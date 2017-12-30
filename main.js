var qs = require('querystring')
var path = require('path')
var fs = require('fs')

var ytdl = require('ytdl-core')
var morgan = require('morgan')
var tmp = require('tmp')
var ffmpeg = require('fluent-ffmpeg')

var express = require('express')
var app = express()

tmp.setGracefulCleanup();

app.use(morgan('dev'))

app.use(express.static(path.join(__dirname, '/public')))

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, "/public", "index.html"))
})

app.post('//validateURL', (req, res) => {

    getPostData(req, function(post) {
        var url = post['url']

        var result = ytdl.validateURL(url)
        res.end(result.toString())
    })
})

app.post('//getInfo', (req, res) => {

    getPostData(req, function(post) {
        var url = post['url']
        ytdl.getInfo(url, function(err, info){
            if(err)
            {
                var response = {
                    error: err.message.replace(/&quot;/g, '\"')
                }
                res.json(response)
            }
            else
            {
                var response = {
                    title: info.title,
                    thumb: info.thumbnail_url,
                    author: info.author.name,
                    url: info.video_url,
                    formats: info.formats
                }

                res.json(response)
            }
        })
    })
});

app.post('//convert', (req, res) => {
   
    getPostData(req, function(post) {
        var url = post['url']
        var audioItag = post['audio']
        var videoItag = post['video']     
        var name = post['name']
        var container = post['container'] 

        tmp.file(function _tempFileCreated(err, audioPath, fd, audioCleanupCallback) {
            if (err) throw err;

            ytdl(url, {quality: audioItag})
            .pipe(fs.createWriteStream(audioPath))
            .on('finish', function(){
                tmp.file({ postfix: '.' + container }, function _tempFileCreated(err, path, fd, cleanupCallback) {
                    if (err) throw err;
                    
                    ffmpeg()
                    .input(ytdl(url, {quality: videoItag})).videoCodec('copy')
                    .input(audioPath).audioCodec('copy')
                    .save(path)
                    .on('error', function(err, stdout, stderr) {
                        console.log(err.message); //this will likely return "code=1" not really useful
                        console.log("stdout:\n" + stdout)
                        console.log("stderr:\n" + stderr) //this will contain more detailed debugging info
                        res.redirect('//error')
                        cleanupCallback()
                        audioCleanupCallback()
                    }).
                    on('end', function() {
                        res.cookie('downloadComplete', 'true')
                        res.download(path, name + "." + container , function(err) {
                            cleanupCallback()
                            audioCleanupCallback()
                        })
                    })
                  });
            })
          });
    })
});

app.get('//error', (req, res) => {
    res.sendFile(path.join(__dirname, "/public", "index.html"))
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