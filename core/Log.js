const colors = require('colors');

class Log {
  info(string) {
    console.log(colors.green(string));
  }

  error(string) {
    console.log(colors.red(string));
  }

  normal(string) {
    console.log(colors.white(string));
  }
}

module.exports = new Log();