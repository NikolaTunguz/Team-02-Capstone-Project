from flask import Flask, Response
from flask_cors import CORS
import cv2
from datetime import datetime
import requests
import sys
import threading
from pathlib import Path

base_path = Path(__file__).resolve().parents[3]
print(base_path)
sys.path.append(str(base_path))

from Models.model_interface import ModelInterface

app = Flask(__name__)
cors = CORS(app, origins="*")


camera = cv2.VideoCapture(0)
running = True
frame = None

def capture_frames():
    global frame
    while running:
        ret, currFrame = camera.read()
        if not ret:
            print("BROKEN")
            break
        frame = currFrame


def process_frames():
    while running:
    #     if frame == None():
    #         print("NO IMAGE")
    #     else:
            # model_interface = ModelInterface()
            # model_interface.set_normal_image("test/test_image.jpg")
            # # model_interface.setThermalImages("C:\Users\Diego\Pictures\Screenshots\Screenshot 2024-04-03 161659.png")
            # print("model: ", model_interface.detect_person())
            # model_interface.detect_pistol()
            pass




def generate_frames():
    global frame
    while True:
        # ret, frame = camera.read()
        # if not ret:
        #     break
        # else:

        if frame is None:
            continue
        _, buffer = cv2.imencode('.jpg', frame)
        frame = buffer.tobytes()
        yield (b'--frame\r\n'
                b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')


@app.route('/video_feed')
def video_feed():
    return Response(generate_frames(),
                    mimetype='multipart/x-mixed-replace; boundary=frame')

# if __name__ == '__main__':
#     app.run(port=5000, debug=True)

if __name__ == '__main__':
    capture_thread = threading.Thread(target=capture_frames)
    processing_thread = threading.Thread(target=process_frames)


    capture_thread.start()
    processing_thread.start()

    app.run(port=5000, debug=True)

    try: 
        app.run(port=5000, debug=True)
    finally:
        running = False
        capture_thread.join()
        processing_thread.join()
        camera.release()   