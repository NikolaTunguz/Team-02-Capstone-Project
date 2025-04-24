#interface to interact with all of the models with the rest of the system

#class imports
import numpy as np
import cv2
from .thermal_models.thermal_model_interface import ThermalInterface
from .normal_models.normal_model_interface import NormalInterface


class ModelInterface:
    def __init__(self):
        self.normal_interface = NormalInterface()
        self.thermal_interface = ThermalInterface()

        self.normal_image = None

        self.thermal_npy_path = None
        self.thermal_image = None
        self.thermal_grayscale = None
        self.thermal_data = None

    def set_normal_image(self, image_path):
        self.normal_image = image_path

    def set_thermal_npy(self, npy_path):
        self.thermal_npy_path = npy_path
        self.convert_raw_thermal()

    def convert_raw_thermal(self):
        npy_file = np.load(self.thermal_npy_path)
        image_data, thermal_data = np.array_split(npy_file, 2, axis = 1)
        
        #first section for image conversion
        thermal_viewable, thermal_grayscale = self.thermal_to_image(image_data)
        self.thermal_image, self.thermal_grayscale = thermal_viewable, thermal_grayscale
    
        #second section for thermal conversion
        thermal_temps = self.thermal_to_temp(thermal_data)
        self.thermal_data = thermal_temps

    def thermal_to_image(self, image_data):
        hi = image_data[:, :, 0].astype(np.uint16)
        lo = image_data[:, :, 1].astype(np.uint16)
        raw_temp = hi * 256 + lo

        #normalize for display (0–255)
        normalized = cv2.normalize(raw_temp, None, 0, 255, cv2.NORM_MINMAX)
        normalized = normalized.astype(np.uint8)

        #apply a color map for visibility
        colored = cv2.applyColorMap(normalized, cv2.COLORMAP_JET)
        return np.array(colored), np.array(normalized)

    def thermal_to_temp(self, thermal_data):
        min_temp = -20
        max_temp = 550
        
        hi = thermal_data[:, :, 0].astype(np.uint16)
        lo = thermal_data[:, :, 1].astype(np.uint16)

        temperatures = ((lo * 256 + hi) / 64) - 273.15

        scaled_temp = (temperatures - min_temp) / (max_temp - min_temp) * 255
        scaled_temp = np.clip(scaled_temp, 0, 255).astype(np.uint8)
        return np.array(scaled_temp)

    
    def detect_pistol(self):
        image = self.thermal_grayscale
        #cv2.imshow('test', image)
        #cv2.waitKey(2000)
        return self.thermal_interface.detect_pistol(image)
    
    def detect_and_bound_pistol(self):
        image = self.thermal_grayscale
        #cv2.imshow('input image', image)
        #cv2.waitKey(0)
        detection, pred_bbox, box_image = self.thermal_interface.detect_and_bound_pistol(image)
        #cv2.imshow('boxed output', box_image)
        return detection, pred_bbox, box_image

    def detect_fire(self):
        thermal_data = self.thermal_data
        detection, bboxes = self.thermal_interface.detect_fire(thermal_data)

        result_image = self.thermal_image
        for x1,y1, x2,y2 in bboxes:
            cv2.rectangle(result_image, (x1, y1), (x2, y2), (255, 255, 255), 2)

        return detection, bboxes, result_image

    def detect_person(self):
        image = self.normal_image
        return self.normal_interface.detect_person(image)

    def detect_package(self):
        image = self.normal_image
        return self.normal_interface.detect_package(image)
    
    def get_bbox_image(self):
        image = self.normal_image
        return self.normal_interface.get_output_image(image)

# Used for debugging models.
# def main():
#     wasd = ModelInterface()
#     wasd.set_thermal_image("test/test_image.jpg")
#     wasd.detect_pistol()

# if __name__ == '__main__':
#     main()
