'use strict';
const express = require('express');
const router = express.Router();

const fs = require('fs');
const Path = require('path');




router.get('/',(req,res) =>{ 
        res.render('dashboard/costumers'); 
    });









module.exports = router