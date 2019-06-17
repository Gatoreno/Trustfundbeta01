const express = require('express');
const router = express.Router();
const helpers = require('../lib/helpers');


const pool = require('../db');
const jwt = require('jsonwebtoken');


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
        expiresIn: '300s'
    });

    res.json({
        token
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



//Ensure
router.post('/m/ensureToken', ensureToken, (req, res) => {

    console.log(req.token)

    jwt.verify(req.token, 'process.env.SECRETO', (err, data) => {
        if (err) {
            res.sendStatus(403);
        } else {
            res.sendStatus(200);
        }
    });

});



//Ensure
router.post('/m/confirm-pass', (req, res) => {
    const {username,pass} = req.body;

    const quer = pool.query('Select * from users_ where username = ?',[username]);

    quer.then(async(resp)=>{
        if (resp.length > 0){

            const passDb = resp[0].pass;
            console.log(passDb, pass);
            const validpass = await helpers.matchPass(pass,passDb);
            if(validpass){

                const {
                    id
                } = req.body;
                const user = id;
                const token = jwt.sign({
                    user
                }, 'process.env.SECRETO', {
                    expiresIn: '300s'
                });

                const user_info = resp[0];

                const responce = {};
                responce.token = token;
                responce.user_info = user_info;
                
            
                res.json({
                    responce
                });
            

            }else{
                res.sendStatus(403);
            }


        }else{
            res.sendStatus(405);
        }
        
    }).catch((err)=>{
        console.log(err);
    });


   
});


router.get('/', (req,res) => {


    res.send('try contact me');

    
});





module.exports = router;