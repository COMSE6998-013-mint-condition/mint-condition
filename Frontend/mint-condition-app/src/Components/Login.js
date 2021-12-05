// import React, { useState, Component } from 'react';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
// import { useNavigate } from "react-router-dom";
import { Container, Typography } from '@material-ui/core';
import logo from '../assets/logo.jpeg'
// import { CognitoUser, AuthenticationDetails } from 'amazon-cognito-identify-js';
// import UserPool from './UserPool'

function Login(){
  // const [ itemData, setItemData ] = useState([]);
  // const [ loading, setLoading ] = useState(false);
  const onSubmit = () =>{ 
    // event.preventDefault();
    // const user
    const url = "https://mintcondition2.auth.us-east-1.amazoncognito.com"
    const client_id = "55gonmd538j2k0ob6s6ltaorvj"
    const redirect_uri = "http://localhost:3000/homepage"
    window.location.href = url + "/login?client_id=" + client_id + "&response_type=token&scope=email+openid&redirect_uri=" + redirect_uri
  }

  return (
      <Container maxWidth='md' style={{marginTop : 22}} >
        <Grid container spacing={2} justifyContent='center' alignItems='center' >
            <Grid item xs={12}>
                <Typography variant="h1" align="center">
                    <strong>Mint Condition</strong>
                </Typography>
                <br></br>
                <Typography variant="h3" align="center">
                An Automated Trading Card Evaulator
                </Typography>
            </Grid>
          <Grid item xs={false}> 
            <img src={logo} alt='logo' align="center" style={{height:500}}/>
          </Grid>
          <Grid> 
          </Grid>
          <Grid item xs={false}>
            <Button variant="contained" onClick={onSubmit} style={{height:80, width: 400, fontSize: 40, backgroundColor: "#FFFDD0"}}>Login / Sign Up</Button>
          </Grid>
        </Grid>
      </Container>
  )
}

export default Login;