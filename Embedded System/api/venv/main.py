from flask import Flask, Response
from flask_cors import CORS
import cv2
from datetime import datetime
import requests

app = Flask(__name__)
cors = CORS(app, origins="*")
camera = cv2.VideoCapture(0)

def generate_frames():
    while True:
        ret, frame = camera.read()
        if not ret:
            break
        else:
            ret, buffer = cv2.imencode('.jpg', frame)
            frame = buffer.tobytes()
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')


@app.route('/video_feed')
def video_feed():
    return Response(generate_frames(),
                    mimetype='multipart/x-mixed-replace; boundary=frame')

# print(type(datetime.now().minute))
# print(datetime.now().second)
# url = "http://127.0.0.1:8080/database"
# headers={
#     'Content-type':'application/json', 
#     'Accept':'application/json'
# }
# while(True):
#     date = datetime.now()
#     if(date.second == 30):
#         date = date.strftime("%m/%d/%Y, %H:%M:%S")
        
#         data = '{"device_id":14, "timestamp":"' + date + '"}'
#         requests.post(url, data=data, headers=headers)

if __name__ == '__main__':
    app.run(port=5000, debug=True)
    