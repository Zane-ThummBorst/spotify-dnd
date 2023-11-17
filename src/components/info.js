import React, { useContext} from 'react';
import { MyContext } from '../myContext';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import 'bootstrap/dist/css/bootstrap.css';
import {Button} from '@mui/material'
import { v4 as uuidv4 } from 'uuid';


export default function Info({element,id,playlist_id,index}){
    const { columns, setColumns, dragged } = useContext(MyContext);
    const button = playlist_id != "Search" ? <Button className='align-right' variant='outlined' onClick={() => deleteSong(playlist_id, index)}>X</Button> : '' 
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
        <Draggable key={id} draggableId={id} index={index}>
          {(provided, snapshot) => (
            <li className={`list-group-item d-flex ${snapshot.isDragging ? '' : 'w-100'}`} ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                <img src={element.images[2].url}></img>
                <p className='h5 ms-2 w-100'>{element.song} by {element.artists[0].artist}</p>
                {button}
            </li>
        )}
        </Draggable>
    )
}