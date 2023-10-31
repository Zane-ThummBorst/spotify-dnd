
const express = require('express')
const router = express.Router();
const axios = require('axios')
const uuid = require('uuid');

// import { v4 as uuidv4 } from 'uuid';

let access_token;
router.post('/', async(req, res)=> {
  
        const url = `https://api.spotify.com/v1/search?q=${req.body.query}&type=track&limit=50`;
        let results =await axios.get(url, {
          headers: {
            Authorization: `Bearer BQCQWvEnTvYdIgwY5iyeNpg7gxPuxzdicUu9PaQSYLokXikKpRsag4eiRo3XgROGEYbli4q3_Y9OeGZMZJr6qYw8kv2cEc-SB4KGu6rDs9LOoB1xHug`,
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