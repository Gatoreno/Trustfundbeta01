require('dotenv').config()
'use strict';

const express = require('express');
const router = express.Router();
const pool = require('../db');


const {
    isLoggedIn,
    isNotLoggedIn
} = require('../lib/auth');


//class
var Openpay = require('openpay');
//instantiation
var openpay = new Openpay(
    'mypdgqijxla2a9w0kdp0', 
    'sk_3f7296c0f84144ba940b2372b34b619a');




router.post('/client-create',(req,res)=>{


    const {id,name,mail} = req.body;
  
    var customerRequest = {
        'name': name,
        'email': mail,
        'requires_account': false 
        };

    //const client = 
    openpay.customers.create(customerRequest, (error, body)=>{
        console.log(error);
        console.log(body);
        

        const wallet = {id: body.id, id_usercreated:id,lastupdate: Date.now()};
        const qu = 
        pool.query('INSERT INTO WALLET_ set ?',[wallet]);

        qu.then((res)=> {
            console.log(res);
            
        }).catch((err)=>{
            console.log(err);
        });

        res.json(body); 
              
    });
});


router.get('/clients-list',(req,res)=> {
   openpay.customers.list((error,body)=>{
    res.json(body);
    });

});

router.post('/cardclient-create',(req,res)=> {

    req.client_id = '';

    var cardRequest = {
        'card_number':'4111111111111111',
        'holder_name':'Juan Perez Ramirez',
        'expiration_year':'20',
        'expiration_month':'12',
        'cvv2':'110',
        'device_session_id':'kR1MiQhz2otdIuUlQkbEyitIqVMiI16f'
     };
     
     openpay.customers.cards.create
     ('a68c6cd0rolaghp2qqd28',
      cardRequest,
       function(error, card)  {
             
        console.log(error);
        res.json(card);
     });

});
//afro2ik0igsusbot5iox

router.post('/charge-tc-unit',(req,res)=> {

    const customerId = 'afro2ik0igsusbot5iox';

//https://sandbox-api.openpay.mx/v1/{MERCHANT_ID}/tokens

   // var http = 'https://sandbox-api.openpay.mx/v1/'{MERCHANT_ID}'/tokens';

    var chargeRequest = {
        'source_id' : 'kqgykn96i7bcs1wwhvgw',
        'method' : 'card',
        'amount' : 100,
        'currency' : 'MXN',
        'description' : 'Cargo inicial a mi cuenta',
        'order_id' : 'oid-00051',
        'device_session_id' : 'kR1MiQhz2otdIuUlQkbEyitIqVMiI16f',
        'customer' : {
             'name' : 'Juan',
             'last_name' : 'Vazquez Juarez',
             'phone_number' : '4423456723',
             'email' : 'juan.vazquez@empresa.com.mx'
        }
     }
/*
    openpay.customers.charges.create(customerId, chargeRequest, ()=>{
        
    });
*/
});

/*
 var chargeRequest = {
        'source_id' : 'kqgykn96i7bcs1wwhvgw',
        'method' : 'card',
        'amount' : 100,
        'currency' : 'MXN',
        'description' : 'Cargo inicial a mi cuenta',
        'order_id' : 'oid-00051',
        'device_session_id' : 'kR1MiQhz2otdIuUlQkbEyitIqVMiI16f',
        'customer' : {
             'name' : 'Juan',
             'last_name' : 'Vazquez Juarez',
             'phone_number' : '4423456723',
             'email' : 'juan.vazquez@empresa.com.mx'
        }
     } */



module.exports = router;