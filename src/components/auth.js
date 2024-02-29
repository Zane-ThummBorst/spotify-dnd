import React, { useContext, useState, useEffect } from 'react';
import { MyContext} from '../myContext';
import 'bootstrap/dist/css/bootstrap.css';
import axios from 'axios';
import {Button, Autocomplete, InputAdornment, Switch, FormControlLabel} from '@mui/material'
const CLIENT_ID = 'afb7072142534f63a2142805b5417358';
const REDIRECT_URI = 'http://localhost:3000';
const SCOPE = 'user-read-private user-read-email';
const AUTH_ENDPOINT = 'https://accounts.spotify.com/authorize';
const RESPONSE_TYPE = 'token'
const AUTHURL = new URL("https://accounts.spotify.com/authorize")



const generateRandomString = (length) => {
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const values = window.crypto.getRandomValues(new Uint8Array(length));
    return values.reduce((acc, x) => acc + possible[x % possible.length], "");
}

const sha256 = async (plain) => {
    const encoder = new TextEncoder()
    const data = encoder.encode(plain)
    return window.crypto.subtle.digest('SHA-256', data)
}
  
const base64encode = (input) => {
    return btoa(String.fromCharCode(...new Uint8Array(input)))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

const authorize = async() =>{
    const codeVerifier  = generateRandomString(64);
    const hashed = await sha256(codeVerifier);
    const codeChallenge = base64encode(hashed);
    const scope = 'playlist-modify-public playlist-modify-private user-read-email';
    window.localStorage.setItem('code_verifier', codeVerifier);
    window.localStorage.setItem('code_verifier', codeVerifier);

    const params =  {
      response_type: 'code',
      client_id: CLIENT_ID,
      scope,
      code_challenge_method: 'S256',
      code_challenge: codeChallenge,
      redirect_uri: REDIRECT_URI,
    }
    
    AUTHURL.search = new URLSearchParams(params).toString();
    window.location.href = AUTHURL.toString();
}



export default function Auth(){
    const {code, setCode} = useContext(MyContext)
    const {userId, setUserId} = useContext(MyContext)


    //There is room in this useEffect to prevent making calls (don't need to make post everytime since )
    useEffect( () =>{
        const fetchToken = async () =>{
            if(code != null){
                let codeVerifier = localStorage.getItem('code_verifier');
        
                const payload = {
                    method: 'POST',
                    headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: new URLSearchParams({
                    client_id: CLIENT_ID,
                    grant_type: 'authorization_code',
                    code,
                    redirect_uri: REDIRECT_URI,
                    code_verifier: codeVerifier,
                    }),
                }
                const body = await fetch("https://accounts.spotify.com/api/token", 
                payload).catch((error) =>{
                    console.log('its a wraps');
                })
                const response =await body.json();
                if(response.access_token != undefined){
                    localStorage.setItem('access_token', response.access_token);
                    localStorage.setItem('refresh_token', response.refresh_token);
                    let curDate = new Date();
                    console.log(curDate)
                    localStorage.setItem('expire_time', curDate.setSeconds(curDate.getSeconds() + response.expires_in))
                }
                const id = await axios.post('http://localhost:1234/neet/back/userInfo',
                {access_token: localStorage.getItem('access_token')}).then((response) =>{
                    console.log('balls');
                    localStorage.setItem('user_id', response.data)
                }).catch((error) =>{
                    console.log("Somethings amuck");
                })
            }
                //triggering twice, dang
            

        }
        fetchToken();
    }, [code])

    return(
            <Button sx={{mt: 2}} variant='outlined' onClick={() =>{authorize()}} >Login</Button>
    )
}