#pytorch
import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from person_detection import FineTunedFasterRCNNPerson

#general
from PIL import Image
import pytest

@pytest.fixture
def test_image():
        #convert jpg to tensor
        image_path = "test/test.jpg"
        return image_path
    
#Test the model has a minimum 90% confidence and that 
#only 1 bounding box is returned (no overlapping boxes of same detection)
def test_person_detection(test_image):
        person_detctor = FineTunedFasterRCNNPerson()
        bboxes, scores = person_detctor.prediction(test_image)

        #only 1 bounding box returned for this test image.
        assert bboxes.shape[0] == 1

        #test confidence is above 90%
        confidence = scores[0].item()
        assert confidence > 0.90
        


