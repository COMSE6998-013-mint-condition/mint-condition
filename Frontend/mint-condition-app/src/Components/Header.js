import React from 'react';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import { Container, Typography } from '@material-ui/core';
import pikachu from '../pikachu.jpg'
import { useNavigate } from "react-router-dom";
import {Link} from "react-router-dom"

function Header(){
  //change userName to user's username
  const userName = "ihunchan1024@gmail.com";
  const navigate = useNavigate();
  return (
      <Container maxWidth='md' style={{marginTop : 22}} >
        <Grid container spacing={2} justifyContent='left' alignItems='left' >
            <Grid item xs={12}>
                <Typography variant="h3" style={{position: 'absolute',left: 50, top: 70,}}>Mint Condition</Typography>
                <img src={pikachu} alt='pikachu' style={{height:120, width: 120, position: 'absolute', left: 365}}/>
                <Link to="/User" style={{position: 'absolute',right: 70, top: 50, fontSize:30}}>{userName}</Link>
            </Grid>
        </Grid>
        <Grid container spacing={2} justifyContent='right' alignItems='right' >
          <Grid item xs={12}>
            <Button onClick={() => navigate('/')} style={{height:70, width: 200, fontSize: 30, color: 'green', position: 'absolute', right: 50,top: 100,}}>Sign Out</Button>
          </Grid>
        </Grid>
      </Container>
      // TODO:
      // change username to logged in user, route sign out button
  )
}

export default Header;