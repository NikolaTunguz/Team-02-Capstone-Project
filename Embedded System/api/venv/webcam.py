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
from picamera2 import Picamera2
from av import VideoFrame
from aiortc import RTCPeerConnection, RTCSessionDescription
from aiortc import VideoStreamTrack
import multiprocessing as mp
import numpy as np

from pathlib import Path
base_path = Path(__file__).resolve().parents[3]
print(base_path)
sys.path.append(str(base_path))
from Models.model_interface import ModelInterface
model_interface = ModelInterface()


thermal_npy_path = os.path.join(base_path, 'Embedded System', 'api', 'venv', 'localcache', 'thermal_input.npy')
relay = None
connections = set()

SIGNALING_SERVER_URI = "ws://seethru-wss.unr.dev"


DEVICE_ID = 18






class StandardTrack(VideoStreamTrack):
    def __init__(self, camera_queue, webrtc_con_standard):
        super().__init__()
        self.camera_queue = camera_queue
        self.webrtc_con_standard = webrtc_con_standard
        self.person_bboxes = []
        self.package_bboxes = []
       
    async def recv(self):
        img = self.camera_queue.get()


        if(self.webrtc_con_standard.poll()):
            bboxes, det_type = self.webrtc_con_standard.recv()
            if(det_type == 'person'):
                self.person_bboxes = bboxes
            elif(det_type == 'package'):
                self.package_bboxes = bboxes
       
        for box in self.person_bboxes:
            x1,y1,x2,y2 = box


            img = cv2.rectangle(img, (x1, y1), (x2, y2), (255, 199, 46), 1)
            img = cv2.putText(img, "person", (x1, y1-10), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 200), 1, cv2.LINE_AA)




        for box in self.package_bboxes:
            x1,y1,x2,y2 = box


            img = cv2.rectangle(img, (x1, y1), (x2, y2), (255, 0, 0), 1)
            img = cv2.putText(img, "package", (x1, y1-10), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 255), 1, cv2.LINE_AA)




        frame = VideoFrame.from_ndarray(img)
        pts, time_base = await self.next_timestamp()
        frame.pts = pts
        frame.time_base = time_base
        return frame

class ThermalTrack(VideoStreamTrack):
    def __init__(self, camera_queue, webrtc_con_thermal):
        super().__init__()
        self.camera_queue = camera_queue
        self.webrt_con_thermal = webrtc_con_thermal
        self.pistol_bboxes = []
        self.fire_bboxes = []
   
    async def recv(self):
        img = self.camera_queue.get()[0]
       
        if(self.webrt_con_thermal.poll()):
            boxes, det_type = self.webrt_con_thermal.recv()
            if(det_type == 'pistol'):
                self.pistol_bboxes = boxes
            elif(det_type == 'fire'):
                self.fire_bboxes = boxes
                pass
       
        if self.pistol_bboxes:
            x1, y1, x2, y2 = self.pistol_bboxes
            x1, x2 = int(x1 * 256), int(x2 * 256)
            y1, y2 = int(y1 * 192), int(y2 * 192)
           
            img = cv2.rectangle(img, (x1, y1), (x2, y2), (255, 199, 46), 2)
            img = cv2.putText(img, "pistol", (x1, y1-10), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 200), 1, cv2.LINE_AA)
           
        if self.fire_bboxes:
            x1, y1, x2, y2 = self.fire_bboxes
            x1, x2 = int(x1 * 256), int(x2 * 256)
            y1, y2 = int(y1 * 192), int(y2 * 192)
           
            img = cv2.rectangle(img, (x1, y1), (x2, y2), (255, 199, 46), 2)
            img = cv2.putText(img, "fire", (x1, y1-10), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 200), 1, cv2.LINE_AA)


        img = cv2.resize(img, (640, 480), interpolation=cv2.INTER_NEAREST)
       
        frame = VideoFrame.from_ndarray(img, format="bgr24")
        pts, time_base = await self.next_timestamp()
        frame.pts = pts
        frame.time_base = time_base
        return frame
   
