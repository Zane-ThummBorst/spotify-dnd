
const express = require('express')
const app = express()
const port = 1234
const back  = require('./routes/back')
const UserCollections = require('./routes/UserCollections')
const {MongoClient} = require('mongodb');

// const uri = 'mongodb://localhost:27017/test'
const client = new MongoClient("mongodb://0.0.0.0:27017/", { monitorCommands: true })

let cors = require('cors');
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));


async function run() {
  try{
    await client.connect();

    const db = client.db('Cagroc')
    const users = db.collection('users')
    const doc = {
      username: 'Zane',
      email: 'thummborstz@gmail.com',
      playlists: [
        {playlist_id: 'wack', playlist_name:'burmese'},
        {playlist_id: 'wack', playlist_name:'burmese'},
        {playlist_id: 'wack', playlist_name:'burmese'},
        {playlist_id: 'wack', playlist_name:'burmese'}
      ]
    }
    //const result = await users.insertOne(doc)
    //console.log(result.insertedId)
  }finally{
    await client.close();
  }
}

run().catch((error) =>{
  console.log(error)
})

app.use('/neet/back', back);
//app.use('neet/userCollections', UserCollections);


app.get('/neet', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})