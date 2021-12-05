import React, {useState} from 'react';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import { Container, Typography } from '@material-ui/core';
import pikachu from '../assets/pikachu.jpg'
import { useNavigate } from "react-router-dom";
import {Link} from "react-router-dom"
import { clear_auth_code } from '../utils/auth_helpers';
import { get_user_info } from '../utils/auth_helpers';

function Header(){
  const [username, setUsername] = useState('loading');
  get_user_info().then(response => {
    if(username!==response['email']){
      setUsername(response['email'])
    }
  });
  const navigate = useNavigate();
  const onSignOut = () =>{
    clear_auth_code();
    navigate('/');
  }

  return (
      <Container maxWidth='md' style={{marginTop : 22}} >
        <Grid container spacing={2}   >
            <Grid item xs={12}>
                <Typography variant="h3" onClick={()=> navigate('/homepage')} style={{cursor:'pointer', position: 'absolute',left: 50, top: 70,}}>Mint Condition</Typography>
                <img src={pikachu} onClick={()=> navigate('/homepage')} alt='pikachu' style={{cursor:'pointer', height:120, width: 120, position: 'absolute', left: 365}}/>
                <Link to="/User" style={{position: 'absolute',right: 70, top: 50, fontSize:30}}>{username}</Link>
            </Grid>
        </Grid>
        <Grid container spacing={2}  >
          <Grid item xs={12}>
            <Button onClick={onSignOut} style={{height:70, width: 200, fontSize: 30, color: 'green', position: 'absolute', right: 50,top: 100,}}>Sign Out</Button>
          </Grid>
        </Grid>
      </Container>
      // TODO:
      // change username to logged in user, route sign out button
  )
}

export default Header;