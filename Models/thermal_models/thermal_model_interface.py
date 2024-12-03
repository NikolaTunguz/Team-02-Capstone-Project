#This file (ThermalInterface.py) is for using the model(s) with thermal imaging.
#This currently only contains concealed pistol, will expand in future to detect fire

#general imports
import torch
import torchvision.transforms as transforms
from PIL import Image
import os

#class imports
from .concealed_pistol_classification import ConcealedPistol


class ThermalInterface:
    def __init__(self):
        self.image = None

        self.concealed_pistol_model = ConcealedPistol()

        current_dir = os.path.dirname(os.path.abspath(__file__))
        model_path = os.path.join(current_dir, 'best_concealed_model.pth')
        device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.concealed_pistol_model.load_state_dict(torch.load(model_path, weights_only = True, map_location=device))

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

if __name__ == '__main__':
    thermal_interface = ThermalInterface()
    image_path = '../Data/test_image.jpg'
    thermal_interface.detect_pistol(image_path)