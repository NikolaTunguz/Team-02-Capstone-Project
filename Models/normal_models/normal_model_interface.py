#model imports
from .person_classification import FineTunedRN18
from .person_detection import FineTunedFasterRCNNPerson
from .package_classification import CustomCNN
from .package_detection import FinedTunedFasterRCNNPackage

#image imports
import cv2

class NormalInterface:
    def __init__(self):
        #initialize models
        self.person_classifier = FineTunedRN18()
        self.person_detector = FineTunedFasterRCNNPerson()
        self.package_classifier = CustomCNN()
        self.package_detector = FinedTunedFasterRCNNPackage()

        #initialize bboxes
        self.person_bboxes = []
        self.package_bboxes = []

    def training(self):
        #only train if needed.
        self.person_classifier.train_model() 
        self.package_classifier.train_model() 
        self.package_detector.train_model()  

    def detect_person(self, image_path):
        #person & package detection pipeline
        person_result = self.person_classifier.prediction(image_path)
        #people
        if(person_result == 1):
            self.person_bboxes = self.person_detector.prediction(image_path)
            # return self.person_bboxes
            return True
        else:
            #print("No person detected")
            return False
            pass
    

    def detect_package(self, image_path):
        #packages
        package_result = self.package_classifier.prediction(image_path)
        if(package_result == 1):
            self.package_bboxes = self.package_detector.prediction(image_path)
        else:
            print("No package detected")
            

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

#training and testing the class works. Not used.
def main():
    model_pipeline = NormalInterface()
    #model_pipeline.training()
    model_pipeline.detect_person("test-data/test.jpg")
    model_pipeline.detect_package("test-data/test.jpg")

if __name__ == "__main__":
    main()

