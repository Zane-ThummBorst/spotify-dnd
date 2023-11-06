import React, { useContext } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import 'bootstrap/dist/css/bootstrap.css';
import { v4 as uuidv4 } from 'uuid';
import Info from './info';
import { MyContext } from '../myContext';
import { Button } from '@mui/material';

export default function Playlist(props) {
  const { columns, setColumns, dragged} = useContext(MyContext);

  const deleteSong = (id, index) =>{
    let newColumn = {...columns};
    let destColumn = newColumn[id];
    let list = newColumn[id]['items'];
    list.splice(index,1);
    setColumns({
      ...columns,
      [id]: {
        ...destColumn,
         items: list
      }
    })
  }
    return(
        <div> 
        <p className='h3 text-center'>{props.data.playlist_name}</p>  
        <Droppable droppableId={props.id}>
        {(provided) => (
          <ul style={{maxHeight: '400px', overflow: 'auto'}}  className="border my-3 py-3 list-group" {...provided.droppableProps} ref={provided.innerRef}>
            {props.data.items.map((element, index) =>{
                return(
                <MyContext.Provider value={{columns,setColumns, dragged}}>
                  <div className='d-flex'>
                    <Info element={element} id={element.id} playlist_id={props.id} index={index}></Info>
                    {/* <Button className='align-right' variant='outlined' onClick={() => deleteSong(props.id, index)}>X</Button> */}
                  </div>
                </MyContext.Provider>
                )
            } )}

            {provided.placeholder}
          </ul>
        )}
      </Droppable>
      </div>
    )
};