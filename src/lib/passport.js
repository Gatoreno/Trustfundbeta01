const passport = require('passport');
const LStrategy = require('passport-local').Strategy;
//const knex = require('../db');
const helpers = require('../lib/helpers');
const pool = require('../db');





passport.use('local.signin', new LStrategy({
    usernameField: 'name',
    passwordField: 'pass',
    passReqToCallback: true
}, async (req, username, pass, done) => {
    console.log(req.body);
    console.log(username, pass);

    const qu = pool.query('SELECT * FROM  USERS_ where username = ?',[username]);
    qu.then( async (res) => {
        console.log(res.length);

        if (res.length > 0) {
            const user = res[0];
            console.log(user);
            const validpass = await helpers.matchPass(pass, user.pass);
            
            if (validpass) {
                done(null,user,req.flash('success','Bienvenido '+user.username));
            }else{
                done(null,false,req.flash('message','Contraseña invalida'));
            }

        }else {
            done(null,false,req.flash('message','Usuario invalido '));
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

    newUser.pass = await helpers.encryptPass(pass);

    //console.log(newUser);

    const query =  pool.query('INSERT INTO USERS_ set ?', [newUser]);
    
    query.then((data) => {
        //console.log(data.toString());
        newUser.id = parseInt(data.insertId);
        console.log(data.insertId);
     return done(null, newUser,req.flash('message','Bienvenido '+newUser.username));


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
    const { lastnameM,
            lastnameP,
            phone, 
            datenac,
            id,role ,name} = req.body;

    const newUser = {
        username: userName,
        name: name,
        mail: mail,
        datenac: datenac,
        id_usercreated: id,
        lastnameP: lastnameP,
        lastnameM: lastnameM,
        mail: mail,
        phone: phone
    };

    switch(role){
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
     return done(null, false,req.flash('message','Usuario '+newUser.username + 'credo con éxito.'));


    }).catch((err) => {
        console.log(err);

        return done(null,false,req.flash('errores','err:'+err))
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
        done(null, res[0]);  // datos de usuario por deseralizar
    }).catch((err) => {
        console.log(err)
    });

    
    //user is an object resulted from a query be sure to use the correct property name
});