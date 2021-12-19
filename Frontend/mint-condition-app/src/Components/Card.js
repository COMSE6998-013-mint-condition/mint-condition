import Grid from '@material-ui/core/Grid';
import {Container} from '@material-ui/core';
import Header from './Header'
import CardList from './CardList'
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import {check_auth_code} from '../utils/auth_helpers';
import {useLocation, useNavigate} from 'react-router-dom';
import {Button, Paper} from "@mui/material";
import axios from "axios";
import React, {useEffect, useState} from "react";
import {Chart} from "react-google-charts";

function createData(name, max_val, quality, mean_val, quality_desc, min_val, label) {
  return {name, max_val, quality, mean_val, quality_desc, min_val, label};
}

function Card(props) {
  check_auth_code();

  const navigate = useNavigate()
  const location = useLocation();
  const [cards, setCards] = useState()
  const [rows, setRows] = useState([createData('n/a', 0, 'n/a', 0, 'n/a', 0)])

  let cardId = ''
  if (location.state && location.state.card) {
    const card = location.state.card;
    cardId = card.card_id
  }

  const [prices, setPrices] = useState([
    ['Time', 'Value'], [
      location.state.card.price_object.timestamp,
      location.state.card.price_object.mean_value
    ]])

  useEffect(() => {
    if (cardId) {
      const url = 'https://3zd6ttzexc.execute-api.us-east-1.amazonaws.com/prod/card/' + cardId
      const headers = {
        'Authorization': localStorage.getItem('id_token'),
        'x-api-key': 'VQi4PffXXeaUzTIaEBnzUaGdnP6sPy9EUWtZSdp8'
      }
      axios.get(url, {headers}).then((response) => {
        if (response.status === 200) {
          let card_name = response.data.path.substring(response.data.path.lastIndexOf('/') + 1, response.data.path.length)
          setRows([createData(card_name, response.data.price_object.max_value,
              response.data.condition_label,
              response.data.price_object.mean_value,
              response.data.condition_desc,
              response.data.price_object.min_value,
              response.data.label)])
        }
      }).then(() => {
        getPrices()
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
    const url = 'https://3zd6ttzexc.execute-api.us-east-1.amazonaws.com/prod/card/' + cardId + '/analyze'
    const headers = {
      'Authorization': localStorage.getItem('id_token'),
      'x-api-key': 'VQi4PffXXeaUzTIaEBnzUaGdnP6sPy9EUWtZSdp8'
    }
    console.log('reanalyzing card: ' + cardId)
    axios.post(url, {}, {headers}).then((response) => {
      if (response.status === 200) {
        window.location.reload()
      } else {
        console.log('error: ' + response.statusText)
      }
    })
  }

  const getPrices = (event) => {
    const url = 'https://3zd6ttzexc.execute-api.us-east-1.amazonaws.com/prod/card/' + cardId + '/prices'
    const headers = {
      'Authorization': localStorage.getItem('id_token'),
      'x-api-key': 'VQi4PffXXeaUzTIaEBnzUaGdnP6sPy9EUWtZSdp8'
    }
    axios.get(url, {headers}).then((response) => {
      if (response.status === 200) {
        let priceArray = [['Time', 'Value']]
        response.data.prices.forEach((priceObject) => {
          let price = [
            priceObject.timestamp,
            priceObject.mean_value
          ]
          priceArray.push(price)
        })
        setPrices(priceArray)
        console.log(priceArray)
      } else {
        console.log('error: ' + response.statusText)
      }
    })
  }

  const updateCard = (event) => {
    const url = 'https://3zd6ttzexc.execute-api.us-east-1.amazonaws.com/prod/card'
    const headers = {
      'Authorization': localStorage.getItem('id_token'),
      'x-api-key': 'VQi4PffXXeaUzTIaEBnzUaGdnP6sPy9EUWtZSdp8'
    }
    const body = {
      'id': cardId,
      'label': 'add_label_here'
    }
    console.log('updating card: ' + cardId)
    axios.post(url, body,{headers}).then((response) => {
      if(response.status === 200)
      {
        window.location.reload()
      } else {
        console.log('error: ' + response.statusText)
      }
    })
  }

  return (
      <Container>
        <Header setCards={setCards}/>
        <Grid container direction='row' style={{flex: 1, marginTop: 15, marginBottom: 15}}>
          <TableContainer>
            <Table style={{background: '#D4F1F4'}} sx={{minWidth: 600, minHeight: 400}} aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell style={{fontSize: 30}}><strong>Card Features</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell style={{fontSize: 18}}><strong>Card Name</strong></TableCell>
                  <TableCell style={{fontSize: 18}}><strong>Maximum Value of Card</strong></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell style={{fontSize: 18}}>
                    {rows[0].name}
                    <br/>
                    <img key={location.state.card.path}
                         src={location.state.card.path}
                         alt={location.state.card.path}
                         width={100}/>
                  </TableCell>
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
                  <TableCell style={{fontSize: 18}}><strong>Labels</strong></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell style={{fontSize: 18}}>{rows[0].label}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell style={{fontSize: 18}}>
                    <Button variant="contained" style={{margin: 5}} onClick={updateCard}>
                      Update
                    </Button>
                    <Button variant="contained" style={{margin: 5}} onClick={reAnalyzeCard}>
                      Analyze
                    </Button>
                    <Button variant="contained" style={{margin: 5}} onClick={deleteCard}>
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
        <Paper>
          <Chart
              height={'600px'}
              chartType="ScatterChart"
              loader={<div>Loading Chart</div>}
              data={prices}
              options={{
                title: 'Value of Card Over Time',
                hAxis: {title: 'Time'},
                vAxis: {title: 'Value'},
                legend: 'none',
              }}
              rootProps={{'data-testid': '1'}}
          />
        </Paper>
        <CardList cards={cards}/>
      </Container>
  )
}

export default Card;