#interface to interact with all of the models with the rest of the system

#class imports
from Models.thermal_models.thermal_model_interface import ThermalInterface
from Models.normal_models.normal_model_interface import NormalInterface


class ModelInterface:
    def __init__(self):
        self.normal_interface = NormalInterface()
        self.thermal_interface = ThermalInterface()

        self.normal_image = None
        self.thermal_image = None

    def set_normal_image(self, image_path):
        self.normal_image = image_path

    def set_thermal_image(self, image_path):
        self.thermal_image = image_path

    def detect_pistol(self):
        image = self.thermal_image
        self.thermal_interface.detect_pistol(image)

    def detect_person(self):
        image = self.normal_image
        self.normal_interface.detect_person(image)

    def detect_package(self):
        image = self.normal_image
        self.normal_interface.detect_package(image)