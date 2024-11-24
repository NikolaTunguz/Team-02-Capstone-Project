#interface to interact with all of the models with the rest of the system
import cv2
from PIL import Image

from Models.thermal_models.thermal_model_interface import ThermalInterface
from Models.normal_models.normal_model_interface import NormalInterface


class ModelInterface:
    def __init__(self):
        self.normal_interface = NormalInterface()
        self.thermal_interface = ThermalInterface()

        self.normal_image = None
        self.thermal_image = None

    def set_normal_image(self, image_path):
        self.normal_image = cv2.imread(image_path)

    def set_thermal_image(self, image_path):
        self.thermal_image = Image(image_path)


