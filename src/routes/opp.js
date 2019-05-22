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


    router.get('/client-get/:id',(req,res)=>{
        

        const id = req.params.id;

        openpay.customers.get(id, function(error, customer) {
            res.json(customer);
          });
    });


    router.get('/client-delete/:id',(req,res)=>{


        openpay.customers.delete(req.params.id, function(error) {
            res.redirect(200, '/costumers/');
          });
    });



    router.post('/costumer-create', (req, res) => {

        console.log(req.body)
        const {  id, name, mail } = req.body;
    
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

               
                return res.redirect(200,'/userconfig');
    
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
        'limit' : 250
      };
    openpay.customers.list(searchParams,(error, body) => {
        res.json(body);
    });

});

router.get('/cards-list/:id', (req, res) => {


    const {
        id
    } = req.params;
      var searchParams = {
        'limit' : 20
      };
      
      openpay.customers.cards.list(id, searchParams, function(error, list){
        res.json(list)
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

router.post('/create-subscribtion', (req, res) => {

    const {
        id_user,
        id_plan
    } = req.body;
    console.log(id_user, id_plan)

    const qu = pool.query('select * from users_ where id = ?', [id_user]);

    qu.then((data) => {
        if (data.length > 0) {
          
            console.log(data[0].id,data[0].mail);

            const userid = data[0].id;
            const clientid = data[0].id_client;
            
            if (clientid == null) {

                const usermail = data[0].mail;
                const username = data[0].name;
                function getClientFromServer() {
                    return axios.post("http://trustfundapp.herokuapp.com/client-create",

                        {
                            name: username,
                            mail: usermail
                        }


                    ).then(function (res) {
                        console.log(res.data);
                        return res.data;
                        //console.log(datax.access_token);

                    }).catch((er) => {
                        console.log(er);
                    });
                    console.log(tok);
                    //console.log(reqtoken);
                    // res.render('links/bbvat',{reqbbva: reqbbva});
                }


                getClientFromServer().then(data => {
                    console.log(data);
                   /* const customer_id = data.id;
                    
                      const query =  pool.query('UPDATE users_ SET id_client = ? WHERE id = ?', [customer_id, userid]);
                      query.then(()=>{
                          res.redirect('/subscribe/'+id_plan, 200, req.flash('message', 'Ya puedes subscribirte.'));
                      });*/
                });





            } else {
                console.log('waiting');
            }

        } else {
            res.redirect('auth/signin', 200, req.flash('message', 'No hay usuario con ese mail.'));
        }

    });

});

//CARDS

router.get('/cardclient-create', isLoggedIn ,(req, res) => {

   res.render('auth/createcard');

});


router.post('/cardclient-create', isLoggedIn ,(req, res) => {

    console.log(req.body);
 
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

function createclient() {

}



module.exports = router;