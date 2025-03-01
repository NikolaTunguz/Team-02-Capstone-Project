import asyncio
import json
import logging
import platform
import websockets

from aiortc import RTCPeerConnection, RTCSessionDescription
from aiortc.contrib.media import MediaPlayer, MediaRelay

relay = None

connections = set()

SIGNALING_SERVER_URI = "ws://localhost:8765"

def create_local_tracks(play_from, decode):
    global relay, webcam

    if play_from:
        player = MediaPlayer(play_from, decode=decode)
        return player.audio, player.video
    else:
        options = {"framerate": "30", "video_size": "640x480"}
        if relay is None:
            if platform.system() == "Windows":
                webcam = MediaPlayer(
                    # "video=USB2.0 PC CAMERA", format="dshow", options=options
                    "video=Integrated Webcam", format="dshow", options=options
                )
            else:
                webcam = MediaPlayer("/dev/video0", format="v4l2", options=options)
            relay = MediaRelay()
        return None, relay.subscribe(webcam.video)


async def on_offer(offer_sdp, target_id):
    offer = RTCSessionDescription(sdp=offer_sdp, type="offer")

    peer_connection = RTCPeerConnection()

    connections.add(peer_connection)

    @peer_connection.on("connectionstatechange")
    async def on_connectionstatechange():
        print("Connection state is %s" % peer_connection.connectionState)
        if peer_connection.connectionState == "failed":
            await peer_connection.close()
            connections.discard(peer_connection)

    audio, video = create_local_tracks(
        False, decode=not False
    )

    if audio:
        peer_connection.addTrack(audio)


    if video:
        peer_connection.addTrack(video)

    await peer_connection.setRemoteDescription(offer)
    answer = await peer_connection.createAnswer()
    await peer_connection.setLocalDescription(answer)


    signaling_message = {
        "type": answer.type,
        "target_id": target_id,
        "sdp": answer.sdp,
    }
    await signaling_socket.send(json.dumps(signaling_message))


async def handle_signaling_messages(signaling_socket):
    async for message in signaling_socket:
        data = json.loads(message)


        if data.get("type") == "offer":
            await on_offer(data["sdp"], data["target_id"])

async def connect_to_signaling_server():
    global signaling_socket
    signaling_socket = await websockets.connect(SIGNALING_SERVER_URI)
    connection_message = {
        "type": "setup",
        "id": 14,
    }
    await signaling_socket.send(json.dumps(connection_message))
    print("Connected to signaling server")

    await handle_signaling_messages(signaling_socket)


async def main():
    await connect_to_signaling_server()

if __name__ == "__main__":
    logging.basicConfig(level=logging.DEBUG)
    asyncio.run(main())