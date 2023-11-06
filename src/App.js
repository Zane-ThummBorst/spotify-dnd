import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import './App.css';
import 'bootstrap/dist/css/bootstrap.css';
import dataSet from './components/data';
import Playlist from './components/playlist';
import Search from './components/search';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import Info from './components/info'
import { MyContext } from "./myContext";
import {Button, TextField, InputAdornment} from '@mui/material'
let url = 'http://localhost:1234/neet/back';
let url2 = 'http://localhost:1234/neet/back/access'


const onDragEnd = (result, columns, setColumns, users, setUsers, setDragged) => {
  if (!result.destination) return;
  const { source, destination } = result;

  if(source.droppableId == "Search"){
      const sourceColumn =[...users];
      const destColumn = columns[destination.droppableId];
      const destItems = [...destColumn.items];
      destItems.splice(destination.index, 0, sourceColumn[source.index]);
      let item = sourceColumn.splice(source.index, 1)[0];
      const newitem = {...item, id: uuidv4()}
      sourceColumn.splice(source.index, 0, newitem )
      setColumns({
        ...columns,
        [destination.droppableId]: {
          ...destColumn,
           items: destItems
        }
      });
      setUsers(sourceColumn);
  }
  else if (source.droppableId !== destination.droppableId) {
    const sourceColumn = columns[source.droppableId];
    const destColumn = columns[destination.droppableId];
    const sourceItems = [...sourceColumn.items];
    const destItems = [...destColumn.items];
    const [removed] = sourceItems.splice(source.index, 1);
    destItems.splice(destination.index, 0, removed);
    setColumns({
      ...columns,
      [source.droppableId]: {
        ...sourceColumn,
         items: sourceItems
      },
      [destination.droppableId]: {
        ...destColumn,
         items: destItems
      }
    });
  } else {
    const column = columns[source.droppableId];
    const copiedItems = [...column.items];
    const [removed] = copiedItems.splice(source.index, 1);
    copiedItems.splice(destination.index, 0, removed);
    setColumns({
      ...columns,
      [source.droppableId]: {
        ...column,
         items: copiedItems
      }
    });
    setDragged('w-100');
  }
};



function App() {
  const [columns, setColumns] = useState({});
  let [users, setUsers] = useState([]);
  let [playlistName, setPlaylistName] = useState('');
  const [dragged, setDragged] = useState('w-100');

  const handleAccess = () =>{
    axios.post(url2).then((res)=>{
      console.log("balls")
    })}

  const handleAddColumn = (event) =>{
    event.preventDefault()
    let len = uuidv4();
    setColumns({...columns, [len]: {playlist_name: playlistName, items: []}})
  }

  const deleteColumn = (id) => {
    let newColumn = {...columns};
    delete newColumn[id];
    setColumns(newColumn);
  }
    return(
      <div className='container '>

        <DragDropContext
        onDragStart={() =>{setDragged('')}}
        onDragEnd={(result) => onDragEnd(result, columns, setColumns, users, setUsers, setDragged)}>
        <div className='row'>
          <div className='col-4 border rounded mt-3'>
          <form onSubmit={handleAddColumn}>
            <TextField
            className='my-3'
            id='set_playlist_name'
            sx={{width: 300}}
            label='Playlist Name'
            onChange={(event) =>{setPlaylistName(event.target.value)}}
            InputProps={{endAdornment: <Button className='mx-1' variant='outlined' type='submit'>Submit</Button> }}
            />
          </form>
          <MyContext.Provider value={{ users, setUsers }}>
            <Search></Search>
          </MyContext.Provider>
          
          </div>
          <div className='col-4 mt-3'>
          {Object.entries(columns).map(([id, column], index) =>{
            if(index % 2 == 0){
            return(
              <div className='border rounded mt-3'>
                <MyContext.Provider value={{columns,setColumns,dragged}}>
                  <Playlist id={id} data={column}></Playlist>
                </MyContext.Provider>
                <Button className = 'my-2 mx-2' variant='outlined' onClick={() => deleteColumn(id)}>Delete</Button>
              </div>
            )}
          })}
          </div>
          <div className='col-4 mt-3'>
          {Object.entries(columns).map(([id, column],index) =>{
            if(index%2 != 0){
            return(
              <div className='border rounded mt-3'>
                <MyContext.Provider value={{columns,setColumns,dragged}}>
                  <Playlist id={id} data={column}></Playlist>
                </MyContext.Provider>
                <Button className = 'my-2 mx-2' variant='outlined' onClick={() => deleteColumn(id)}>Delete</Button>
              </div>
            )}
          })}
          </div>
        </div>
        </DragDropContext>
        <Button className='my-3' variant='outlined' onClick={() => handleAccess()}>Hit me</Button>
      </div>
    )
  }
  

export default App;

