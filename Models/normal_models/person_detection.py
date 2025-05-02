#YoloV8 (Vital for optimizing real-time performance)
import torch
from ultralytics import YOLO
from torchvision.ops import nms
import os

class YOLOv8Person():
    def __init__(self):
        #initialize model
        model_path = os.path.join("model-weights", "yolov8m.pt")
        self.model = YOLO(model_path)
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model = self.model.to(self.device)

    def prediction(self, image_path): 
        #make prediction
        pred = self.model(image_path)[0]

        bboxes = pred.boxes.xyxy
        labels = pred.boxes.cls
        scores = pred.boxes.conf

        #only keep people predictions.
        person_only = torch.where(labels == 0)[0] #get first tuple (the tensor)
        if(person_only.numel() == 0):
            print("no person detected")
            return torch.empty((0, 4), device=self.device), torch.empty((0,), device=self.device) #no bboxes
        bboxes = bboxes[person_only]
        scores = scores[person_only]
        
        #NMS filtering
        keep = torch.where(scores > 0.7)[0]
        #check if empty bboxes BEFORE nms
        if (keep.numel() == 0):
            return torch.empty((0, 4), device=self.device), torch.empty((0,), device=self.device)

        nms_indices = nms(bboxes[keep], scores[keep], 0.5) #last param, IoU threshold
        bboxes = bboxes[nms_indices]
        scores = scores[nms_indices]

        return bboxes, scores

# #pytorch
# import torch 
# import torchvision

# from torchvision.ops import nms

# #general
# from PIL import Image

# class FineTunedFasterRCNNPerson():
#     def __init__(self):
#         #initialize model
#         #self.model = torchvision.models.detection.fasterrcnn_resnet50_fpn(weights="DEFAULT")
#         self.model = torchvision.models.detection.faster
#         self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
#         self.model = self.model.to(self.device)

#     def prediction(self, image_path):
#         

#         #make prediction
#         self.model.eval()
#         with torch.no_grad():
#             pred = self.model([image])

#         bboxes, labels, scores = pred[0]["boxes"], pred[0]["labels"], pred[0]["scores"]
        
#         #only keep people predictions.
#         person_only = torch.where(labels == 1)[0] #get first tuple (the tensor)
#         if(person_only.numel() == 0):
#             # print("no person detected")
#             return torch.empty((0, 4), device=self.device), torch.empty((0,), device=self.device) #no bboxes
#         bboxes = bboxes[person_only]
#         scores = scores[person_only]
        
#         #NMS filtering
#         keep = torch.where(scores > 0.8)[0]
#         #check if empty bboxes BEFORE nms
#         if (keep.numel() == 0):
#             return torch.empty((0, 4), device=self.device), torch.empty((0,), device=self.device)

#         nms_indices = nms(bboxes[keep], scores[keep], 0.5) #last param, IoU threshold
#         bboxes = bboxes[nms_indices]
#         scores = scores[nms_indices]

#         return bboxes, scores
    
#testing, not directly called
def main():
    person_detector = YOLOv8Person()
    print(person_detector.prediction("test/test.jpg"))

if __name__ == "__main__":
    main()
