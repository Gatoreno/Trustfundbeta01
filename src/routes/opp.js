require('dotenv').config()
'use strict';

const express = require('express');
const router = express.Router();
const pool = require('../db');
const helpers = require('../lib/helpers');


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




router.post('/client-create', (req, res) => {


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
    openpay.customers.create(customerRequest, (error, body) => {
        console.log(error);
        console.log(body);


        const wallet = {
            id: body.id,
            id_usercreated: id,
            lastupdate: Date.now()
        };
        const qu =
            pool.query('INSERT INTO WALLET_ set ?', [wallet]);

        qu.then((res) => {
            console.log(res);

        }).catch((err) => {
            console.log(err);
        });

        res.json(body);

    });
});


router.get('/clients-list', (req, res) => {
    openpay.customers.list((error, body) => {
        res.json(body);
    });

});

router.get('/cards-list', (req, res) => {
    openpay.cards.list((error, body) => {
        res.json(body);
    });
});


//PLANS

router.get('/plan-list', (req, res) => {
    openpay.plans.list((error, body) => {
        res.json(body);
    });
});

router.post('/plan-delete', (req, res) => {


    const id = req.body.id;
    const id_user = req.body.id_user;
    const pass = req.body.pass;




    const query = pool.query('Select * from users_ where id = ?', [id_user]);


    query.then(async (resx) => {
        if (resx.length > 0) {
            const user = resx[0];
            const validpass = await helpers.matchPass(pass, user.pass);

            if (validpass) {

                openpay.plans.delete(id, function (error) {
                    if (error) console.log(error);

                    return res.redirect(200, '/costumers/');
                });

            } else {
                return res.redirect(500, '/costumers/');
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
        res.redirect(200, '/dashboard/');
    });
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
        res.redirect('/dashboard/costumers', req.flash('message', 'Plan actualizado con éxito.'));

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

router.get('/plan-edit/:id', (req, res) => {

    const {
        id
    } = req.params;

    //console.log(id);
    openpay.plans.get(id, function (error, plan) {
        // ...

        res.render('tc/plan', {
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

router.get('/suscribe/:id', isLoggedIn, (req, res) => {
    const id = req.params.id;
    console.log(id);

    openpay.plans.get(id, function (error, plan) {
        // ...

        res.render('tc/suscribe', {
            plan
        });
    });

});

//CARDS

router.post('/cardclient-create', (req, res) => {

    req.client_id = 'a68c6cd0rolaghp2qqd2';

    var cardRequest = {
        'card_number': '4111111111111111',
        'holder_name': 'Juan Perez Ramirez',
        'expiration_year': '20',
        'expiration_month': '12',
        'cvv2': '110',
        'device_session_id': 'kR1MiQhz2otdIuUlQkbEyitIqVMiI16f'
    };

    openpay.customers.cards.create('a68c6cd0rolaghp2qqd2',
        cardRequest,
        function (error, card) {

            console.log(error);
            res.json(card);
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