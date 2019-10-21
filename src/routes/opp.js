require('dotenv').config()
'use strict';

const express = require('express');
const router = express.Router();
const pool = require('../db');
const helpers = require('../lib/helpers');
const axios = require('axios');
const jwt = require('jsonwebtoken');


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


router.post('/buy-wcard/',(req,res)=>{

    const {id_card,id_client,amount,device_session_id,
        token_id,
    name,lastnameM,phone,mail} = req.body;
    const cardId = id_card;
    const customerId = id_client;

        //falta la source id
    var chargeRequest = {
        'source_id' : cardId,
        'method' : 'card',
        'amount' : amount,
        'currency' : 'MXN',
        'description' : 'Compra',
        'order_id' : 'oid-00051',
        'device_session_id' : device_session_id};
        /*'customer' : {
             'name' : name,
             'last_name' : lastnameM,
             'phone_number' : phone,
             'email' : mail
        }*/
     

    console.log(req.body);
    

   
    openpay.customers.charges.create(customerId,chargeRequest, function (error, charge) {
        // ...
        //console.log(card);
       if(error){
        console.log(error);
        
        res.render('error/err',{error});
       }

   res.status(200);
   res.render('tc/buy', {charge});

    });
});

router.get('/client-get/:id', (req, res) => {


    const id = req.params.id;
    const client = {id:id}

    openpay.customers.get(id, function (error, customer) {
        res.json(customer);
    });
});

router.get('/get-charges/:id',(req,res)=>{

    const id = req.params.id;
    const client = {id:id}

    searchParams = {};

      openpay.customers.charges.list(id,searchParams, function(error, chargeList) {
        // ...
        if(error) res.json(error);
        else res.json(chargeList);
      });
});

router.get('/get-charges-info/:id',(req,res)=>{
    const id = req.params.id;
   

    const qu = pool.query('Select * from users_ where id_client = ?',[id]);
    qu.then((response)=>{
        res.json(response);
    }).catch((err)=>{
        res.json(err);
    });
});

router.get('/get-charge/:id',(req,res)=>{
    const id = req.params.id;
   

    const qu = pool.query('Select * from users_ where id_client = ?',[id]);
    qu.then((response)=>{
        res.json(response);
    }).catch((err)=>{
        res.json(err);
    });
});

router.get('/get-charge/:id',(req,res)=>{
    const id = req.params.id;
   

    const qu = pool.query('Select * from users_ where id_client = ?',[id]);
    qu.then((response)=>{
        res.json(response);
    }).catch((err)=>{
        res.json(err);
    });
});


router.get('/get-client-subscription/:id',(req,res)=>{
    const id = req.params.id;



    var searchParams = {
        
      };
      
      openpay.customers.subscriptions.list(id, searchParams, function(error, list){
        // ...
        if(error) res.json(error);
        else res.json(list);
      });

  
});

router.get('/client-info/:id',isLoggedIn,(req,res)=>{

    const id = req.params.id;
    const client = {id:id}

    res.render('auth/client',{client});

});


router.get('/client-delete/:id', (req, res) => {


    openpay.customers.delete(req.params.id, function (error) {
        res.status(200);
        res.render('dashboard/costumers');
        req.flash('message', 'Eliminado con éxito');
        //res.redirect( 'http://localhost:4000/costumers');

    });
});



router.post('/costumer-create', (req, res) => {

    console.log(req.body);
    const {
        id,
        name,
        mail
    } = req.body;

    var customerRequest = {
        'name': name,
        'email': mail,
        'requires_account': false
    };


    //const client = 
    openpay.customers.create(customerRequest, (error, customer) => {
        console.log(error);
        console.log(customer);



        const qu =
            pool.query('UPDATE USERS_ SET id_client = ? WHERE id = ?', [customer.id, id]);

        qu.then((resx) => {
            console.log(resx);


            req.flash('message', 'Cliente creado con éxito');
            res.status(200);
            res.render('tc/main');


        }).catch((err) => {
            console.log(err);
        });



    });
});

