#general imports
from flask import Flask, Response
from flask_cors import CORS
import cv2
import sys
from pathlib import Path
import requests
from datetime import datetime


#get ModelInterface class.
base_path = Path(__file__).resolve().parents[3]
print(base_path)
sys.path.append(str(base_path))
from Models.model_interface import ModelInterface

#backend initialization
app = Flask(__name__)
cors = CORS(app, origins="*")

#global variables
camera = cv2.VideoCapture(0)
running = True
model_interface = ModelInterface()
notification_counter = 0


def generate_frames():
    global notification_counter
    while running:
        #read camera data
        ret, frame = camera.read()

        #check if there is a frame
        if not ret:
           break
        #important note: localcache needs to exist, imwrite() will not generate this.
        cv2.imwrite("localcache/input_image.jpg", frame)
        #process 1: display image to site
        _, buffer = cv2.imencode('.jpg', frame)
        frame = buffer.tobytes()
        yield (b'--frame\r\n'
                b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')
        
        #process 2: capture frame for model processing
        model_interface.set_normal_image("localcache/input_image.jpg") 

        #person detection
        detected = model_interface.detect_person()
        bbox_image = model_interface.get_bbox_image()

        print(notification_counter)

        if(notification_counter == 0):
            if(detected):
                date = datetime.now()
                date = date.strftime("%m/%d/%Y, %H:%M:%S")

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
                notification_counter = 100
        
        else:
            notification_counter -= 1
        

        #display processed image to site
        _, buffer = cv2.imencode('.jpg', bbox_image)
        frame = buffer.tobytes()
        yield (b'--frame\r\n'
                b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')


@app.route('/video_feed')
def video_feed():
    return Response(generate_frames(),
                    mimetype='multipart/x-mixed-replace; boundary=frame')


if __name__ == '__main__':
    app.run(port=5000, debug=True)