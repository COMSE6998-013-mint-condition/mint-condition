import React from 'react';
import Grid from '@material-ui/core/Grid';
import { Container, makeStyles } from '@material-ui/core';
import {DropzoneArea} from 'material-ui-dropzone'
import Header from './Header'
import CardList from './CardList'
import { check_auth_code } from '../utils/auth_helpers';

const useStyles = makeStyles({
  smDropzone: {
    height: 750,
    width: 700
  },
});

function HomePage(props){
  check_auth_code();
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