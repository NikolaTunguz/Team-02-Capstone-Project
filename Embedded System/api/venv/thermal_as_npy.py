import numpy as np
import cv2

cap = cv2.VideoCapture(8, cv2.CAP_V4L)
cap.set(cv2.CAP_PROP_CONVERT_RGB, 0.0)

frame_num = 0
while cap.isOpened():
    ret, frame = cap.read()
    if ret:
        imdata, thdata = np.array_split(frame, 2)
        #print('frame was read')
        
        #combine into one array to save
        combined = np.concatenate((imdata, thdata), axis=1) 
        
        np.save(f"localcache/thermal_frame_{frame_num}.npy", combined)
        #print('frame was saved')

        break 

cap.release()