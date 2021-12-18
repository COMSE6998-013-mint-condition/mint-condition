import { elementAcceptingRef } from '@mui/utils';
import axios from 'axios';

// helper to check if we have an auth token either in query parameters or in storage. Redirect to log in if we don't
function check_auth_code() {
    // check hash for token. map hash from string to obj with keys 'id_token', 'access_token', 'expires_in', 'token_type'
    const hash = window.location.hash
    const hash_params = hash.substring(1).split('&').reduce(function(map, obj){
        const split = obj.split("=");
        map[split[0]] = split[1];
        return map
    }, {})

    let id_token = hash_params['id_token']

    if (id_token) {
        // store auth code
        localStorage.setItem('id_token', id_token)
    }

    // if we don't have an auth code in storage, redirect to log in page
    id_token = localStorage.getItem('id_token')
    if (!id_token) {
        window.location.href = "/"
    }
}

// clear the auth code stored in browser
// planning to use this every time we get an expired code response from an api request
function clear_auth_code() {
    localStorage.removeItem('id_token')
    window.location.href = "/"
}

async function get_user_info() {
    const token = localStorage.getItem('id_token');
    const headers = {
        'Authorization': token,
        'x-api-key': 'VQi4PffXXeaUzTIaEBnzUaGdnP6sPy9EUWtZSdp8'
    }
    let response1 = null;
    let response2 = null;
    let total_val = null;
    let total_cards = null;
    try{
        response1 = await axios.get('https://3zd6ttzexc.execute-api.us-east-1.amazonaws.com/dev/user', {headers})
        response2 = await axios.get('https://3zd6ttzexc.execute-api.us-east-1.amazonaws.com/dev/cards', {headers})
        response2.data.cards.forEach(
            (element) => {
                total_cards += 1
                total_val += element.price_object.mean_value
            }
        )
        console.log("total_val")
        console.log(total_val)
        return [response1.data, total_cards, total_val]
    } catch (error) {
        // right now, failed auth returns a cors error because it doesn't have the cors header. If we had the cors header
        // we could properly parse the error for an auth error. For now, just log out. 
        clear_auth_code();
    }
}

export {check_auth_code, clear_auth_code, get_user_info};