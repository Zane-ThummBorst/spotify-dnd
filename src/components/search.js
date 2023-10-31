import React, { useContext } from 'react';
import { MyContext } from '../myContext';
import {  Droppable } from 'react-beautiful-dnd';
import 'bootstrap/dist/css/bootstrap.css';
import axios from 'axios';
import Info from './info'

let url = 'http://localhost:1234/neet/back';


export default function Search(){
  const { users, setUsers } = useContext(MyContext);

    const handleSubmit = (event) =>{
      event.preventDefault()
      axios.post(url, {
          query: event.target.query.value
      }).then((res)=>{
        setUsers(res.data);
      })}
  
    return (
     <div>
      <form onSubmit={handleSubmit}>
        <input type='text' name="query"></input>
        <button type='submit'>submit</button>
      </form>
      <Droppable droppableId="Search" isDropDisabled={true}>
        {(provided) => (
        <ul className="border my-3 py-3 list-group" {...provided.droppableProps} ref={provided.innerRef}>
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