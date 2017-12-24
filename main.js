var ytdl = require('ytdl-core')
var qs = require('querystring')
var path = require('path')
var morgan = require('morgan')

var express = require('express')
var app = express()

app.use(morgan('dev'))
//TODO REMOVE "/YOUTUBE" BEFORE COMMITING
app.use('/youtube', express.static(path.join(__dirname, '/public')))

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, "/public", "index.html"))
})

//TODO "//validateURL" BEFORE COMMITING
app.post('/youtube/validateURL', (req, res) => {

    var body = '';
    req.on('data', function (data) {
        body += data;

        // Too much POST data, kill the connection!
        // 1e3 === 1 * Math.pow(10, 3) === 1 * 1000 ~~~ 1KB
        if (body.length > 1e3)
            req.connection.destroy();
    })

    req.on('end', function () {
        var post = qs.parse(body);
        var url = post['url']

        var result = ytdl.validateURL(url)

        res.end(result.toString())
    })
})

//TODO "//getInfo" BEFORE COMMITING
app.post('/youtube/getInfo', (req, res) => {

    getPostData(req, function(post) {
        var url = post['url']
        ytdl.getInfo(url, function(err, info){
            if(err)
            {
                var response = {
                    error: err.message.replace(/&quot;/g, '\"')
                }
                res.end(JSON.stringify(response))
            }
            else
            {
                //for(f of info.formats) console.log(f.type, f.encoding, f.quality, f.container, f.resolution)
                var response = {
                    title: info.title,
                    thumb: info.thumbnail_url,
                    author: info.author.name,
                    url: info.video_url,
                    formats: info.formats
                }

                res.end(JSON.stringify(response))
            }
        })
    })
});

//TODO "//getConvertUrl" BEFORE COMMITING
app.post('/youtube/getConvertUrl', (req, res) => {
   
    getPostData(req, function(post) {
        var url = post['url']
        var audioItag = post['audio']
        var videoItag = post['video']        

        //TODO


        ytdl.getInfo(url, function(err, info){
            if(err)
            {
                var result = {
                    error: err.message.replace(/&quot;/g, '\"')
                }
                res.end(JSON.stringify(result))
            }
            else
            {
                //for(f of info.formats) console.log(f.type, f.encoding, f.quality, f.container, f.resolution)
                res.end(JSON.stringify(info.formats))
            }
        })
    })
});

var server = app.listen(2137, () => {
    console.log(`Server started on ` + 2137);
})

function getPostData(req, callback) {

    var body = '';
    req.on('data', function (data) {
        body += data;

        // Too much POST data, kill the connection!
        // 1e3 === 1 * Math.pow(10, 3) === 1 * 1000 ~~~ 1KB
        if (body.length > 1e3)
            req.connection.destroy();
    })

    req.on('end', function () {
        var post = qs.parse(body);
        callback(post)
    })
}