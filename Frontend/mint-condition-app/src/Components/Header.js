import React, {useEffect, useState} from 'react';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import {Box, Container, Typography} from '@material-ui/core';
import pikachu from '../assets/pikachu.jpg'
import { useNavigate } from "react-router-dom";
import {Link} from "react-router-dom"
import { clear_auth_code } from '../utils/auth_helpers';
import { get_user_info } from '../utils/auth_helpers';
import SearchBar from "./SearchBar";
import axios from "axios";

function Header({setCards}){
  const [username, setUsername] = useState('loading');

  get_user_info().then(response => {
    if(username!==response[0]['email']){
      setUsername(response[0]['email'])
    }
  });
  const navigate = useNavigate();
  const onSignOut = () =>{
    clear_auth_code();
    navigate('/');
  }

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
      <Container maxWidth='lg'>
        <Grid container
              item
              spacing={2}
              direction='row'
              justifyContent='space-evenly'
              alignItems='center'
        >
            <Grid container item
                  direction='column'
                  alignItems='flex-end'
                  style={{marginRight:50, marginTop: 50}}
            >
                <Link to="/User">
                    {username}
                </Link>
                <Button onClick={onSignOut}>
                    Sign Out
                </Button>
          </Grid>
            <Grid container item
                  direction='row'
                  alignItems='center'
                  style={{marginLeft:50, }}
            >
                <Typography variant="h3"
                            onClick={()=> navigate('/homepage')}
                >
                    Mint Condition
                </Typography>
                <img src={pikachu}
                     onClick={()=> navigate('/homepage')}
                     alt='pikachu'
                     style={{height:120, width:120, marginLeft:10}}
                />
            </Grid>
            <Grid container item justifyContent='center'>
                <SearchBar setPhotos={setCards} />
            </Grid>
        </Grid>
      </Container>
  )
}

export default Header;