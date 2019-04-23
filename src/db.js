const mysql = require('mysql');
const {promisify} = require('util');


const {database} = require('./keys');

const pool = mysql.createPool(database);

pool.getConnection((err,conn)=>{
    if(err){
        if(err.code === 'PROTOCOL_CONNECTION_LOST'){
            console.log('database connection was closed')
        }
        if(err.code === 'ER_CON_COUNT_ERROR'){
            console.log('database has to many connections')
        }
        if(err.code === 'ECONNREFUSED'){
            console.log('database access denied'+ err)
        }
    }

    if(conn){
        console.log('connection success /heroku');
        conn.release();
        return;
    }
});



pool.query = promisify(pool.query)

module.exports = pool;