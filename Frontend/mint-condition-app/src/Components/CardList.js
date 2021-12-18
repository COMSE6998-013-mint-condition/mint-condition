import React from 'react';
import Grid from '@material-ui/core/Grid';
import {Box} from '@material-ui/core';
import { useNavigate } from "react-router-dom";
import {ImageList, ImageListItem} from "@material-ui/core";


function CardList(props) {
  const navigate = useNavigate();

  return (
      <Box maxWidth='xl' style={{marginTop : 40, flexGrow:1}} >
        <Grid container
              direction="row"
              spacing={2}
              style={{ margin:10 }}>
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