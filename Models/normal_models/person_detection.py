#pytorch
import torch 
import torchvision
from torchvision import transforms
from torchvision.ops import nms

#general
from PIL import Image

class FineTunedFasterRCNNPerson():
    def __init__(self):
        #initialize model
        self.model = torchvision.models.detection.fasterrcnn_resnet50_fpn(weights="DEFAULT")
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model = self.model.to(self.device)

    def prediction(self, image_path):
        #prepare image
        image = Image.open(image_path)

        transform = transforms.Compose([
            transforms.ToTensor()
        ])
        image = transform(image)
        image = image.to(self.device)

        #make prediction
        self.model.eval()
        with torch.no_grad():
            pred = self.model([image])

        bboxes, labels, scores = pred[0]["boxes"], pred[0]["labels"], pred[0]["scores"]
        
        #only keep people predictions.
        person_only = torch.where(labels == 1)[0] #get first tuple (the tensor)
        if(person_only.numel() == 0):
            print("no person detected")
            return image
        
        bboxes = bboxes[person_only]

        #NMS filtering
        keep = torch.where(scores > 0.95)
        nms_indices = nms(bboxes[keep], scores[keep], 0.5) #threshold 50% IoU
        bboxes = bboxes[nms_indices]

        return bboxes