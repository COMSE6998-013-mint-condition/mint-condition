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
        <Grid style={{flex: 1}}>
          <TableContainer>
            <Table style={{background:'#D4F1F4'}} sx={{marginTop: 16, minWidth: 600, minHeight:400 }} aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell style={{fontSize: 30}}><strong>Card Features</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell style={{ fontSize: 18}}><strong>Card Name</strong></TableCell>
                  <TableCell style={{ fontSize: 18}}><strong>Number of Related Cards</strong></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell style={{fontSize: 18}}>{rows[0].name}</TableCell>
                  <TableCell style={{fontSize: 18}}>{rows[0].related_cards}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell style={{fontSize: 18}}><strong>Card Quality</strong></TableCell>
                  <TableCell style={{fontSize: 18}}><strong>Buyer Requests</strong></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell style={{fontSize: 18}}>{rows[0].quality}</TableCell>
                  <TableCell style={{fontSize: 18}}>{rows[0].requests}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell style={{fontSize: 18}}><strong>Card Value</strong></TableCell>
                  <TableCell style={{fontSize: 18}}><strong>Card Availability</strong></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell style={{fontSize: 18}}>{rows[0].value}</TableCell>
                  <TableCell style={{fontSize: 18}}>{rows[0].availability}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
          </Grid>
          <CardList/>
      </Container>
      // TODO:
      // Fetch info from api
  )
}

export default Card;