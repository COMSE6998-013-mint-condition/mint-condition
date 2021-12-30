import torch
import torchvision.models as models
import torch.nn.functional as F
from pytorch_lightning import LightningModule
import torchmetrics

class TradingCardsNet(LightningModule):
    def __init__(self, **kwargs):
        super().__init__()
        
        model = kwargs.get('model', 'resnet18')
        fine_tuning = kwargs.get('Fine_tuning', True)
        pretrained = kwargs.get('pretrained', True)
        self.lr = kwargs.get('lr', 1e-3)

        if model=='resnet18':
          backbone = models.resnet18(pretrained=pretrained)
          layers = list(backbone.children())[:-1] #all layers except last
          self.feature_extractor = nn.Sequential(*layers)
          if fine_tuning:
              for param in self.feature_extractor.parameters():
                  param.requires_grad = False

          # Define the classifier
          num_features = backbone.fc.in_features #fc is last layer
          num_target_classes = 10
          self.classifier = nn.Linear(num_features, num_target_classes)
        else:
          raise NotImplementedError

        # Metrics
        self.training_accuracy = torchmetrics.Accuracy()
        self.val_accuracy = torchmetrics.Accuracy()

    def forward(self, x):
        self.feature_extractor.eval()
        with torch.no_grad():
            representations = self.feature_extractor(x).flatten(1)
        x = self.classifier(representations)
        return x

    def configure_optimizers(self):
        optimizer = torch.optim.Adam(
            filter(lambda p: p.requires_grad, self.parameters()),
            lr=self.lr,
            betas=(0.9, 0.999),
            eps=1e-08,
            weight_decay=0
            )
        return optimizer

    def training_step(self, batch, batch_idx):
        x, y = batch
        features = self.feature_extractor(x).flatten(1)
        y_hat = self.classifier(features)
        loss = F.cross_entropy(y_hat, y)        
        self.log("training_loss", loss)
        self.training_accuracy(y_hat, y)
        return loss

    def training_epoch_end(self, outputs):
        self.log("train_accuracy", self.training_accuracy.compute())
        self.training_accuracy.reset()

    def validation_step(self, batch, batch_idx):
        x, y = batch
        features = self.feature_extractor(x).flatten(1)
        y_hat = self.classifier(features)
        loss = F.cross_entropy(y_hat, y)  
        self.val_accuracy(y_hat, y)
        self.log("val_loss", loss)
        self.log("val_acc", self.val_accuracy, prog_bar=True)
        return loss

    def get_progress_bar_dict(self):
        items = super().get_progress_bar_dict()
        # discard the version number
        items.pop("v_num", None)
        # Override tqdm_dict logic in `get_progress_bar_dict`
        # call .item() only once but store elements without graphs
        running_accuracy = self.training_accuracy.compute()
        # convert the loss in the proper format
        items["accuracy"] = f"{running_accuracy:.3}"
        return items