
const express = require('express')
const router = express.Router();
const axios = require('axios')
const uuid = require('uuid');
const fs = require('fs')
const file = 'access_token.json'
const {MongoClient} = require('mongodb');

const client = new MongoClient("mongodb://0.0.0.0:27017/", { monitorCommands: true })
client.connect();

router.post('/', async(req, res)=> {
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
  
  let results =await axios.get(url, {
    headers: {
      Authorization: `Bearer ${req.body.access_token}`,
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
      albumid: element.album.id,
      uri: element.uri
    }
  )
})        
res.json(finished);
})

// not used often (used once to get genres that put into its own thang)
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

router.post('/userInfo', async(req,res) =>{
  const url = "https://api.spotify.com/v1/me";
  const access_token = req.body.access_token
  const sync = req.body.sync
  let results =await axios.get(url, {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  }).then(async(response) =>{

    try{
      //await client.connect();
      const db = client.db('Cagroc')
      const users = db.collection('users')

      // change this to store in redis instead
      const query = {
        username: response.data.id,
        email: response.data.email,
      }
      const exists = await users.findOne(query);
      if (!exists){
        let UPI = await getUserPlaylistInfo(access_token)
        const doc = {
          username: response.data.id,
          email: response.data.email,
          playlists: UPI
        }
        const result = await users.insertOne(doc)
      }
      else if (sync){
        let UPI = await getUserPlaylistInfo(access_token)
        let myquery = {username: response.data.id}
        let newVals = {$set: {playlists: UPI}}
        //const result = await users.insertOne(doc)
        const result = await users.updateOne(myquery, newVals);
      }

    }finally{
      //await client.close();
    }
    res.json(response.data.id);
  }).catch((error) =>{
    console.log(error)
  })
})

// adds to redis, mongo, spotify
// creation is immediate (no publish, publish as created)
router.post('/createPlaylist', async(req,res) =>{
    const playlist_name = req.body.playlist;
    const user_id = req.body.user_id;
    const access_token = req.body.access_token;
    const playlistDetails = {
      name: playlist_name,
      description: 'lemon scented',
      public: true, // Set to false for a private playlist
    };



    const url = `https://api.spotify.com/v1/users/${user_id}/playlists`
    let results =await axios.post(url, playlistDetails, {
      headers: {
        Authorization: `Bearer ${access_token}`,
        'Content-Type': 'application/json'
      }
    }).then(async(response) =>{
      console.log("playlist successfuly created")
      await client.connect()
      .then(async() =>{
        const db = client.db('Cagroc')
        const users = db.collection('users')
        let user = await users.findOne({username: req.body.user_id})
        let playlists = user.playlists
        playlists.unshift({
          playlist_id: response.data.id,
          playlist_name:playlist_name,
          items:[]
        })
        users.updateOne({username: req.body.user_id}, {$set: {playlists: playlists}})
      })


      res.json(response.data.id)
    }).catch((error) =>{
      console.log(error.response.data)
    })
})

router.post('/updatePlaylist', async(req,res) =>{
  let id = '6UCayoL55oMkJ57l4r2Ev0'
  let url = `https://api.spotify.com/v1/playlists/6UCayoL55oMkJ57l4r2Ev0/tracks?uris=spotify:track:4iV5W9uYEdYUVa79Axb7Rh`
  const access_token = req.body.access_token;
  let items = req.body.items
  let playlist_id = req.body.playlist_id
  let arr = items.map((element) =>{
    return element['uri']
  })
  

  const response = await axios.put(
    `https://api.spotify.com/v1/playlists/${playlist_id}/tracks`,
    {},
    {
      params: {
        'uris': arr.join(',')
      },
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json'
      }
    }
  ).then((response) =>{
    console.log("playlist successfuly updated")
  }).catch((error) =>{
    console.log(error.response.data)
  })
})

//delete needs to update cache and update mongo

router.post('/delete', async(req, res) => {
  let page = req.body.page;
  const access_token = req.body.access_token

  await client.connect()
  .then(async() =>{
    const db = client.db('Cagroc')
    const users = db.collection('users')
    let playlists = await users.findOne({username: req.body.username})
    playlists = playlists.playlists
    playlists = playlists.filter(element =>{
      return element.playlist_id != req.body.playlist_id
    })
    users.updateOne({username: req.body.username}, {$set: {playlists: playlists}})

  })
  console.log('BIG MASSIVE BALLS')
  const url = `https://api.spotify.com/v1/playlists/${req.body.playlist_id}/followers`
  let result = await axios.delete(url, {
    headers: {
      Authorization: `Bearer ${access_token}`,
    }
  }).then(()=>{
    console.log('playlist deleted')
    res.json('')
  }).catch((error) =>{
    console.log(req.body.playlist_id)
  })
})

