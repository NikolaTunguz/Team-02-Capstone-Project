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

def camera_reader(camera_queue, thermal_queue):
    print("loading")
    cap_standard = cv2.VideoCapture(0)
    cap_thermal = cv2.VideoCapture(1)
    print("loaded")
    while(True):
        _, frame = cap_standard.read()
        try: 
            camera_queue.put_nowait(frame)
        except:
            pass
            
        _, frame = cap_thermal.read()
        try:
            thermal_queue.put_nowait(frame)
        except:
            pass

def image_process(camera_queue, im_pro_con_person, im_pro_con_package):
    print("im_pro started")
    previous_person_notification = 0
    previous_package_notification = 0 
    package_timer = 0
    prev_person_detections = deque(maxlen=3)
    package_detected = False

    while(True):
        frame = camera_queue.get()
        cv2.imwrite("localcache/input_image.jpg", frame)
        model_interface.set_normal_image("localcache/input_image.jpg")

        #person detection
        person_detected = model_interface.detect_person()
        person_bboxes = model_interface.normal_interface.person_bboxes.cpu().numpy().astype("int")
        im_pro_con_person.send(person_bboxes)

        current_time = time.time()


        #every X seconds do package detection
        if (current_time - previous_package_notification > package_timer):
            previous_package_notification = current_time
            package_detected = model_interface.detect_package()
            package_bboxes = model_interface.normal_interface.package_bboxes.cpu().numpy().astype("int")
            im_pro_con_package.send(package_bboxes)
            # Update times as necessary (hours-minutes likely)
            if(package_detected):
                package_timer = 60
            else:
                package_timer = 15
   
        #notifications
        # print(current_time - previous_person_notification > 60, ":", person_detected, ":", not (True in prev_person_detections))
        if ((current_time - previous_person_notification > 60) and person_detected and not (True in prev_person_detections)):
            previous_person_notification = current_time
            date = datetime.now()
            date = date.strftime("%m/%d/%Y, %H:%M:%S")

            cv2.imwrite("localcache/event_snap.jpg", frame)

            with open("localcache/event_snap.jpg", "rb") as img_file:
                 response = requests.post(
                    "http://127.0.0.1:8080/database",
                    files={"snapshot": ("event_snap.jpg", img_file, "image/jpeg")},
                    data = {
                     "device_id": 14,
                     "timestamp": date,
                     "message": "Person detected at camera."
                    }
                 )
                 if response.status_code == 200:
                     print("Notification and snapshot sent successfully")
                 else:
                     print(f"Failed to send notification. Status code: {response.status_code}")
        prev_person_detections.append(person_detected)

        if (package_detected):
            previous_package_notification = current_time
            date = datetime.now()
            date = date.strftime("%m/%d/%Y, %H:%M:%S")

            cv2.imwrite("localcache/event_snap.jpg", frame)

            with open("localcache/event_snap.jpg", "rb") as img_file:
                    response = requests.post(
                    "http://127.0.0.1:8080/database",
                    files={"snapshot": ("event_snap.jpg", img_file, "image/jpeg")},
                    data = {
                        "device_id": 14,
                        "timestamp": date,
                        "message": "Package detected at camera."
                    }
                    )
                    if response.status_code == 200:
                        print("Notification and snapshot sent successfully")
                    else:
                        print(f"Failed to send notification. Status code: {response.status_code}")
            package_detected = False



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
    peer_connection.addTrack(TestTrack(thermal_queue, webrtc_con_person, webrtc_con_package))

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

async def im_read(camera_queue, thermal_queue):
    im_reader = aioprocessing.AioProcess(target=camera_reader, args=[camera_queue, thermal_queue])
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
    thermal_queue = aioprocessing.AioQueue(5)

    webrtc_con_person, im_pro_con_person = aioprocessing.AioPipe(duplex=False)
    webrtc_con_package, im_pro_con_package = aioprocessing.AioPipe(duplex=False)

    tasks = [
        asyncio.ensure_future(im_read(camera_queue, thermal_queue)),
        asyncio.ensure_future(main(camera_queue, webrtc_con_person, webrtc_con_package)),
        # asyncio.ensure_future(run_im_pro(camera_queue, im_pro_con_person, im_pro_con_package)),
        # asyncio.ensure_future(run_thumbnail_process(camera_queue)),
    ]
    try:
        loop.run_until_complete(asyncio.wait(tasks))
    except:
        os.system('taskkill -f -im python*' if os.name == 'nt' else 'pkill -9 python')
    loop.close()