'use strict';
const express = require('express');
const router = express.Router();
//middles
const fs = require('fs');
const Path = require('path');
const stripe = require('stripe')(process.env.STSK);
const pool = require('../db');

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



router.post('/add-goal',(req,res)=>{

    const {id_user,id_proyecto,init,end,
      descrip,title} = req.body;

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

      const query = pool.query('INSERT INTO goals_ set ?',[goal]);


      query.then(()=>{
        req.flash('success', 'Meta generada');
        res.redirect('/projects/update-project/'+id_proyecto);
      }).catch((err)=>{
        console.log(err)
      });
    

});

router.get('/goals/:id',(req,res)=>{
  const {id} = req.params;
  const query = pool.query('select * from goals_ where id_proyecto = ?',[id]);
  query.then((goals)=>{
    res.json(goals);
  }).catch((err)=>{
    console.log(err);
  });
});


router.post('/add-project',  (req, res) => {
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

    

    
    const qu =  pool.query('INSERT INTO PROJECTS_ set ?', [proj]);
    qu.then(() => {
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

    const total_pages = total_items / items_per_page ;

    const projects = await pool.query('SELECT *  from PROJECTS_ LIMIT  ? , ? ',[start_index,total_pages]);

    //console.log(projects);


    res.render('projects/projects', {projects,total_pages,current_page});

  /*const projects = await pool.query('SELECT * FROM PROJECTS_ ');
    console.log(projects);
    res.render('projects/projects', {projects});
*/
  
  });



router.get('/get-projects/:current_page', async (req, res) => {

  const {current_page} = req.params;

  //console.log(current_page)

  const items_per_page = 3;
    const start_index = (current_page - 1) * items_per_page;

    const query_projects = await pool.query('SELECT count(id) count FROM PROJECTS_');
    const total_items = query_projects[0].count;


    const total_pages = total_items / items_per_page ;

    const projects = await pool.query('SELECT * from PROJECTS_ LIMIT  ? , ? ',[start_index,total_pages]);

   // console.log(projects,total_pages);


   
  
  
    res.render('projects/projects', {projects,total_pages,current_page});

  
  });


  
 




  router.get('/get-project/:id', (req, res) => {
    const {
      id
    } = req.params;
    const queyk = pool.query('SELECT * FROM PROJECTS_ where id = ?',[id]);
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
    const queyk = pool.query('SELECT * FROM PROJECTS_ where id = ?',[id]);

    
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
    const queyk = pool.query('SELECT * FROM PROJECTS_ where id = ?',[id_project]);
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
    const proj ={
      mail: mail,
      phone: phone,
      url: url,
      urlyt: urlyt
    };
    const queryk =  pool.query('UPDATE PROJECTS_ set ? where id = ? ', [proj, id]);

  
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


  router.get('/get-all',  (req, res) => {

    const projects =  pool.query('SELECT * FROM PROJECTS_ ');
    projects.then((resp)=>{
      res.json(resp);
    }).catch((err)=>{
      console.log(err)
    });
   

  
  });




module.exports = router;