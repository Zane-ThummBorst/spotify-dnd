import React, { useContext} from 'react';
import { MyContext } from '../myContext';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import 'bootstrap/dist/css/bootstrap.css';
import { v4 as uuidv4 } from 'uuid';


export default function Info({element,id,index}){


    return(
        <Draggable key={id} draggableId={id} index={index}>
          {(provided) => (
        <li className='list-group-item d-flex' ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
            <img src={element.images[2].url}></img>
            <p className='h5 ms-2'>{element.song} by {element.artists[0].artist}</p>
        </li>
        )}
        </Draggable>
    )
}