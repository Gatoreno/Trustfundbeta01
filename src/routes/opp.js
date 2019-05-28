require('dotenv').config()
'use strict';

const express = require('express');
const router = express.Router();
const pool = require('../db');
const helpers = require('../lib/helpers');
const axios = require('axios');


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


router.get('/client-get/:id', (req, res) => {


    const id = req.params.id;

    openpay.customers.get(id, function (error, customer) {
        res.json(customer);
    });
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

    console.log(req.body)
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
            pool.query('UPDATE users_ SET id_client = ? WHERE id = ?', [customer.id, id]);

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

router.get('/card-get/:id', (req, res) => {


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

router.get('/merchant',(req,res)=>{
    openpay.merchant.get(function(error, merchant){
        // ...
        res.json(merchant);
      });
});


router.post('/create-subscribtion', (req, res) => {

    const {
        id_user,    
        id_plan,token_id
    } = req.body;
    console.log(id_user,
        id_plan,token_id);



    /*
    const qu = pool.query('select * from users_ where id = ?', [id_user]);

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

                    const updatecliente = await pool.quer('Update users_ set id_client = ? where id = ?', [customer.iduserid]);

                    res.redirect('auth/signin', 200, req.flash('message', 'Ya es usted cliente y puede sucribirse.'));

                });


            } else {

                //select opp data from id_client
                const card = [];
                card = openpay.customers.cards.get(costumer, id, function (error, card) {
                    // ...
                    return card;

                });

                var subscriptionRequest = {
                    'card': {
                        'card_number': '4111111111111111',
                        'holder_name': 'Juan Perez Ramirez',
                        'expiration_year': '20',
                        'expiration_month': '12',
                        'cvv2': '110',
                        'device_session_id': 'kR1MiQhz2otdIuUlQkbEyitIqVMiI16f'
                    },
                    'plan_id': id_plan
                };



                console.log(token_id, userid, clientid, id_plan, card,subscriptionRequest);

            }

        } else {
            res.redirect('auth/signin', 200, req.flash('message', 'No hay usuario con ese mail.'));
        };

    })*/

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


//afro2ik0igsusbot5iox

router.post('/charge-tc-unit', (req, res) => {

    const customerId = 'afro2ik0igsusbot5iox';

    //https://sandbox-api.openpay.mx/v1/{MERCHANT_ID}/tokens

    // var http = 'https://sandbox-api.openpay.mx/v1/'{MERCHANT_ID}'/tokens';

    var chargeRequest = {
        'source_id': 'kqgykn96i7bcs1wwhvgw',
        'method': 'card',
        'amount': 100,
        'currency': 'MXN',
        'description': 'Cargo inicial a mi cuenta',
        'order_id': 'oid-00051',
        'device_session_id': 'kR1MiQhz2otdIuUlQkbEyitIqVMiI16f',
        'customer': {
            'name': 'Juan',
            'last_name': 'Vazquez Juarez',
            'phone_number': '4423456723',
            'email': 'juan.vazquez@empresa.com.mx'
        }
    }
    /*
        openpay.customers.charges.create(customerId, chargeRequest, ()=>{
            
        });
    */
});




module.exports = router;