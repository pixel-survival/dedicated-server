const colors = require('colors');

/**
 * Логирование.
 */
class Log {
    /**
     * Вывод информации.
     * 
     * @param {string} string Текст лога. 
     */
    info(string) {
        console.log(colors.green(string));
    }

    /**
     * Вывод ошибки.
     * 
     * @param {string} string Текст лога. 
     */
    error(string) {
        console.log(colors.red(string));
    }
}

module.exports = Log;