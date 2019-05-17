require('dotenv').config()
'use strict';

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const pool = require('../db');
const nodemailer = require("nodemailer");






const {
    isLoggedIn,
    isNotLoggedIn
} = require('../lib/auth');

router.post('/api/login', (req, res) => {
    const {
        id
    } = req.body;
    const user = id;
    const token = jwt.sign({
        user
    }, 'process.env.SECRETO', {
        expiresIn: '3600s'
    });

    res.json({
        token
    });
});



//Ensure
router.get('/api/protected', ensureToken, (req, res) => {
    jwt.verify(req.token, 'seceto', (err, data) => {
        if (err) {
            res.sendStatus(403);
        } else {
            res.json({
                text: 'protected',
                data: data //iat 
            });
        }
    });

});

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

router.get('/get-reset-pass',  (req, res) => {
            res.render('auth/get-reset-pass');
});

router.post('/get-reset-pass', (req, res) => {

    //check if user existe

    const mailuser = req.body.mail;
    const qu = pool.query('SELECT * from USERS_ where mail = ?', [mailuser]);


    qu.then((resx) => {
        if (resx.length > 0) {
            const user_ = res[0];

           //creando token con mail
            const user = mailuser;
            const token = jwt.sign({
                user
            }, 'process.env.SECRETO', {
                expiresIn: '3600s'
            });
            //mail de recuperación
            let transporter = nodemailer.createTransport({
                service: "gmail",
                port: 25,
                secure: false, // true for 465, false for other ports
                auth: {
                    type: 'oauth2',
                    user: 'manuel.o@trustfund.com.mx',
                    clientId: '804329507754-hibhcnfn4j6vja59ua8vovea5b2r5lr5.apps.googleusercontent.com',
                    clientSecret: 'XG5O2BWvT_FeolZFmc5_Fq2W',
                    refreshToken: '1/hF2D-9doalNaTWMpGXsXIRttLifkotder8G5CWsV-I1NMxTk1TW8pEOvdl7rbHjK',
                }
            });
            const xname = 'TRUSTFUND';

            req.headers = {
                'Content-Type':'application/x-www-form-urlencoded',
                    'authorization':'Bearer'
                }
        
            //host =    req.header('host');    
            console.log();

            // send mail with defined transport object
            let mail = transporter.sendMail({
                from: '"TrustFundWeb 👻 user: ' + xname + ' <' + mailuser + '>', // sender address
                to: "pushpoped@gmail.com", // list of receivers
                subject: "Reinicio de contraseña ✔", // Subject line
                text: 'Reinicio de contraseña',
                html: '<div class="card" style="width:400px">' +
                    '<div class="card-body">' +
                    '<h4 class="card-title">Mensaje de:' + xname + '</h4>' +
                    '<p class="card-text">Este espacio es para recuperar tu contraseña</p>' +
                    '<a href="http://'+req.headers.host+'/reset-pass-confirm/'+ token + '">Click Aqui</a>' +
                    '<p class="card-text">' + mailuser + '</p>' +
                    '' +
                    '</div>' +
                    '</div>',
            });
            
            mail.then(() => {
                
                res.render('public/mensajenviado');

            }).catch((err) => {
                console.log(err);
            });
        }else{
            req.flash('message', 'No existe usuario con ese mail');
            res.redirect('/reset-pass');
        }
    }).catch((err) => {
        console.log(err);
    });


});

router.get('/reset-pass-confirm/:token',isNotLoggedIn,ensureToken ,(req, res) => {
  
    //console.log(req.params);

  
    const {token} = req.params;
    //console.log(token);
    jwt.verify(token, 'process.env.SECRETO', (err, data) => {
        if (err) {
            res.sendStatus(403);
        } else {
        const sc = {tok: token}
            //console.log(data)
            res.render('auth/reset-pass',{sc});
        }
    });


});


router.get('/getget',(req,res)=>{
    req.headers = {
        'Content-Type':'application/x-www-form-urlencoded',
            'authorization':'Bearer'
        }

    const host =req.header('host');    
    console.log(host);
});


