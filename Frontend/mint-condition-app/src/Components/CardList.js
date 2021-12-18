import React, {useState} from 'react';
import Grid from '@material-ui/core/Grid';
import { Container, makeStyles, Typography } from '@material-ui/core';
import {DropzoneArea} from 'material-ui-dropzone'
import { get_user_info } from '../utils/auth_helpers';
import axios from 'axios';
import { useNavigate } from "react-router-dom";


const useStyles = makeStyles({
  smDropzone: {
    height: 200,
    width: 200,
  },
});

function CardList() {
  const classes = useStyles();
  const [images, setImages] = useState([]);
  const navigate = useNavigate();

  // get user info, then set user info, then get cards
  let user_info = null
  get_user_info().then(response => {
    user_info = response[0];
    getCards();
  });

  // get a list of user cards and set state of images to be the list of images
  function getCards() {
    console.log('getting cards')
    // send get request
    const url = 'https://3zd6ttzexc.execute-api.us-east-1.amazonaws.com/dev/cards'
    const headers = {
      'Authorization': localStorage.getItem('id_token'),
      'x-api-key': 'VQi4PffXXeaUzTIaEBnzUaGdnP6sPy9EUWtZSdp8'
    }
    axios.get(url, {headers}).then(response => {
      console.log(response)
      let cards = response.data.cards;
      let images_html = cards.map(card => {
        let card_name = card.path.substring(card.path.lastIndexOf('/')+1, card.path.length) //hack to get image name since we don't have label yet
        return <img style={{width:250, height:350, margin:20}} key={card_name} src={card.path} alt={card_name} onClick={() => {
          navigate('/card', {state: {'card':card}})}
        }/>
      });
      // only update if the list has changed, otherwise we recurse forever because we call get_user_info again
      if (images_html.length !== images.length) {
        setImages(images_html)
      }
    });
  }

  //function is called when card is added to dropzone area
  function uploadCard(files){
    const image = files[0]
    // more accurately, this is called when dropzone is changed, if there's no image, just exit
    if (!image) {
      return 0;
    }

    // if user info hasn't been retrieved yet, set a 1 second timeout and try again. dangerous cuz this recurses forever...
    if (!user_info) {
      setTimeout(() => {uploadCard(files)}, 1000);
      console.log('no user info yet...')
      return 0;
    }
    
    // send upload request to apigateway
    const url = 'https://3zd6ttzexc.execute-api.us-east-1.amazonaws.com/dev/upload'
    const user = user_info['user_id']
    const labels = ''
    const key = image.name
    const headers = {
      'Authorization': localStorage.getItem('id_token'),
      'Content-Type': 'image/jpeg',
      'X-Key': key,
      'x-amz-meta-customLabels': labels,
      'x-amz-meta-user': user,
      'x-api-key': 'VQi4PffXXeaUzTIaEBnzUaGdnP6sPy9EUWtZSdp8'
    }
    console.log("headers")
    console.log(headers)
    axios.put(url, image, {headers}).then(response => console.log(response));
    //TODO if fails, tell user

    //get cards because we now have a new card, set timeout to 1 second to let the backend process the card
    setTimeout(() => {getCards()}, 5);
    // window.location.reload();
  }

  return (
      <Container maxWidth='md' style={{marginTop : 40}} >
        <Typography variant="h5" style={{ }}>Uploaded Cards</Typography>
        <br></br>
        <Grid style={{ }}>
          <DropzoneArea filesLimit={1} onChange={uploadCard} acceptedFiles={['image/*']} classes={{root: classes.smDropzone}} dropzoneText={"Upload a Card"}/>
          {images}
        </Grid>
      </Container>
      // TODO:
      // Add images before the dropzonearea using imagelist
  )
}

export default CardList;