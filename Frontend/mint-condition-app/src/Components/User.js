import Grid from '@material-ui/core/Grid';
import { Container} from '@material-ui/core';
import CardList from './CardList'
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Header from './Header'
import React, {useState} from 'react';
import { check_auth_code, get_user_info } from '../utils/auth_helpers';
import axios from 'axios';
import { useNavigate } from "react-router-dom";


function createData(name, num_cards, purpose, total_val) {
  return { name, num_cards, purpose, total_val};
}

// const rows = [createData('Arthur Pikachu', 159, 'Seller', 24, '******', 500)];

function User(){
  check_auth_code();
  let user_email = null
  // init to dummy data
  const [rows, setRows] = useState([createData('Arthur Pikachu', 159, 'Seller', 24)]);
  get_user_info().then(response => {
    if(rows[0].name !== response[0]['email']){
      user_email = response[0]['email']
      setRows([createData(user_email, response[1], 'Trade', response[2])])
    }
  })

  return (
      <Container maxWidth='md' style={{marginTop : 22}}>
        <Header/>
        <Grid style={{flex: 1}}>
          <TableContainer>
          <Table style={{background:'#D4F1F4'}} sx={{ marginTop: 16, minWidth: 600, minHeight:400 }} aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell style={{fontSize: 30}}><strong>User Profile</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell style={{fontSize: 18}}><strong>Name</strong></TableCell>
                <TableCell style={{fontSize: 18}}><strong>Number of User Cards</strong></TableCell>
              </TableRow>
              <TableRow>
                <TableCell style={{fontSize: 18}}>{rows[0].name}</TableCell>
                <TableCell style={{fontSize: 18}}>{rows[0].num_cards}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell style={{fontSize: 18}}><strong>User Purpose</strong></TableCell>
                <TableCell style={{fontSize: 18}}><strong>Estimated Value of Cards</strong></TableCell>
              </TableRow>
              <TableRow>
                <TableCell style={{fontSize: 18}}>{rows[0].purpose}</TableCell>
                <TableCell style={{fontSize: 18}}>{rows[0].total_val}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
        </Grid>
        <CardList/>
      </Container>
  )
}

export default User;