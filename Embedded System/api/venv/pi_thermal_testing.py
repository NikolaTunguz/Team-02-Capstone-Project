import cv2
import os
import numpy as np


#model interface import
import sys
from pathlib import Path
base_path = Path(__file__).resolve().parents[3]
sys.path.append(str(base_path))
from Models.model_interface import ModelInterface

if __name__ == '__main__':
    model_interface = ModelInterface()
   
    cap = cv2.VideoCapture(0, cv2.CAP_V4L)
    cap.set(cv2.CAP_PROP_CONVERT_RGB, 0.0)
    while cap.isOpened():
        ret, frame = cap.read()
        if ret:
            imdata, thdata = np.array_split(frame, 2)
            combined = np.concatenate((imdata, thdata), axis=1)
            np.save('localcache/test_thermal_npy.npy', combined)


            model_interface.set_thermal_npy('localcache/test_thermal_npy.npy')
            image = model_interface.thermal_image
            cv2.imshow('test', image)
            cv2.waitKey(10)

            pure_classification = model_interface.detect_pistol()
            print('classification: ', pure_classification)
            detection, bbox, result_image = model_interface.detect_and_bound_pistol()
            cv2.imshow('output', result_image)
            if detection:
                print('pistol detected', bbox)
                cv2.imshow('pistol', result_image)
                cv2.waitKey(10)
            else:
                print('no pistol detected', bbox)
            cv2.imshow('output', result_image)
            cv2.waitKey(10)
                
    cap.release()
    cv2.destroyAllWindows()