require('dotenv').config()
'use strict';


module.exports = {
    database: {
        host: PROCESS.ENV.DB_HOST,
        user: PROCESS.ENV.DB_USER,
        password: PROCESS.ENV.DB_PASS,
        database: PROCESS.ENV.DB_T
    }
}