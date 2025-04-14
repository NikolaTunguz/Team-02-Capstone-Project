#interface to interact with all of the models with the rest of the system

#class imports
from .thermal_models.thermal_model_interface import ThermalInterface
from .normal_models.normal_model_interface import NormalInterface


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
        return self.thermal_interface.detect_pistol(image)
    
    def detect_and_bound_pistol(self):
        image = self.thermal_image
        detection, box_image = self.thermal_interface.detect_and_bound_pistol(image)
        return detection, box_image

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
