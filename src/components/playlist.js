import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import 'bootstrap/dist/css/bootstrap.css';
import { v4 as uuidv4 } from 'uuid';
import Info from './info';

export default function Playlist(props) {
    return(
        <div> 
        <p className='h3 text-center'>{props.data.playlist_name}</p>  
        <Droppable droppableId={props.id}>
        {(provided) => (
          <ul className="border my-3 py-3 list-group" {...provided.droppableProps} ref={provided.innerRef}>
            {props.data.items.map((element, index) =>{
                console.log(element);
                return(
                <Info element={element} id={element.id} index={index}></Info>
                )
            } )}

            {provided.placeholder}
          </ul>
        )}
      </Droppable>
      </div>
    )
};