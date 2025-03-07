#This file (ThermalInterface.py) is for using the model(s) with thermal imaging.
#This currently only contains concealed pistol, will expand in future to detect fire

#general imports
import torch
import torchvision.transforms as transforms
from PIL import Image
import os
import matplotlib.pyplot as plt

#class imports
from .concealed_pistol_classification import ConcealedPistol
from .concealed_pistol_detection import BoundPistol


class ThermalInterface:
    def __init__(self):
        self.image = None

        self.concealed_pistol_model = ConcealedPistol()
        self.bound_pistol_model = BoundPistol()

        current_dir = os.path.dirname(os.path.abspath(__file__))
        concealed_model_path = os.path.join(current_dir, 'best_concealed_model.pth')
        bound_model_path = os.path.join(current_dir, 'bounding_pistol.pth')
        device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

        self.concealed_pistol_model.load_state_dict(torch.load(concealed_model_path, weights_only = True, map_location = device))
        self.bound_pistol_model.load_state_dict(torch.load(bound_model_path, weights_only = True, map_location = device))


    def transform_image(self):
        #shape and grayscale image
        transform = transforms.Compose([
            transforms.Resize((256, 256)),
            transforms.Grayscale(),
            transforms.ToTensor()
        ])

        #transform, and change to have right dimensionality
        self.image = transform(self.image)
        self.image = self.image.unsqueeze(0) 

    def detect_pistol(self, image_path):
        #process image
        self.image = Image.open(image_path)
        self.transform_image()

        #send to model to detect
        detected = self.concealed_pistol_model.pistol_detected(self.image)

        if detected:
            return 1
        else:
            return 0
        
    def detect_and_bound_pistol(self, image_path):
        self.image = Image.open(image_path)
        self.transform_image()

        detected, result_image = self.bound_pistol_model.pistol_detected(self.image)
        
        if detected:
            plt.imshow(result_image, cmap='gray')
            plt.axis("off")
            plt.title("Pistol Detected" if detected else "No Pistol Detected")
            plt.show()
            return 1, result_image  
        else:
            return 0, result_image


#if __name__ == '__main__':
#    thermal_interface = ThermalInterface()
#    image_path = '../Data/test_image.jpg'
#    thermal_interface.detect_pistol(image_path)

#    thermal_interface.detect_and_bound_pistol(image_path)