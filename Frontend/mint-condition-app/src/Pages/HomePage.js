import React from 'react';
import Grid from '@material-ui/core/Grid';
import { Container, makeStyles } from '@material-ui/core';
import {DropzoneArea} from 'material-ui-dropzone'
import Header from './Components/Header'
import CardList from './Components/CardList'

const useStyles = makeStyles({
  smDropzone: {
    height: 750,
    width: 700
  },
});

function HomePage(){
  //change userName to user's username
  // const userName = "ihunchan1024@gmail.com";
  const classes = useStyles();
  return (
      <Container maxWidth='md' style={{marginTop : 22}} >
        <Header/>
        <Grid style={{position: 'absolute', left: 1100, bottom: 550,}}>
          <DropzoneArea classes={{root: classes.smDropzone}} dropzoneText={"Upload a Card"}/>
        </Grid>
        <CardList/>
      </Container>
      // TODO:
      // Add images before the dropzonearea using imagelist, change username to logged in user, route sign out button
      // onclick of username directs to user detail page
  )
}

export default HomePage;