import asyncio
import aioprocessing
import json
import websockets
import requests
import time
from collections import deque
from datetime import datetime
import sys
import os
import cv2
from av import VideoFrame
from aiortc import RTCPeerConnection, RTCSessionDescription
from aiortc import VideoStreamTrack

from pathlib import Path
base_path = Path(__file__).resolve().parents[3]
print(base_path)
sys.path.append(str(base_path))
from Models.model_interface import ModelInterface
model_interface = ModelInterface()

relay = None

connections = set()

SIGNALING_SERVER_URI = "ws://localhost:8765"

class TestTrack(VideoStreamTrack):
    def __init__(self, camera_queue, webrtc_con_person, webrtc_con_package):
        super().__init__()
        self.camera_queue = camera_queue
        self.webrtc_con_person = webrtc_con_person
        self.webrtc_con_package = webrtc_con_package
        self.person_bboxes = []
        self.package_bboxes = []

    async def recv(self):
        img = self.camera_queue.get()

        if(self.webrtc_con_person.poll()):
            self.person_bboxes = self.webrtc_con_person.recv()
        
        if(self.webrtc_con_package.poll()):
            self.package_bboxes = self.webrtc_con_package.recv()

        font = cv2.FONT_HERSHEY_SIMPLEX

        for box in self.person_bboxes:
            x1,y1,x2,y2 = box

            img = cv2.rectangle(img, (x1, y1), (x2, y2), (255, 199, 46), 1) 
            img = cv2.putText(img, "person", (x1, y1-10), font, 0.6, (0, 0, 200), 1, cv2.LINE_AA)

        for box in self.package_bboxes:
            x1,y1,x2,y2 = box

            img = cv2.rectangle(img, (x1, y1), (x2, y2), (255, 0, 0), 1) 
            img = cv2.putText(img, "package", (x1, y1-10), font, 0.6, (0, 255, 255), 1, cv2.LINE_AA)

        frame = VideoFrame.from_ndarray(img, format="bgr24")
        pts, time_base = await self.next_timestamp()
        frame.pts = pts
        frame.time_base = time_base
        return frame

def camera_reader(camera_queue):
    print("loading")
    cap = cv2.VideoCapture(0)
    print("loaded")
    while(True):
        ret, frame = cap.read()
        camera_queue.put(frame)

def image_process(camera_queue, im_pro_con_person, im_pro_con_package):
    print("im_pro started")
    previous_person_notification = 0
    previous_package_notification = 0 
    prev_person_detections = deque(maxlen=3)
    prev_package_detections = deque(maxlen=3)

    frame_counter = 0

    while(True):
        frame = camera_queue.get()
        cv2.imwrite("localcache/input_image.jpg", frame)
        model_interface.set_normal_image("localcache/input_image.jpg")

        #person detection
        person_detected = model_interface.detect_person()
        person_bboxes = model_interface.normal_interface.person_bboxes.cpu().numpy().astype("int")
        im_pro_con_person.send(person_bboxes)

        #every X frames do package detection
        # if frame_counter % 300 == 0:
        #     package_detected = model_interface.detect_package()
        # else:
        #     package_detected = False
        package_detected = model_interface.detect_package()
        package_bboxes = model_interface.normal_interface.package_bboxes.cpu().numpy().astype("int")

        im_pro_con_package.send(package_bboxes)
        
        #notifications
        current_time = time.time()
        print(current_time - previous_person_notification > 60, ":", person_detected, ":", not (True in prev_person_detections))
        if ((current_time - previous_person_notification > 60) and person_detected and not (True in prev_person_detections)):
            previous_person_notification = current_time
            date = datetime.now()
            date = date.strftime("%m/%d/%Y, %H:%M:%S")

            cv2.imwrite("localcache/event_snap.jpg", frame)
            print(f"Saved notification image: ahhhh")

            headers={
                'Content-type':'application/json',
                'Accept':'application/json'
            }

            data = {
                "device_id":14,
                "timestamp":date,
                "message":"Person detected at camera."
            }
            requests.post("http://127.0.0.1:8080/database", json=data, headers=headers)
        prev_person_detections.append(person_detected)

        print(current_time - previous_package_notification > 60, ":", package_detected, ":", not (True in prev_package_detections))
        if ((current_time - previous_package_notification > 60) and package_detected and not (True in prev_package_detections)):
            previous_package_notification = current_time
            date = datetime.now()
            date = date.strftime("%m/%d/%Y, %H:%M:%S")

            headers={
                'Content-type':'application/json',
                'Accept':'application/json'
            }

            data = {
                "device_id":14,
                "timestamp":date,
                "message":"Package detected at camera."
            }
            requests.post("http://127.0.0.1:8080/database", json=data, headers=headers)
        prev_package_detections.append(package_detected)

        frame_counter += 1


