#ConcealedPistolDetection.ipynb is for developing this model.
#This file is for creating a class to represent and use the model

#imports
import torch
import torch.nn as nn
#import matplotlib.pyplot as plt

class ConcealedPistol(nn.Module):
    def __init__(self):
        super(ConcealedPistol, self).__init__()

        self.current_image = None
        num_classes = 2

        #model takes input of 256 x 256 x 1
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
    
        #8 x 8 x 128 comes from sizing, the pool in each layer cut dimensionality in half, 128 is out channels
        self.fc1 = nn.Linear(in_features = (8 * 8 * 128), out_features = 64)
        self.fc2 = nn.Linear(in_features = 64, out_features = num_classes)

        self.pool = nn.MaxPool2d(2,2)
        self.relu = nn.ReLU()
        self.dropout = nn.Dropout(0.5)

    #model's foward pass
    def forward(self, input):
        #forward pass first block
        output = self.conv1(input)
        output = self.bn1(output)
        output = self.relu(output)
        output_pool_1 = self.pool(output)

        #forward pass second block
        output = self.conv2(output_pool_1)
        output = self.bn2(output)
        output = self.relu(output)
        output_pool_2 = self.pool(output)

        #forward pass third block
        output = self.conv3(output_pool_2)
        output = self.bn3(output)
        output = self.relu(output)
        output_pool_3 = self.pool(output)

        #forward pass fourth block
        output = self.conv4(output_pool_3)
        output = self.bn4(output)
        output = self.relu(output)
        output_pool_4 = self.pool(output)

        #forward pass fifth block
        output = self.conv5(output_pool_4)
        output = self.bn5(output)
        output = self.relu(output)
        output_pool_5 = self.pool(output)

        #forward pass flattening
        output = output_pool_5.view(-1, 128 * 8 * 8)

        #forward pass fully connected layers
        output = self.fc1(output)
        output = self.relu(output)
        output = self.dropout(output)

        output = self.fc2(output)
        return output
    
    #returns T/F if gun detected
    def pistol_detected(self, image):

        self.current_image = image
        device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

        self.eval()
        with torch.no_grad():
            self.current_image.to(device)

            #this class is the model, self(self.current) passes into inherited
            #goes through call function, which runs forward pass
            prediction = self(self.current_image)

            #check prediction class, 0 is gun, 1 no gun
            predicted_class = torch.argmax(prediction, dim = 1).item()
            if predicted_class == 0:
                return True
            return False

    def show_image(self):
        pass