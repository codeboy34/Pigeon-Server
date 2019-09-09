const chalk = require('chalk');
const error = chalk.bold.red;
const warning = chalk.keyword('orange');
const message = chalk.blue
const start = chalk.yellow

module.exports = class Log {

    constructor(_TAG) {

        this.TAG = "[ " + _TAG + " ]"

        this.log = function (msg) {
            console.log(message(this.TAG + " " + msg))
        }

        this.error = function (err) {
            console.log(error(this.TAG + " " + err))
        }

        this.warning = function (wrng) {
            console.log(warning(this.TAG + " " + wrng))
        }

        this.start = function (msg) {
            console.log(start(this.TAG + " " + msg))
        }
    }
}