router.post('/client-create', (req, res) => {


    const {

        name,
        mail
    } = req.body;

    var customerRequest = {
        'name': name,
        'email': mail,
        'requires_account': false
    };

    //const client = 
    openpay.customers.create(customerRequest, (error, customer) => {
        console.log(error);
        console.log(customer);


        /*

        const wallet = {
             
            id_usercreated: 0,
            lastupdate: Date.now()
        };
        const qu =
            pool.query('INSERT INTO WALLET_ set ?', [wallet]);

        qu.then((res) => {
            console.log(res);

        }).catch((err) => {
            console.log(err);
        });*/

        res.json(customer);

    });
});


router.get('/clients-list', (req, res) => {
    var searchParams = {
        'limit': 250
    };
    openpay.customers.list(searchParams, (error, body) => {
        res.json(body);
    });

});

router.get('/cards-list/:id', (req, res) => {


    const {
        id
    } = req.params;
    var searchParams = {
        'limit': 20
    };

    openpay.customers.cards.list(id, searchParams, function (error, list) {
        res.json(list)
    });
});


router.post('/cardclient-delete/',(req,res)=>{
    
    const {id_card,id_client} = req.body;

    openpay.customers.cards.delete(id_client, id_card, function(error) {
        // ...
        if(error){
            console.log(error);
            res.status(200);
            req.flash('error', 'Hubo un error contacte con soporte');

            res.render('error/err',{error});
        }else{
            res.status(200);
            req.flash('sucess', 'Tarjeta eliminada');
            res.render('public/sucessUpdate');

        }
      });
      
})


router.get('/card-get/:id/:costumer', (req, res) => {


    const {
        id,
        costumer
    } = req.params;


    openpay.customers.cards.get(costumer, id, function (error, card) {
        // ...
        res.json(card);

    });


});


//PLANS

router.get('/plan-list', (req, res) => {
    openpay.plans.list((error, body) => {
        res.json(body);
    });
});


router.get('/plan-delete', () => {});

router.post('/plan-delete', (req, res) => {


    const id = req.body.id;
    const id_user = req.body.id_user;
    const pass = req.body.pass;


    if (!pass) {
        res.render('/costumers');
    }



    const query = pool.query('Select * from users_ where id = ?', [id_user]);


    query.then(async (resx) => {
        if (resx.length > 0) {
            const user = resx[0];
            const validpass = await helpers.matchPass(pass, user.pass);

            if (validpass) {

                openpay.plans.delete(id, function (error) {
                    if (error) console.log(error);

                    res.status(200);
                    res.render('dashboard/costumers');
                    req.flash('message', 'Cliente creado con éxito');
                });

            } else {
                res.status(500);
                res.render('dashboard/costumers');
                req.flash('error', 'Error de contraseña');
            }
        }

    }).catch((err) => {
        console.log(err);
    });



    /**/
});

router.post('/plan-create', (req, res) => {

    const {
        amount,
        status_after_retry,
        retry_times,
        name,
        repeat_every,
        trial_days,
        repeat_unit
    } = req.body;

    const planRequest = {
        amount: parseFloat(amount).toFixed(2),
        status_after_retry: status_after_retry,
        retry_times: retry_times,
        name: name,
        repeat_unit: repeat_unit,
        trial_days: parseInt(trial_days),
        repeat_every: repeat_every
    };

    openpay.plans.create(planRequest, function (error, plan) {
        // ...
        if (error) console.log(error);
        //res.status(200).redirect(req.flash('message', 'Plan creado con éxito.'), '/dashboard/costumers');        
        //res.redirect(200, '/dashboard');
        res.status(200);
        res.render('dashboard/costumers');
        req.flash('message', 'Plan creado con éxito');
    });

    //res.render();
});


router.post('/plan-update', (req, res) => {

    const {
        amount,
        status_after_retry,
        retry_times,
        name,
        repeat_every,
        trial_days,
        planId
    } = req.body;

    var planRequest = {
        amount: amount,
        status_after_retry: status_after_retry,
        retry_times: retry_times,
        name: name,
        repeat_unit: repeat_unit,
        trial_days: trial_days,
        repeat_every: repeat_every
    };

    openpay.plans.update(planId, planRequest, function (error, plan) {
        // ...
        if (error) console.log(error);

        res.status(200);
        res.render('dashboard/costumers');

    });
})


