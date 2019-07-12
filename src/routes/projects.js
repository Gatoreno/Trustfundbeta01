'use strict';
const express = require('express');
const router = express.Router();
//middles
const fs = require('fs');
const Path = require('path');
const stripe = require('stripe')(process.env.STSK);
const pool = require('../db');
const nodemailer = require("nodemailer");



require('../lib/handlebars');

const {
  isLoggedIn,
  isNotLoggedIn
} = require('../lib/auth');


router.get('/add', async (req, res) => {

  const owners = await pool.query('SELECT * FROM USERS_ where owner ');
  console.log(owners);
  res.render('projects/add-project', {
    owners: owners
  });

});

router.get('/byowner/:id', async (req, res) => {

  const {
    id
  } = req.params;
  const project = await pool.query('SELECT * FROM projects_ where id_owner = ?', [id]);

  console.log(project);
  res.json(project);

});



router.post('/add-goal', (req, res) => {

  const {
    id_user,
    id_proyecto,
    init,
    end,
    descrip,
    title
  } = req.body;

  const img = req.files[0];

  const imgn = img.location;

  const goal = {
    id_proyecto: id_proyecto,
    id_usercreated: id_user,
    title: title,
    descrip: descrip,
    init: init,
    end: end,
    percentage: 0,
    img: imgn
  }

  //console.log(goal)

  const query = pool.query('INSERT INTO goals_ set ?', [goal]);


  query.then(() => {
    req.flash('success', 'Meta generada');
    res.redirect('/projects/update-project/' + id_proyecto);
  }).catch((err) => {
    console.log(err)
  });


});

router.get('/goals/:id', async (req, res) => {
  const {
    id
  } = req.params;
  const query = pool.query('select * from goals_ where id_proyecto = ?', [id]);
  query.then((goals) => {
    res.json(goals);
  }).catch((err) => {
    console.log(err);
  });
});


router.post('/add-project', (req, res) => {
  const pdf = req.files[1];
  const img = req.files[0];

  const pdfn = pdf.location;
  const imgn = img.location;

  const {
    title,
    fullname,
    mail,
    phone,
    univer,
    mail_investigator,
    name_investigator,
    cvu,
    area,
    url,
    urlyt,
    descrip,
    id_owner
  } = req.body;


  const proj = {
    title: title,
    fullname: fullname,
    mail: mail,
    phone: phone,
    university: univer,
    mail_investigator: mail_investigator,
    name_investigator: name_investigator,
    cvu: cvu,
    area: area,
    url: url,
    urlyt: urlyt,
    description: descrip,
    img: imgn,
    onepayer: pdfn,
    Id_usercreated: 0,
    id_owner: id_owner
  };




  const qu = pool.query('INSERT INTO PROJECTS_ set ?', [proj]);
  qu.then(async () => {

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

    const mail_again = req.body.mail;
    var os = require("os");
    var hostname = os.hostname();
    //host =    req.header('host');    
    console.log(JSON.stringify(req.headers.host));
    const hosty = req.headers.host;
    // send mail with defined transport object
    let mailx = await transporter.sendMail({
      from: '"TrustFundWeb 👻 Administración y soporte', // sender address
      to: mail_again, // list of receivers
      subject: "Estas invitado a formar parte de TrustFund ✔", // Subject line
      text: 'Invitación Trustfund',
      html: '<div class="card" style="width:400px">' +
        '<div class="card-body">' +
        '<h4 class="card-title">Mensaje de:' + xname + '</h4>' +
        '<p class="card-text">Esta invitación es para formes parte de TrustFund</p>' +
        '<p class="card-text">Felicidades usted ya cuenta como dueño de un proyecto dentro de TrustFundx</p>' +
        '<small>Ahora usted puede actualizar su proyecto desde la plataforma</small><br>' +
        '<a href="https://trustfundapp.herokuapp.com/profile">Ver proyecto</a>' +



        '</div>' +
        '</div>',
    });

    console.log(mail_again,mailx);
    req.flash('success', 'Proyecto generado');
    res.redirect('/dashboard/');

  }).catch((err) => {
    console.log(err)
  });







});



