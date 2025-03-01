import asyncio
import websockets
import json

connected_clients = {}
client_ids = {}

async def handle_client(websocket):
    client_id = str(id(websocket))
    connected_clients[client_id] = websocket
    print(f"Client {client_id} connected")

    try:
        async for message in websocket:
            data = json.loads(message)
            print(data.get("type"))
            if data.get("type") == "offer":
                target_id = data.get("target_id")
                target_id = client_ids[target_id]
                if target_id in connected_clients:
                    data['target_id'] = client_id
                    await connected_clients[target_id].send(json.dumps(data))
                else:
                    print(f"Target client {target_id} not connected")
            
            elif data.get("type") == "answer":
                target_id = data.get("target_id")
                if target_id in connected_clients:
                    data['target_id'] = client_id
                    await connected_clients[target_id].send(json.dumps(data))
                else:
                    print(f"Target client {target_id} not connected")
            elif data.get("type") == "setup":
                client_ids[data.get("id")] = client_id

    except websockets.ConnectionClosed:
        print(f"Client {client_id} disconnected")
    finally:
        connected_clients.pop(client_id, None)

async def main():
    server = await websockets.serve(handle_client, 'localhost', 8765)
    print("WebSocket server started on ws://localhost:8765")
    await server.wait_closed()

asyncio.run(main())