router.post('/plan-get/', (req, res) => {

    const id = req.body.id;
    openpay.plans.get(id, function (error, plan) {
        // ...
        if (error) console.log(error);
        res.json(plan);
    });
})

router.get('/plan-edit/:id', isLoggedIn, (req, res) => {

    const {
        id
    } = req.params;

    //console.log(id);
    openpay.plans.get(id, function (error, plan) {
        // ...

        res.render('auth/plan', {
            plan
        });
    });

});
router.get('/plan/:id', (req, res) => {

    const {
        id
    } = req.params;

    //console.log(id);
    openpay.plans.get(id, function (error, plan) {
        // ...

        res.render('tc/planinfo', {
            plan
        });
    });

});

router.get('/plan-json/:id', (req, res) => {

    const {
        id
    } = req.params;

    //console.log(id);
    openpay.plans.get(id, function (error, plan) {
        // ...

        res.json({plan});
    });

});



router.get('/subscription/:id/:id_client', isLoggedIn, (req, res) => {
    const id = req.params.id;
    const id_client = req.params.id_client;


    console.log(id);

    openpay.customers.subscriptions.get(id_client, id, function(error, subscription){
        // ...
      if(error){
          res.status(500);
        res.render('tc/subscription', {
            error
        });
      }
      res.status(200);
        res.render('tc/subscription', {
            subscription
        });


    });

});

router.get('/subscribe/:id', isLoggedIn, (req, res) => {
    const id = req.params.id;
    console.log(id);

    openpay.plans.get(id, function (error, plan) {
        // ...

        res.render('tc/subscribe', {
            plan
        });
    });

});

router.post('/subscription-delete/', isLoggedIn, (req, res) => {
   const {id_client,id}  = req.body;
   openpay.customers.subscriptions.delete(id_client, id, function(error){
    // ...

    if(error){
        res.render('error/err',{error});
    }
    else{
              
        res.status(200);
        res.render('public/sucessUpdate');
        req.flash('message', 'Suscripción eliminada con éxito');
    }

  });

});

router.get('/merchant', (req, res) => {
    openpay.merchant.get(function (error, merchant) {
        // ...
        res.json(merchant);
    });
});


router.post('/create-subscribtion', (req, res) => {

    const {
        id_plan,
        id_card,
        id_client,
        id_user
    } = req.body;
    console.log( id_plan,
        id_card,
        id_client,
        id_user);



        
    
    const qu = pool.query('select * from USERS_ where id = ?', [id_user]);

    qu.then(async (data) => {
        if (data.length > 0) {

            console.log(data[0].id, data[0].mail);

            const userid = data[0].id;
            const clientid = data[0].id_client;

            if (clientid == null) {
                const usermail = data[0].mail;
                const username = data[0].name;
                //const queryInset = await pool.query('Update users_ set ');
                var customerRequest = {
                    'name': usermail,
                    'email': username,
                    'requires_account': false
                };

                //const client = 
                openpay.customers.create(customerRequest, async (error, customer) => {
                    console.log(error);
                    console.log(customer);

                    const updatecliente = await pool.quer('Update USERS_ set id_client = ? where id = ?', [customer.iduserid]);
                    res.redirect('auth/signin', 200, req.flash('message', 'Ya es usted cliente y puede sucribirse.'));

                });


            } else {

                //select opp data from id_client
               
                var subscriptionRequest = {
                    'plan_id':id_plan,
                    'source_id' : id_card,
                    'trial_end_date' :  Date.now()
                 };
                 
                 openpay.customers.subscriptions.create(id_client, subscriptionRequest, function(error, subscription){
                   // ...
                   if(error){
                    console.log(error)
                   }else{
                       console.log(subscription);
                       
                       res.status(200);
                    res.render('public/sucessUpdate');
                    req.flash('message', 'Suscripción creada con éxito');
                   }
                 });



            }

        } else {
            res.redirect('auth/signin', 200, req.flash('message', 'No hay usuario con ese mail.'));
        };

    })

});


