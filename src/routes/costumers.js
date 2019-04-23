'use strict';
const express = require('express');
const router = express.Router();

const fs = require('fs');
const Path = require('path');
const stripe = require('stripe')('sk_test_BZtGzyuD4TTr3LrxS2RPK2iH');




router.get('/',(req,res) =>{
    
    var customers = []
    var xcostumers = stripe.customers.list(
      { 
        limit: 10 
      },
      (err, customersx)=> {
        // asynchronously called
    
        const data = customersx.data;
        data.forEach((data)=>{
            customers.push(data);
    
            
        });
        console.log(data)
        res.render('dashboard/costumers',{customers});
    
      }
    );
    
    xcostumers.then().catch((err)=>{
        console.log(err)
    });
    
    
    
    });
    


router.get('/all',(req,res) =>{
    
var customers = []
var xcostumers = stripe.customers.list(
  { limit: 300 },
  (err, customersx)=> {
    // asynchronously called

    const data = customersx.data;
    data.forEach((data)=>{
        customers.push(data);

        
    });
    
    res.json(customers);

  }
);

xcostumers.then().catch((err)=>{
    console.log(err)
});



});





module.exports = router