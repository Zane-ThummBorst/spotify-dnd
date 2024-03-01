import React, { useContext, useState, useEffect } from 'react';
import { MyContext } from '../myContext';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import 'bootstrap/dist/css/bootstrap.css';
import axios from 'axios';
import Info from './info'
import {Box} from '@mui/material'
import TextField from '@mui/material/TextField';
import {Button, Autocomplete, InputAdornment, Switch, FormControlLabel} from '@mui/material'
import { FixedSizeList, areEqual } from 'react-window';


let url = 'http://localhost:1234/neet/back';


export default function Search(){
  const { users, setUsers, is_expired, getRefreshToken } = useContext(MyContext);
  const [genres, setGenres] = useState([]);
  const [genre, setGenre] = useState([]);
  const [submission,setSubmission] = useState('a')
  const [newSongs, setNewSongs] = useState(false)
  const [timeOut, setTimeOut] = useState(0)
  const [offset, setOffset] = useState(0)

  // try to change up?? Snagged from code sandbox example
  function getStyle({ provided, style, isDragging }) {
    const combined = {
      ...style,
      ...provided.draggableProps.style,
    };
  
    const marginBottom = 8;
    const withSpacing = {
      ...combined,
      height: isDragging ? combined.height : combined.height - marginBottom,
      marginBottom,
    };
    return withSpacing;
  }
  
  //rename function to something more appropriate
  function Next({ provided, item, style, isDragging, playlist_id, index }) {
    return (
      <div
        {...provided.draggableProps}
        {...provided.dragHandleProps}
        ref={provided.innerRef}
        style={getStyle({ provided, style, isDragging })}
      >
          <Info isDragging={isDragging} element={item} id={item.id} playlist_id='Search' index={index}/>
      </div>
    );
  }
    //figure out how react memo is working???
    const Row = React.memo(({ index, style, data, playlist_id }) => {
      const item = data[index];
      return (
        <Draggable draggableId={item.id} index={index} key={"same"}>
          {(provided) => <Next provided={provided} item={item} style={style} playlist_id='Searchy' index={index} />}
        </Draggable>
      );
   }, areEqual);

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
      console.log(is_expired())
      let query = submission
      if(query == ""){
        query = "s"
      }
      const off = offset;
      axios.post(url, {
          query: query,
          genres: genre,
          newTag: newSongs,
          offset: off,
          access_token: localStorage.getItem('access_token')
      }).then((res)=>{
        if(offset > 0){
          const merged = [...users, ...res.data];
          setUsers(merged);
        }else{
          setUsers(res.data);
        }
      })}


    return (
     <div>
      <form>
        <Box display='flex'>
          <TextField
          id='main-search'
          sx={{width: 300, my:2}}
          label='Song Search'
          onChange={(event) =>{
            setSubmission(event.target.value)
          }}
          />
          <Autocomplete
            multiple
            disablePortal
            limitTags={1}
            id="combo-box-demo"
            options={genres}
            onChange={(event, newValue) =>{
              setGenre(newValue);
            }}
            sx={{ width: 400, my:2}}
            renderInput={(params) => <TextField {...params} label="Genre" />}
            name="genres"
          />
        </Box>
        <FormControlLabel
          sx={{mr:5}}
          control={<Switch onChange={(event) =>{
            handleToggle(event)}}/>}
          label='New Songs'
        />

        <Button 
        onClick={() => {
          setOffset(0)
          handleSubmit(0)}}
        variant='outlined'>submit</Button>
      </form>
      <Droppable droppableId="Search" isDropDisabled={true} mode = 'virtual' renderClone={
        (provided, snapshot, rubric) => (
          <Next
            provided={provided}
            isDragging={snapshot.isDragging}
            item={users[rubric.source.index]}
            playlist_id='Search'
          />
      )}>
        {(provided) => (
          // bootstrap TODO
          <Box sx={{my:2, py:2, border:1, borderRadius: '2%'}}>
          <FixedSizeList
            height={400}
            itemCount={users.length}
            itemSize={80}
            itemData={users}
            outerRef={provided.innerRef}
            innerElementType="ul"
            playlist_id = 'Search'
            style={{ maxHeight: '400px', overflow: 'auto' }}
            {...provided.droppableProps}
            >
            {Row}
          </FixedSizeList>
          </Box>
      )}
      </Droppable>
     </div>
    );
}