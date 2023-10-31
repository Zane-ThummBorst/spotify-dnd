
const express = require('express')
const router = express.Router();
const axios = require('axios')
const uuid = require('uuid');
// import { v4 as uuidv4 } from 'uuid';

router.post('/', async(req, res)=> {
    try {
        const url = `https://api.spotify.com/v1/search?q=${req.body.query}&type=track&limit=50`;
        let results =await axios.get(url, {
          headers: {
            Authorization: `Bearer BQC4FE_5fspn9_MhTx-jXOt37P7x8AzQRdoHsd1ZROIloSiuH9nqzyMFJc1t704G_PIsi6X-tchm_Luss-y5LsKN74Qdgw031NoG2rjYEc8QiHPpNA0`,
          },
        });
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
        // console.log(finished);
        res.json(finished);
      } catch (error) {
        console.log("failure");
      }
})



module.exports = router