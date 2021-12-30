import imp, sys
import numpy as np
import os
import pickle
import torch
import io
import boto3
import json
from torchvision import transforms
from PIL import Image
from six import BytesIO

str_labels = ["FP", "GOOD", "VG", "VG-EX", "EX", "EX-MT", "NM", "NM-MT", "MINT", "GEM-MT"]

    
def train(hyperparameters, input_data_config, channel_input_dirs, output_data_dir,
          num_gpus, num_cpus, hosts, current_host, **kwargs):
    pass

def test(ctx, net, val_data):
    pass


def model_fn(model_dir):
    """Creates pytorch model specified via model_dir.
    
    Args:
        model_dir (str): path to model root dir. 
    """
    device = torch.device("cuda:0" if torch.cuda.is_available() else "cpu")
    model = torch.load(open(os.path.join(model_dir, 'model/model.pth'), "rb")).to(device)
    print('[INFO] model loaded:')
    print(model.eval())
    return model 


def predict_fn(input_object, model):
    """ Uses Image library to load image and transfrom into float numbers for model prediction.
    
    Args:
        input_object (Image): image loaded using PIL.Image
        model (Object): unpickled model provided using model_fn
    """
    transformer = transforms.Compose([
                                  transforms.Resize((255, 255)),
                                  transforms.ToTensor(),
                                  transforms.Normalize(mean=[0.485, 0.456, 0.406],
                                                       std=[0.229, 0.224, 0.225]),
                                  ])
    print("[INFO] Running model inference on image: {}".format(input_object))
    X = transformer(input_object)
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    model.to(device)
    model.eval()
    with torch.no_grad():
        logits = model(X[None, ...].to(device))
        print("[INFO]: The prediction logits are: {}".format(logits))
        pred = logits.argmax(dim=1)
        return str_labels[pred]


def input_fn(request_body, request_content_type):
    """ Loads input from request content and returns image specified in request_body as PIL.Image.
    
    Args:
        request_body (bytes): serialized dictionary with two required key: "bucket" and "key" which specify an image to predict.
        request_content_type (str): type of content
        
    """
    print('[INFO] request_body: {}'.format(request_body))
    data = json.loads(request_body.decode())
    s3 =  boto3.resource('s3')
    bucket = s3.Bucket(data['bucket'])
    object = bucket.Object(data['key'])
    response = object.get()
    file_stream = response['Body']
    image = Image.open(file_stream)
 
    #print('[INFO] Got Image of shape {} with scale {}'.format(image.shape, image.max()))
    return image

def output_fn(prediction, content_type):
    """Outputs result of prediction.
    
    Args:
        prediction (str): Label predicted by predict_fn
        content_type (str): type of content
    """
    print('[INFO] prediction: {}'.format(prediction))
    return {'statusCode': 200, 'body': '{}'.format(prediction) }

if __name__ == "__main__":
    """
    Test script - please run this at the root directory of model/, i.e., ./model/..
    """
    
    test_model_dir = "./"
    test_request_body = json.dumps({'bucket': 'ccbd-mint-cv-model', 'key': 'test_data.jpeg'}).encode('utf-8')
    test_request_content_type = "test_type" 
    test_response_content_type = "test_type"
    
    # Deserialize the Invoke request body into an object we can perform prediction on
    input_object = input_fn(test_request_body, test_request_content_type)

    test_model = model_fn(test_model_dir)
    
    # Perform prediction on the deserialized object, with the loaded model
    prediction = predict_fn(input_object, test_model)

    # Serialize the prediction result into the desired response content type
    output = output_fn(prediction, test_response_content_type)
    
    assert output['statusCode'] == 200
