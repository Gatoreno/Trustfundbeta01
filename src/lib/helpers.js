const bcrypt = require('bcryptjs');
const helpers = {};

helpers.encryptPass = async (pass) =>{
    const salt = await bcrypt.genSalt(10); // genera los saltos de encriptación
    const hash = await bcrypt.hash(pass,salt);
    return hash;
};

helpers.matchPass = async (pass, savedPass) => {
    try{
        return await bcrypt.compare(pass, savedPass);
    }catch(err){
        console.log(err);
    }
};


module.exports = helpers