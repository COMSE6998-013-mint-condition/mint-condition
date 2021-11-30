import axios from 'axios';

// Create instance
export default axios.create({
    baseURL: `https://3zd6ttzexc.execute-api.us-east-1.amazonaws.com/dev`
});
