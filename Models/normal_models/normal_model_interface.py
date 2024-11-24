#model imports
import person_classification
import person_detection
import package_classification
import package_detection

#image imports
import cv2

class NormalInterface:
    def __init__(self):
        #initialize models
        self.person_classifier = person_classification.FineTunedRN18()
        self.person_detector = person_detection.FineTunedFasterRCNNPerson()
        self.package_classifier = package_classification.CustomCNN()
        self.package_detector = package_detection.FinedTunedFasterRCNNPackage()

        #initialize bboxes
        self.person_bboxes = []
        self.package_bboxes = []

    def training(self):
        #only train if needed.
        self.person_classifier.train_model() #best val loss: 0.0708
        self.package_classifier.train_model() #best val loss: 0.0130
        self.package_detector.train_model() #best val loss: 0.1425 

    def flow(self, image_path):
        #person & package detection pipeline
        person_result = self.person_classifier.prediction(image_path)

        #people
        if(person_result == 1):
            self.person_bboxes = self.person_detector.prediction(image_path)
        else:
            print("No person detected")

        #packages
        package_result = self.package_classifier.prediction(image_path)
        if(package_result == 1):
            self.package_bboxes = self.package_detector.prediction(image_path)
        else:
            print("No package detected")
        
        output_image = self.get_output_image(image_path)
        return output_image


    def get_output_image(self, image_path):
        #add bounding boxes using cv2
        image = cv2.imread(image_path)

        height, width, _ = image.shape
        new_size = 700
        image = cv2.resize(image, (new_size, new_size))

        scale_x = new_size / width
        scale_y = new_size / height

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

        cv2.imshow("output-image", image)
        cv2.waitKey(0)
        cv2.destroyAllWindows()

        return image

def main():
    model_pipeline = NormalInterface()
    #model_pipeline.training()
    model_pipeline.flow("test-data/test.jpg")

if __name__ == "__main__":
    main()

