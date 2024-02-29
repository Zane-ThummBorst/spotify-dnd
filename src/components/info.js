import React, { useContext} from 'react';
import { MyContext } from '../myContext';
import 'bootstrap/dist/css/bootstrap.css';
import {Button} from '@mui/material'
import '../App.css';
import Tooltip from '@mui/material/Tooltip';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';


export default function Info({isDragging,element,id,playlist_id, index}){
    const { columns, setColumns, dragged } = useContext(MyContext);

    //bootstrap TODO
    const button = playlist_id != "Search" ?
     <Button className='align-right' variant='text' size='large' onClick={() => deleteSong(playlist_id, index)}><DeleteIcon/></Button> : ''

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
      // bootstrap TODO
            <li className={`list-group-item d-flex ${isDragging ? '' : 'w-100'}`}>
                <img className='rounded border' src={element.images[2].url}></img>
                <Tooltip title={`${element.song} by ${element.artists[0].artist}`} placement= 'top' arrow>
                <p className='stuff align-self-center h6 ms-2 w-100'>
                  <span className=''>{element.song}</span> 
                  <span className='mt-2 text-secondary'>{element.artists[0].artist}
                  </span>
                  </p>
                </Tooltip>
                {button}
            </li>
        )}