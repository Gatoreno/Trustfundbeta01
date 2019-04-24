const express = require('express');
const router = express.Router();

const pool = require('../db')

const {
    isLoggedIn,
    isNotLoggedIn
} = require('../lib/auth');

router.get('/', (req,res) => {
    /*
    const owners = await pool.query('SELECT * FROM USERS_');
    console.log(owners);
    res.json( {
        owners: owners
    });*/

    res.render('public/main');

    
})



router.get('/profile',isLoggedIn,(req,res)=>{
    res.render('public/profile');
});


router.get('/dashboard',isLoggedIn,(req,res)=>{
    res.render('dashboard/dashboard');
});

router.get('/get-usersall',(req,res)=>{
    const admins = [];
    pool.query('SELECT * FROM USERS_');
    query.then((data)=>{
        data.forEach((data) => {
            admins.push(data);
          });
          //console.log(admins)
          res.json(admins);
    }).catch((err)=>{
        console.log(err);
    });

});




router.get('/pag-news',(req,res)=>{
    const news = [];
    let response = [];
    const query = pool.query('SELECT * FROM NEWS_');
    query.then( ( data ) => {
        const success = {}
        success.data = data;
        res.json( { success } );
      } ).catch( ( err ) => {
            console.log( err );
      } );

});


//public info
router.get('/get-projects',(req,res)=>{
    const {id} = req.params;
    const proj = [];
    const query = pool.query('SELECT * FROM PROJECTS_ ');
    query.then((data)=>{
        data.forEach((data) => {
            proj.push(data);
          });
          //console.log(admins)
          res.json(proj);
    }).catch((err)=>{
        console.log(err);
    });

});

router.get('/get-somed',(req,res)=>{
    const projects = [];
    const query = pool.query('SELECT * FROM PROJECTS_');
    query.then((data)=>{
        data.forEach((data) => {
            projects.push(data);
          });
          //console.log(admins)
          res.json(projects);
    }).catch((err)=>{
        console.log(err);
    });

});


//Info for admin
router.get('/get-admins',(req,res)=>{
    const admins = [];
    const query = pool.query('SELECT * FROM USERS_ where admin');
    query.then((data)=>{
        data.forEach((data) => {
            admins.push(data);
          });
          //console.log(admins)
          res.json(admins);
    }).catch((err)=>{
        console.log(err);
    });

});

//
router.get('/get-owners',(req,res)=>{
    const admins = [];
    const query = pool.query('SELECT * FROM USERS_ where owner');
    query.then((data)=>{
        data.forEach((data) => {
            admins.push(data);
          });
          //console.log(admins)
          res.json(admins);
    }).catch((err)=>{
        console.log(err);
    });

});


router.get('/get-news',(req,res)=>{
    const admins = [];
    const query = pool.query('SELECT * FROM NEWS_ ');
    query.then((data)=>{
        data.forEach((data) => {
            admins.push(data);
          });
          //console.log(admins)
          res.json(admins);
    }).catch((err)=>{
        console.log(err);
    });

});

//metodos de descarga
router.get('/download_pdf/:onepayer', function(req, res){
    const {onepayer} = req.params;
      var file =  'public/uploads/'+onepayer;
    res.download(file); // Set disposition and send it.
  });
  
  router.get('/download_img/:img', function(req, res){
    const {img} = req.params;
      var file =  'public/uploads/'+img;
    res.download(file); // Set disposition and send it.
  });

router.get('/logout',isLoggedIn, (req, res) => {
    req.logOut();
    res.redirect('/');
});


module.exports = router;