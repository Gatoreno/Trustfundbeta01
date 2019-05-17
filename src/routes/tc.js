require('dotenv').config()
'use strict';

const express = require('express');
const router = express.Router();
const pool = require('../db');


const {
    isLoggedIn,
    isNotLoggedIn
} = require('../lib/auth');


router.get('/',(req,res)=> {
    res.render('tc/main');
});


module.exports = router;