//CARDS

router.get('/cardclient-create', isLoggedIn, (req, res) => {

    res.render('auth/createcard');

});


router.post('/cardclient-create', isLoggedIn, (req, res) => {


    const {
        card,
        year,
        month,
        dig,
        holder_name,
        client,
        token_id
    } = req.body;

    console.log(card, year, month, dig, holder_name, client, token_id);

    var cardRequest = {
        'card_number': card,
        'holder_name': holder_name,
        'expiration_year': year,
        'expiration_month': month,
        'cvv2': dig,
        'device_session_id': token_id
    }

    openpay.customers.cards.create(client, cardRequest, function (error, card) {
        // ...    
        if (error) console.log(error);
        //res.json(card)
        res.status(200);
        res.render('auth/userconfig');



        //res.redirect(200, '/dashboard');

    });

});


router.get('/cardclient-delete/:id', isLoggedIn, (req, res) => {

    const {
        id
    } = req.params;

    res.render('auth/deletecard', {
        id
    });

});


//

router.get('/buy/:unit', (req, res) => {

    const {
        unit
    } = req.params;

    const qu = pool.query('SELECT * from tc_ where id = ?', [unit]);
    qu.then((respon, err) => {
        if (respon.length > 0) {
            const unit = respon[0];
            res.render('tc/buy', {
                unit
            });
        } else console.log(err);

    }).catch((err) => {
        console.log(err);
    });

});


router.post('/buy/', (req, res) => {

    const {
        token_id,description, amount,
        device_session_id,id_client,id_plan
    } = req.body;


    var chargeRequest = {
        'source_id': token_id,
        'method': 'card',
        'amount': amount,
        'description': description,
        'device_session_id': device_session_id
        
    }

    console.log(chargeRequest);


    openpay.customers.charges.create(id_client,chargeRequest, function (error, charge) {
        // ...
        console.log('try charging ...');
        //console.log(charge);
        if (charge) {
            console.log('charging ...');
            async function resp(){
                const tc_unit = {
                    id_client: id_client,
                    id_charge: charge.id,
                    id_plan: id_plan,
                    status: 0,
                    descrip: 'Sin usar aún',
                    amount: amount
                };
                const chargedb = await pool.query('INSERT INTO tc_u set  ?', [tc_unit]);
                console.log('try query ...');
                if (chargedb.insertId) {
                    console.log('success query ...');
                    //console.log(error);
                    //res.json(charge);
                    
                } else {
                    console.log('error query ...');
                    console.log(error);
                    res.json(charge);
                    res.status(500);
                    req.flash('error',
                    `<p>description: ${error.description}</p><p>`+
                    `http_code: ${error.http_code}</p><p> error_code: ${error.error_code}</p>`+
                    `<p> category:${error.category}</p>`);
                    
                    res.render('error/err',{error});
                }

               
            }

            resp();

            res.status(200);
            res.render('tc/buy', {charge});
        } else {
            console.log(error);
            res.status(500);
            req.flash('error',
            `<p>description: ${error.description}</p><p>`+
            `http_code: ${error.http_code}</p><p> error_code: ${error.error_code}</p>`+
            `<p> category:${error.category}</p>`);
            res.render('error/err',{error});
        }

    });

});


router.get('/charges/:id', (req, res) => {
    const {
        id
    } = req.params;

    var searchParams = {
        'creation[gte]': '2013-11-01',
        'limit': 200
    };

    openpay.customers.charges.list(id, searchParams, function (error, chargeList) {
        // ...
        res.json(chargeList);
    });
});

router.get('/tc-unit/:id',isLoggedIn,(req,res)=>{
    const {id} = req.params;
    const query = pool.query('SELECT * from tc_u  where id = ?' ,[id]);
    query.then((resp)=>{
        const unit = resp[0];
        res.render('tc/unit',{unit});
    }).catch((error)=> {
        console.log(error)
    });
});