// key for redis can just be the page it is found on
// if page is altered, then those changes must be reflected
router.post('/userPlaylist', async(req,res) =>{
  let result = []
    const playlist_ids = await mongodbPlaylists(req.body.access_token, req.body.offset, req.body.username, req.body.term)
    .then(async(response) =>{
        for(let i = 0; i < response.length; i++){
          items = await userPlaylistItems(req.body.access_token, response[i].playlist_id)
          result.push({
            playlist_id: response[i].playlist_id,
            playlist_name: response[i].playlist_name,
            items: items
          })
      }
      // console.log(result)
      res.json(result);
    })
    console.log('finished')
})

// must account for # of total playlists
router.post('/totalPlaylists', async(req, res) =>{
  let playlists
  let username = req.body.username
  let term = req.body.term
  console.log('we have made it')
  try{
    //await client.connect()
    const db = client.db('Cagroc')
    const users = db.collection('users')
    let user = await users.findOne({username: username})
    playlists = user.playlists
    playlists = playlists.filter(element =>{
      return element.playlist_name.toLowerCase().includes(term)
    })
  }catch(error){
    console.log(error);
  }
  finally{
    //await client.close()
    if(playlists)
      res.json(playlists.length)
    else
      res.json(0)
  }
});

let mongodbPlaylists = async(access_token, offset, username, term) =>{
  let result = []
  try{
    //await client.connect()
    const db = client.db('Cagroc')
    const users = db.collection('users')
    let user = await users.findOne({username: username})
    let playlists = user.playlists
    playlists = playlists.filter(element =>{
      return element.playlist_name.toLowerCase().includes(term)
    })
    for(let i = offset; i < offset + 4 && i < playlists.length; i++){
      result.push(playlists[i])
    }
  }finally{
    //await client.close()
    return result
  }
}
let getUserPlaylistInfo = async(access_token) =>{
    let offset = 0
    let playlist = []
    let morePlaylists = true
    while(morePlaylists){
      await userPlaylistIds(access_token, 50, offset)
      .then(response =>{
        if(response.length != 0){
          response.map(element =>{
            playlist.push({playlist_id: element.id, playlist_name: element.name, items:[]})
          })
          offset += 50
        }else{
          morePlaylists = false
        }
        //console.log(response)
      }).catch(error=>{
        console.log('balls')
      })
    }
    return playlist
}

let userPlaylistIds = async(access_token, limit, offset) =>{
  let temp = null
  const url = `https://api.spotify.com/v1/me/playlists?limit=${limit}&offset=${offset}`
  let results =await axios.get(url, {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
    }).then(response =>{
      console.log(response.data.items)
      temp = response.data.items
    }).catch((error) =>{
      console.log(error)
    }) 
    return temp
}

// get one (repetitive but get a working solution then optimize)
let userPlaylistItems = async(access_token, id) =>{
  let playlist_id = id
  let items = []
  const response = await axios.get(
    `https://api.spotify.com/v1/playlists/${playlist_id}/tracks`,
    {
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json'
      }
    }
  ).then(response =>{
    response.data.items.map(element =>{
      items.push({
        id: uuid.v4(),  
              song: element.track.name,
              songid: element.track.id, 
              artists: element.track.artists.map((e) =>{ return {artist: e.name, id: e.id}}),
              images: element.track.album.images,
              albumid: element.track.album.id,
              uri: element.track.uri
      })
    })
  }).catch(error =>{
    console.log(error)
  })
  return items
}

router.post('/getOne', async(req, res) =>{
  let index = req.body.index
  let username = req.body.username
  let term = req.body.term
  let playlist;
  await client.connect()
  .then(async() =>{
    const db = client.db('Cagroc')
    const users = db.collection('users')
    let user = await users.findOne({username: username})
    let playlists = user.playlists
    playlists = playlists.filter(element =>{
      return element.playlist_name.toLowerCase().includes(term)
    })
    playlist = playlists[index]
  }).catch(error =>{
    console.log('balls this did not work!!!')
  })


  if(!playlist){
    res.json(undefined)
  }else{
    let playlist_id = playlist.playlist_id;
    let access_token = req.body.access_token;
    let items = []
    const response = await axios.get(
      `https://api.spotify.com/v1/playlists/${playlist_id}/tracks`,
      {
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'Content-Type': 'application/json'
        }
      }
    ).then(response =>{
      response.data.items.map(element =>{
        items.push({
          id: uuid.v4(),  
                song: element.track.name,
                songid: element.track.id, 
                artists: element.track.artists.map((e) =>{ return {artist: e.name, id: e.id}}),
                images: element.track.album.images,
                albumid: element.track.album.id,
                uri: element.track.uri
        })
      })
    }).catch(error =>{
      console.log(error)
    })

    let result = {
      playlist_id: playlist_id,
      playlist_name: playlist.playlist_name,
      items: items
    }

    res.json(result)
}
})


module.exports = router