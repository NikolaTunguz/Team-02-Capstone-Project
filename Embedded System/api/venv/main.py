#general imports
from flask import Flask, Response
from flask_cors import CORS
import cv2
import sys
from pathlib import Path
import time

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


def generate_frames():
    while running:
        #read camera data
        ret, frame = camera.read()

        #check if there is a frame
        if not ret:
           break

        cv2.imwrite("localcache/input_image.jpg", frame)
        #process 1: display image to site
        _, buffer = cv2.imencode('.jpg', frame)
        frame = buffer.tobytes()
        yield (b'--frame\r\n'
                b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')
        
        #process 2: capture frame for model processing
        model_interface.set_normal_image("localcache/input_image.jpg")
        # model_interface.set_thermal_image("localcache/test_image.jpg") 

        #object detection models - return is a bounding box
        model_interface.detect_person()
        # model_interface.detect_package()
        # image = model_interface.get_bbox_image()
        
        #classification model - return is a 0 or a 1
        # model_interface.detect_pistol()
        # thermal_output = model_interface.detect_pistol()


@app.route('/video_feed')
def video_feed():
    return Response(generate_frames(),
                    mimetype='multipart/x-mixed-replace; boundary=frame')


if __name__ == '__main__':
    app.run(port=5000, debug=True)