
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
        // genre:"${genres.join('"OR genre:"')}"
        let genres = req.body.genres;
        let queryString = [];
        genres.map((element) =>{
          queryString.push(element.label)
        })
        let propBuilder = ''; 
        propBuilder += req.body.newTag ? `year:2023 ` : ''; 
        if(queryString.length > 0)
          propBuilder += ` genre:"${queryString.join('"OR genre:"')}" `;
        propBuilder += req.body.query === undefined ? "" : req.body.query 
        const url = `https://api.spotify.com/v1/search?q=${propBuilder}&type=track&limit=50&offset=${req.body.offset}`;
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

router.get('/genres', async(req, res) =>{
  const url = 'https://api.spotify.com/v1/recommendations/available-genre-seeds'
  let data = JSON.parse(fs.readFileSync(file));
  let results =await axios.get(url, {
    headers: {
      Authorization: `Bearer ${data['access_token']}`,
    },
  }).catch((error) =>{
    console.log(error)
    res.json({});
  })

  res.json(results.data)
})

router.get('/genreList', async(req, res) =>{
  res.json({"genres":["acoustic","afrobeat","alt-rock","alternative","ambient","anime","black-metal","bluegrass","blues","bossanova","brazil","breakbeat","british","cantopop","chicago-house","children","chill","classical","club","comedy","country","dance","dancehall","death-metal","deep-house","detroit-techno","disco","disney","drum-and-bass","dub","dubstep","edm","electro","electronic","emo","folk","forro","french","funk","garage","german","gospel","goth","grindcore","groove","grunge","guitar","happy","hard-rock","hardcore","hardstyle","heavy-metal","hip-hop","holidays","honky-tonk","house","idm","indian","indie","indie-pop","industrial","iranian","j-dance","j-idol","j-pop","j-rock","jazz","k-pop","kids","latin","latino","malay","mandopop","metal","metal-misc","metalcore","minimal-techno","movies","mpb","new-age","new-release","opera","pagode","party","philippines-opm","piano","pop","pop-film","post-dubstep","power-pop","progressive-house","psych-rock","punk","punk-rock","r-n-b","rainy-day","reggae","reggaeton","road-trip","rock","rock-n-roll","rockabilly","romance","sad","salsa","samba","sertanejo","show-tunes","singer-songwriter","ska","sleep","songwriter","soul","soundtracks","spanish","study","summer","swedish","synth-pop","tango","techno","trance","trip-hop","turkish","work-out","world-music"]})
})



router.get('/userInfo', async(req,res) =>{
  const url = "https://api.spotify.com/v1/me";
  let data = JSON.parse(fs.readFileSync(file));
  let results =await axios.get(url, {
    headers: {
      Authorization: `Bearer BQCUvBcgNcPVZ9DwOnmn9h3D43E1ENM_8iaiV0aPRwPbrRQD2G-euINqfqzNemFOXGxF8dmavn8whmRkX51_JawgozHziLzYJ2LRRBK8aI04sgVcIwuJQsUjOtaSoOuJiyq4VQAvLxu__ZxT0YdqK28wk4j8aF9AbHEgT9-VVTFthfgXHiiWNN4`,
    },
  }).then(response =>{
    res.json(response.data.id);
    console.log(response)
  }).catch((error) =>{
    console.log(error)
  })
})


/**
 * TODO:
 *  grab user id programically
 *  grab bearer token programically
 */
router.get('/userPlaylist', async(req,res) =>{
  // const user_id = 'zanethummborst'
  const url = `https://api.spotify.com/v1/me/playlists`
  let results =await axios.get(url, {
    headers: {
      Authorization: `Bearer BQCUvBcgNcPVZ9DwOnmn9h3D43E1ENM_8iaiV0aPRwPbrRQD2G-euINqfqzNemFOXGxF8dmavn8whmRkX51_JawgozHziLzYJ2LRRBK8aI04sgVcIwuJQsUjOtaSoOuJiyq4VQAvLxu__ZxT0YdqK28wk4j8aF9AbHEgT9-VVTFthfgXHiiWNN4`,
    },
    }).then(response =>{
      console.log(response.data.items)
      res.json(response.data.items)
    }) 
})

router.post('/createPlaylist', async(req,res) =>{
    const playlist_name = req.body.playlist;
    console.log(playlist_name)
    const user_id = req.body.user_id;
    const access_token = req.body.access_token;

    const playlistDetails = {
      name: playlist_name,
      description: 'lemon scented',
      public: true, // Set to false for a private playlist
    };

    const url = `https://api.spotify.com/v1/users/zanethummborst/playlists`
    let results =await axios.post(url, playlistDetails, {
      headers: {
        Authorization: `Bearer ${access_token}`,
        'Content-Type': 'application/json'
      }
    }).then((response) =>{
      console.log("playlist successfuly created")
      console.log(response)
    }).catch((error) =>{
      console.log(error.response.data)
    })
  })

module.exports = router