#this class is to create a custom gun dataset
#this will contain self annotated data from outside source, and annotated self collected data
#each image only contains 1 pistol, and 1 associated annotation

import os
from torch.utils.data import Dataset
from torchvision import transforms
from PIL import Image

#inherit from dataset to be able to use dataloader
class CustomDataset(Dataset):
    def __init__(self, root_directory, transform):

        #current subfolders are with gun, without gun, in the future this can probably be in one folder instead of two
        self.root_directory = root_directory
        self.sub_directory = ['with gun', 'without gun']

        self.transformation = transform

        self.images = []
        self.labels = []
        self.bounding_boxes = []

        self.parse_data()

    
    #function to collect info for each image
    def parse_data(self):
        for dir in self.sub_directory:
            image_path = os.path.join(self.root_directory, dir, 'images')
            label_path = os.path.join(self.root_directory, dir, 'labels')

            for image_name in os.listdir(image_path):
                label_name = image_name.replace('.jpg', '.txt')

                image_file = os.path.join(image_path, image_name)
                label_file = os.path.join(label_path, label_name)

                with open(label_file, 'r') as f:
                    class_label, x, y, width, height = f.readline().split()

                #pytorch transform requires a pil image or tensor, this opens as PIL
                transformed_image = self.transformation(Image.open(image_file))

                self.images.append(transformed_image)
                self.labels.append(int(class_label))
                self.bounding_boxes.append( (float(x), float(y), float(width), float(height)) )


    #required functions for dataset/dataloader compatability
    def __len__(self):
        return len(self.labels)
    
    def __getitem__(self, index):
        return self.images[index], self.labels[index], self.bounding_boxes[index]
    

