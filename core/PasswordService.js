const bcrypt = require('bcrypt');
const config = require('./../config/app');

class PasswordService {
  async createHash(password) {
    return new Promise((resolve, reject) => {
      bcrypt.genSalt(config.password.salt, (error, salt) => {
        if (error) {
          log.error('Salt not created');
          resolve(false);
            
          return;
        }
        
        bcrypt.hash(password, salt, (error, hash) => {
          if (error) {
            log.error('Hash not created');
            resolve(false);
            
            return;
          }

          resolve(hash);
        });
      });   
    });
  }

  async compareHash(password, hash) {
    return new Promise((resolve, reject) => {      
      bcrypt.compare(password, hash, (error, result) => {
        if (error) {
          log.error('Comparison error');
          resolve(false);

          return;
        }

        resolve(result);
      });
    })
  }
}

module.exports = new PasswordService();