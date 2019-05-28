const passport = require('passport');
const LStrategy = require('passport-local').Strategy;
//const knex = require('../db');
const helpers = require('../lib/helpers');
const pool = require('../db');

const GoogleplustokenStrategy = require('passport-google-oauth2');


//google passport
passport.use('googleToken', new GoogleplustokenStrategy({
        callbackURL:'/auth/googleT/cb', 
        clientID: '804329507754-int6bm1fa9hpp8i1kril5cfa4ar4ubot.apps.googleusercontent.com',
        clientSecret: 'UMb_6t8Rekopelsy8TLh8hIC',
        passReqToCallback   : true
    },
    async (req, accessToken, refreshToken, profile, done) => {

       // console.log(accessToken);
       //console.log(profile);
        //console.log(profile.emails[0].value);
        
        const mail = profile.emails[0].value;
        const id =  profile.id;
        const language = profile.language;
        const provider = profile.provider;
        const name = profile.displayName;
        //createusername
        const x  = profile.name.givenName;
        const y  = profile.name.familyName;


        const x1 = x.substring(0,3).trim();
        const y1 = y.substring(0,3).trim();
        const rand2 = Math.floor(Math.random() * 10000) + 1;
        
        
        const username = x1+y1+rand2;

        const pass = await helpers.encryptPass(username);


        //
        const img = profile.photos[0].value;
        const user = {name:name,img:img,mail:mail,username:username,pass:pass,status:1,user:1};
        

        //console.log(somed);



        
        const check = pool.query('SELECT * From USERS_ where mail = ?',[mail]);
        check.then((resp)=>{
            if (resp.length > 0){
                //console.log(resp);
                const userx = resp[0];
                done(null,userx);
            }else{

                //console.log(resp);
                const queryuser = pool.query('INSERT INTO USERS_ set ?', [user]);

               
                queryuser.then((resp1)=>{

                    //console.log(resp1[0].length);
                    const somed = {id:id,language:language,provider:provider,name:username  };
                    //console.log(somed);
                    //console.log(resp1);
                    user.id = resp1.insertId;
                    somed.id_usercreated = resp1.insertId;

                    //console.log(somed);

                    const query = pool.query('INSERT INTO SOMED_ set ?',[somed]);


                    query.then((respz)=>{
                        console.log('datos de google añadidos a db'+respz[0]);
                        //console.log(user);
                        
                        
                        return done(null,user, req.flash('message', 'Bienvenido ' + user.name));
                    }).catch((err)=>{
                        console.log(err);
                    });
                    
                }).catch((err)=>{
                    console.log(err);
                });
               
            }
        });
/*
/*
       
       


        /*      
        User.findOrCreate({ googleId: profile.id }, function (err, user) {
          return done(err, user);
        });*/
    }
));



//

//movil app

passport.use('app.signin', new LStrategy({
    usernameField: 'username',
    passwordField: 'pass',
    passReqToCallback: true
}, async (req, username, pass, done) => {
    //console.log(req.body);
   //console.log(username, pass);



    const qu = pool.query('SELECT * FROM  USERS_ where username = ?', [username]);
    qu.then(async (res) => {
       // console.log(res.length);

        if (res.length > 0) {
            const user = res[0];
            //console.log(user);
            const validpass = await helpers.matchPass(pass, user.pass);

            if (validpass) {
                done(null, user);
            } else {
                done(null, false);
            }

        } else {
            done(null, false);
        }
    }).catch((err) => {
        console.log(err);
    });
}));

//local web

passport.use('local.signin', new LStrategy({
    usernameField: 'name',
    passwordField: 'pass',
    passReqToCallback: true
}, async (req, username, pass, done) => {
    console.log(req.body);
    console.log(username, pass);



    const qu = pool.query('SELECT * FROM  USERS_ where username = ?', [username]);
    qu.then(async (res) => {
        console.log(res.length);

        if (res.length > 0) {
            const user = res[0];
            console.log(user);
            const validpass = await helpers.matchPass(pass, user.pass);

            if (validpass) {
                done(null, user, req.flash('success', 'Bienvenido ' + user.username));
            } else {
                done(null, false, req.flash('message', 'Contraseña invalida'));
            }

        } else {
            done(null, false, req.flash('message', 'Usuario invalido '));
        }
    }).catch((err) => {
        console.log(err);
    });
}));


passport.use('local.signup', new LStrategy({
    usernameField: 'name',
    passwordField: 'pass',
    passReqToCallback: true
}, async (req, userName, pass, done) => {

    //console.log(req.body);
    const mail = req.body.mail;
    const name = req.body.name;
    const datenac = req.body.datenac;
    const newUser = {
        username: name,
        mail: mail,
        datenac: datenac,
        id_usercreated: 0
    };
    console.log(pass.length);
    if (pass.length < 8) {
        done(null, false, req.flash('message', 'Contraseña no cumple con el minimo de caracteres. '));
    }

    newUser.pass = await helpers.encryptPass(pass);

    //console.log(newUser);

    const query = pool.query('INSERT INTO USERS_ set ?', [newUser]);

    query.then((data) => {
        //console.log(data.toString());
        newUser.id = parseInt(data.insertId);
        console.log(data.insertId);
        return done(null, newUser, req.flash('message', 'Bienvenido ' + newUser.username));


    }).catch((err) => {
        console.log(err);
    });


}));








passport.use('local.signup-subadmin', new LStrategy({
    usernameField: 'name',
    passwordField: 'pass',
    passReqToCallback: true
}, async (req, userName, pass, done) => {

    //console.log(req.body);
    const mail = req.body.mail;
    //const name = req.body.name;
    const {
        lastnameM,
        lastnameP,
        phone,
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
        img:'/img/logo512.png'
    };

    switch (role) {
        case 1:
            newUser.admin = true;
            newUser.owner = false;

            break;

        case 2:
            neUser.owner = true;
            newUser.admin = false;
            break;
    }


    newUser.pass = await helpers.encryptPass(pass);

    console.log(newUser);

    const query = pool.query('INSERT INTO USERS_ set ?', [newUser]);

    query.then((data) => {
        //console.log(data.toString());
        newUser.id = parseInt(data);
        console.log(newUser);
        return done(null, false, req.flash('message', 'Usuario ' + newUser.username + 'credo con éxito.'));


    }).catch((err) => {
        console.log(err);

        return done(null, false, req.flash('errores', 'err:' + err))
    });


}));

passport.serializeUser((user, done) => {

    done(null, user.id); //user is an object resulted from a query be sure to use the correct property name
});


passport.deserializeUser(async (id, done) => {
    console.log(id)
    const qu = pool.query('SELECT * FROM USERS_ where id = ?', [id]);
    qu.then((res) => {
        console.log('datos recibido con éxito')
        done(null, res[0]); // datos de usuario por deseralizar
    }).catch((err) => {
        console.log(err)
    });


    //user is an object resulted from a query be sure to use the correct property name
});