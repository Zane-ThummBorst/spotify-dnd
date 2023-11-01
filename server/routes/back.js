
const express = require('express')
const router = express.Router();
const axios = require('axios')
const uuid = require('uuid');
const fs = require('fs')
const file = 'access_token.json'


// import { v4 as uuidv4 } from 'uuid';
/**
 * curl -X POST "https://accounts.spotify.com/api/token"www-form-urlencoded"-d "grant_type=client_credentials&client_id=afb7072142534f63a2142805b5417358&client_secret=78f989dcf6ae4495a7fe1a3bf1fa92ce"
 */
router.post('/access', async(req, res) =>{
  const data = new URLSearchParams();
  data.append('grant_type', 'client_credentials');
  data.append('client_id', 'afb7072142534f63a2142805b5417358');
  data.append('client_secret', '78f989dcf6ae4495a7fe1a3bf1fa92ce');

  const config = {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  };

  
  axios.post('https://accounts.spotify.com/api/token', data, config)
  .then(response => {
    let data = response.data.access_token
    fs.writeFileSync(file, JSON.stringify({"access_token": data}) );
  })
  .catch(error => {
    console.error('Error:', error);
  });
})

router.post('/', async(req, res)=> {
        const url = `https://api.spotify.com/v1/search?q=${req.body.query}&type=track&limit=50`;
        let data = JSON.parse(fs.readFileSync(file));
        let results =await axios.get(url, {
          headers: {
            Authorization: `Bearer ${data['access_token']}`,
          },
        }).catch((error) =>{
          console.log(error.response.status)
          res.json({});
        })
          let finished = results.data.tracks.items.map((element) =>{
          return(
            {
              id: uuid.v4(),  
              song: element.name,
              songid: element.id, 
              artists: element.artists.map((e) =>{ return {artist: e.name, id: e.id}}),
              images: element.album.images,
              albumid: element.album.id
            }
          )
        })        
        res.json(finished);
})



module.exports = router