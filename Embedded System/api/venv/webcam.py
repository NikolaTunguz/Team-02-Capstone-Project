import asyncio
import aioprocessing
import json
import websockets
import sys
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
    def __init__(self, camera_queue):
        super().__init__()
        self.camera_queue = camera_queue

    async def recv(self):
        img = self.camera_queue.get()
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

def image_process(camera_queue):
    print("im_pro started")
    while(True):
        frame = camera_queue.get()
        cv2.imwrite("localcache/input_image.jpg", frame)
        model_interface.set_normal_image("localcache/input_image.jpg") 
        print(model_interface.detect_person())

async def on_offer(offer_sdp, target_id, camera_queue):
    offer = RTCSessionDescription(sdp=offer_sdp, type="offer")

    peer_connection = RTCPeerConnection()

    connections.add(peer_connection)

    @peer_connection.on("connectionstatechange")
    async def on_connectionstatechange():
        print("Connection state is %s" % peer_connection.connectionState)
        if peer_connection.connectionState == "failed":
            await peer_connection.close()
            connections.discard(peer_connection)

    peer_connection.addTrack(TestTrack(camera_queue))

    await peer_connection.setRemoteDescription(offer)
    answer = await peer_connection.createAnswer()
    await peer_connection.setLocalDescription(answer)


    signaling_message = {
        "type": answer.type,
        "target_id": target_id,
        "sdp": answer.sdp,
    }
    await signaling_socket.send(json.dumps(signaling_message))


async def handle_signaling_messages(signaling_socket, camera_queue):
    async for message in signaling_socket:
        data = json.loads(message)


        if data.get("type") == "offer":
            await on_offer(data["sdp"], data["target_id"], camera_queue)

async def connect_to_signaling_server(camera_queue):
    global signaling_socket
    signaling_socket = await websockets.connect(SIGNALING_SERVER_URI)
    connection_message = {
        "type": "setup",
        "id": 14,
    }
    await signaling_socket.send(json.dumps(connection_message))
    print("Connected to signaling server")

    await handle_signaling_messages(signaling_socket, camera_queue)

async def main(camera_queue):
    await connect_to_signaling_server(camera_queue)

async def im_read(camera_queue):
    im_reader = aioprocessing.AioProcess(target=camera_reader, args=[camera_queue])
    im_reader.start()
    await im_reader.coro_join()

async def run_im_pro(camera_queue):
    im_pro = aioprocessing.AioProcess(target=image_process, args=[camera_queue])
    im_pro.start()
    await im_pro.coro_join()


if __name__ == "__main__":

    loop = asyncio.get_event_loop()

    camera_queue = aioprocessing.AioQueue(5)

    tasks = [
        asyncio.ensure_future(im_read(camera_queue)),
        asyncio.ensure_future(main(camera_queue)),
        asyncio.ensure_future(run_im_pro(camera_queue)),
    ]
    loop.run_until_complete(asyncio.wait(tasks))
    loop.close()