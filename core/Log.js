const colors = require('colors');

class Log {
  info(string) {
    console.log(colors.green(string));
  }

  error(string) {
    console.log(colors.red(string));
  }
}

module.exports = Log;