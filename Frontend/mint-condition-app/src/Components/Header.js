import React, {useEffect, useRef, useState} from 'react';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import {Container, Typography} from '@material-ui/core';
import pikachu from '../assets/pikachu.jpg'
import {Link, useNavigate} from "react-router-dom";
import {clear_auth_code, get_user_info} from '../utils/auth_helpers';
import SearchBar from "./SearchBar";
import axios from "axios";
import {IconButton} from "@mui/material";
import UploadFileIcon from '@mui/icons-material/UploadFile';

function Header({setCards}){
  const [username, setUsername] = useState('loading');
  const inputFile = useRef(null)
  const [selectedPhoto, setSelectedPhoto] = useState([]);
  const [userInfo, setUserInfo] = useState();

  const navigate = useNavigate();
  const onSignOut = () =>{
    clear_auth_code();
    navigate('/');
  }

  const onChangeFile = (event) => {
    setSelectedPhoto(event.target.files[0]);
  }

  useEffect(() => {
    // get user info, then set user info, then get cards
    get_user_info().then(response => {
        setUserInfo(response[0]);
    });
  }, [])

  useEffect(() => {
    if(userInfo){
        setUsername(userInfo['email']);
    }

  }, [userInfo])

  useEffect(() => {
    // if user info hasn't been retrieved yet, set a 1 second timeout and try again. dangerous cuz this recurses forever...
    if (!userInfo) {
      console.log('no user info yet...')
      return 0;
    }
    if(selectedPhoto !== null) {
        const url = 'https://3zd6ttzexc.execute-api.us-east-1.amazonaws.com/prod/upload'
        const user = userInfo['user_id']
        const labels = ''
        const key = selectedPhoto.name
        console.log(localStorage.getItem('id_token'))

        let headers = {
            'Authorization': localStorage.getItem('id_token'),
            "Content-Type": 'image/jpeg',
            "X-Key": key,
            'x-amz-meta-customLabels': labels,
            'x-amz-meta-user': user,
            'x-api-key': 'VQi4PffXXeaUzTIaEBnzUaGdnP6sPy9EUWtZSdp8'
        }
        axios.put(url, selectedPhoto, {headers}).then((response) => {
            console.log(response)
            setSelectedPhoto(null)
            if(response.status === 200) {
                setTimeout(function(){ window.location.reload(); }, 2000);
            } else {
                console.log('Upload failed')
            }
        })
    }
  }, [selectedPhoto])

      // get a list of user cards and set state of images to be the list of images
  function getCards() {
    if(setCards && typeof setCards === "function")
    {
        console.log('getting cards')
        // send get request
        const url = 'https://3zd6ttzexc.execute-api.us-east-1.amazonaws.com/prod/cards'
        const headers = {
          'Authorization': localStorage.getItem('id_token'),
          'x-api-key': 'VQi4PffXXeaUzTIaEBnzUaGdnP6sPy9EUWtZSdp8'
        }
        axios.get(url, {headers}).then(response => {
          console.log(response)
          setCards(response.data.cards)
        });
    }
  }

  useEffect(() => {
      getCards()
  }, [])

  return (
      <Container maxWidth='lg'>
        <Grid container
              item
              spacing={2}
              direction='row'
              justifyContent='space-evenly'
              alignItems='center'
        >
            <Grid container item
                  direction='column'
                  alignItems='flex-end'
                  style={{marginRight:50, marginTop: 50}}
            >
                <Link to="/User">
                    {username}
                </Link>
                <Button onClick={onSignOut}>
                    Sign Out
                </Button>
          </Grid>
            <Grid container item
                  direction='row'
                  alignItems='center'
                  style={{marginLeft:50, }}
            >
                <Typography variant="h3"
                            onClick={()=> navigate('/homepage')}
                >
                    Mint Condition
                </Typography>
                <img src={pikachu}
                     onClick={()=> navigate('/homepage')}
                     alt='pikachu'
                     style={{height:120, width:120, marginLeft:10}}
                />
            </Grid>
            {setCards && typeof setCards === 'function' &&
                <Grid container item justifyContent='center'>
                    <SearchBar setPhotos={setCards} />
                    <input id="file"
                           type="file"
                           ref={inputFile}
                           onChange={onChangeFile.bind(this)}
                           style={{ display: 'none' }}
                    />
                   <IconButton color="primary"
                               aria-label="upload picture"
                               component="span"
                               style={{margin: 10}}
                               onClick={() => inputFile.current.click()}>
                    <UploadFileIcon />
                   </IconButton>
                </Grid>
            }
        </Grid>
      </Container>
  )
}

export default Header;