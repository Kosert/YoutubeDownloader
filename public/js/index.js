window.onload = function () {
    var inputURL = document.getElementById('input-url')
    var button = document.getElementById('button-download')
    var lastUrl = ""

    function onInput() {   
        if (inputURL.value === "")
        {
            lastUrl = ""
            failed()
        }
        else if (inputURL.value !== "" && lastUrl !== inputURL.value) {
            startLoading()
            lastUrl = inputURL.value
            var param = "url=" + lastUrl
            xmlhttp = new XMLHttpRequest()
            xmlhttp.open("POST", "/validateURL", true)
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

    button.addEventListener('click', function(){

        var table = document.getElementById('formats')
        var oldTbody = table.getElementsByTagName('tbody')[0]
        var newTbody = document.createElement('tbody')

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

        table.replaceChild(newTbody, oldTbody)
        table.hidden = false

        var param = "url=" + lastUrl
        xmlhttp = new XMLHttpRequest()
        xmlhttp.open("POST", "/getInfo", true)
        xmlhttp.onreadystatechange = function () {
            if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                var filters = JSON.parse(xmlhttp.responseText)

                newTbody.deleteRow(0)

                for (f of filters) {
                    var row = newTbody.insertRow(newTbody.rows.length)
                    row.insertCell().innerHTML = f.encoding ? f.encoding : "<b>NO VIDEO</b>"
                    row.insertCell().innerHTML = f.audioEncoding ? f.audioEncoding : "<b>NO AUDIO</b>"
                    row.insertCell().innerHTML = f.container
                    row.insertCell().innerHTML = f.resolution
                    var link = document.createElement('a')
                    link.href = f.url
                    var linkText = document.createTextNode('Click here')
                    link.appendChild(linkText)
                    link.title = 'Click here'
                    row.insertCell().appendChild(link)
                }

            }
        }
        xmlhttp.send(param)

    })

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