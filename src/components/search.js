import React, { useContext, useState, useEffect } from 'react';
import { MyContext } from '../myContext';
import {  Droppable } from 'react-beautiful-dnd';
import 'bootstrap/dist/css/bootstrap.css';
import axios from 'axios';
import Info from './info'
import TextField from '@mui/material/TextField';
import {Button, Autocomplete, InputAdornment, Switch, FormControlLabel} from '@mui/material'

let url = 'http://localhost:1234/neet/back';
let url2 = 'http://localhost:1234/neet/back/access'


export default function Search(){
  const { users, setUsers } = useContext(MyContext);
  const [genres, setGenres] = useState([]);
  const [genre, setGenre] = useState([]);
  const [submission,setSubmission] = useState('a')
  const [newSongs, setNewSongs] = useState(false)
  const [timeOut, setTimeOut] = useState(0)

  const handleToggle = (event) =>{
    setNewSongs(event.target.checked)
  }

  useEffect(() => {
    axios.get('http://localhost:1234/neet/back/genreList').then((res) =>{
      let list = [];
      res.data.genres.map((genre) =>{
        list.push({'label': genre})
      })
      setGenres(list)
  })},[]);

  useEffect(() =>{
    clearTimeout(timeOut);
    const newTimeout = setTimeout(() => {
      handleSubmit(null);
    }, 500);
    setTimeOut(newTimeout);
  }, [submission, newSongs])

    const handleSubmit = (event) =>{
      console.log(submission);
      let query = submission
      if(query == ""){
        query = "s"
      }

      if(event != null)
        event.preventDefault()
      axios.post(url, {
          query: query,
          genres: genre,
          newTag: newSongs
      }).then((res)=>{
        setUsers(res.data);
      })}

      // const handleChange = (event) =>{
      //   const query = event.target.value
      //   setSubmission(event.target.value)
      //   clearTimeout(timeOut);

      //   const newTimeout = setTimeout(() => {
      //     handleSubmit(null,query);
      //   }, 500);

      //   setTimeOut(newTimeout);
      // }  
    return (
     <div>
      <form onSubmit={(event) => {handleSubmit(event)}}>
        <div className='d-flex' >
          <TextField
          className='my-3'
          id='main-search'
          sx={{width: 300}}
          label='Song Search'
          onChange={(event) =>{
            setSubmission(event.target.value)
          }}
          />
          <Autocomplete className='my-3'
            multiple
            disablePortal
            limitTags={1}
            id="combo-box-demo"
            options={genres}
            onChange={(event, newValue) =>{
              setGenre(newValue);
            }}
            sx={{ width: 400}}
            renderInput={(params) => <TextField {...params} label="Genre" />}
            name="genres"
          />
        </div>
        <FormControlLabel
          className='me-5'
          control={<Switch onChange={(event) =>{
            handleToggle(event)}}/>}
          label='New Songs'
        />

        <Button variant='outlined' type='submit'>submit</Button>
      </form>
      <Droppable droppableId="Search" isDropDisabled={true}>
        {(provided) => (
        <ul style={{maxHeight: '400px', overflow: 'auto'}} className="border my-3 py-3 list-group" {...provided.droppableProps} ref={provided.innerRef}>
        {users.map((element, index) =>{
            return(
            <Info element={element} id={element.id} playlist_id="Search" index={index}></Info>
            )
        })}
      </ul>
      )}
      </Droppable>
     </div>
    );
}