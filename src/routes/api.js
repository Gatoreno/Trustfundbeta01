require('dotenv').config()
'use strict';

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const pool = require('../db');
const nodemailer = require("nodemailer");
const helpers = require('../lib/helpers');






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

router.get('/tc-info-plan/:id',(req,res)=>{
    const {id} = req.params;
    const plandata =  pool.query('SELECT * FROM tc_ where id = ? ',[id]);
    //console.log(projects);
   
    plandata.then((resx) => {
        res.json(resx);
    });

    
})

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

router.get('/get-reset-pass', (req, res) => {
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
                    refreshToken: '1/K0u_nl6bWWHtMIjIuj2fSMhUss3bTBD-qt93dHyQGpw'
                }
            });
            const xname = 'TRUSTFUND';

            /*req.headers = {
                'Content-Type':'application/x-www-form-urlencoded',
                    'authorization':'Bearer'
            }*/

            var os = require("os");
            var hostname = os.hostname();
            //host =    req.header('host');    
            console.log(JSON.stringify(req.headers.host));
            const hosty = req.headers.host;
            // send mail with defined transport object
            let mail = transporter.sendMail({
                from: '"TrustFundWeb 👻 user: ' + xname + ' <' + mailuser + '>', // sender address
                to: mailuser, // list of receivers
                subject: "Reinicio de contraseña ✔", // Subject line
                text: 'Reinicio de contraseña',
                html: '<div class="card" style="width:400px">' +
                    '<div class="card-body">' +
                    '<h4 class="card-title">Mensaje de:' + xname + '</h4>' +
                    '<p class="card-text">Este espacio es para recuperar tu contraseña</p>' +
                    '<a href="https://' + hosty + '/reset-pass-confirm/' + token + '?' + mailuser + '">Click Aqui</a>' +
                    '<p class="card-text">' + mailuser + '</p>' +
                    '' +
                    '</div>' +
                    '</div>',
            });


            console.log(token, mail);

            mail.then(() => {

                res.render('public/mensajenviado');

            }).catch((err) => {
                console.log(err);
            });
        } else {
            req.flash('message', 'No existe usuario con ese mail');
            res.redirect('/reset-pass');
        }
    }).catch((err) => {
        console.log(err);
    });


});

router.get('/reset-pass-confirm/:token', (req, res) => {

    //console.log(req.params);
    const {
        token
    } = req.params;
    //console.log(token);
    jwt.verify(token, 'process.env.SECRETO', (err, data) => {
        if (err) {
            res.sendStatus(403);
        } else {
            const sc = {
                tok: token
            }
            //console.log(data)
            res.render('auth/reset-pass', {
                sc
            });
        }
    });
});




