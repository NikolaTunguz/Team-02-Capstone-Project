import cv2
import numpy as np

class FireDetection():
    def __init__(self):
        self.image_path = None

    def set_thermal_image_path(self, image_path):
        self.image_path = image_path

    def convert_to_temperature(self, image):
        #function temperature conversion logic from https://github.com/leswright1977/PyThermalCamera/blob/main/src/tc001v4.2.py
    
        # #find the max temperature in the frame
        # lomax = np.uint16(thermal_data[..., 1].max())
        # posmax = thermal_data[..., 1].argmax()
        # #since argmax returns a linear index, convert back to row and col
        # mcol,mrow = divmod(posmax, width)
        # himax = thermal_data[mcol][mrow][0]
        # lomax = lomax * 256
        # maxtemp = himax + lomax
        # maxtemp = (maxtemp / 64) - 273.15
        # maxtemp = round(maxtemp, 2)

        # #find the lowest temperature in the frame
        # lomin = np.uint16(thermal_data[..., 1].min())
        # posmin = thermal_data[..., 1].argmin()
        # #since argmax returns a linear index, convert back to row and col
        # lcol,lrow = divmod(posmin,width)
        # himin = thermal_data[lcol][lrow][0]
        # lomin=lomin * 256
        # mintemp = himin+lomin
        # mintemp = (mintemp / 64) - 273.15
        # mintemp = round(mintemp, 2)

        # #find the average temperature in the frame
        # loavg = thermal_data[..., 1].mean()
        # hiavg = thermal_data[..., 0].mean()
        # loavg = loavg * 256
        # avgtemp = loavg + hiavg
        # avgtemp = (avgtemp / 64) - 273.15
        # avgtemp = round(avgtemp, 2)

        # print(maxtemp, mintemp, avgtemp)

        #scale all temperatures from -20 - 550C to 0-255, limits come from hardware specifications
        image_data, thermal_data = np.array_split(image, 2, axis = 1)

        min_temp = -20
        max_temp = 550
        
        lo = thermal_data[:, :, 1].astype(np.uint16)
        hi = thermal_data[:, :, 0].astype(np.uint16)

        temperatures = ((lo * 256 + hi) / 64) - 273.15

        scaled_temp = (temperatures - min_temp) / (max_temp - min_temp) * 255
        scaled_temp = np.clip(scaled_temp, 0, 255).astype(np.uint8)

        return scaled_temp


    def detect(self):
        image = np.load(self.image_path)
        thermal_image = self.convert_to_temperature(image)
        #cv2.imshow('test',thermal_image)
        #cv2.waitKey(0)

        #-20C is 0, 550C is 255
        #fire begins around ~200C, corresponds to ~86.8 in pixel value
        #lighter fires are tamer, ~100
        _, thermal_image = cv2.threshold(thermal_image, 30, 255, cv2.THRESH_BINARY)
        #cv2.imshow('test',thermal_image)
        #cv2.waitKey(0)

        contours, _ = cv2.findContours(thermal_image, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

        detected = False
        num_fires = 0
        true_contours = []

        for contour in contours:
            area = cv2.contourArea(contour)
            if area > 10:
                detected = True
                num_fires += 1
                true_contours.append(contour)
        
        #cv2.drawContours(thermal_image, true_contours, -1, (150), 2)
        #cv2.imshow('test',thermal_image)
        #cv2.waitKey(0)
        
        if detected:
            return True, num_fires, true_contours
        else:
            return False, num_fires, true_contours

if __name__ == '__main__':
    fire = FireDetection()

    fire.set_thermal_image_path('../../Embedded System/api/venv/localcache/thermal_frame_0.npy')
    detection, num_fires, contours = fire.detect()
    print(detection, num_fires)

    fire.set_thermal_image_path('../../Embedded System/api/venv/localcache/thermal_frame_1.npy')
    detection, num_fires, contours = fire.detect()
    print(detection, num_fires)
