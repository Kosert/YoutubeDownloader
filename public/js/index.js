window.onload = function () {
    var inputURL = document.getElementById('input-url')
    var button = document.getElementById('button-download')
    var lastUrl = ""

    var errorAlert = document.getElementById('div-error')
    if(window.location.href.indexOf("error") > -1) {
        errorAlert.hidden = false
     }

    function onInput() {
        if (inputURL.value === "") {
            lastUrl = ""
            failed()
        }
        else if (inputURL.value !== "" && lastUrl !== inputURL.value) {
            startLoading()
            lastUrl = inputURL.value
            var param = "url=" + lastUrl
            xmlhttp = new XMLHttpRequest()
            xmlhttp.open("POST", "/youtube/validateURL", true)
            xmlhttp.onreadystatechange = function () {
                if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                    if (xmlhttp.responseText === "true") {
                        success()
                    }
                    else {
                        failed()
                    }
                }
            }
            xmlhttp.send(param)
        }
    }

    function callOnInput() {
        setTimeout(onInput, 0)
    }

    inputURL.addEventListener('keyup', callOnInput)
    inputURL.addEventListener('paste', callOnInput)

    var fulls = []
    var videoOnly = []
    var audioOnly = []

    var videoSelect = document.getElementById('video-select')
    var audioSelect = document.getElementById('audio-select')

    videoSelect.addEventListener('change', function () {
        generateContainer()
    })

    audioSelect.addEventListener('change', function () {
        generateContainer()
    })

    var convertButton = document.getElementById('convert')
    convertButton.addEventListener('click', function () {
        convertButton.disabled = true
        document.getElementById('div-convert-loading').hidden = false
        document.getElementById('form-custom').hidden = true
        var progress = document.getElementById('progress-convert')
        progress.classList.add("progress-bar-striped")
        progress.classList.remove("bg-success")
        progress.innerText = "Converting..."   

        var cookieChecker = setInterval(function() {
            var status = getCookie('downloadComplete')
            if (status === "true") {
                progress.classList.add("bg-success")
                progress.classList.remove("progress-bar-striped")    
                progress.innerText = "Download started"      
                document.cookie = 'downloadComplete=; Max-Age=-99999999;' 
                clearInterval(cookieChecker)                          
            }
            else {
                //nothin
            }
        })
        
        document.getElementById("form-custom").submit()
    })

    button.addEventListener('click', function () {

        errorAlert.hidden = true

        var divLoading = document.getElementById('div-loading')
        divLoading.hidden = false

        var divInfo = document.getElementById('div-info')
        divInfo.hidden = true

        var divCustom = document.getElementById('div-custom')
        divCustom.hidden = true

        var divTracks = document.getElementById('div-tracks')
        divTracks.hidden = true

        var divFulls = document.getElementById('div-fulls')
        divFulls.hidden = true

        var fullsTable = document.getElementById('fulls')
        var videoTable = document.getElementById('videoOnly')
        var audioTable = document.getElementById('audioOnly')
        clearAndLoad(fullsTable)
        clearAndLoad(videoTable)
        clearAndLoad(audioTable)

        document.getElementById('div-convert-loading').hidden = true
        document.getElementById('form-custom').hidden = false

        while (videoSelect.options.length > 0) {
            videoSelect.remove(0)
        }

        while (audioSelect.options.length > 0) {
            audioSelect.remove(0)
        }

        fulls = []
        videoOnly = []
        audioOnly = []

        var param = "url=" + lastUrl
        xmlhttp = new XMLHttpRequest()
        xmlhttp.open("POST", "/youtube/getInfo", true)
        xmlhttp.onreadystatechange = function () {
            divLoading.hidden = true
            if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                var response = JSON.parse(xmlhttp.responseText)

                if (response.error) {
                    errorAlert.hidden = false
                    errorAlert.children[0].innerText = "Error: " + response.error
                }
                else {
                    for (f of response.formats) {
                        if (!f.container) continue

                        if (f.encoding && f.audioEncoding) {
                            fulls.push(f)
                        }
                        else if (f.encoding && !f.audioEncoding) {
                            videoOnly.push(f)
                            var option = document.createElement('option')
                            option.value = f.itag
                            option.text = formatToString(f)
                            videoSelect.add(option)
                        }
                        else {
                            audioOnly.push(f)
                            var option = document.createElement('option')
                            option.value = f.itag
                            option.text = formatToString(f)
                            audioSelect.add(option)
                        }
                    }

                    document.getElementById('title').innerText = response.title
                    document.getElementById('description').innerText = "Uploaded by: " + response.author
                    document.getElementById('thumbnail').src = response.thumb

                    document.getElementById('dummy-name').value = response.title
                    document.getElementById('dummy-url').value = response.url

                    divInfo.hidden = false
                    divFulls.hidden = false
                    divTracks.hidden = false

                    convertButton.disabled = false

                    divCustom.hidden = false

                    populateTable(fullsTable, fulls)
                    populateTable(videoTable, videoOnly)
                    populateTable(audioTable, audioOnly)

                    generateContainer()
                }
            }
        }
        xmlhttp.send(param)

    })

    function formatToString(f) {

        var encoding = f.encoding ? f.encoding : f.audioEncoding
        var container = f.container
        var quality = f.encoding ? f.resolution + (f.fps ? " " + f.fps + "fps" : "") : f.audioBitrate + " kbps"
        return encoding + " | " + container + " | " + quality
    }

    function populateTable(table, data) {
        for (f of data) {
            var tbody = table.tBodies[0]
            var row = tbody.insertRow(tbody.rows.length)
            if (f.encoding) {
                row.insertCell().innerHTML = f.encoding
            }
            if (f.audioEncoding) {
                row.insertCell().innerHTML = f.audioEncoding
            }
            row.insertCell().innerHTML = f.container
            row.insertCell().innerHTML = f.encoding ? f.resolution + (f.fps ? " " + f.fps + "fps" : "") : f.audioBitrate + " kbps"
            var link = document.createElement('a')
            link.href = f.url
            link.download = document.getElementById("title").innerText
            var linkText = document.createTextNode('Download')
            link.appendChild(linkText)
            link.title = 'Click here'
            row.insertCell().appendChild(link)
        }
    }

    function clearAndLoad(table) {
        var oldTbody = table.getElementsByTagName('tbody')[0]
        var newTbody = document.createElement('tbody')

        table.replaceChild(newTbody, oldTbody)
    }

    function generateContainer() {
        var video = videoOnly[videoSelect.selectedIndex]
        var audio = audioOnly[audioSelect.selectedIndex]

        var convertButton = document.getElementById('convert')
        var canBeMP4 = true
        var canBeWEBM = true

        if (video.container === 'webm' || audio.container === 'webm') {
            canBeMP4 = false
        }
        if (video.container !== 'webm' || audio.container !== 'webm') {
            canBeWEBM = false
        }

        var container = document.getElementById("dummy-container")
        if (canBeMP4) {
            container.value = "mp4"
            convertButton.value = "Convert to MP4"
        }
        else if (canBeWEBM) {
            container.value = "webm"
            convertButton.value = "Convert to WEBM"
        }
        else {
            container.value = "mkv"
            convertButton.value = "Convert to MKV"
        }
    }

    function getCookie(cname) {
        var name = cname + "=";
        var decodedCookie = decodeURIComponent(document.cookie);
        var ca = decodedCookie.split(';');
        for(var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) == 0) {
                return c.substring(name.length, c.length);
            }
        }
        return "";
    }

    function startLoading() {
        inputURL.classList.add("loading")
        inputURL.classList.remove("is-valid")
        inputURL.classList.remove("is-invalid")
        button.classList.add('btn-secondary')
        button.classList.remove('btn-primary')
        button.disabled = true
    }

    function success() {
        inputURL.classList.remove("loading")
        inputURL.classList.add("is-valid")
        button.classList.add('btn-primary')
        button.classList.remove('btn-secondary')
        button.disabled = false
    }

    function failed() {
        inputURL.classList.remove("loading")
        inputURL.classList.add("is-invalid")
        button.classList.add('btn-secondary')
        button.classList.remove('btn-primary')
        button.disabled = true
    }

    if (inputURL.value !== "") {
        callOnInput()
    }
    console.log("Init completed.")
}