router.post('/reset-password/', (req, res) => {

    //console.log(req.params);
    const {
        token,
        mail,
        pass,
        pas1
    } = req.body;
    console.log( token,
        mail,
        pass,
        pas1);
    jwt.verify(token, 'process.env.SECRETO', (err, data) => {
        if (err) {
            res.sendStatus(403);
            console.log(err);
        } else {

             console.log('data: '+ token);
            console.log('data: '+ data);
            //console.log(data)
            const query = pool.query('Select * from users_ where mail = ?', [mail]);
            query
                .then(async (respon) => {
                    if (respon.length > 0) {
                        const user = respon[0];
                        console.log('respon: '+ respon[0]);
                        const pass_new = await helpers.encryptPass(pass); 

                        console.log('iduser: '+ user.id);

                        const queryUpdate = await pool.query('Update users_ set pass = ? where id = ?', [pass_new, user.id]);

                        req.flash('success', 'Datos actualizados,intende de nuevo');
                        res.redirect('auth/signin');

                    } else {
                        console.log(err);
                        req.flash('error', 'Por favor comunicate con soporte');
                        res.redirect('public/contact');
                    }
                })
                .catch((err) => {
                    console.log(err);
                    req.flash('error', 'Por favor comunicate con soporte');
                    res.redirect('public/contact');
                });
        }
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
            //refreshToken: '1/hF2D-9doalNaTWMpGXsXIRttLifkotder8G5CWsV-I1NMxTk1TW8pEOvdl7rbHjK',
            refreshToken: '1/K0u_nl6bWWHtMIjIuj2fSMhUss3bTBD-qt93dHyQGpw'
        }
    });
    const xname = name;

    // send mail with defined transport object
    let mailer = transporter.sendMail({
        from: '"TrustFundWeb 👻 user: ' + xname + ' <' + mail + '>', // sender address
        to: "support@trustfund.com.mx", // list of receivers
        subject: "Mensaje de Contacto ✔", // Subject line
        text: 'Mensaje de Contacto',
        html: '<div class="card" style="width:400px">' +
            '<div class="card-body">' +
            '<h4 class="card-title">Mensaje de:' + xname + '</h4>' +
            '<p class="card-text">' + message + '</p>' +
            '<p class="card-text">' + mail + '</p>' +
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

router.get('/instrucciones', (req, res) => {
    res.render('public/instrucciones');
})


//searching

router.get('/search', function (req, res) {
    /*
    pool.query('SELECT title from projects_ where title like "%'+req.query.key+'%"',
    function(err, rows, fields) {
    if (err) throw err;
    var data=[];
    for(i=0;i<rows.length;i++)
    {
    data.push(rows[i].first_name);
    }
    res.end(JSON.stringify(data));
    });*/


    const qu = pool.query('SELECT title from projects_ where title like "%' + req.query.key + '%"');
    qu.then((resx) => {
        if (resx.length > 0) {



            res.end(JSON.stringify(data));

        }
    }).catch((err) => {
        console.log(err)
    });

});

//tc

router.post('/tc-create', (req, res) => {
    const img1 = req.files[0];
    const nimg1 = img1.location;
    const {
        id_user,
        amount,
        name,
        desc
    } = req.body;


    const tc = {
        id_usercreated: id_user,
        amount: amount,
        name: name,
        desc: desc,
        img: nimg1
    }

    const qu = pool.query('INSERT into tc_ set ?', [tc]);

    qu.then((resx) => {
        if (resx.length > 0) {
            req.flash('message', 'Unidad creada con éxito.');
            res.redirect('/costumers');
        } else {
            req.flash('error', 'Hubo algín error');
            res.render('dashboard/costumers');
        }

    }).catch((err) => {
        console.log(err)
    });

});

router.get('/tc-list', (req, res) => {
    const qu = pool.query('SELECT * FROM tc_');
    qu.then((resx) => {
        res.json(resx)
    });
})
//

//medallas

router.post('/create-medalla', (req, res) => {
    const {
        id_user,
        name,
        desc,
        condition
    } = req.body;
    const img1 = req.files[0];
    const nimg1 = img1.location;

    const badge = {
        id_usercreated: id_user,
        name: name,
        desc: desc,
        status: 'aún fuera de sistema',
        img: nimg1,
        condition: condition
    }


    console.log(badge)

    const qu = pool.query('INSERT INTO BADGES_ set ?', [badge]);
    qu.then((response, error) => {
        if (error) throw error;
        if (response.insertId) {

            req.flash('message', 'Medalla agregada con éxitol');
            res.redirect('/dashboard');
        } else {
            req.flash('error', 'Intentelo de nuevo o contacte a soporte');
            res.redirect('/dashboard');
        }
    }).catch((err) => {
        console.log(err)
    });


});


router.get('/goals-list/:id', (req, res) => {

    const {
        id
    } = req.params;
    const query = pool.query('SELECT * from goals_ where id = ?', [id]);

    query.then((resp) => {
        res.json(resp);
    }).catch((err) => {
        res.json(err);
    });


});



router.get('/tc-info-client/:id',(req,res)=>{

    const id = req.params.id;

    const query = pool.query('select sum(amount) total, count'+
    '(id) total_units, descrip descrip  from tc_u where status = 0 AND id_client = ?',[id]);

    query.then((response)=>{
        res.json(response);
    }).catch((err)=>{  
        res.json(err);
    });
});

router.get('/tc-get/:id',(req,res)=>{
    const {id} = req.params;
    const query = pool.query('SELECT * FROM tc_u where status = 0 AND id_client = ?',[id]);
    
    query.then((tc)=>{
        res.json(tc);
    }).catch((err)=>{
        res.json(err)
    });
});

router.get('/tc-get-ocupated/:id',(req,res)=>{
    const {id} = req.params;
    const query = pool.query('SELECT * FROM tc_u where id_client = ?',[id]);
    
    query.then((tc)=>{
        res.json(tc);
    }).catch((err)=>{
        res.json(err)
    });
});
router.get('/medallas', (req, res) => {
    const query = pool.query('SELECT * FROM BADGES_ ');
    query.then((resp) => {
        res.json(resp);
    }).catch((err) => {
        res.json(err);
    });
});


module.exports = router;