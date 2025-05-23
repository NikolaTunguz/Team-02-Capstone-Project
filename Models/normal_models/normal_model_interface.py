#model imports
from .person_classification import FineTunedRN18
from .person_detection import YOLOv8Person
from .package_classification import CustomCNN
from .package_detection import YOLOv8Package

#image imports
import cv2
import torch

class NormalInterface:
    def __init__(self):
        #initialize models
        self.person_classifier = FineTunedRN18()
        self.person_detector = YOLOv8Person()
        self.package_classifier = CustomCNN()
        self.package_detector = YOLOv8Package()

        #initialize bboxes
        self.person_bboxes = []
        self.package_bboxes = []

        #initialize scores
        self.person_scores = []
        self.package_scores = []

    def training(self):
        #only train if needed.
        self.person_classifier.train_model() 
        self.package_classifier.train_model() 
        self.package_detector.train_model()  


    def detect_person(self, image_path):
        #person & package detection pipeline
        #classifier not used., too low accuracy across hundreds of frames a second.
        #person_result = self.person_classifier.prediction(image_path) 

        #if no detection, empty bboxes
        device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.person_bboxes = torch.empty((0, 4), device=device) #initialize empty bbox
        self.person_scores = torch.empty((0,), device=device) #initialize empty score
    
        self.person_bboxes, self.person_scores = self.person_detector.prediction(image_path)

        if(self.person_bboxes.size(0) == 0):
            return False
        else:
            return True
    

    def detect_package(self, image_path):
        #packages
        # package_result = self.package_classifier.prediction(image_path)
        # if(package_result == 1):
        #     self.package_bboxes = self.package_detector.prediction(image_path)
        # else:
        #     print("No package detected")

        #if no detection, empty bboxes
        device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.package_bboxes = torch.empty((0, 4), device=device)
        self.package_scores = torch.empty((0,), device=device)

        self.package_bboxes, self.package_scores = self.package_detector.prediction(image_path)

        if(self.package_bboxes.size(0) == 0):
            return False
        else:
            return True
            

    def get_output_image(self, image_path):
        #add bounding boxes using cv2
        image = cv2.imread(image_path)

        height, width, _ = image.shape
        #current functionality: overlap with live feed. don't resize for now.
        #redundant scales
        #new_size = 700
        image = cv2.resize(image, (width, height))

        scale_x = width / width
        scale_y = height / height

        font = cv2.FONT_HERSHEY_SIMPLEX

        #person bounding boxes
        for i in range(len(self.person_bboxes)):
            x1,y1,x2,y2 = self.person_bboxes[i].cpu().numpy().astype("int")

            x1 = int(x1 * scale_x)
            y1 = int(y1 * scale_y)
            x2 = int(x2 * scale_x)
            y2 = int(y2 * scale_y)

            class_name = "person"

            #cv2 uses BGR for colors.
            image = cv2.rectangle(image, (x1, y1), (x2, y2), (255, 199, 46), 1) 
            image = cv2.putText(image, class_name, (x1, y1-10), font, 0.6, (0, 0, 200), 1, cv2.LINE_AA) 

        #package bounding boxes
        for i in range(len(self.package_bboxes)):
            x1,y1,x2,y2 = self.package_bboxes[i].cpu().numpy().astype("int")

            x1 = int(x1 * scale_x)
            y1 = int(y1 * scale_y)
            x2 = int(x2 * scale_x)
            y2 = int(y2 * scale_y)

            class_name = "package"

            image = cv2.rectangle(image, (x1, y1), (x2, y2), (255, 199, 46), 1) 
            image = cv2.putText(image, class_name, (x1, y1-10), font, 0.6, (0, 0, 200), 1, cv2.LINE_AA) 

        return image
    
    # def bbox_out(self):
    #     person_bboxes = self.person_bboxes.cpu().numpy().astype("int")
    #     package_bboxes = self.package_bboxes.cpu().numpy().astype("int")

    #     combined_bboxes = {
    #         "person": person_bboxes,
    #         "package": package_bboxes
    #     }
        
    #     return combined_bboxes

    

#training and testing the class works. Not used.
def main():
    model_pipeline = NormalInterface()
    #model_pipeline.training()
    model_pipeline.detect_person("test-data/test.jpg")
    model_pipeline.detect_package("test-data/test.jpg")

if __name__ == "__main__":
    main()