router.get('/get-user-edit/:id', isLoggedIn, (req, res) => {
    const {
        id
    } = req.params;

    const query = pool.query('SELECT * FROM USERS_ where id = ?', [id]);
    const user = [];

    query.then((data) => {
        data.forEach((data) => {
            user.push(data);



        });

        res.render('auth/edit-user', {
            user
        });


    });
});

router.get('/contact', (req, res) => {

    res.render('public/contact');

});

router.post('/contact', (req, res) => {
    //console.log(process.env.SENDGRID_API_KEY);
    const {
        name,
        mail,
        message
    } = req.body;



    //mail 
    let transporter = nodemailer.createTransport({
        service: "gmail",
        port: 25,
        secure: false, // true for 465, false for other ports
        auth: {
            type: 'oauth2',
            user: 'manuel.o@trustfund.com.mx',
            clientId: '804329507754-hibhcnfn4j6vja59ua8vovea5b2r5lr5.apps.googleusercontent.com',
            clientSecret: 'XG5O2BWvT_FeolZFmc5_Fq2W',
            refreshToken: '1/hF2D-9doalNaTWMpGXsXIRttLifkotder8G5CWsV-I1NMxTk1TW8pEOvdl7rbHjK',
        }
    });
    const xname = 'TRUSTFUND';

    // send mail with defined transport object
    let mailer = transporter.sendMail({
        from: '"TrustFundWeb 👻 user: ' + xname + ' <' + mailuser + '>', // sender address
        to: "support@trsutfund.com.mx", // list of receivers
        subject: "Mensaje de Contacto ✔", // Subject line
        text: 'Mensaje de Contacto',
        html: '<div class="card" style="width:400px">' +
            '<div class="card-body">' +
            '<h4 class="card-title">Mensaje de:' + xname + '</h4>' +
            '<p class="card-text">'+message+'</p>' +
            '<p class="card-text">' + mailuser + '</p>' +
            '' +
            '</div>' +
            '</div>',
    });
    
    
    
    
    mailer.then((success) => {
        console.log(success)
        res.render('public/mensajenviado');
    
    }).catch((err) => {
        console.log(err);
    });
   
       

});


//reset password


router.get('/reset-pass', (req, res) => {
    res.render('public/reset-pass');

});


router.post('/sendmailg', (req, res) => {

});


router.get('/projects-json', async (req, res) => {

    const projects = await pool.query('SELECT * FROM PROJECTS_ ');
    //console.log(projects);
    res.json({
        projects
    });


});


router.get('/news-json', async (req, res) => {

    const news = await pool.query('SELECT * FROM NEWS_ ');
    //console.log(projects);
    res.json({
        news
    });


});


router.get('/users-json', async (req, res) => {

    const news = await pool.query('SELECT * FROM USERS_ where user = 1 ');
    //console.log(projects);
    res.json({
        news
    });


});

router.get('/projects-json', async (req, res) => {

    const projects = await pool.query('SELECT * FROM PROJECTS_ ');
    //console.log(projects);
    res.json(projects);


});




router.get('/false-news/', (req, res) => {
    const {
        id
    } = req.params;


    //console.log(id)
    const falsenews = {
        title: 'test news false',
        text1: '29f64cb637e74b83dfe9e0e233650293f967.jpg',
        text2: '29f64cb637e74b83dfe9e0e233650293f967.jpg',
        text3: '29f64cb637e74b83dfe9e0e233650293f967.jpg',
        img1: '29f64cb637e74b83dfe9e0e233650293f967.jpg',
        img2: '29f64cb637e74b83dfe9e0e233650293f967.jpg',
        img3: '29f64cb637e74b83dfe9e0e233650293f967.jpg',
        imgh: '29f64cb637e74b83dfe9e0e233650293f967.jpg',
        id_proyecto: 1,
        id_usercreated: 0

    };

    const insert = pool.query('INSERT INTO NEWS_ set = ?', [falsenews]);

    var i;
    for (i = 0; i < 20; i++) {
        insert.then();
    }

    insert.then((data) => {
        try {
            req.flash('success', 'Noticia Generada con éxito');
            res.redirect('/dashboard');
        } catch (err) {
            console.log(err)
        }
    }).catch((err) => {
        console.log(err)
    });


});




//STRIPE

router.get('st-test1', (req, res) => {
    res.send('llegamos aquí');
});

//

module.exports = router;