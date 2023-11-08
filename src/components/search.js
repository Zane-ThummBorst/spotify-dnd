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
  const [offset, setOffset] = useState(0)


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
      setOffset(0);
      handleSubmit(0);
    }, 500);
    setTimeOut(newTimeout);
  }, [submission, newSongs])


    const handleSubmit = (offset) =>{
      console.log(submission);
      let query = submission
      if(query == ""){
        query = "s"
      }
      const off = offset;
      axios.post(url, {
          query: query,
          genres: genre,
          newTag: newSongs,
          offset: off
      }).then((res)=>{
        if(offset > 0){
          const merged = [...users, ...res.data];
          setUsers(merged);
        }else{
          setUsers(res.data);
        }
      })}

      // const handleScroll = (event) =>{
      //   const bottom = (event.target.clientHeight ===  Math.ceil(event.target.scrollHeight - event.target.scrollTop)) || (event.target.clientHeight ===  Math.floor(event.target.scrollHeight - event.target.scrollTop));
      //   if(!bottom){
      //     console.log(event.target.clientHeight)
      //     console.log("============")
      //     console.log(event.target.scrollHeight - event.target.scrollTop)
      //   }else{
      //     let query = submission
      //     if(query == ""){
      //       query = "s"
      //     }
      //     let off = offset;
      //     setOffset(off + 50);
      //     axios.post(url, {
      //       query: query,
      //       genres: genre,
      //       newTag: newSongs,
      //       offset: off+50
      //   }).then((res)=>{
      //     console.log("multiple????")
      //     const merged = [...users, ...res.data];
      //     setUsers(merged);
      //   })}
      // }

    return (
     <div>
      <form>
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

        <Button onClick={() => {setOffset(0)}} variant='outlined'>submit</Button>
      </form>
      <Droppable droppableId="Search" isDropDisabled={true}>
        {(provided) => (
        <ul style={{maxHeight: '400px', overflow: 'auto'}} className="border my-3 py-3 list-group" {...provided.droppableProps} ref={provided.innerRef}>
        {users.map((element, index) =>{
            return(
            <Info element={element} id={element.id} playlist_id="Search" index={index}></Info>
            )
        })}
        
        <li><Button onClick={() => {handleSubmit(offset+50)
           setOffset(offset+ 50); }}
            variant='outlined'>Load More</Button></li>
      </ul>
      )}
      </Droppable>
     </div>
    );
}