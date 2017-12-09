var ytdl = require('ytdl-core')
var qs = require('querystring')
var path = require('path')

var express = require('express')
var app = express()

app.use(express.static('public'))

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, "/public", "index.html"))
})

app.post('/validateURL', (req, res) => {

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
        // use post['blah'], etc.
        var url = post['url']

        var result = ytdl.validateURL(url)

        res.end(result.toString())
    })
})

app.post('/getInfo', (req, res) => {
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
        // use post['blah'], etc.
        var url = post['url']

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