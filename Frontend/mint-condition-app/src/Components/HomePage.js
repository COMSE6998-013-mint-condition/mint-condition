import React, {useEffect, useState} from 'react';
import Grid from '@material-ui/core/Grid';
import {Box, Container, makeStyles} from '@material-ui/core';
import Header from './Header'
import CardList from './CardList'
import { check_auth_code } from '../utils/auth_helpers';
import axios from "axios";
import SearchBar from "./SearchBar";

function HomePage(props){
  check_auth_code();

  const [cards, setCards] = useState()

  return (
      <Container>
          <Grid container
          direction='column'
          alignItems='stretch'
          spacing={2}
          justifyContent='center'
    >
        <Grid item>
            <Header setCards={setCards}/>
        </Grid>
        <Grid container item>
            <CardList cards={cards}/>
        </Grid>
    </Grid>
      </Container>
  )
}

export default HomePage;