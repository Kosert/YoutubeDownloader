window.onload = function () {
    var inputURL = document.getElementById('input-url')
    var button = document.getElementById('button-download')
    var lastUrl = ""

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

    button.addEventListener('click', function () {

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

        var videoSelect = document.getElementById('video-select')
        var audioSelect = document.getElementById('audio-select')

        while (videoSelect.options.length > 0) {
            videoSelect.remove(0)
        }

        while (audioSelect.options.length > 0) {
            audioSelect.remove(0)
        }

        var fulls = []
        var videoOnly = []
        var audioOnly = []

        var param = "url=" + lastUrl
        xmlhttp = new XMLHttpRequest()
        xmlhttp.open("POST", "/youtube/getInfo", true)
        xmlhttp.onreadystatechange = function () {
            divLoading.hidden = true
            if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                var response = JSON.parse(xmlhttp.responseText)

                if (response.error) {
                    fullsTable.tBodies[0].deleteRow(0)
                    videoTable.tBodies[0].deleteRow(0)
                    audioTable.tBodies[0].deleteRow(0)

                    var errorRow = fullsTable.tBodies[0].insertRow(0)
                    var errorCell = errorRow.insertCell()
                    errorCell.colSpan = "5"
                    errorCell.classList.add("alert", "alert-danger")
                    errorCell.innerText = "Error: " + response.error
                }
                else {
                    console.log(response)
                    for (f of response.formats) {
                        if (f.encoding && f.audioEncoding) {
                            fulls.push(f)
                        }
                        else if (f.encoding && !f.audioEncoding) {
                            videoOnly.push(f)
                            var option = document.createElement('option')
                            option.setAttribute('data-itag', f.itag)
                            option.text = formatToString(f)
                            videoSelect.add(option)
                        }
                        else {
                            var option = document.createElement('option')
                            option.setAttribute('data-itag', f.itag)
                            option.text = formatToString(f)
                            audioSelect.add(option)
                            audioOnly.push(f)
                        }
                    }

                    document.getElementById('title').innerText = response.title
                    document.getElementById('description').innerText = "Uploaded by: " + response.author
                    document.getElementById('thumbnail').src = response.thumb
                    divInfo.setAttribute('data-url', response.url)
                    
                    divInfo.hidden = false
                    divFulls.hidden = false
                    divTracks.hidden = false

                    var convertOld = document.getElementById('convert')
                    var convertButton = convertOld.cloneNode();
                    convertOld.parentNode.replaceChild(convertButton, convertOld);
                    convertButton.innerText = "Convert"

                    convertButton.addEventListener('click', function () {
                        convertButton.disabled = true
                        var videoItag = videoSelect.options[videoSelect.selectedIndex].getAttribute('data-itag')
                        var audioItag = audioSelect.options[audioSelect.selectedIndex].getAttribute('data-itag')
                        convert(divInfo.getAttribute('data-url'), videoItag, audioItag)
                    })

                    divCustom.hidden = false

                    populateTable(fullsTable, fulls)
                    populateTable(videoTable, videoOnly)
                    populateTable(audioTable, audioOnly)

                    console.log("fulls:")
                    console.log(fulls)
                    console.log("video:")
                    console.log(videoOnly)
                    console.log("audio:")
                    console.log(audioOnly)
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

    function convert(url, videoTag, audioTag) {
        
        var params = "url=" + url + "&video=" + videoTag + "&audio=" + audioTag
        xmlhttp = new XMLHttpRequest()
        xmlhttp.open("POST", "/youtube/getConvertUrl", true)
        xmlhttp.onreadystatechange = function () {
            if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                var response = JSON.parse(xmlhttp.responseText)

                if(response.error)
                {
                    //TODO
                }
                else
                {
                    window.location.href = response.url
                }
            }
        }
        xmlhttp.send(params)
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
/*
        var loadingDiv = document.createElement('div')
        loadingDiv.classList.add('progress')
        var progressBar = document.createElement('div')
        progressBar.classList.add('progress-bar', 'progress-bar-striped', 'progress-bar-animated', 'w-100')
        loadingDiv.appendChild(progressBar)
        var loadingRow = newTbody.insertRow(0)
        var loadingCell = loadingRow.insertCell()
        loadingCell.style = "height: 50px;"
        loadingCell.classList.add('align-middle')
        loadingCell.appendChild(loadingDiv)
        loadingCell.colSpan = "5"
*/
        table.replaceChild(newTbody, oldTbody)
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

    console.log("Init completed.")
}