router.get('/get-projects/', async (req, res) => {

  const current_page = 1;

  console.log(current_page)

  const items_per_page = 3;
  const start_index = (current_page - 1) * items_per_page;

  const query_projects = await pool.query('SELECT count(id) count FROM PROJECTS_');
  const total_items = query_projects[0].count;

  console.log();

  const total_pages = total_items / items_per_page;

  const projects = await pool.query('SELECT *  from PROJECTS_ LIMIT  ? , ? ', [start_index, total_pages]);

  //console.log(projects);


  res.render('projects/projects', {
    projects,
    total_pages,
    current_page
  });

  /*const projects = await pool.query('SELECT * FROM PROJECTS_ ');
    console.log(projects);
    res.render('projects/projects', {projects});
*/

});



router.get('/get-projects/:current_page', async (req, res) => {

  const {
    current_page
  } = req.params;

  //console.log(current_page)

  const items_per_page = 3;
  const start_index = (current_page - 1) * items_per_page;

  const query_projects = await pool.query('SELECT count(id) count FROM PROJECTS_');
  const total_items = query_projects[0].count;


  const total_pages = total_items / items_per_page;

  const projects = await pool.query('SELECT * from PROJECTS_ LIMIT  ? , ? ', [start_index, total_pages]);

  // console.log(projects,total_pages);





  res.render('projects/projects', {
    projects,
    total_pages,
    current_page
  });


});








router.get('/get-project/:id', (req, res) => {
  const {
    id
  } = req.params;
  const queyk = pool.query('SELECT * FROM PROJECTS_ where id = ?', [id]);
  const links = [];

  queyk.then((data) => {

    data.forEach((data) => {
      links.push(data);
    });
    //console.log(projects);
    res.render('projects/view', {
      links
    });
  }).catch((err) => {
    res.send('error: ' + err);
    //res.render('err/err',{err: err});
  });


});


router.get('/get/:id', (req, res) => {
  const {
    id
  } = req.params;
  const queyk = pool.query('SELECT * FROM PROJECTS_ where id = ?', [id]);


  queyk.then((data) => {
    res.json(data);
  }).catch((err) => {
    res.send('error: ' + err);
    //res.render('err/err',{err: err});
  });


});




router.get('/update-project/:id_project', (req, res) => {
  const {
    id_project
  } = req.params;
  const queyk = pool.query('SELECT * FROM PROJECTS_ where id = ?', [id_project]);
  const projects = [];

  queyk.then((data) => {

    data.forEach((data) => {
      projects.push(data);
    });
    //console.log(projects);
    res.render('projects/edit-project', {
      projects
    });
  }).catch((err) => {
    res.send('error: ' + err);
    //res.render('err/err',{err: err});
  });

});

router.post('/update-info-project', (req, res) => {
  const {
    id,
    mail,
    phone,
    url,
    urlyt
  } = req.body;

  console.log(id, mail, phone, url, urlyt);
  const proj = {
    mail: mail,
    phone: phone,
    url: url,
    urlyt: urlyt
  };
  const queryk = pool.query('UPDATE PROJECTS_ set ? where id = ? ', [proj, id]);


  queryk.then(() => {
    res.render('public/main');
  }).catch((err) => {
    console.log(err);
  });
});



// FALTA EL UPDATE DE ESTOS ARCHIVOS Y ELIMINAR ARCHIVOS VIEJOS
router.post('/update-pdf-project', (req, res) => {
  //const pdf = req.files;
  const {
    id
  } = req.body;
  console.log(req.body);

});

router.post('/update-img-project', (req, res) => {
  //const img = req.files;
  //const {id} = req.body;
  console.log(req.body);

});


//ST


router.get('/get-all', (req, res) => {

  const projects = pool.query('SELECT * FROM PROJECTS_ ');
  projects.then((resp) => {
    res.json(resp);
  }).catch((err) => {
    console.log(err)
  });



});




module.exports = router;