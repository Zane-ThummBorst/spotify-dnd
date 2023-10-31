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
let url = 'http://localhost:1234/neet/back';


const onDragEnd = (result, columns, setColumns, users, setUsers) => {
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
  }
};



function App() {
  const [columns, setColumns] = useState({});
  let [users, setUsers] = useState([]);

  const handleSubmit = (event) =>{
    event.preventDefault()
    axios.post(url, {
        query: event.target.query.value
    }).then((res)=>{
      setUsers(res.data);
    })}


  const handleAddColumn = (event) =>{
    event.preventDefault()
    let name = event.target.playlist_name.value;
    let len = uuidv4();
    setColumns({...columns, [len]: {playlist_name: name, items: []}})
  }

  const deleteColumn = (id) => {
    let newColumn = {...columns};
    delete newColumn[id];
    setColumns(newColumn);
  }
    return(
      <div className='container'>
        <form onSubmit={handleAddColumn}>
          <input type='text' placeholder='Playlist Name' name='playlist_name'></input>
          <button type='submit'>Submit</button>
        </form>
        <button className='btn' onClick={handleAddColumn}>Add Component</button>




        <DragDropContext onDragEnd={(result) => onDragEnd(result, columns, setColumns, users, setUsers)}>
        <div className='row'>
          <div className='col-4'>
          <MyContext.Provider value={{ users, setUsers }}>
            <Search></Search>
          </MyContext.Provider>
          </div>
          <div className='col-4 mt-3'>
          {Object.entries(columns).map(([id, column], index) =>{
            if(index % 2 == 0){
            return(
              <div>
                <MyContext.Provider value={{columns,setColumns}}>
                  <Playlist id={id} data={column}></Playlist>
                </MyContext.Provider>
                <button className='btn' onClick={() => deleteColumn(id)}>Delete</button>
              </div>
            )}
          })}
          </div>
          <div className='col-4 mt-3'>
          {Object.entries(columns).map(([id, column],index) =>{
            if(index%2 != 0){
            return(
              <div>
                <MyContext.Provider value={{columns,setColumns}}>
                  <Playlist id={id} data={column}></Playlist>
                </MyContext.Provider>
                <button className='btn' onClick={() => deleteColumn(id)}>Delete</button>
              </div>
            )}
          })}
          </div>
        </div>
        </DragDropContext>
      </div>
    )
  }
  

export default App;