router.get('/tc-info-plan/:id',isLoggedIn,(req,res)=>{
    const {id} = req.params;
    const query = pool.query('SELECT * from tc_u  where id = ?' ,[id]);
    query.then((resp)=>{
        const unit = resp[0];
        res.render('tc/unit',{unit});
    }).catch((error)=> {
        console.log(error)
    });
});

router.get('/tc-info-plan-json/:id', async (req,res)=>{
    const id = req.params.id;
    const tc = await pool.query('SELECT * from tc_u  where id = ?' ,[id]);
    res.json(tc);
});

router.post('/getallwh',(req,response)=>{

    console.info('Received!'); // Log every time a WebHook is handled.
    console.log(req.webhook);
    console.log(req);
    // Execute any logic that you want when the 3rd Party Client hits that endpoint

    response.status(200); // Let the sender know that we've received the WebHook
    response.send();
    
});

//wkz94otmlqqxoi6b7xfw


router.get('/get-wh/',(req,response)=>{

    console.info('Received!'); // Log every time a WebHook is handled.
    console.info(req);
    // Execute any logic that you want when the 3rd Party Client hits that endpoint

    openpay.webhooks.get('wkz94otmlqqxoi6b7xfw', function(error, webhook){
        // ...
        response.json(webhook);
      });

    response.status(200); // Let the sender know that we've received the WebHook
    });


router.post('/refund', (req, res) => {
    const {id,amount,id_client,id_charge} = req.body;
    
    var refundRequest = {
        'description' : 'devolución',
        'amount' : amount
     };

    openpay.customers.charges.refund(id_client, id_charge, refundRequest,
    function(error, charge) {
        // ...

        async function  bajaTc(){
            const tc_unit = {

                status: null,
                descrip: 'Baja Trust coin por devolución',
            };
            const chargedb = await pool.query('update  tc_u set  ? where id = ?', [tc_unit,id]);
        }bajaTc();
        res.status(200);
        res.render('tc/refund', {
            charge
        });
    });
});



//mobil payments

function ensureToken(req, res, next) {
    const bearerHeader = req.headers['authorization'];
    console.log(bearerHeader);

    if (typeof bearerHeader !== 'undefined') {
        const bearer = bearerHeader.split(" ");
        const bearerToken = bearer[1];
        req.token = bearerToken;
        next();
    } else {
        res.sendStatus(403);
    }
}


//ensureToken, 
router.get('/buyUnit/protected/', (req, res) => {

    const {id,id_unit,token,amount} = req.headers;
    const resp = {
        'id':id,
        'token':token,
        'id_unit':id_unit,
        'amount':amount
    };

    res.render('mobil/buyUnitMobil',{resp});
   //res.json(resp);

});

router.get('/buyUnit/Test/', (req, res) => {

    const {id,id_unit,token,amount} = req.headers;
    const resp = {
        'id':842,
        'id_unit':22,
        'amount':50
    };

    res.render('mobil/buyUnitMobil',{resp});
   //res.json(resp);

});


var request = require('request');

