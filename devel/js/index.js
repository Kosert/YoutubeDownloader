window.onload = function () {
    var inputURL = document.getElementById("input-url")
    var button = document.getElementById("button-download")
    const loader = this.document.getElementById("loader")
    var lastUrl = ""

    var errorAlert = document.getElementById("div-error")
    if (window.location.href.indexOf("error") > -1) {
        errorAlert.hidden = false
    }

    function onInput() {
        if (inputURL.value === "") {
            lastUrl = ""
            failed()
            return
        }

        var url
        if (!inputURL.value.startsWith("http"))
            url = "https://" + inputURL.value
        else url = "https://" + inputURL.value
        if (!isValidUrl(url)) {
            lastUrl = inputURL.value
            failed()
            return
        }

        if (inputURL.value !== "" && lastUrl !== inputURL.value) {
            lastUrl = inputURL.value
            var param = "url=" + lastUrl
            xmlhttp = new XMLHttpRequest()
            xmlhttp.open("POST", "/validateURL", true)
            xmlhttp.onreadystatechange = function () {
                if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                    if (xmlhttp.responseText === "true") {
                        success()
                    } else {
                        failed()
                    }
                }
            }
            xmlhttp.send(param)
        }
    }

    var inputTimeout
    function callOnInput() {
        startLoading()
        clearTimeout(inputTimeout)
        inputTimeout = setTimeout(onInput, 500)
    }

    inputURL.addEventListener("keyup", callOnInput)
    inputURL.addEventListener("paste", callOnInput)

    var fulls = []
    var videoOnly = []
    var audioOnly = []

    var videoSelect = document.getElementById("video-select")
    var audioSelect = document.getElementById("audio-select")

    videoSelect.addEventListener("change", function () {
        generateContainer()
    })

    audioSelect.addEventListener("change", function () {
        generateContainer()
    })

    var convertButton = document.getElementById("convert")
    convertButton.addEventListener("click", function () {
        convertButton.disabled = true
        document.getElementById("div-convert-loading").hidden = false
        document.getElementById("form-custom").hidden = true
        var progress = document.getElementById("progress-convert")
        progress.classList.add("progress-bar-striped")
        progress.classList.remove("bg-success")
        progress.innerText = "Converting..."

        var cookieChecker = setInterval(function () {
            var status = getCookie("downloadComplete")
            if (status === "true") {
                progress.classList.add("bg-success")
                progress.classList.remove("progress-bar-striped")
                progress.innerText = "Download started"
                document.cookie = "downloadComplete=; Max-Age=-99999999;"
                clearInterval(cookieChecker)
            } else {
                //nothin
            }
        })

        document.getElementById("form-custom").submit()
    })

    button.addEventListener("click", function () {
        errorAlert.hidden = true

        var divLoading = document.getElementById("div-loading")
        divLoading.hidden = false

        var divInfo = document.getElementById("div-info")
        divInfo.hidden = true

        var divCustom = document.getElementById("div-custom")
        divCustom.hidden = true

        var divTracks = document.getElementById("div-tracks")
        divTracks.hidden = true

        var divFulls = document.getElementById("div-fulls")
        divFulls.hidden = true

        var fullsTable = document.getElementById("fulls")
        var videoTable = document.getElementById("videoOnly")
        var audioTable = document.getElementById("audioOnly")
        clearAndLoad(fullsTable)
        clearAndLoad(videoTable)
        clearAndLoad(audioTable)

        document.getElementById("div-convert-loading").hidden = true
        document.getElementById("form-custom").hidden = false

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
        xmlhttp.open("POST", "/getInfo", true)
        xmlhttp.onreadystatechange = function () {
            divLoading.hidden = true
            if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                var response = JSON.parse(xmlhttp.responseText)

                if (response.error) {
                    errorAlert.hidden = false
                    errorAlert.children[0].innerText = "Error: " + response.error
                } else {

                    for (f of response.formats.universal) {
                        fulls.push(f)
                    }
                    for (f of response.formats.videos) {
                        videoOnly.push(f)
                        var option = document.createElement("option")
                        option.value = f.itag
                        option.text = f.codecs + " | " + f.label
                        videoSelect.add(option)
                    }
                    for (f of response.formats.audios) {
                        audioOnly.push(f)
                        var option = document.createElement("option")
                        option.value = f.itag
                        option.text = f.codecs + " | " + f.label
                        audioSelect.add(option)
                    }

                    document.getElementById("title").innerText = response.title
                    document.getElementById("description").innerText = "Uploaded by: " + response.author
                    document.getElementById("thumbnail").src = response.thumb

                    document.getElementById("dummy-name").value = response.title
                    document.getElementById("dummy-url").value = response.url

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

    function populateTable(table, data) {
        for (f of data) {
            var tbody = table.tBodies[0]
            var row = tbody.insertRow(tbody.rows.length)
            row.insertCell().innerHTML = f.codecs
            row.insertCell().innerHTML = "<b>" + f.container + "</b>"
            row.insertCell().innerHTML = f.label
            var link = document.createElement("a")
            link.href = f.url
            link.target = "_blank"
            link.rel = "noopener noreferrer"
            link.download = document.getElementById("title").innerText
            link.title = "Click here to download"
            link.classList.add("btn", "btn-info")
            var linkText = document.createTextNode("Download")
            link.appendChild(linkText)
            const cell = row.insertCell()
            cell.classList.add("align-middle")
            cell.appendChild(link)
        }
    }

    function clearAndLoad(table) {
        var oldTbody = table.getElementsByTagName("tbody")[0]
        var newTbody = document.createElement("tbody")

        table.replaceChild(newTbody, oldTbody)
    }

    function generateContainer() {
        var video = videoOnly[videoSelect.selectedIndex]
        var audio = audioOnly[audioSelect.selectedIndex]

        if (!video || !audio) {
            document.getElementById("div-custom").hidden = true   
            return
        }

        const convertButton = document.getElementById("convert")
        var canBeMP4 = true
        var canBeWEBM = true

        if (video.container === "webm" || audio.container === "webm") {
            canBeMP4 = false
        }
        if (video.container !== "webm" || audio.container !== "webm") {
            canBeWEBM = false
        }

        var container = document.getElementById("dummy-container")
        if (canBeMP4) {
            container.value = "mp4"
            convertButton.value = "Convert to MP4"
        } else if (canBeWEBM) {
            container.value = "webm"
            convertButton.value = "Convert to WEBM"
        } else {
            container.value = "mkv"
            convertButton.value = "Convert to MKV"
        }
    }

    function getCookie(cname) {
        var name = cname + "="
        var decodedCookie = decodeURIComponent(document.cookie)
        var ca = decodedCookie.split(";")
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i]
            while (c.charAt(0) == " ") {
                c = c.substring(1)
            }
            if (c.indexOf(name) == 0) {
                return c.substring(name.length, c.length)
            }
        }
        return ""
    }

    function startLoading() {
        loader.hidden = false
        inputURL.style.width = "calc(100% - 50px)"
        inputURL.classList.remove("valid")
        inputURL.classList.remove("invalid")
        button.classList.add("btn-secondary")
        button.classList.remove("btn-primary")
        button.disabled = true
    }

    function success() {
        loader.hidden = true
        inputURL.style.width = "100%"
        inputURL.classList.add("valid")
        button.classList.add("btn-primary")
        button.classList.remove("btn-secondary")
        button.disabled = false
    }

    function failed() {
        loader.hidden = true
        inputURL.style.width = "100%"
        inputURL.classList.add("invalid")
        button.classList.add("btn-secondary")
        button.classList.remove("btn-primary")
        button.disabled = true
    }

    if (inputURL.value !== "") {
        callOnInput()
    }
    console.log("Init completed.")
}

const isValidUrl = (string) => {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}