#bounding_pistol.ipynb is for developing this model.
#This file is for creating a class to represent and use the model

#imports
import torch
import torch.nn as nn
import cv2
import numpy as np
#import matplotlib.pyplot as plt

class BoundPistol(nn.Module):
    def __init__(self):
        super(BoundPistol, self).__init__()

        self.current_image = None
        num_classes = 2

        #model takes input of 256 x 256 x 1
        #make sure in_channels aligns with out_channels from the previous layer

        self.conv1 = nn.Conv2d(in_channels = 1, out_channels = 32, kernel_size = 3, stride = 1, padding = 1)
        self.bn1 = nn.BatchNorm2d(32)

        self.conv2 = nn.Conv2d(in_channels = 32, out_channels = 32, kernel_size = 3, stride = 1, padding = 1)
        self.bn2 = nn.BatchNorm2d(32)

        self.conv3 = nn.Conv2d(in_channels = 32, out_channels = 64, kernel_size = 3, stride = 1, padding = 1)
        self.bn3 = nn.BatchNorm2d(64)

        self.conv4 = nn.Conv2d(in_channels = 64, out_channels = 64, kernel_size = 3, stride = 1, padding = 1)
        self.bn4 = nn.BatchNorm2d(64)

        self.conv5 = nn.Conv2d(in_channels = 64, out_channels = 128, kernel_size = 3, stride = 1, padding = 1)
        self.bn5 = nn.BatchNorm2d(128)

        self.conv6 = nn.Conv2d(in_channels = 128, out_channels = 128, kernel_size = 3, stride = 1, padding = 1)
        self.bn6 = nn.BatchNorm2d(128)

        self.conv7 = nn.Conv2d(in_channels = 128, out_channels = 256, kernel_size = 3, stride = 1, padding = 1)
        self.bn7 = nn.BatchNorm2d(256)

        self.conv8 = nn.Conv2d(in_channels = 256, out_channels = 128, kernel_size = 3, stride = 1, padding = 1)
        self.bn8 = nn.BatchNorm2d(128)

        self.conv9 = nn.Conv2d(in_channels = 128, out_channels = 128, kernel_size = 3, stride = 1, padding = 1)
        self.bn9 = nn.BatchNorm2d(128)

        #16 x 16 x 128 comes from sizing, the pool in each layer cut dimensionality in half, 256 is out channels
        self.fc1 = nn.Linear(in_features = (16 * 16 * 128), out_features = 64)
        self.fc2 = nn.Linear(in_features = 64, out_features = 32)
        self.fc3 = nn.Linear(in_features = 32, out_features = 32)
        self.fc4 = nn.Linear(in_features = 32, out_features = 32)
        self.fc_class = nn.Linear(in_features = 32, out_features = num_classes)
        self.fc_bbox = nn.Linear(in_features = 32, out_features = 4)

        self.pool = nn.MaxPool2d(2,2)
        self.leaky_relu = nn.LeakyReLU()
        self.sigmoid = nn.Sigmoid()
        self.dropout = nn.Dropout(0.5)

    #model's foward pass
    def forward(self, input):
        #forward pass first block, no pool
        output = self.conv1(input)
        output = self.bn1(output)
        output = self.leaky_relu(output)
        #output_pool_1 = self.pool(output)

        #forward pass second block, pool
        output = self.conv2(output)
        output = self.bn2(output)
        output = self.leaky_relu(output)
        output_pool_2 = self.pool(output)

        #forward pass third block, no pool
        output = self.conv3(output_pool_2)
        output = self.bn3(output)
        output = self.leaky_relu(output)
        #output_pool_3 = self.pool(output)

        #skip connection, connect 1-3
        #skip1 = self.pool(input) #downsample
        #if skip1.shape[1] != output.shape[1]:  # if channels differ, adjust
        #    skip1 = nn.functional.pad(skip1, (0, 0, 0, 0, 0, output.shape[1] - skip1.shape[1]))
        #output += skip1
        output_skip_1 = output

        #forward pass fourth block, pool
        output = self.conv4(output_skip_1)
        output = self.bn4(output)
        output = self.leaky_relu(output)
        output_pool_4 = self.pool(output)

        #forward pass fifth block, no pool
        output = self.conv5(output_pool_4)
        output = self.bn5(output)
        output = self.leaky_relu(output)
        #output_pool_5 = self.pool(output)

        #forward pass sixth block, pool
        output = self.conv6(output)
        output = self.bn6(output)
        output = self.leaky_relu(output)
        output_pool_6 = self.pool(output)

        #skip connection, connect 4-6
        skip2 = self.pool(self.pool(output_skip_1)) #downsample
        if skip2.shape[1] != output_pool_6.shape[1]:  # if channels differ, adjust
            skip2 = nn.functional.pad(skip2, (0, 0, 0, 0, 0, output_pool_6.shape[1] - skip2.shape[1]))
        output_pool_6 += skip2
        output_skip_2 = output_pool_6

        #forward pass seventh block, no pool
        output = self.conv7(output_pool_6)
        output = self.bn7(output)
        output = self.leaky_relu(output)

        #forward pass eigth block, pool
        output = self.conv8(output)
        output = self.bn8(output)
        output = self.leaky_relu(output)
        output_pool_8 = self.pool(output)

        #forward pass ninth block, no pool
        output = self.conv9(output_pool_8)
        output = self.bn9(output)
        output = self.leaky_relu(output)

        #skip connection, connect 6-9
        skip3 = self.pool(output_skip_2) # downsample input to match spatial dims
        if skip3.shape[1] != output.shape[1]:  # if channels differ, adjust
            skip3 = nn.functional.pad(skip3, (0,0,0,0, 0, output.shape[1] - skip3.shape[1]))
        output += skip3
        output_skip_3 = output

        #forward pass flattening
        output = output.view(-1, 128 * 16 * 16)

        #forward pass fully connected layers
        output = self.fc1(output)
        output = self.leaky_relu(output)
        output = self.dropout(output)

        output = self.fc2(output)
        output = self.leaky_relu(output)
        output = self.dropout(output)

        output = self.fc3(output)
        output = self.leaky_relu(output)
        output = self.dropout(output)

        output = self.fc4(output)
        output = self.leaky_relu(output)
        output = self.dropout(output)

        output_class = self.fc_class(output)
        
        output_bbox = self.fc_bbox(output)
        output_bbox = self.sigmoid(output_bbox)

        return output_class, output_bbox
    
    #returns T/F if gun detected, passes in a PIL image
    def pistol_detected(self, image):
        self.current_image = image
        device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

        self.eval()
        with torch.no_grad():
            self.current_image.to(device)

            #this class is the model, self(self.current) passes into inherited
            #goes through call function, which runs forward pass
            pred_class, pred_bbox = self(self.current_image)
            pred_bbox = pred_bbox.cpu().detach().numpy().flatten()

            #convert bbox coordinates to pixel values
            image = self.current_image.squeeze(0).permute(1, 2, 0).cpu().numpy()  
            image = (image * 255).astype(np.uint8)  
            height, width, _ = image.shape
            pred_bbox = [ int(pred_bbox[0] * width), int(pred_bbox[1] * height), int(pred_bbox[2] * width), int(pred_bbox[3] * height)]

            #check prediction class, 0 is no gun, 1 is gun
            predicted_class = torch.argmax(pred_class, dim = 1).item()
            if predicted_class == 1:
                return True, pred_bbox, self.get_bounded_image(pred_bbox)
            else:
                return False, pred_bbox, self.get_bounded_image(pred_bbox)

    def get_bounded_image(self, pred_bbox):
        image = self.current_image.squeeze(0).permute(1, 2, 0).cpu().numpy()  
        image = (image * 255).astype(np.uint8)  

        #draw predicted bounding box in red
        image = cv2.rectangle(image, 
                                (pred_bbox[0], pred_bbox[1]), 
                                (pred_bbox[2], pred_bbox[3]), 
                                (255, 0, 0), 2)
        
        #print(pred_bbox)
        #cv2.imshow('test', image)
        #cv2.waitKey(0)
        return image