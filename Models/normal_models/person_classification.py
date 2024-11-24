#pytorch imports
import torch
import torch.nn as nn
from torch.utils.data import DataLoader, random_split
import torchvision
from torchvision import transforms, datasets
import os

#general imports
from sklearn.metrics import accuracy_score, confusion_matrix, ConfusionMatrixDisplay
import matplotlib.pyplot as plt
from PIL import Image

class FineTunedRN18():
    def __init__(self):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        # self.preprocessing()

        #define model
        self.model = torchvision.models.resnet18(weights="DEFAULT")
        self.model.fc = nn.Linear(self.model.fc.in_features, 2) #number of classes = 2 for binary classification
        self.model.to(self.device)


    def preprocessing(self):
        #prepare images
        transform = transforms.Compose([
            transforms.Resize((256,256)),
            transforms.ToTensor()
        ])

        dataset = datasets.ImageFolder(root="datasets/person-classification", transform=transform)

        #split dataset and add to dataloader
        train_size = int(0.9 * len(dataset))
        val_size = len(dataset) - train_size
        train_dataset, val_dataset = random_split(dataset, [train_size, val_size])

        batch_size = 32
        self.train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True)
        self.val_loader = DataLoader(val_dataset, batch_size=batch_size, shuffle=False)


    def train_model(self):
        #define hyperparameters
        criterion = nn.CrossEntropyLoss()
        optimizer = torch.optim.Adam(self.model.parameters(), lr=0.0001, weight_decay=0.0001)
        self.num_epochs = 8

        #save loss, accuracy, and labels
        self.epoch_train_acc = []
        self.epoch_train_loss = []
        self.epoch_val_acc = []
        self.epoch_val_loss = []
        self.val_labels = []
        self.val_prediction_labels = []

        best_val_loss = float("inf")
        best_epoch = 0

        for epoch in range(self.num_epochs):
            self.model.train()
            batch_train_loss = []
            batch_train_acc = []
            batch_val_loss = []
            batch_val_acc = []

            #training
            for (data,labels) in self.train_loader:
                data = data.to(self.device)
                labels = labels.to(self.device)

                optimizer.zero_grad()
                prediction = self.model(data)

                loss = criterion(prediction, labels)
                batch_train_loss.append(loss.item())

                loss.backward()
                optimizer.step()

                #batch accuracy
                _, prediction_labels = torch.max(prediction, dim=1) #save indices only
                #convert from tensor to numpy array
                actual_labels = labels.cpu().numpy()
                prediction_labels = prediction_labels.cpu().numpy()
                batch_train_acc.append(accuracy_score(actual_labels, prediction_labels))

            #epoch accuracy & loss
            train_acc = sum(batch_train_acc) / len(batch_train_acc)
            self.epoch_train_acc.append(train_acc)

            train_loss = sum(batch_train_loss) / len(batch_train_loss)
            self.epoch_train_loss.append(train_loss)

            #validation
            self.model.eval()
            with torch.no_grad():
                for(data,labels) in self.val_loader:
                    data = data.to(self.device)
                    labels = labels.to(self.device)

                    prediction = self.model(data)

                    loss = criterion(prediction, labels)
                    batch_val_loss.append(loss.item())

                    #batch accuracy
                    _, prediction_labels = torch.max(prediction, dim=1)
                    actual_labels = labels.cpu().numpy()
                    prediction_labels = prediction_labels.cpu().numpy()
                    batch_val_acc.append(accuracy_score(actual_labels, prediction_labels))

                    #save all validation predictions for confusion matrix
                    self.val_labels.extend(actual_labels)
                    self.val_prediction_labels.extend(prediction_labels)

                #epoch accuracy & loss
                val_acc = sum(batch_val_acc) / len(batch_val_acc)
                self.epoch_val_acc.append(val_acc)

                val_loss = sum(batch_val_loss) / len(batch_val_loss)
                self.epoch_val_loss.append(val_loss)
            
            #save best epoch
            if(val_loss < best_val_loss):
                torch.save(self.model.state_dict(), "model-weights/best_person_classification.pth")
                best_val_loss = val_loss
                best_epoch = epoch+1

            if(epoch == 0):
                print("Person Classification")
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
        model_path = os.path.join(current_dir, 'model-weights/best_person_classification.pth')
        self.model.load_state_dict(torch.load(model_path, weights_only=True))
        self.model.eval()
        with torch.no_grad():
            prediction = self.model(image)
        _, predicted_class = torch.max(prediction, 1)

        #print prediction
        if(predicted_class == 1):
            #print("Person Detected.")
            return 1
        else:
            #print("No Person Detected.")
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
        #display confusion matrix for validation set
        val_cm = confusion_matrix(self.val_labels, self.val_prediction_labels)
        ConfusionMatrixDisplay(val_cm).plot()
