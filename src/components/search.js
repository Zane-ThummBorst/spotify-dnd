import React, { useContext, useState, useEffect } from 'react';
import { MyContext } from '../myContext';
import {  Droppable } from 'react-beautiful-dnd';
import 'bootstrap/dist/css/bootstrap.css';
import axios from 'axios';
import Info from './info'
import TextField from '@mui/material/TextField';
import {Button, Autocomplete, InputAdornment} from '@mui/material'

let url = 'http://localhost:1234/neet/back';
let url2 = 'http://localhost:1234/neet/back/access'


export default function Search(){
  const { users, setUsers } = useContext(MyContext);
  const [genres, setGenres] = useState([]);
  const [genre, setGenre] = useState([]);
  const [submission,setSubmission] = useState('')

  useEffect(() => {
    axios.get('http://localhost:1234/neet/back/genreList').then((res) =>{
      let list = [];
      res.data.genres.map((genre) =>{
        list.push({'label': genre})
      })
      setGenres(list)
  })},[]);


    const handleSubmit = (event) =>{
      event.preventDefault()
      axios.post(url, {
          query: submission,
          genres: genre
      }).then((res)=>{
        setUsers(res.data);
      })}
  
    return (
     <div>
      <form onSubmit={handleSubmit}>
        <div className='d-flex' >
          <TextField
          className='my-3'
          id='main-search'
          sx={{width: 300}}
          label='Song Search'
          onChange={(event) =>{setSubmission(event.target.value)}}
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
        <Button variant='outlined' type='submit'>submit</Button>
      </form>
      <Droppable droppableId="Search" isDropDisabled={true}>
        {(provided) => (
        <ul style={{maxHeight: '400px', overflow: 'auto'}} className="border my-3 py-3 list-group" {...provided.droppableProps} ref={provided.innerRef}>
        {users.map((element, index) =>{
            return(
            <Info element={element} id={element.id} index={index}></Info>
            )
        })}
      </ul>
      )}
      </Droppable>
     </div>
    );
}