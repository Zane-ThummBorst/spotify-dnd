const express = require('express')
const router = express.Router();
const axios = require('axios')
const uuid = require('uuid');
const redis = require('redis');
const redisClient = redis.createClient();
const {MongoClient} = require('mongodb');

