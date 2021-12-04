import Grid from '@material-ui/core/Grid';
import { Container } from '@material-ui/core';
import Header from './Header'
import CardList from './CardList'
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { check_auth_code } from '../utils/auth_helpers';


function createData(name, related_cards, quality, requests, value, availability) {
  return { name, related_cards, quality, requests, value, availability };
}

const rows = [
  createData('Pikachu', 159, 'Mint', 24, 1000, 'In Stock'),
];

function Card(){
  check_auth_code();
  return (
      <Container maxWidth='md' style={{marginTop : 22}}>
        <Header/>
        <CardList/>
        <Grid style={{position: 'absolute', left: 1200, bottom: 550,}}>
          <TableContainer component={Paper}>
          <Table style={{background:'#D4F1F4'}} sx={{ minWidth: 1000, minHeight:800 }} aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell style={{position: 'absolute', top: 50, left: 350, fontSize: 50}}><strong>Card Features</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell style={{position: 'absolute', top: 150, left: 180, fontSize: 25}}><strong>Card Name</strong></TableCell>
                <TableCell style={{position: 'absolute', top: 150, left: 600, fontSize: 25}}><strong>Number of Related Cards</strong></TableCell>
              </TableRow>
              <TableRow>
                <div style={{position: 'absolute', top: 250, left: 220, fontSize: 25}}>{rows[0].name}</div>
                <div style={{position: 'absolute', top: 250, left: 650, fontSize: 25}}>{rows[0].related_cards}</div>
              </TableRow>
              <TableRow>
                <TableCell style={{position: 'absolute', top: 350, left: 180, fontSize: 25}}><strong>Card Quality</strong></TableCell>
                <TableCell style={{position: 'absolute', top: 350, left: 600, fontSize: 25}}><strong>Buyer Requests</strong></TableCell>
              </TableRow>
              <div style={{position: 'absolute', top: 450, left: 220, fontSize: 25}}>{rows[0].quality}</div>
              <div style={{position: 'absolute', top: 450, left: 650, fontSize: 25}}>{rows[0].requests}</div>
              <TableRow>
                <TableCell style={{position: 'absolute', top: 550, left: 180, fontSize: 25}}><strong>Card Value</strong></TableCell>
                <TableCell style={{position: 'absolute', top: 550, left: 600, fontSize: 25}}><strong>Card Availability</strong></TableCell>
              </TableRow>
              <div style={{position: 'absolute', top: 650, left: 220, fontSize: 25}}>{rows[0].value}</div>
                <div style={{position: 'absolute', top: 650, left: 650, fontSize: 25}}>{rows[0].availability}</div>
            </TableBody>
          </Table>
        </TableContainer>
        </Grid>
      </Container>
      // TODO:
      // Fetch info from api
  )
}

export default Card;