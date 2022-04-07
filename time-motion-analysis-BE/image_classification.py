import tensorflow as tf
from tensorflow.keras.preprocessing import image
from tensorflow.keras.models import load_model
import numpy as np
import json
import sys

def main():
    img = image.load_img("./public/" + sys.argv[1], target_size=(150, 150))
    # img = image.load_img("./public/" + "cat.0.jpg", target_size=(150, 150))
    new_model = load_model('my_model.h5')
    
    x = image.img_to_array(img)
    x = np.expand_dims(x, axis=0)
    images = np.vstack([x])

    classes = new_model.predict(images, batch_size=10)
    animalType = int(classes[0])
    data = {
        "animal": animalType
    }
    print(json.dumps(data))


if __name__ == "__main__":
    main()