router.post('/check-conditions/', async (req,res)=>{

    const {ncharges,nsubscriptions,nusedunits,nprojects,id} = req.body;
    
   // console.log('variables : \n charges: '+ncharges+'\n subs: '+nsubscriptions+'\n used: '+nusedunits+'\n projects: '+nprojects);
    
    const idB_nsubscriptions = await pool.query('SELECT id_badge from conditions_ where nsubscriptions =  ?',[nsubscriptions]);
    const idB_ncharges = await pool.query('SELECT id_badge from conditions_ where ncharges = ?',[ncharges]);
    const idBFullCondition = await pool.query
    ('Select id_badge from conditions_ where  nsubscriptions = ? && ncharges = ? && nprojects = ? && nusedunits = ? ',
    [nsubscriptions,ncharges,nusedunits,nprojects]);
    const idB_nprojects = await pool.query('SELECT id_badge from conditions_ where nprojects = ?',[nprojects]);
    const idB_nuseduntis = await pool.query('SELECT id_badge from conditions_ where nusedunits = ?',[nusedunits]);

   
   //ID's from badges
    console.log('medallas por condición: \n'+
        'subs: '+idB_nsubscriptions[0].id_badge+'\n',
                'proj: '+idB_nprojects[0].id_badge+'\n',
                'charg: '+idB_ncharges[0].id_badge+'\n',
                'used: '+idB_nuseduntis[0].id_badge+'\n',
                'fullconditions: '+idBFullCondition[0].id_badge+'\n',
                );
    // Checking id badeges from user badges list
  
        const bdids = checkbadgesInUserList(id,
        idB_ncharges[0].id_badge,
        idB_nprojects[0].id_badge,
        idB_nsubscriptions[0].id_badge,
        idB_nuseduntis[0].id_badge,
        idBFullCondition[0].id_badge). then(async (resp)=>{
            console.log(resp.charges, resp.subs, resp.projects, resp.used, resp.full);
           console.log(ncharges,nsubscriptions,nusedunits,nprojects,id)

            console.log('leng charges\n'+resp.charges.length);
            console.log('leng subs\n'+resp.subs.length);
            console.log('leng projects\n'+resp.projects.length);
            console.log('leng useds\n'+resp.used.length);
            console.log('leng full\n'+resp.full.length);

            /*
                If checkbadges return badges ths should be add to
                user badgelist list then, set value to badges for the return
            */

            //Inserting badges from charges conditions
            const badges = {};
                if(resp.charges.length == 0){
                    // if user doesn't have this badge
                    //select count
                    const getCount = await pool.query('Select count from user_badgeList where id_user = ?',[id]);
                    let count = getCount[0].count + 1; 
                    console.log('medalla por charges: \n'+idB_ncharges[0].id_badge);
                    //set badge to userbadgelist
                    let badgeInsert = {
                        id_user: parseInt(id) ,
                        id_badge: parseInt(idB_ncharges[0].id_badge)
                    }
                    const insertIntoUserListBadge = await pool.query('INSERT INTO user_badgeList set ? ',[badgeInsert]);
                    //update count //update count
                    const updateuserListBadge = await pool.query('Update user_badgeList set count = ? where id = ?', [count, id]);
                    //add badge to response
                    console.log('medalla añadida a resp badges');
                    badges.charges = idB_ncharges[0].id_badge;

                }else{
                    //if user have badges don't add to response
                    badges.charges = 0;
                }
                //  subs badges
                if(resp.subs.length == 0){
                    const getCount = await pool.query('Select count from user_badgeList where id_user = ?',[id]);
                    let count = getCount[0].count + 1; 
                    console.log('medalla por subs: \n'+idB_nsubscriptions[0].id_badge);

                    const badgeInsert = {
                        id_user: id ,
                        id_badge:idB_nsubscriptions[0].id_badge
                    }
                    const insertIntoUserListBadge = await pool.query('Insert into user_badgeList set  ? ',[badgeInsert]);
                    //update count
                    const updateuserListBadge = await pool.query('Update user_badgeList set count = ? where id = ?', [count, id]);
                    //add badge to response
                    console.log('medalla añadida a resp badges');
                    badges.subs = idB_nsubscriptions[0].id_badge;
                }
                else{
                    badges.subs = 0;
                }
                // end subs badges
                 //  subs projects
                if(resp.projects.length == 0){
                    const getCount = await pool.query('Select count from user_badgeList where id_user = ?',[id]);
                    let count = getCount[0].count + 1; 
                    console.log('medalla por projects: \n'+idB_nprojects[0].id_badge);

                    const badgeInsertProject = {
                        id_user: id ,
                        id_badge:idB_nprojects[0].id_badge
                    }
                    const insertIntoUserListBadge = await pool.query('Insert into user_badgeList set  ? '
                    ,[badgeInsertProject]);
                    //update count
                    const updateuserListBadge = await pool.query('Update user_badgeList set count = ? where id = ?', [count, id]);
                    //add badge to response
                    console.log('medalla añadida a resp badges');
                    badges.projects = idB_nprojects[0].id_badge;
                }
                else{
                    badges.projects = 0;
                }
                //end projects
                //used units badge
                if (resp.used.length == 0){
                    //idB_nuseduntis
                    const getCount = await pool.query('Select count from user_badgeList where id_user = ?',[id]);
                    let count = getCount[0].count + 1; 
                    console.log('medalla por unidades usadas: \n'+idB_nuseduntis[0].id_badge);
                    const badgeInsertUsed = {
                        id_user: id ,
                        id_badge:idB_nuseduntis[0].id_badge
                    }
                    const insertIntoUserListBadge = await pool.query('Insert into user_badgeList  set ? '
                    ,[badgeInsertUsed]);

                    //update count
                    const updateuserListBadge = await pool.query('Update user_badgeList set count = ? where id = ?', [count, id]);
                    //add badge to response
                    console.log('medalla añadida a resp badges');
                    badges.used = idB_nuseduntis[0].id_badge;
                }
                else{
                    badges.used = 0;
                }
                //end used units
                //full conditions
                if (resp.full.length == 0){
                    //idBFullCondition
                    const getCount = await pool.query('Select count from user_badgeList where id_user = ?',[id]);
                    let count = getCount[0].count + 1; 
                    console.log('medalla por unidades usadas: \n'+idBFullCondition[0].id_badge);

                    const badgeInsertfull = {
                        id_user: id ,
                        id_badge:idBFullCondition[0].id_badge
                    }
                    const insertIntoUserListBadge = await pool.query('Insert into user_badgeList  set ? '
                    ,[badgeInsertfull]);
                    //update count
                    const updateuserListBadge = await pool.query('Update user_badgeList set count = ? where id = ?', [count, id]);
                    //add badge to response
                    console.log('medalla añadida a resp badges');
                    badges.full = idBFullCondition[0].id_badge;
                }
                else{
                    badges.full = 0;
                }
                // end full conditions
                console.log(badges);

                res.json(badges);
              
        });
    

        // return idbadges won and return view
//no funcionò
        


});


