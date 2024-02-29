import React, {useContext} from 'react';
import '../App.css';
import 'bootstrap/dist/css/bootstrap.css';
import Search from './search';
import { MyContext } from "../myContext";
import {Button, TextField} from '@mui/material'
import Grid from '@mui/material/Unstable_Grid2';


export default function SearchArea(){
    const {setPlaylistName, users, setUsers, is_expired, getRefreshToken, handleAddColumn} = useContext(MyContext)
    return(
        <Grid item
        xs={4}
        sx={{border:1, borderRadius: '2%'}}
        style={{ position: 'sticky', top: 25, background: 'white', maxHeight: '720px' }}
        >
         <form onSubmit={handleAddColumn}>
           <TextField
           id='set_playlist_name'
           sx={{width: 300, my:2}}
           label='Playlist Name'
           onChange={(event) =>{setPlaylistName(event.target.value)}}
           InputProps={{endAdornment: <Button sx={{mx: 1}} variant='outlined' type='submit'>Submit</Button> }}
           />
         </form>
         <MyContext.Provider value={{ users, setUsers, is_expired, getRefreshToken }}>
           <Search></Search>
         </MyContext.Provider>
       </Grid>
    )
}