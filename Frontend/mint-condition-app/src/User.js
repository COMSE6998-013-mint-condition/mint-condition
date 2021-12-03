import React, { useState, Component } from 'react';
import Grid from '@material-ui/core/Grid';
import { Container, Typography } from '@material-ui/core';
import CardList from './Components/CardList'
import logo from './pikachu.png'
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import pikachu from './pikachu.jpg'
import Button from '@material-ui/core/Button';
import {Link, useNavigate} from "react-router-dom"

function createData(name, num_cards, purpose, num_sold, pwd, total_val) {
  return { name, num_cards, purpose, num_sold, pwd, total_val };
}

const rows = [
  createData('Arthur Pikachu', 159, 'Seller', 24, '******', 500),
];

function User(){
  const userName = "ihunchan1024@gmail.com";
  const navigate = useNavigate()
  return (
      <Container maxWidth='md' style={{marginTop : 22}}>
        <Grid container spacing={2} justifyContent='left' alignItems='left' >
            <Grid item xs={12}>
                <Typography variant="h3" style={{position: 'absolute',left: 50, top: 70,}}>User Details</Typography>
                <img src={pikachu} style={{height:120, width: 120, position: 'absolute', left: 365}}/>
                <Link to="/User" style={{position: 'absolute',right: 70, top: 50, fontSize:30}}>{userName}</Link>
            </Grid>
        </Grid>
        <Grid container spacing={2} justifyContent='right' alignItems='right' >
          <Grid item xs={12}>
            <Button onClick={() => navigate('/')} style={{height:70, width: 200, fontSize: 30, color: 'green', position: 'absolute', right: 50,top: 100,}}>Sign Out</Button>
          </Grid>
        </Grid>
        <Grid style={{position: 'absolute', left: 100, bottom: 550,}}>
          <img src={logo} style={{height:800, width: 700}}></img>
        </Grid>
        <CardList/>
        <Grid style={{position: 'absolute', left: 1200, bottom: 550,}}>
          <TableContainer component={Paper}>
          <Table style={{background:'#D4F1F4'}} sx={{ minWidth: 1000, minHeight:800 }} aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell style={{position: 'absolute', top: 50, left: 350, fontSize: 50}}><strong>UserName</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell style={{position: 'absolute', top: 150, left: 130, fontSize: 25}}><strong>Name</strong></TableCell>
                <TableCell style={{position: 'absolute', top: 150, left: 600, fontSize: 25}}><strong>Number of User Cards</strong></TableCell>
              </TableRow>
              <TableRow>
                <div style={{position: 'absolute', top: 250, left: 150, fontSize: 25}}>{rows[0].name}</div>
                <div style={{position: 'absolute', top: 250, left: 650, fontSize: 25}}>{rows[0].num_cards}</div>
              </TableRow>
              <TableRow>
                <TableCell style={{position: 'absolute', top: 350, left: 130, fontSize: 25}}><strong>User Purpose</strong></TableCell>
                <TableCell style={{position: 'absolute', top: 350, left: 600, fontSize: 25}}><strong>Number of Cards Sold</strong></TableCell>
              </TableRow>
              <div style={{position: 'absolute', top: 450, left: 150, fontSize: 25}}>{rows[0].purpose}</div>
              <div style={{position: 'absolute', top: 450, left: 650, fontSize: 25}}>{rows[0].num_sold}</div>
              <TableRow>
                <TableCell style={{position: 'absolute', top: 550, left: 130, fontSize: 25}}><strong>Password</strong></TableCell>
                <TableCell style={{position: 'absolute', top: 550, left: 600, fontSize: 25}}><strong>Value of Current Cards</strong></TableCell>
              </TableRow>
              <div style={{position: 'absolute', top: 650, left: 150, fontSize: 25}}>{rows[0].pwd}</div>
                <div style={{position: 'absolute', top: 650, left: 650, fontSize: 25}}>{rows[0].total_val}</div>
            </TableBody>
          </Table>
        </TableContainer>
        </Grid>
      </Container>
      // TODO:
      // Fetch info from api (replace with relevant info)
  )
}

export default User;