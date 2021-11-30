import React, { useState, Component } from 'react';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import { useNavigate } from "react-router-dom";
import { Container, makeStyles, Typography } from '@material-ui/core';
import logo from '../logo.jpeg'

function Login(){
  const [ itemData, setItemData ] = useState([]);
  const [ loading, setLoading ] = useState(false);
  const history = useNavigate();
  const routeChange = () =>{ 
    let path = 'https://mintcondition2.auth.us-east-1.amazoncognito.com/signup?response_type=code&client_id=55gonmd5[…]ntcondition2.auth.us-east-1.amazoncognito.com'; 
    history(path);
    console.log("nice");
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
          <Grid item xs={13}> 
            <img src={logo} align="center"/>
          </Grid>
          <Grid> 
          </Grid>
          <Grid item xs={13}>
            <Button variant="contained" onClick={routeChange} style={{height:80, width: 400, fontSize: 40, backgroundColor: "#FFFDD0"}}>Login / Sign Up</Button>
          </Grid>
        </Grid>
      </Container>
  )
}

export default Login;