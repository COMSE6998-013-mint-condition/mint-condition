import React, {useEffect, useState} from 'react';
import Grid from '@material-ui/core/Grid';
import {Box, Container, makeStyles, Typography} from '@material-ui/core';
import {DropzoneArea} from 'material-ui-dropzone'
import { get_user_info } from '../utils/auth_helpers';
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import {ImageList, ImageListItem} from "@material-ui/core";


const useStyles = makeStyles({
  smDropzone: {
    fullWidth: 'true',
  },
});

function CardList(props) {
  const classes = useStyles();
  const navigate = useNavigate();

  // get user info, then set user info, then get cards
  let user_info = null
  get_user_info().then(response => {
    user_info = response[0];
  });

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
    const url = 'https://3zd6ttzexc.execute-api.us-east-1.amazonaws.com/prod/upload'
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
    axios.put(url, image, {headers}).then((response) => {
      console.log(response)
      if(response.status === 200) {
        window.location.reload();
      } else {
        console.log('Upload failed')
      }
    });
  }

  return (
      <Box maxWidth='xl' style={{marginTop : 40, flexGrow:1}} >
        <Grid container
              direction="row"
              spacing={2}
              style={{ margin:10}}>
          <Grid item>
            <DropzoneArea filesLimit={1}
                          onChange={uploadCard}
                          acceptedFiles={['image/*']}
                          classes={{root: classes.smDropzone}}
                          dropzoneText={"Upload a Card"}/>
          </Grid>
          <Grid item>
            <ImageList cols={4} rowHeight={300} gap={4}>
              {
                props.cards?.map((card) => (
                  <ImageListItem key={card.path}>
                    <img
                         key={card.path}
                         src={card.path}
                         alt={card.path}
                         onClick={() => {
                            navigate('/card', {state: {'card':card, 'cards':props.cards}})
                            window.location.reload()
                         }}
                    />
                  </ImageListItem>
                ))
              }
            </ImageList>
          </Grid>
        </Grid>
      </Box>
  )
}

export default CardList;