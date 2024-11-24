#pytorch imports
import torch
import torch.nn as nn
from torch.utils.data import DataLoader, random_split
from torchvision import transforms, datasets
import os

#general imports
from sklearn.metrics import accuracy_score, confusion_matrix, ConfusionMatrixDisplay
import matplotlib.pyplot as plt
from PIL import Image

#Binary classifier 
class CustomCNN(nn.Module):
    def __init__(self):
        super(CustomCNN, self).__init__()
        #prepare data
        # self.preprocessing()

        #in: 3x256x256
        self.conv1 = nn.Conv2d(in_channels=3, out_channels=32, kernel_size=3, stride=1, padding=1)
        self.bn1 = nn.BatchNorm2d(32)
        self.relu1 = nn.ReLU()
        self.pool1 = nn.MaxPool2d(2,2)

        self.conv2 = nn.Conv2d(in_channels=32, out_channels=64, kernel_size=3, stride=1, padding=1)
        self.bn2 = nn.BatchNorm2d(64)
        self.relu2 = nn.ReLU()
        self.pool2 = nn.MaxPool2d(2,2)

        self.conv3 = nn.Conv2d(in_channels=64, out_channels=64, kernel_size=3, stride=1, padding=1)
        self.bn3 = nn.BatchNorm2d(64)
        self.relu3 = nn.ReLU()
        self.pool3 = nn.MaxPool2d(2,2)

        self.conv4 = nn.Conv2d(in_channels=64, out_channels=128, kernel_size=3, stride=1, padding=1)
        self.bn4 = nn.BatchNorm2d(128)
        self.relu4 = nn.ReLU()
        self.pool4 = nn.MaxPool2d(2,2)

        self.conv5 = nn.Conv2d(in_channels=128, out_channels=128, kernel_size=3, stride=1, padding=1)
        self.bn5 = nn.BatchNorm2d(128)
        self.relu5 = nn.ReLU()
        self.pool5 = nn.MaxPool2d(2,2)

        self.conv6 = nn.Conv2d(in_channels=128, out_channels=256, kernel_size=3, stride=1, padding=1)
        self.bn6 = nn.BatchNorm2d(256)
        self.relu6 = nn.ReLU()
        self.pool6 = nn.MaxPool2d(2,2)
        #out: 256x4x4

        self.fc1 = nn.Linear(in_features=256*4*4, out_features=256)
        self.drop = nn.Dropout(0.5)
        self.fc2 = nn.Linear(in_features=256, out_features=2)

        #move model to gpu if possible
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self = self.to(self.device)

    def forward(self, x):
        output = self.pool1(self.relu1(self.bn1(self.conv1(x))))
        output = self.pool2(self.relu2(self.bn2(self.conv2(output))))
        output = self.pool3(self.relu3(self.bn3(self.conv3(output))))
        output = self.pool4(self.relu4(self.bn4(self.conv4(output))))
        output = self.pool5(self.relu5(self.bn5(self.conv5(output))))
        output = self.pool6(self.relu6(self.bn6(self.conv6(output))))

        output = output.view(-1, 256*4*4)
        output = self.fc1(output)
        output = self.drop(output)
        output = self.fc2(output)
        return output
    

    def preprocessing(self):
            #prepare images
            transform = transforms.Compose([
                transforms.Resize((256,256)),
                transforms.ToTensor()
            ])

            dataset = datasets.ImageFolder(root="datasets/package-classification", transform=transform)

            #split dataset
            train_size = int(0.8 * len(dataset))
            val_size = len(dataset) - train_size
            train_dataset, val_dataset = random_split(dataset, [train_size, val_size])

            #use dataloaders for batching
            batch_size = 64
            self.train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True)
            self.val_loader = DataLoader(val_dataset, batch_size=batch_size, shuffle=False)
            

    def train_model(self):
        #define hyperparameters
        criterion = nn.CrossEntropyLoss()
        optimizer = torch.optim.Adam(self.parameters(), lr=0.0001)
        self.num_epochs = 10

        #save statistics for graphing 
        self.epoch_train_loss = []
        self.epoch_train_acc = []
        self.epoch_val_loss = []
        self.epoch_val_acc = []
        self.val_labels = []
        self.val_prediction_labels = []

        best_val_loss = float("inf")
        best_epoch = 0

        for epoch in range(self.num_epochs):
            self.train()
            batch_train_loss = []
            batch_train_acc = []
            batch_val_loss = []
            batch_val_acc = []
            
            #training
            for (data,labels) in self.train_loader:
                data = data.to(self.device)
                labels = labels.to(self.device)

                optimizer.zero_grad()
                prediction = self(data)

                loss = criterion(prediction, labels)
                batch_train_loss.append(loss.item())

                loss.backward()
                optimizer.step()

                #batch accuracy
                _, prediction_labels = torch.max(prediction, dim=1)
                actual_labels = labels.cpu().numpy()
                prediction_labels = prediction_labels.cpu().numpy()
                batch_train_acc.append(accuracy_score(actual_labels, prediction_labels))

            #epoch accuracy & loss
            train_acc = sum(batch_train_acc) / len(batch_train_acc)
            self.epoch_train_acc.append(train_acc)

            train_loss = sum(batch_train_loss) / len(batch_train_loss)
            self.epoch_train_loss.append(train_loss)

            #validation
            self.eval()
            with torch.no_grad():
                for(data,labels) in self.val_loader:
                    data = data.to(self.device)
                    labels = labels.to(self.device)

                    prediction = self(data)

                    loss = criterion(prediction, labels)
                    batch_val_loss.append(loss.item())

                    #batch accuracy
                    _, prediction_labels = torch.max(prediction, dim=1)
                    actual_labels = labels.cpu().numpy()
                    prediction_labels = prediction_labels.cpu().numpy()
                    batch_val_acc.append(accuracy_score(actual_labels, prediction_labels))

                    #track validation labels for confusion matrix
                    self.val_labels.extend(actual_labels)
                    self.val_prediction_labels.extend(prediction_labels)

                #epoch accuracy & loss
                val_acc = sum(batch_val_acc) / len(batch_val_acc)
                self.epoch_val_acc.append(val_acc)

                val_loss = sum(batch_val_loss) / len(batch_val_loss)
                self.epoch_val_loss.append(val_loss)

                #save best epoch
                if(val_loss < best_val_loss):
                    torch.save(self.state_dict(), "model-weights/best_package_classification.pth")
                    best_val_loss = val_loss
                    best_epoch = epoch+1
            
                #print training results
                if(epoch == 0):
                    print("Package Classification")
                print(f"Epoch: {epoch+1} train acc: {self.epoch_train_acc[epoch]:.4f} train loss: {self.epoch_train_loss[epoch]:.4f} val acc: {self.epoch_val_acc[epoch]:.4f} val loss: {self.epoch_val_loss[epoch]:.4f}")
                if(epoch == self.num_epochs-1):
                    print(f"Best Epoch: {best_epoch} best val loss: {best_val_loss:.4f}")


    def prediction(self, image_path):
        #prepare test image
        transform = transforms.Compose([
            transforms.Resize((256,256)),
            transforms.ToTensor()
        ])
        image = Image.open(image_path)
        image = transform(image)
        image = image.unsqueeze(0) #add batch dimension
        image = image.to(self.device)

        #make prediction
        current_dir = os.path.dirname(os.path.abspath(__file__))
        model_path = os.path.join(current_dir, 'model-weights/best_package_classification.pth')
        self.load_state_dict(torch.load(model_path, weights_only=True))
        self.eval()
        with torch.no_grad():
            prediction = self(image)
        _, predicted_class = torch.max(prediction, 1)

        if(predicted_class[0] == 1):
            return 1
        else:
            return 0


    def display_training_graphs(self):
        plt.figure(figsize=(12, 6))
        #accuracy
        plt.subplot(1, 2, 1)
        plt.title("Accuracy")
        plt.xlabel("Epoch")
        plt.ylabel("Accuracy")
        plt.ylim(0, 1)

        epochs = range(1,self.num_epochs+1)
        plt.plot(epochs, self.epoch_train_acc, label="Training Accuracy")
        plt.plot(epochs, self.epoch_val_acc, label="Validation Accuracy")
        plt.legend()

        #loss
        plt.subplot(1, 2, 2)
        plt.title("Loss")
        plt.xlabel("Epoch")
        plt.ylabel("Loss")

        plt.plot(epochs, self.epoch_train_loss, label="Training Loss")
        plt.plot(epochs, self.epoch_val_loss, label="Validation Loss")
        plt.legend()
        plt.show()


    def displayConfusionMatrix(self):
        #display confusion matrix on validation set.
        val_cm = confusion_matrix(self.val_labels, self.val_prediction_labels)
        ConfusionMatrixDisplay(val_cm).plot()
        plt.show()

