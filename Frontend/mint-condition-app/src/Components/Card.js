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
import {useLocation, useNavigate} from 'react-router-dom';
import {Button} from "@mui/material";
import axios from "axios";
import {useEffect, useState} from "react";


function createData(name, max_val, quality, mean_val, quality_desc, min_val) {
  return { name, max_val, quality, mean_val, quality_desc, min_val };
}

function Card(props){
  check_auth_code();

  const navigate = useNavigate()
  const location = useLocation();

  let cardId = ''
  if(location.state && location.state.card) {
    const card = location.state.card;
    cardId = card.card_id
  }

  const [rows, setRows] = useState([createData('n/a', 0, 'n/a', 0, 'n/a', 0)])

  useEffect(() => {
    if (cardId) {
      const url = 'https://3zd6ttzexc.execute-api.us-east-1.amazonaws.com/prod/card/' + cardId
      const headers = {
        'Authorization': localStorage.getItem('id_token'),
        'x-api-key': 'VQi4PffXXeaUzTIaEBnzUaGdnP6sPy9EUWtZSdp8'
      }
      axios.get(url, {headers}).then((response) => {
        if(response.status === 200) {
          // createData()
          let card_name = response.data.path.substring(response.data.path.lastIndexOf('/')+1, response.data.path.length)
          console.log(response.data)
          console.log(card_name)
          console.log(createData(card_name, response.data.price_object.max_value, response.data.condition_label,  response.data.price_object.mean_value, response.data.condition_desc, response.data.price_object.min_value))
          setRows([createData(card_name, response.data.price_object.max_value, response.data.condition_label,  response.data.price_object.mean_value, response.data.condition_desc, response.data.price_object.min_value)])
        }
      })
    }
  }, [])



  const deleteCard = (event) => {
    const url = 'https://3zd6ttzexc.execute-api.us-east-1.amazonaws.com/prod/card/' + cardId
    const headers = {
      'Authorization': localStorage.getItem('id_token'),
      'x-api-key': 'VQi4PffXXeaUzTIaEBnzUaGdnP6sPy9EUWtZSdp8'
    }
    console.log('deleting card: ' + cardId)
    axios.delete(url, {headers}).then((response) => {
      navigate('/homepage')
    })
  }

  const reAnalyzeCard = (event) => {
    window.location.reload();
    // const url = 'https://3zd6ttzexc.execute-api.us-east-1.amazonaws.com/prod/card/' + cardId + '/analyze'
    // const headers = {
    //   'Authorization': localStorage.getItem('id_token'),
    //   'x-api-key': 'VQi4PffXXeaUzTIaEBnzUaGdnP6sPy9EUWtZSdp8'
    // }
    // console.log('reanalyzing card: ' + cardId)
    // axios.post(url, {headers}).then((response) => {
    //   window.location.reload();
    // })
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
                  <TableCell style={{ fontSize: 18}}><strong>Maximum Value of Card</strong></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell style={{fontSize: 18}}>{rows[0].name}</TableCell>
                  <TableCell style={{fontSize: 18}}>{rows[0].max_val}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell style={{fontSize: 18}}><strong>Card Quality</strong></TableCell>
                  <TableCell style={{fontSize: 18}}><strong>Mean Value of Card</strong></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell style={{fontSize: 18}}>{rows[0].quality}</TableCell>
                  <TableCell style={{fontSize: 18}}>{rows[0].mean_val}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell style={{fontSize: 18}}><strong>Description</strong></TableCell>
                  <TableCell style={{fontSize: 18}}><strong>Minimum Value of Card</strong></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell style={{fontSize: 18}}>{rows[0].quality_desc}</TableCell>
                  <TableCell style={{fontSize: 18}}>{rows[0].min_val}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell style={{fontSize: 18}}>
                    <Button variant="contained" style={{margin:5}}>
                      Update
                    </Button>
                    <Button variant="contained" style={{margin:5}} onClick={reAnalyzeCard}>
                      Analyze
                    </Button>
                    <Button variant="contained" style={{margin:5}} onClick={deleteCard}>
                      Delete
                    </Button>
                  </TableCell>
                  <TableCell style={{fontSize: 18}}>

                  </TableCell>
                  <TableCell style={{fontSize: 18}}>

                  </TableCell>
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