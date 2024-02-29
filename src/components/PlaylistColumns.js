import React, {useContext} from 'react';
import '../App.css';
import Playlist from './playlist';
import 'bootstrap/dist/css/bootstrap.css';
import { MyContext } from "../myContext";
import {Button, TextField, Box} from '@mui/material'
import  Grid from '@mui/material/Unstable_Grid2';




export default function SearchArea({even}){
    const {columns, setColumns, dragged, deleteColumn, updatePlaylist, publishPlaylist} = useContext(MyContext)

    //bootstrap TODO
    const playlist_button = (column, id) =>{
        if(column['playlist_id']){
          return <Button sx = {{my: 1, mx: 1}} variant='outlined' onClick={() => updatePlaylist(id) }>Update</Button>
        }else{
          return <Button sx = {{my: 1, mx: 1}} variant='outlined' onClick={() => publishPlaylist(column,id) }>Publish</Button>
        }
    }

    return(
            <Grid item xs={4}>
            {/* {console.log(columns)} */}
            {Object.entries(columns).map(([id, column], index) =>{
                if(index % 2 == even){
                return(
                <Box sx = {{border: 1, mb: 2, borderRadius: '2%'}}>
                    <MyContext.Provider value={{columns,setColumns,dragged,deleteColumn}}>
                        <Playlist id={id} data={column}></Playlist>
                    </MyContext.Provider>
                    <Button sx = {{my: 1, mx: 1}} variant='outlined' onClick={() => updatePlaylist(id) }>Update</Button>
                </Box>
                )}
            })}
            </Grid>
    )
}