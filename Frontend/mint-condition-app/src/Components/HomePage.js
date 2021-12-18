import React, {useEffect, useState} from 'react';
import Grid from '@material-ui/core/Grid';
import { Container, makeStyles } from '@material-ui/core';
import Header from './Header'
import CardList from './CardList'
import { check_auth_code } from '../utils/auth_helpers';
import axios from "axios";
import SearchBar from "./SearchBar";

function HomePage(props){
  check_auth_code();

  const [cards, setCards] = useState()

    // get a list of user cards and set state of images to be the list of images
  function getCards() {
    console.log('getting cards')
    // send get request
    const url = 'https://3zd6ttzexc.execute-api.us-east-1.amazonaws.com/prod/cards'
    const headers = {
      'Authorization': localStorage.getItem('id_token'),
      'x-api-key': 'VQi4PffXXeaUzTIaEBnzUaGdnP6sPy9EUWtZSdp8'
    }
    axios.get(url, {headers}).then(response => {
      console.log(response)
      setCards(response.data.cards)
    });
  }

  useEffect(() => {
      getCards()
  }, [])

  return (
      <Container maxWidth='md' style={{backgroundColor:'green'}} >
        <Header/>
        <Grid style={{flex:1, flexGrow:1, marginTop: 150}}>
            <SearchBar setPhotos={setCards} />
            <CardList cards={cards}/>
        </Grid>
      </Container>
  )
}

export default HomePage;