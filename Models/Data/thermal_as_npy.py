import numpy as np
import cv2

def convert_raw_thermal_to_displayable(self, npy_file):
    image = npy_file
    image_data, thermal_data = np.array_split(image, 2, axis = 1)
    hi = image_data[:, :, 0].astype(np.uint16)
    lo = image_data[:, :, 1].astype(np.uint16)
    raw_temp = hi * 256 + lo

    #normalize for display (0–255)
    normalized = cv2.normalize(raw_temp, None, 0, 255, cv2.NORM_MINMAX)
    normalized = normalized.astype(np.uint8)

    #apply a color map for visibility
    colored = cv2.applyColorMap(normalized, cv2.COLORMAP_JET)

    return colored

cap = cv2.VideoCapture(8, cv2.CAP_V4L)
cap.set(cv2.CAP_PROP_CONVERT_RGB, 0.0)
frame_num = 0
while cap.isOpened():
    ret, frame = cap.read()
    if ret:
        imdata, thdata = np.array_split(frame, 2)
        combined = np.concatenate((imdata, thdata), axis=1) 

        image = convert_raw_thermal_to_displayable(combined)
        cv2.imshow('test', frame)
        
        key = cv2.waitKey(1)
        if key == ord('p'):
            np.save(f"collected_data/npy_files/without gun/thermal_frame_{frame_num}.npy", combined)
            frame_num += 1
            print('frame was saved')

        if key == ord('q'):
            break

cap.release()