//check if user already have badges in user list
async function checkbadgesInUserList(id,
                    idB_ncharges,
                    idB_nsubscriptions,
                    idB_nprojects,
                    idB_nuseduntis,
                    idBFullCondition){
    const bdg_ncharges = await pool.query('SELECT * from user_badgeList where id_badge = ? && id_user = ?',
    [idB_ncharges,id]);
    const bdg_nsubscriptions = await pool.query('SELECT * from user_badgeList where id_badge = ? && id_user = ?',
    [idB_nsubscriptions,id]);
    const bdg_nprojects = await pool.query('SELECT * from user_badgeList where id_badge = ? && id_user = ?',
    [idB_nprojects,id]);
    const bdg_nusedunits = await pool.query('SELECT * from user_badgeList where id_badge = ? && id_user = ?',
    [idB_nuseduntis,id]);
    const bdg_nFullCondition =  await pool.query('SELECT * from user_badgeList where id_badge = ? && id_user = ?',
    [idBFullCondition,id]);

    console.log('charg: '+bdg_ncharges+'\n',
    'subs: '+bdg_nsubscriptions+'\n',
    'proj: '+bdg_nprojects+'\n',
    'used: '+bdg_nusedunits+'\n',
    'fullconditions: '+bdg_nFullCondition+'\n',
    );
    

    const badges = {
      
    }
    if(bdg_ncharges) badges.charges = bdg_ncharges;
    else badges.charges = ''
    if(bdg_nsubscriptions) badges.subs = bdg_nsubscriptions;
    else badges.subs = ''
    if(bdg_nprojects) badges.projects = bdg_nprojects;
    else badges.projects = ''
    if(bdg_nusedunits) badges.used = bdg_nusedunits;
    else badges.used = ''
    if(bdg_nFullCondition) badges.full = bdg_nFullCondition;
    else badges.full = ''

    return badges;
  
}

router.get('/check-conditions/',(req,res)=>{


    res.render('public/conditions');
});


module.exports = router;