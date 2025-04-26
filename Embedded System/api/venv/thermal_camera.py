import cv2

import usb.core
import usb.util

import pygetwindow as gw
from PIL import ImageGrab
import os

#model interface import
import sys
from pathlib import Path
base_path = Path(__file__).resolve().parents[3]
sys.path.append(str(base_path))
from Models.model_interface import ModelInterface

class ThermalCamera:
    def __init__(self):
        pass
    
    def take_app_image(self):
        #hard coded values, not good but works as a temporary work around while not on the raspberry pi
        window = gw.getWindowsWithTitle('TC View 0.6.9.1')[0]

        if window.isMinimized:
            window.restore()
        window.activate()

        window.resizeTo(450, 450)
        window.moveTo(0, 0)
        
        window_rectangle = (125, 185, 455, 435) #left, top, right, bottom

        screenshot = ImageGrab.grab(window_rectangle)
        #screenshot.show()
        screenshot.save('localcache/test_thermal_image.jpg')

        #window.minimize()
        
    def webcam_feed(self):
        #default camera/webcam feed (testing purposes)
        cap = cv2.VideoCapture(0)
        while(cap.isOpened()):
            ret, frame = cap.read()

            if ret == True:
                cv2.namedWindow('Test', cv2.WINDOW_NORMAL)
                cv2.imshow('Test', frame)

                key = cv2.waitKey(100) #time between frames in milliseconds
                if key == ord('q'):
                    cap.release()
                    cv2.destroyAllWindows()

    def list_cameras(self):
        available_cameras = []
        for i in range(10):
            cap = cv2.VideoCapture(i)
            if cap.isOpened():
                available_cameras.append(i)
                cap.release()
        return available_cameras
    
    def print_cameras(self):
        camera_list = self.list_cameras()
        for camera in camera_list:
            print(camera)

    def find_usb_devices(self):
        #printing all usb devices info
        devices = usb.core.find(find_all=True)
        for device in devices:
            print(f"Device: VID {hex(device.idVendor)},  PID {hex(device.idProduct)} \n")

        #finding VID and PID from the print above
        VID = 0xbda  
        PID = 0x5830 

        #finding the device to ensure it can be found
        device = usb.core.find(idVendor=VID, idProduct=PID)
        if device is None:
            print("Device not found.")
        else:
            print(f"Device found: {device}")


if __name__ == '__main__':
    camera = ThermalCamera()
    model_interface = ModelInterface()
    
    #finding all cameras on device (on windows thermal camera does not show up)
    #camera.print_cameras()

    #attempting to find thermal camera by usb port (lists camera, but fails to display images when tested, something with usb protocols)
    #camera.find_usb_devices()
    
    #default webcam camera output feed (press q to exit)
    #camera.webcam_feed()

    #taking screenshot from the TC View app
    #camera.take_app_image()

    base_path = Path(__file__).resolve().parents[0]
    
    path =  os.path.join(base_path, 'localcache', 'thermal_frame_0.npy')
    model_interface.set_thermal_npy(path)
    detection, bboxes, result_image = model_interface.detect_fire()
    if detection:
        print("fire detected ", bboxes)
        cv2.imshow('test', result_image)
        cv2.waitKey(0)
    else:
        print("no fire detected ", bboxes)

    path =  os.path.join(base_path, 'localcache', 'thermal_frame_1.npy')
    model_interface.set_thermal_npy(path)
    detection, bboxes, result_image = model_interface.detect_fire()
    if detection:
        print("fire detected ", bboxes)
        cv2.imshow('test', result_image)
        cv2.waitKey(3000)
    else:
        print("no fire detected ", bboxes)

    path =  os.path.join(base_path, 'localcache', 'thermal_frame_appendix.npy')
    model_interface.set_thermal_npy(path)
    detection, bbox, result_image = model_interface.detect_and_bound_pistol()
    if detection:
        print("pistol detected ")
    else:
        print("no pistol detected ")
    cv2.imshow('test', result_image)
    cv2.waitKey(3000)

    path =  os.path.join(base_path, 'localcache', 'thermal_frame_pocket.npy')
    model_interface.set_thermal_npy(path)
    detection, bbox, result_image = model_interface.detect_and_bound_pistol()
    if detection:
        print("pistol detected ")
    else:
        print("no pistol detected ")
    cv2.imshow('test', result_image)
    cv2.waitKey(3000)