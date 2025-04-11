#Faster RCNN is weak model due to lack of resources for training
#A roboflow model was trained to 94.9% mAP however requires python 3.11 
#roboflow model also has limitation of deploying restricted to 1 device.

#pytorch
import torch
import torch.optim.adadelta
from torch.utils.data import DataLoader, Dataset
import torchvision
from torchvision import transforms
from torchvision.models.detection.faster_rcnn import FastRCNNPredictor
from torchvision.ops import nms

#general 
import pandas as pd
import os
from PIL import Image

class FinedTunedFasterRCNNPackage():
    def __init__(self):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        
        self.model = torchvision.models.detection.fasterrcnn_resnet50_fpn(weights="DEFAULT")

        #fine-tune to 2 classes by replacing with custom predictor.
        in_features = self.model.roi_heads.box_predictor.cls_score.in_features
        num_classes = 2 #background, packages
        self.model.roi_heads.box_predictor = FastRCNNPredictor(in_features, num_classes)

        self.model = self.model.to(self.device)
     
    
    def preprocessing(self):
        #define datasets
        train_data = pd.read_csv("datasets/package-detection/train_annotations.csv")
        train_data = train_data.drop(columns=["width", "height"])

        val_data = pd.read_csv("datasets/package-detection/val_annotations.csv")
        val_data = val_data.drop(columns=["width", "height"])

        train_dataset = CustomDataset("datasets/package-detection/train", train_data)
        val_dataset = CustomDataset("datasets/package-detection/validation", val_data)

        #add to dataloader
        batch_size = 8
        self.train_loader = DataLoader(train_dataset, batch_size=batch_size, collate_fn=self.collate_fn, shuffle=True)
        self.val_loader = DataLoader(val_dataset, batch_size=batch_size, collate_fn=self.collate_fn, shuffle=False)


    #account for varying bounding boxes per image.
    def collate_fn(self, batch):
        images, targets = zip(*batch)
        return list(images), list(targets)
    

    def train_model(self):
        #prepare data
        self.preprocessing()

        #hyperparameters
        #optimizer = torch.optim.SGD(self.model.parameters(), lr=0.0003, momentum=0.9, weight_decay=0.0003)
        optimizer = torch.optim.SGD(self.model.parameters(), lr=0.001, momentum=0.9, weight_decay=0.0005)
        #optimizer = torch.optim.Adam(self.model.parameters(), lr=0.0001)
        num_epochs = 5

        #save best weights
        best_val_loss = float("inf")
        best_epoch = 0

        for epoch in range(num_epochs):
            epoch_train_loss = []
            epoch_val_loss = []
            self.model.train()
            #training
            for (images, targets) in self.train_loader:
                #move data to device
                for i in range(len(images)):
                    images[i] = images[i].to(self.device)

                for target in targets:
                    target["boxes"] = target["boxes"].to(self.device)
                    target["labels"] = target["labels"].to(self.device)

                optimizer.zero_grad()
                prediction = self.model(images, targets)
                batch_loss = sum(loss for loss in prediction.values())
                
                batch_loss.backward()   
                optimizer.step()

                epoch_train_loss.append(batch_loss)

            avg_train_loss = sum(epoch_train_loss) / len(epoch_train_loss)

            #validation
            #self.model.eval() the model does not return losses in validation mode.
            with torch.no_grad():
                for (images, targets) in self.val_loader:
                    for i in range(len(images)):
                        images[i] = images[i].to(self.device)

                    for target in targets:
                        target["boxes"] = target["boxes"].to(self.device)
                        target["labels"] = target["labels"].to(self.device)

                    prediction = self.model(images, targets)
                    batch_loss = sum(loss for loss in prediction.values())

                    epoch_val_loss.append(batch_loss)

            avg_val_loss = sum(epoch_val_loss) / len(epoch_val_loss)

            #save best epoch
            if(avg_val_loss < best_val_loss):
                torch.save(self.model.state_dict(), "model-weights/best_package_detection.pth")
                best_val_loss = avg_val_loss
                best_epoch = epoch+1

            #output training and validation results  results
            if(epoch == 0):
                print("Package Detection")
            print(f"Epoch: {epoch+1} train loss: {avg_train_loss:.4f} val loss: {avg_val_loss:.4f}")
            if(epoch == num_epochs-1):
                print(f"Best epoch: {best_epoch} Best val loss: {best_val_loss:.4f}")


    def prediction(self, image_path):
        #prepare image
        image = Image.open(image_path).convert("RGB")

        transform = transforms.Compose([
            transforms.ToTensor()
        ])
        image = transform(image)
        image = image.to(self.device)

        #make prediction
        current_dir = os.path.dirname(os.path.abspath(__file__))
        model_path = os.path.join(current_dir, 'model-weights/best_package_detection.pth')
        self.model.load_state_dict(torch.load(model_path, weights_only=True, map_location=self.device))
        self.model.eval()
        with torch.no_grad():
            pred = self.model([image])

        #store output (don't need labels for binary prediction)
        bboxes, scores, labels = pred[0]["boxes"], pred[0]["scores"], pred[0]["labels"]

        #filter by confidence
        score_threshold = 0.5
        keep = torch.where(scores>score_threshold)[0]
        if keep.numel() == 0: #check for empty bboxes
            return torch.empty((0, 4), device=self.device), torch.empty((0,), device=self.device)
        
        bboxes = bboxes[keep]
        scores = scores[keep]
        labels = labels[keep]

        #keep package labels only
        package_only = torch.where(labels == 1)[0]
        if package_only.numel() == 0: #check for empty bboxes
            return torch.empty((0, 4), device=self.device), torch.empty((0,), device=self.device)

        bboxes = bboxes[package_only]
        scores = scores[package_only]

        #NMS filtering
        nms_indices = nms(bboxes, scores, 0.5)
        bboxes = bboxes[nms_indices]
        scores = scores[nms_indices]

        return bboxes, scores


#formatting annotation CSV into usable dataset for faster rcnn.
class CustomDataset(Dataset):
    def __init__(self, image_root, annotation_file):
        self.image_root = image_root
        self.annotation_file = annotation_file 

    def __len__(self):
        return len(self.annotation_file)
    
    def __getitem__(self, index):
        #get specific row's image and target data
        annotation = self.annotation_file.iloc[index]
        #get image
        image_path = os.path.join(self.image_root, annotation["filename"])
        image = Image.open(image_path)
        transform = transforms.Compose([
            #transforms.Resize(600),
            transforms.ToTensor(),  
            transforms.Normalize((0.485, 0.456, 0.406),(0.229, 0.224, 0.225)) #imagenet values
        ])

        image = transform(image)

        #get bbox coordinates
        x1, y1, x2, y2 = annotation["xmin"], annotation["ymin"], annotation["xmax"], annotation["ymax"]
        boxes = torch.tensor([[x1,y1,x2,y2]])

        #get labels (all 1 for package)
        labels = torch.tensor([1])

        #format as target dict for Faster RCNN
        target = {}
        target["boxes"] = boxes
        target["labels"] = labels

        return image, target
    
#quick training only
# def main():
#     package_predicter = FinedTunedFasterRCNNPackage()
#     package_predicter.train_model()
#     #best val loss: 0.3594

# if __name__ == "__main__":
#     main()

