
const express = require('express')
const app = express()
const port = 1234
const back  = require('./routes/back')

let cors = require('cors');
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/neet/back', back);


app.get('/neet', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})