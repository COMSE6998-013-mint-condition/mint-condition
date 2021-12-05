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
import {useLocation} from 'react-router-dom';


function createData(name, related_cards, quality, requests, value, availability) {
  return { name, related_cards, quality, requests, value, availability };
}

function Card(props){
  check_auth_code();

  const location = useLocation();
  let rows = []
  if(location.state && location.state.card) {
    const card = location.state.card
    let card_name = card.path.substring(card.path.lastIndexOf('/')+1, card.path.length) //hack to get image name since we don't have label yet
    rows = [createData(card_name, 'n/a', card.condition_label, 'n/a', 'n/a', 'n/a')];
  } else {
    //this means we navigated to this page without a state (most likely typed in the url instead of clicking a card)
    rows = [createData('n/a', 0, 'n/a', 0, 0, 'n/a')]
  }
  
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