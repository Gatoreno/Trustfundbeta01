const express = require('express');
const router = express.Router();



const passport = require('passport');
const pool = require('../db');
const helpers = require('../lib/helpers');
const jwt = require('jsonwebtoken');


const {
    isLoggedIn,
    isNotLoggedIn
} = require('../lib/auth');


router.get('/goT', (req, res) => {
    res.render('auth/goT');
});

router.get('/googleT/cb', passport.authenticate('googleToken'), (req, res) => {
    // const {cb}=req.params;
    const user = req.user;
    console.log(user);
    res.redirect('/profile');
});

router.get('/googleT', passport.authenticate('googleToken', {
    scope: ['profile', 'email']
}));
router.get('/signup', isNotLoggedIn, (req, res) => {
    res.render('auth/signup');
});

router.get('/signin', isNotLoggedIn, (req, res) => {
    res.render('auth/signin');
});


//Json mobil app

router.post('/signin-app',
    passport.authenticate('app.signin'),
    function (req, res) {
        // If this function gets called, authentication was successful.
        // `req.user` contains the authenticated user.
        // Then you can send your json as response.
        res.json({
            user:  req.user
        });
    });


//

router.post('/signup', passport.authenticate('local.signup', {
    successRedirect: '/profile',
    failureRedirect: '/auth/signup',
    failureFlash: true
}));

router.post('/signin', isNotLoggedIn, (req, res, next) => {
    passport.authenticate('local.signin', {
        successRedirect: '/profile',
        failureRedirect: '/auth/signin',
        failureFlash: true
    })(req, res, next);
});


router.get('/reset-password', (req, res) => {
    /* ensureToken,
    jwt.verify(req.token, 'seceto', (err, data) => {
         if (err) {
             res.redirect('/reset-pass', 403, req.flash('message','Intenta de nuevo.'));
         } else {
             res.json({
                 text: 'protected',
                 data: data //iat 
             });
         }
     });*/

    res.render('auth/pass-reset');

});


router.post('/reset-pass-mail', (req, res) => {


    let mail = req.body.mail;

    const checkm = pool.query('SELECT * FROM USERS_ where mail = ?', [mail]);
    checkm.then((resx) => {
        if (resx.length > 0) {
            console.log(resx);
            //console.log(resx.mail);

            const token = jwt.sign({
                mail
            }, 'seceto', {
                expiresIn: '3600s'
            });

            //console.log(token);
            //Send liga
        } else {
            console.log('err' + resx);
            res.redirect('/reset-pass', 403, req.flash('message', 'No hay usuario con ese mail.'));
        }
    });

});

//router.get();


router.post('/update-info-admin', (req, res) => {
    console.log(req.body);
    console.log(req.files);

    const {
        name,
        lastnameP,
        lastnameM,
        phone,
        calle,
        colonia,
        cp,
        estado,
        id
    } = req.body;

    const img = req.files[0];
    const imgfn = img.filename;

    userad = {
        name: name,
        lastnameP: lastnameP,
        lastnameM: lastnameM,
        phone: phone,
        calle: calle,
        colonia: colonia,
        cp: cp,
        estado: estado,

        status: 1,
        img: imgfn,
        admin: true
    };

    const queryk = pool.query('UPDATE USERS_ set ? where id = ? ', [userd, id]);


    queryk.then(() => {
        res.render('public/sucessUpdate');
    }).catch((err) => {
        console.log(err);
    });
});


router.post('/update-info-user-form', (req, res) => {
    console.log(req.body);
    console.log(req.files);

    const {
        name,
        lastnameP,
        lastnameM,
        phone,
        calle,
        colonia,
        cp,
        estado,
        id
    } = req.body;

    const img = req.files[0];
    const imgfn = img.filename;


    const userd = {
        name: name,
        lastnameP: lastnameP,
        lastnameM: lastnameM,
        phone: phone,
        calle: calle,
        colonia: colonia,
        cp: cp,
        estado: estado,
        status: 1,
        img: imgfn,
        user: true
    };
    queryk = pool.query('UPDATE USERS_ set ? where id = ? ', [userd, id]);

    queryk.then(() => {
        res.render('public/sucessUpdate');
    }).catch((err) => {
        console.log(err);
    });
});



router.post('/signup-subadmin', async (req, res) => {
    //console.log(req.body);
    const mail = req.body.mail;
    //const name = req.body.name;
    const {
        lastnameM,
        lastnameP,
        pass,
        phone,
        userName,
        datenac,
        id,
        role,
        name
    } = req.body;

    const newUser = {
        username: userName,
        name: name,
        mail: mail,
        datenac: datenac,
        id_usercreated: id,
        lastnameP: lastnameP,
        lastnameM: lastnameM,
        mail: mail,
        phone: phone,
        admin: null,
        owner: null
    };

    if (role == 1) {
        newUser.admin = 1
    } else if (role == 2) {
        newUser.owner = 1
    } else {
        newUser.user = null
    }


    newUser.pass = await helpers.encryptPass(pass);

    console.log(newUser);

    const query = pool.query('INSERT INTO USERS_ set ?', [newUser]);

    query.then((data) => {
        //console.log(data.toString());
        newUser.id = parseInt(data);
        console.log(newUser);
        res.redirect('/profile/', 200, req.flash('success', newUser.username + ' creado con éxito'));

    }).catch((err) => {
        console.log(err);

        res.redirect('/profile/', 500, req.flash('err: ' + err));
    });


});

router.get('/edit-user', );





module.exports = router;

module.exports = router;