def send_notification(frame, path, message, det_type):
    date = datetime.now()
    date = date.strftime("%m/%d/%Y, %H:%M:%S")


    cv2.imwrite(path, frame)


    with open(path, "rb") as img_file:
        response = requests.post(
            "https://seethru.unr.dev/api/database",
            files={"snapshot": ("event_snap.jpg", img_file, "image/jpeg")},
            data = {
                "device_id": DEVICE_ID,
                "timestamp": date,
                "message": message,
                "notif_type": det_type,
            }
        )


        if response.status_code == 200:
            print("Notification and snapshot sent successfully")
        else:
            print(f"Failed to send notification. Status code: {response.status_code}")


def camera_reader(camera_queue, thermal_queue):
    print("loading")
    cap_standard = Picamera2()
    cap_standard.configure(cap_standard.create_video_configuration(main={"format":'RGB888', "size":(1280, 720)}))
    cap_standard.start()
    #cap_standard = cv2.VideoCapture(0)
    #cap_standard.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
    #cap_standard.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
    cap_thermal = cv2.VideoCapture(0, cv2.CAP_V4L)
    cap_thermal.set(cv2.CAP_PROP_CONVERT_RGB, 0.0)
    cap_thermal.set(cv2.CAP_PROP_FRAME_WIDTH, 256)
    cap_thermal.set(cv2.CAP_PROP_FRAME_HEIGHT, 384)
    print("loaded")
    while(True):
        frame = cap_standard.capture_array()
        frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        if not camera_queue.full():
            camera_queue.put_nowait(frame)
       
        _, frame = cap_thermal.read()
        if not thermal_queue.full():
            frame = frame.reshape(384, 256, 2)
            imdata, thdata = np.array_split(frame, 2)
            combined = np.concatenate((imdata, thdata), axis=1)
            np.save('localcache/thermal_input.npy', combined)
            thermal_image, thermal_grayscale, thermal_data = model_interface.set_thermal_npy(thermal_npy_path)
            thermal_queue.put_nowait((thermal_image, thermal_grayscale, thermal_data))




def image_process(camera_queue, im_pro_con_standard):
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


        im_pro_con_standard.send((person_bboxes, "person"))


        current_time = time.time()


       
        #every X seconds do package detection
        if (current_time - previous_package_notification > package_timer):
            previous_package_notification = current_time
            package_detected = model_interface.detect_package()
            package_bboxes = model_interface.normal_interface.package_bboxes.cpu().numpy().astype("int")
            im_pro_con_standard.send((package_bboxes, "package"))
            # Update times as necessary (hours-minutes likely)
            if(package_detected):
                package_timer = 30
            else:
                package_timer = 15
       
   
        #notifications
        print(current_time - previous_person_notification > 60, ":", person_detected, ":", not (True in prev_person_detections))
        if ((current_time - previous_person_notification > 60) and person_detected and not (True in prev_person_detections)):
            previous_person_notification = current_time
            frame = cv2.cvtColor(frame, cv2.COLOR_RGB2BGR)
            
            for box in person_bboxes:
                x1,y1,x2,y2 = box
                frame = cv2.rectangle(frame, (x1, y1), (x2, y2), (255, 199, 46), 1)
                frame = cv2.putText(frame, "person", (x1, y1-10), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 200), 1, cv2.LINE_AA)

            send_notification(frame, "localcache/event_snap.jpg", "Person detected at camera.", "person")
        prev_person_detections.append(person_detected)
       
        if (package_detected):
            previous_package_notification = current_time
            frame = cv2.cvtColor(frame, cv2.COLOR_RGB2BGR)
            
            for box in package_bboxes:
                x1,y1,x2,y2 = box
                frame = cv2.rectangle(frame, (x1, y1), (x2, y2), (255, 0, 0), 1)
                frame = cv2.putText(frame, "package", (x1, y1-10), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 255), 1, cv2.LINE_AA)
                
            send_notification(frame, "localcache/event_snap.jpg", "Package detected at camera.", "package")
            package_detected = False
           
       
