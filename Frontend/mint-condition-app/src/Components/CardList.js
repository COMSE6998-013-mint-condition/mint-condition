import React from 'react';
import Grid from '@material-ui/core/Grid';
import { Container, makeStyles, Typography } from '@material-ui/core';
import {DropzoneArea} from 'material-ui-dropzone'

const useStyles = makeStyles({
  smDropzone: {
    height: 200,
    width: 200
  },
});

function CardList(){
  const classes = useStyles();
  return (
      <Container maxWidth='md' style={{marginTop : 22}} >
        <Typography variant="h4" style={{position: 'absolute',left: 100, bottom: 550,}}>Uploaded Cards</Typography>
        <Grid style={{position: 'absolute', left: 100, bottom: 220,}}>
          <DropzoneArea classes={{root: classes.smDropzone}} dropzoneText={"Upload a Card"}/>
        </Grid>
      </Container>
      // TODO:
      // Add images before the dropzonearea using imagelist
  )
}

export default CardList;