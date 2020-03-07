const qs = require("querystring")
const path = require("path")
const fs = require("fs")

const ytdl = require("ytdl-core")
const morgan = require("morgan")
const tmp = require("tmp")
const ffmpeg = require("fluent-ffmpeg")

const log = require("./log")
const parser = require("./parser")

const express = require("express")
const app = express()

tmp.setGracefulCleanup()

app.use(morgan("dev"))

if (process.env.NODE_ENV != "production")
    app.use(express.static(path.join(__dirname, "/devel")))

app.use(express.static(path.join(__dirname, "/public")))

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "/public", "index.html"))
})

app.get("/faq", (req, res) => {
    res.sendFile(path.join(__dirname, "/public", "faq.html"))
})

app.post("/validateURL", (req, res) => {
    getPostData(req, function(post) {
        const url = post["url"]

        const result = ytdl.validateURL(url)
        res.end(result.toString())
    })
})

app.post("/getInfo", (req, res) => {
    getPostData(req, function(post) {
        const url = post["url"]
        ytdl.getInfo(url, function(err, info) {
            if (err) {
                const response = {
                    error: err.message.replace(/&quot;/g, '"')
                }
                res.json(response)
            } else {
                let thumbnail = null
                try {
                    thumbnail = info.player_response.videoDetails.thumbnail.thumbnails[0].url
                } catch (error) {
                    thumbnail = info.thumbnail_url
                }

                const parsedFormats = parser.parseFormats(info.formats)
                if (!parsedFormats) {
                    res.json({
                        error: "Parse error, try another video"
                    })
                    return
                }

                const response = {
                    title: info.title,
                    length: info.length_seconds,
                    thumb: thumbnail,
                    author: info.author.name,
                    url: info.video_url,
                    formats: parsedFormats
                }

                res.json(response)
            }
        })
    })
})

app.post("/convert", log.logActivity, (req, res) => {
    getPostData(req, function(post) {
        const url = post["url"]
        const audioItag = post["audio"]
        const videoItag = post["video"]
        const name = post["name"]
        const container = post["container"]

        tmp.file(function _tempFileCreated(err, audioPath, fd, audioCleanupCallback) {
            if (err) throw err

            ytdl(url, { quality: audioItag })
                .pipe(fs.createWriteStream(audioPath))
                .on("finish", function() {
                    tmp.file({ postfix: "." + container }, function _tempFileCreated(err, path, fd, cleanupCallback) {
                        if (err) throw err

                        ffmpeg()
                            .input(ytdl(url, { quality: videoItag }))
                            .videoCodec("copy")
                            .input(audioPath)
                            .audioCodec("copy")
                            .save(path)
                            .on("error", function(err, stdout, stderr) {
                                console.log(err.message)
                                console.log("stdout:\n" + stdout)
                                console.log("stderr:\n" + stderr)
                                res.redirect("/youtube/error")
                                cleanupCallback()
                                audioCleanupCallback()
                            })
                            .on("end", function() {
                                res.cookie("downloadComplete", "true")
                                res.download(path, name + "." + container, function(err) {
                                    cleanupCallback()
                                    audioCleanupCallback()
                                })
                            })
                    })
                })
        })
    })
})

app.get("/error", (req, res) => {
    res.sendFile(path.join(__dirname, "/public", "index.html"))
})

const server = app.listen(2137, () => {
    console.log(`Server started on ` + 2137)
})

function getPostData(req, callback) {
    let body = ""
    req.on("data", function(data) {
        body += data

        // Too much POST data, kill the connection!
        // 1e3 === 1 * Math.pow(10, 3) === 1 * 1000 ~~~ 1KB
        if (body.length > 1e3) req.connection.destroy()
    })

    req.on("end", function() {
        const post = qs.parse(body)
        callback(post)
    })
}
