const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const pool = require('../db');

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
    }, 'seceto', {
        expiresIn: '3600s'
    });

    res.json({
        token
    });
});

//links

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



//Ensure

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



router.get('/project-support/:id', (req, res) => {
    const {
        id
    } = req.params;


    //console.log(id)

    const query = knex.table('TC_')
        .innerJoin('PROJECTS_', 'TC_.id_proyecto', '=', 'PROJECTS_.id')
        .where('PROJECTS_.id', [id]);


    query.then((resx) => {
        res.json(resx)
    }).catch((err) => {
        console.log(err)
    });

});


router.get('/user-tc/:id', (req, res) => {
    const {
        id
    } = req.params;


    //console.log(id)

    const query = knex.table('TC_')
        .innerJoin('USERS_', 'TC_.id_usercreated', '=', 'USERS_.id')
        .where('USERS_.id', [id]);

    query.then((resx) => {
        res.json(resx);
    }).catch((err) => {
        console.log(err)
    });
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





module.exports = router;