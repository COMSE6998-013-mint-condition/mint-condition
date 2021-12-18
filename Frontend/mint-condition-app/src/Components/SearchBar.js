import * as React from 'react';
import Paper from '@mui/material/Paper';
import InputBase from '@mui/material/InputBase';
import IconButton from '@mui/material/IconButton';
import SearchIcon from '@mui/icons-material/Search';
import axios from 'axios';
import { useState } from 'react';

export default function SearchBar(props) {

  const [search, setSearch] = useState("");
  const [text, setText] = useState("");

  const inputRef = React.useRef(null)

  const handleSearch = () => {
    if(search !== "") {

      const url = 'https://3zd6ttzexc.execute-api.us-east-1.amazonaws.com/prod/search'
  
      let config = {
        params: {
          label: search
        },
        headers: {
          'Authorization': localStorage.getItem('id_token'),
          'x-api-key': 'VQi4PffXXeaUzTIaEBnzUaGdnP6sPy9EUWtZSdp8'
        }
      }
      axios.get(url, config).then((response) =>  {
          props.setPhotos(response.data['cards'])
      })
    } else {
      const url = 'https://3zd6ttzexc.execute-api.us-east-1.amazonaws.com/prod/cards'
      const headers = {
        'Authorization': localStorage.getItem('id_token'),
        'x-api-key': 'VQi4PffXXeaUzTIaEBnzUaGdnP6sPy9EUWtZSdp8'
      }
      axios.get(url, {headers}).then(response => {
        props.setPhotos(response.data['cards'])
      });
    }
  }

  React.useEffect(() => {
    if(text !== "")
    {
      inputRef.current.value = text
      setSearch(text)
    }
  }, [text])
  
  return (
    <Paper
      sx={{ p: '2px 4px', display: 'flex', alignItems: 'center', width: 700 }}
      style={{backgroundColor:'#eeeeee'}}
    >
      <InputBase
        sx={{ ml: 1, flex: 1 }}
        placeholder="Search Cards"
        inputProps={{ 'aria-label': 'search photos' }}
        onKeyUp={(event) => { if(event.keyCode === 13) { handleSearch() } }} 
        onChange={(event) => {setSearch(event.target.value)}}
        inputRef={inputRef}
      />
      <IconButton sx={{ p: '10px' }} aria-label="search" onClick={handleSearch}>
        <SearchIcon />
      </IconButton>
    </Paper>
  );
}