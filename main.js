var ytdl = require('ytdl-core')
var qs = require('querystring')

var express = require('express')
var app = express()

app.use(express.static('public'))

app.get('/', (req, res) => {
    res.sendFile("index.html")
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

var server = app.listen(2137, () => {
    console.log(`Server started on ` + 2137);
})