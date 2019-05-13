require('dotenv').config()
'use strict';

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const pool = require('../db');


const {
    isLoggedIn,
    isNotLoggedIn
} = require('../lib/auth');

router.get('/get-logo/', (req, res) => {
    res.status(200).sendFile('public/img/logo512.png');
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



router.post('/api/login', (req, res) => {
    const {
        id
    } = req.body;
    const user = id;
    const token = jwt.sign({
        user
    }, process.env.SECRETO, {
        expiresIn: '3600s'
    });

    res.json({
        token
    });
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

        res.render('auth/edit-user',{user});


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

    //console.log(token);

    const sgMail = require('@sendgrid/mail');
    //sgMail.setApiKey(process.env.SENDGRID_API_KEY);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
    sgMail.setApiKey('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');
    const msg = {
        to: 'support@trustfund.com.mx',
        from: mail,
        subject: 'Reiniciar contraseña TrustFund',
        text: 'Gracias por tu confianza.',
        html: '<div class="card" style="width:400px">' +
            '<div class="card-body">' +
            '<h4 class="card-title">Mensaje de:' + name + '</h4>' +
            '<p class="card-text">' + message + '</p>' +
            '<p class="card-text">mail:' + mail + '</p>' +
            '' +
            '</div>' +
            '</div>',
    };
    sgMail.send(msg).then(() => {
        res.render('public/mensajenviado');
    });

});


//reset password


router.get('/reset-pass', (req, res) => {
    res.render('public/reset-pass');

});

router.post('/reset-pass', (req, res) => {
    //console.log(process.env.SENDGRID_API_KEY);
    const mail = 'mai@gmail.com';
    const token = jwt.sign({
        mail
    }, process.env.SECRETO, {
        expiresIn: '3600s'
    });

    //console.log(token);

    const sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    const msg = {
        to: 'pushpoped@gmail.com',
        from: 'manuel.o@trustfund.com.mx',
        subject: 'Reiniciar contraseña TrustFund',
        text: 'Gracias por tu confianza.',
        html: '<div class="card" style="width:400px">' +
            '<img class="card-img-top" src="" alt="Card image" style="width:100%">' +
            '<div class="card-body">' +
            '<h4 class="card-title">Reinicia tu contraseña</h4>' +
            '<p class="card-text">Some example text some example text. John Doe is an architect and engineer</p>' +
            '<a href="' + token + '" class="">Restablecer contraseña.</a>' +
            '</div>' +
            '</div>',
    };
    sgMail.send(msg).then(() => {
        res.json('sended');
    });

});


router.post('/sendmailg',(req,res)=> {
    
});


router.get('/projects-json', async (req, res) => {

    const projects = await pool.query('SELECT * FROM PROJECTS_ ');
    //console.log(projects);
    res.json({projects});

  
  });


router.get('/news-json', async (req, res) => {

    const news = await pool.query('SELECT * FROM NEWS_ ');
    //console.log(projects);
    res.json({news});

  
  });


router.get('/users-json', async (req, res) => {

    const news = await pool.query('SELECT * FROM USERS_ where user = 1 ');
    //console.log(projects);
    res.json({news});

  
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
 
router.get('st-test1',(req,res)=>{
    res.send('llegamos aquí');
});

//

module.exports = router;