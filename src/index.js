require('dotenv').config()
'use strict';

// Require process, so we can mock environment variables
const process = require('process');

// [START app]
const express = require('express');
const hbs = require('express-handlebars');
const morgan = require('morgan');
const jwt = require('jsonwebtoken');
const path = require('path');
const crypto = require('crypto');
const flash = require('connect-flash');
const session = require('express-session'); 
const mysqlStore = require('express-mysql-session');
const passport = require('passport');
const favicon = require('express-favicon');
const multerS3 = require('multer-s3');
const aws = require('aws-sdk');
const multer = require('multer');


const app = express();
require('./lib/passport');
const {database} = require('./keys');


aws.config.update({
  secretAccessKey: '+DjRHGAqke5wPu4AX8uheDz/Thy9coBgfOdR1u1N',
  accessKeyId: 'AKIAYCDWDTGU7RVVBGVU',
  region: 'us-east-1'
});


var s3 = new aws.S3();

//aws s3 trustfundendtoend


var uploads3 = multer({
  storage: multerS3({
      s3: s3,
      bucket: 'trustfundendtoend',
      key: function (req, file, cb) {
          console.log(file);
          let customFileName = crypto.randomBytes(18).toString('hex');
          fileExtension = file.originalname.split('.')[1]; // get file extension from original file name
          cb(null, customFileName + '.' + fileExtension);      }
  })
});


//local storage
/*const multer = require('multer');

const storage = multer.diskStorage({
  destination: 'public/uploads',
  filename: (req, file, cb) => {
    let customFileName = crypto.randomBytes(18).toString('hex');
    fileExtension = file.originalname.split('.')[1]; // get file extension from original file name
    cb(null, customFileName + '.' + fileExtension);
  }
});
*/




app.enable('trust proxy');

// Middleware

app.use(session({
  secret: 'seceto',
  resave: false,
  saveUninitialized: false,
  store: new mysqlStore(database)
}));

app.use(morgan('dev'));
app.use(express.urlencoded({
  extended: false
}));
app.use(express.json());
app.use(passport.initialize()); 
app.use(passport.session());
app.use(multer({
  storage: multerS3({
    s3: s3,
    bucket: 'trustfundendtoend',
     acl: 'public-read',
    metadata: function (req, file, cb) {
      cb(null, {fieldName: file.fieldname});
    },
    key: function (req, file, cb) {
        console.log(file);
        let customFileName = crypto.randomBytes(18).toString('hex');
        fileExtension = file.originalname.split('.')[1]; // get file extension from original file name
        cb(null, customFileName + '.' + fileExtension);      }
})
}).any('fx'));




// flash middle-ware
app.use(flash());


//Globar Variables
app.use((req,res,next) => {
  //variables para mensajes Flash
  app.locals.success = req.flash('success');
  app.locals.message = req.flash('message');
  app.locals.errores = req.flash('errores');

  // Vairable local de usuario
  app.locals.user = req.user;
  next();
});


//ROUTES
app.use(require('./routes/'));
app.use(require('./routes/api'));
app.use(require('./routes/opp'));
app.use('/auth',require('./routes/auth'));
app.use('/projects',require('./routes/projects'));
app.use('/news',require('./routes/news'));
app.use('/costumers', require('./routes/costumers'));


// Publics
app.use(express.static(path.join(__dirname, '../public/')));

app.use(favicon(path.join(__dirname,'../public/','ca64e9572384260dcc6b9b2d76bb8fe5','favicon.ico')));


  app.set('port', process.env.PORT || 4000); //puerto 
  app.set('views', path.join(__dirname, 'views')); //vistas
  // view engine
  app.engine('.hbs', hbs({
    defaultLayout: 'main',
    layoutsDir: path.join(app.get('views'), 'layouts'),
    partialsDir: path.join(app.get('views'), 'partials'),
    extname: '.hbs',
    helpers : require ('./lib/handlebars')
  }));
  
app.set('view engine', '.hbs');



  

  // Start server
  
  app.listen(app.get('port'), () => {
    console.log(`App listening on port ${app.get('port')}`);
  });