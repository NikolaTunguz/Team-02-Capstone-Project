#this class is to create a custom gun dataset
#this will contain self annotated data from outside source, and annotated self collected data
#each image only contains 1 pistol, and 1 associated annotation

import os
from torch.utils.data import Dataset
from torchvision import transforms
from PIL import Image

#inherit from dataset to be able to use dataloader
class CustomDataset(Dataset):
    def __init__(self, root_directory, transform, categories):

        #current subfolders are with gun, without gun, in the future this can probably be in one folder instead of two
        self.root_directory = root_directory
        self.sub_directory = categories

        self.transformation = transform

        self.images = []
        self.labels = []
        self.bounding_boxes = []

        self.parse_data()

    
    #function to collect info for each image
    def parse_data(self):
        print(self.root_directory)
        for dir in self.sub_directory:
            image_path = os.path.join(self.root_directory, dir, 'images')
            label_path = os.path.join(self.root_directory, dir, 'labels')
            #print(image_path)

            for image_name in os.listdir(image_path):
                #print(image_name)
                label_name = image_name.replace('.jpg', '.txt')

                image_file = os.path.join(image_path, image_name)
                label_file = os.path.join(label_path, label_name)

                with open(label_file, 'r') as f:
                    class_label, x_center, y_center, width, height = f.readline().split()

                #pytorch transform requires a pil image or tensor, this opens as PIL
                transformed_image = self.transformation(Image.open(image_file))

                _, image_height, image_width = transformed_image.shape
                x_center = float(x_center) * image_width
                y_center = float(y_center) * image_height
                width = float(width) * image_width
                height = float(height) * image_height

                x1 = int(x_center - (width / 2))
                y1 = int(y_center - (height / 2))
                x2 = int(x_center + (width / 2))
                y2 = int(y_center + (height / 2))

                self.images.append(transformed_image)
                self.labels.append(int(class_label))
                self.bounding_boxes.append( (x1, y1, x2, y2) )


    #required functions for dataset/dataloader compatability
    def __len__(self):
        return len(self.labels)
    
    def __getitem__(self, index):
        return self.images[index], self.labels[index], self.bounding_boxes[index]

