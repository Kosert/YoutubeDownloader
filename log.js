// utility log functions
const fs = require('fs')
const stream = fs.createWriteStream("log.log", { flags: "a" })

module.exports = {

    enableActivityLog: false,

    info: function (...messages) {
        messages.unshift('\033[37m[INFO]')
        messages.push('\033[0m')
        console.log(...messages)

        messages.shift()
        messages.pop()
        messages.unshift('[INFO]')
        saveToFile(...messages)
    },

    warning: function (...messages) {
        messages.unshift('\033[1;33m[WARN]\033[33m')
        messages.push('\033[0m')
        console.log(...messages)

        messages.shift()
        messages.pop()
        messages.unshift('[WARN]')
        saveToFile(...messages)
    },

    error: function (...messages) {
        messages.unshift('\033[1;31m[ERROR]\033[31m')
        messages.push('\033[0m')
        console.log(...messages)

        messages.shift()
        messages.pop()
        messages.unshift('[ERROR]')
        saveToFile(...messages)
    },

    logActivity: (req, res, next) => {

        if (this.enableActivityLog) {
            if (next)
                next()
            return
        }

        const time = new Date().toISOString().replace("T", " ")
        const login = req.uid ? req.uid : "@"
        const ua = req.headers['user-agent']
        const path = req.originalUrl
        const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress
        const method = req.method
        const entry = time + "\t" + method + "\t" + path + "\t" + login + "\t" + ip + "\t" + ua + "\n"
        stream.write(entry)
        if (next)
            next()
    }
}

function saveToFile(...messages) {
    let entry = new Date().toISOString().replace("T", " ")
    messages.forEach(msg => {
        if (msg instanceof Error)
            entry += " " + msg.name + ": " + msg.message + "\n" + msg.stack ? msg.stack : ""
        else if (typeof msg === "object")
            entry += JSON.stringify(msg)
        else
            entry += msg
    })
    entry += "\n"
    stream.write(entry)
}