async def on_offer(offer_sdp, target_id, camera_queue, thermal_queue, webrtc_con_standard, webrtc_con_thermal):
    offer = RTCSessionDescription(sdp=offer_sdp, type="offer")
    print("offer")
    peer_connection = RTCPeerConnection()

    connections.add(peer_connection)

    @peer_connection.on("connectionstatechange")
    async def on_connectionstatechange():
        print("Connection state is %s" % peer_connection.connectionState)
        if peer_connection.connectionState == "failed":
            await peer_connection.close()
            connections.discard(peer_connection)
    print("track add start")
    peer_connection.addTrack(StandardTrack(camera_queue, webrtc_con_standard))
    peer_connection.addTrack(ThermalTrack(thermal_queue, webrtc_con_thermal))
    print("track add finish")
    await peer_connection.setRemoteDescription(offer)
    answer = await peer_connection.createAnswer()
    await peer_connection.setLocalDescription(answer)
   
    answer = RTCSessionDescription(
        type = peer_connection.localDescription.type,
        sdp = peer_connection.localDescription.sdp,
    )


    signaling_message = {
        "type": answer.type,
        "target_id": target_id,
        "sdp": answer.sdp,
    }
    await signaling_socket.send(json.dumps(signaling_message))




async def handle_signaling_messages(signaling_socket, thermal_queue, camera_queue, webrtc_con_standard, webrtc_con_thermal):
    async for message in signaling_socket:
        data = json.loads(message)




        if data.get("type") == "offer":
            await on_offer(data["sdp"], data["target_id"], camera_queue, thermal_queue, webrtc_con_standard, webrtc_con_thermal)




async def connect_to_signaling_server(camera_queue, thermal_queue, webrtc_con_standard, webrtc_con_thermal):
    global signaling_socket
    signaling_socket = await websockets.connect(SIGNALING_SERVER_URI)
    connection_message = {
        "type": "setup",
        "id": DEVICE_ID,
    }
    await signaling_socket.send(json.dumps(connection_message))
    print("Connected to signaling server")

    await handle_signaling_messages(signaling_socket, thermal_queue, camera_queue, webrtc_con_standard, webrtc_con_thermal)




def thumbnail_process(camera_queue):
    last_thumbnail_time = time.time()


    while True:
        frame = camera_queue.get()
        frame = cv2.cvtColor(frame, cv2.COLOR_RGB2BGR)
        if frame is None or frame.size == 0:
            print("Error: Empty frame")
            continue


        if time.time() - last_thumbnail_time > 30:
            try:
                cv2.imwrite("localcache/thumbnail.jpg", frame)
                with open("localcache/thumbnail.jpg", "rb") as img_file:
                    response = requests.post(
                        "https://seethru.unr.dev/api/update_thumbnail",
                        files={"thumbnail": ("thumbnail.jpg", img_file, "image/jpeg")},
                        data={"device_id": DEVICE_ID}
                    )
                    if response.status_code == 200:
                        print("Thumbnail updated successfully")
                    else:
                        print(f"Failed to update thumbnail. Status code: {response.status_code}")


            except Exception as e:
                print(f"Error in thumbnail processing: {e}")


            last_thumbnail_time = time.time()


   
