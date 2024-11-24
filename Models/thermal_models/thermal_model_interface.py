#This file (ThermalInterface.py) is for using the model(s) with thermal imaging.
#This currently only contains concealed pistol, will expand in future to detect fire

#general imports
import torch
import torchvision.transforms as transforms
from PIL import Image

#class imports
from concealed_pistol_classification import ConcealedPistol


class ThermalInterface:
    def __init__(self):
        self.image = None

        self.concealed_pistol_model = ConcealedPistol()
        self.concealed_pistol_model.load_state_dict(torch.load('best_concealed_model.pth', weights_only = True))

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
            print("gun detected")
        else:
            print("no gun detected")

if __name__ == '__main__':
    thermal_interface = ThermalInterface()
    image_path = '../Data/test_image.jpg'
    thermal_interface.detect_pistol(image_path)