async def on_offer(offer_sdp, target_id, camera_queue, webrtc_con_person, webrtc_con_package):
    offer = RTCSessionDescription(sdp=offer_sdp, type="offer")

    peer_connection = RTCPeerConnection()

    connections.add(peer_connection)

    @peer_connection.on("connectionstatechange")
    async def on_connectionstatechange():
        print("Connection state is %s" % peer_connection.connectionState)
        if peer_connection.connectionState == "failed":
            await peer_connection.close()
            connections.discard(peer_connection)

    peer_connection.addTrack(TestTrack(camera_queue, webrtc_con_person, webrtc_con_package))

    await peer_connection.setRemoteDescription(offer)
    answer = await peer_connection.createAnswer()
    await peer_connection.setLocalDescription(answer)


    signaling_message = {
        "type": answer.type,
        "target_id": target_id,
        "sdp": answer.sdp,
    }
    await signaling_socket.send(json.dumps(signaling_message))


async def handle_signaling_messages(signaling_socket, camera_queue, webrtc_con_person, webrtc_con_package):
    async for message in signaling_socket:
        data = json.loads(message)


        if data.get("type") == "offer":
            await on_offer(data["sdp"], data["target_id"], camera_queue, webrtc_con_person, webrtc_con_package)

async def connect_to_signaling_server(camera_queue, webrtc_con_person, webrtc_con_package):
    global signaling_socket
    signaling_socket = await websockets.connect(SIGNALING_SERVER_URI)
    connection_message = {
        "type": "setup",
        "id": 14,
    }
    await signaling_socket.send(json.dumps(connection_message))
    print("Connected to signaling server")

    await handle_signaling_messages(signaling_socket, camera_queue, webrtc_con_person, webrtc_con_package)

async def main(camera_queue, webrtc_con_person, webrtc_con_package):
    await connect_to_signaling_server(camera_queue, webrtc_con_person, webrtc_con_package)

async def im_read(camera_queue):
    im_reader = aioprocessing.AioProcess(target=camera_reader, args=[camera_queue])
    im_reader.start()
    await im_reader.coro_join()

async def run_im_pro(camera_queue, im_pro_con_person, im_pro_con_package):
    im_pro = aioprocessing.AioProcess(target=image_process, args=[camera_queue, im_pro_con_person, im_pro_con_package])
    im_pro.start()
    await im_pro.coro_join()

def thumbnail_process(camera_queue):
    last_thumbnail_time = time.time()

    while True:
        frame = camera_queue.get()
        if frame is None or frame.size == 0:
            print("Error: Empty frame")
            continue

        if time.time() - last_thumbnail_time > 30:
            try:
                cv2.imwrite("localcache/thumbnail.jpg", frame)
                with open("localcache/thumbnail.jpg", "rb") as img_file:
                    response = requests.post(
                        "http://127.0.0.1:8080/update_thumbnail",
                        files={"thumbnail": ("thumbnail.jpg", img_file, "image/jpeg")},
                        data={"device_id": 14}
                    )

                    if response.status_code == 200:
                        print("Thumbnail updated successfully")
                    else:
                        print(f"Failed to update thumbnail. Status code: {response.status_code}")

            except Exception as e:
                print(f"Error in thumbnail processing: {e}")

            last_thumbnail_time = time.time()

async def run_thumbnail_process(camera_queue):
    thumbnail_proc = aioprocessing.AioProcess(target=thumbnail_process, args=[camera_queue])
    thumbnail_proc.start()
    await thumbnail_proc.coro_join()


if __name__ == "__main__":

    loop = asyncio.get_event_loop()

    camera_queue = aioprocessing.AioQueue(5)

    webrtc_con_person, im_pro_con_person = aioprocessing.AioPipe(duplex=False)
    webrtc_con_package, im_pro_con_package = aioprocessing.AioPipe(duplex=False)

    tasks = [
        asyncio.ensure_future(im_read(camera_queue)),
        asyncio.ensure_future(main(camera_queue, webrtc_con_person, webrtc_con_package)),
        asyncio.ensure_future(run_im_pro(camera_queue, im_pro_con_person, im_pro_con_package)),
        asyncio.ensure_future(run_thumbnail_process(camera_queue)),
    ]
    try:
        loop.run_until_complete(asyncio.wait(tasks))
    except:
        os.system('taskkill -f -im python*' if os.name == 'nt' else 'pkill -9 python')
    loop.close()