def thermal_process(thermal_queue, im_pro_con_thermal):
    while(True):
        thermal_image, thermal_grayscale, thermal_data = thermal_queue.get()
       
        model_interface.set_thermal_grayscale(thermal_grayscale)
        model_interface.set_thermal_data(thermal_data)

        if model_interface.detect_pistol():
            print("Pistol")
            _, bbox, _ = model_interface.detect_and_bound_pistol()
            bbox_scaled = [box / 384 for box in bbox]
            im_pro_con_thermal.send((bbox_scaled, 'pistol'))
            
            if bbox_scaled:
                x1, y1, x2, y2 = bbox_scaled
                x1, x2 = int(x1 * 256), int(x2 * 256)
                y1, y2 = int(y1 * 192), int(y2 * 192)
               
                thermal_image = cv2.rectangle(thermal_image, (x1, y1), (x2, y2), (255, 199, 46), 2)
                thermal_image = cv2.putText(thermal_image, "pistol", (x1, y1-10), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 200), 1, cv2.LINE_AA)
                
                thermal_image = cv2.resize(thermal_image, (640, 480), interpolation=cv2.INTER_NEAREST)
                
            send_notification(thermal_image, "localcache/event_snap_thermal.jpg", "Pistol detected at camera", "pistol")
        else:
            print("No pistol")
            im_pro_con_thermal.send(((0, 0, 0, 0), 'pistol'))
       

        det, bbox, _ = model_interface.detect_fire()
        if det:
            bbox_scaled = ( bbox[0][0] / 256, bbox[0][1] / 192, bbox[0][2] / 256, bbox[0][3] / 192 )
            im_pro_con_thermal.send((bbox_scaled, 'fire'))
            
            if bbox_scaled:
                x1, y1, x2, y2 = bbox_scaled
                x1, x2 = int(x1 * 256), int(x2 * 256)
                y1, y2 = int(y1 * 192), int(y2 * 192)
               
                thermal_image = cv2.rectangle(thermal_image, (x1, y1), (x2, y2), (255, 199, 46), 2)
                thermal_image = cv2.putText(thermal_image, "fire", (x1, y1-10), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 200), 1, cv2.LINE_AA)

                thermal_image = cv2.resize(thermal_image, (640, 480), interpolation=cv2.INTER_NEAREST)
            
            send_notification(thermal_image, "localcache/event_snap_thermal.jpg", "Fire detected at camera", "fire")
            print('Fire')
        else:
            im_pro_con_thermal.send(((0, 0, 0, 0), 'fire'))
            print('No fire')


async def run_thumbnail_process(camera_queue):
    thumbnail_proc = aioprocessing.AioProcess(target=thumbnail_process, args=[camera_queue])
    thumbnail_proc.start()
    await thumbnail_proc.coro_join()


async def run_thermal_im_pro(thermal_queue, im_pro_con_thermal):
    thermal_pro = aioprocessing.AioProcess(target=thermal_process, args=[thermal_queue, im_pro_con_thermal])
    thermal_pro.start()
    await thermal_pro.coro_join()


async def stream(camera_queue, thermal_queue, webrtc_con_standard, webrtc_con_thermal):
    await connect_to_signaling_server(camera_queue, thermal_queue, webrtc_con_standard, webrtc_con_thermal)


async def im_read(camera_queue, thermal_queue):
    im_reader = aioprocessing.AioProcess(target=camera_reader, args=[camera_queue, thermal_queue])
    im_reader.start()
    await im_reader.coro_join()


async def run_im_pro(camera_queue, im_pro_con_standard):
    im_pro = aioprocessing.AioProcess(target=image_process, args=[camera_queue, im_pro_con_standard])
    im_pro.start()
    await im_pro.coro_join()


if __name__ == "__main__":
    mp.set_start_method("spawn")

    loop = asyncio.get_event_loop()

    camera_queue = aioprocessing.AioQueue(1)
    thermal_queue = aioprocessing.AioQueue(1)


    webrtc_con_standard, im_pro_con_standard = aioprocessing.AioPipe(duplex=False)
    webrtc_con_thermal, im_pro_con_thermal = aioprocessing.AioPipe(duplex=False)


    tasks = [
        asyncio.ensure_future(im_read(camera_queue, thermal_queue)),
        asyncio.ensure_future(stream(camera_queue, thermal_queue, webrtc_con_standard, webrtc_con_thermal)),
        asyncio.ensure_future(run_im_pro(camera_queue, im_pro_con_standard)),
        asyncio.ensure_future(run_thermal_im_pro(thermal_queue, im_pro_con_thermal)),
        asyncio.ensure_future(run_thumbnail_process(camera_queue)),
    ]
    try:
        loop.run_until_complete(asyncio.wait(tasks))
    except:
        os.system('taskkill -f -im python*' if os.name == 'nt' else 'pkill -9 python')
    loop.close()