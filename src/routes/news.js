'use strict';
const express = require('express');
const router = express.Router();
//middles
const pool = require('../db');
const fs = require('fs');
const Path = require('path');

require('../lib/handlebars');


router.post('/add-New', (req, res) => {
   const {
        title,
        text1,
        text2,
        text3,
        id_proyecto,
        id_usercreated
    } = req.body;

    const img1 = req.files[1];
    const nimg1 = img1.location;

    const img2 = req.files[2];
    const nimg2 = img2.location;

    const img3 = req.files[3];
    const nimg3 = img3.location;

    const imgt = req.files[0];
    const nimgt = imgt.location;

   // console.log(req.params);
   // console.log(req.files   );

    //res.json({'imageUrl': req.files})
   
    const news = {
        title:title,
        text1:text1,
        text2:text2,
        text3:text3,
        img1: nimg1,
        img2: nimg2,
        img3: nimg3,
        imgh: nimgt,
        id_proyecto:id_proyecto,
        id_usercreated:id_usercreated

    };

    console.log(news);

    const insert = pool.query('INSERT INTO NEWS_ set ?', [news]);



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

router.get('/:id', (req, res) => {
    const {
        id
    } = req.params;
    console.log(id);
    const news = [];
    const query = pool.query('SELECT * FROM NEWS_ where id = ?', [id]);
    query.then((data) => {
        data.forEach((data) => {
            news.push(data);
        });

        res.render('public/infonews', {
            news
        });

    }).catch((err) => {
        console.log(err)
    });


});
router.post('/update-imgs', (req, res) => {
    const {
        id
    } = req.body;

/*
    const qu = ('SELECT * FROM USERS_ where id = ?', [id]);

    qu.then((data) => {
        for (let img in data) { // bucle "for in" para recorrer objetos
            fs.unlink('/uploads/' + data[img], (err) => { // data[key] devuelve el valor del campo

                console.log('File deleted: ' + data[img]);
            });
        }
    }).catch((err) => {
        console.log(err);
    });
*/

    const f1 = req.files[0];
    const f2 = req.files[1];
    const f3 = req.files[2];


    const files = {
        img1: f1.location,
        img2: f2.location,
        img3: f3.location
    };

    const queryk = pool.query('UPDATE NEWS_ set ? where id = ? ', [files, id]);



    queryk.then(() => {
        try {
            req.flash('success', 'Datos actualizados');
            res.redirect('/news/edit/' + id);
        } catch (err) {
            console.log(err)
        }
    }).catch((err) => {
        console.log(err);
    });

});
router.post('/update-text', (req, res) => {
    const {
        id,
        text1,
        text2,
        text3
    } = req.body;
    console.log(id, text1, text2, text3);

    const files = {
        text1: text1,
        text2: text2,
        text3: text3
    };

    const qu = pool.query('UPDATE NEWS_ set ? where id = ? ', [files, id]);


    qu.then(() => {
        try {
            req.flash('success', 'Datos actualizados');
            res.redirect('/news/edit/' + id);
        } catch (err) {
            console.log(err)
        }
    }).catch((err) => {
        console.log(err)
    });

});

router.get('/edit/:id', (req, res) => {
    const {
        id
    } = req.params;
    console.log(id);

    const query = pool.query('SELECT * FROM NEWS_ where id = ?', [id]);

    const news = [];
    query.then((data) => {
        data.forEach((data) => {
            news.push(data);
        });

        res.render('projects/edit-new', {
            news
        });

    }).catch((err) => {
        console.log(err);
    });

});


module.exports = router;