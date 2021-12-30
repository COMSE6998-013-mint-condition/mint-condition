# Mint-Condition-Machine-Learning

This folder demonstrates the whole training pipeline and testing pipeline of mint-condondition model - TradingCardNet, and deployment of mint-condondition model. 

## Mint-Cindition-Training-and-Testing-Pipeline

In the Mint-Condition-MachineLearningModel folder, there are two versions of TradingCardNet pipeline, including TradingCardEval_version1.ipynb and TradingCardEval_version2.ipynb. It also contains a history.csv to present the training history during the fine-tuning.

### TradingCardEval_version1.py

This notebook demonstrates how to train our TradingCardNet, from importing the trading card dataset, spliting them into training set and testing set, how to build up a TradingCardNet architecture, and how to evaluate the model.

### TradingCardEval_version2.py

The difference between TradingCardEval_version1 and TradingCardEval_version2 is that the version 2 tried to copy the dataset from the GoogleDrive to Google CoLab. In this way, it would be easier to load the images into Google CoLab, and it will also be faster to load the images during the training.

## Mint-Condition-Sagemaker-Deployment

### lambda_function.py

The lambda function shows how clients can connect to sagemaker endpoint. 

The endpoint takes in a serialized dictionary with two required key: "bucket" and "key" which specify an image to predict.

The entire url of the image will therefore be ```s3://bucket/key```. 

The response body of the endpoint will contain only the predicted label from one of ```["FP", "GOOD", "VG", "VG-EX", "EX", "EX-MT", "NM", "NM-MT", "MINT", "GEM-MT"]```

### sagemaker/tradingCards.ipynb

This notebook demonstrates how to deploy a somewhereelse pretrained pytorch model onto sagemaker. Note that ```model_file``` variable should be specify in ```.tar.gz``` format. This zipped file should contain everything including ```model.pth``` under the folder ```sagemaker/model```, i.e., ```sagemaker/model``` should have the following structure and zipped. 

The entry point specified as an argument of the ```PytorchModel``` object should also be the script ```inference.py``` as the following file structure suggests.
```
|    model
|           |--model.pth
|
|    code
|           |--inference.py
|           |--requirements.txt

```

### sagemaker/model/code/inference.py

This script controls the behavior of the endpoint deployed using ```PytorchModel```. Please see https://docs.aws.amazon.com/sagemaker/latest/dg/adapt-inference-container.html for details.

