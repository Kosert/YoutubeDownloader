window.onload = function () {
    var inputURL = document.getElementById('input-url')
    var icon = document.getElementById('icon')
    var button = document.getElementById('button-download')
    var inputParent = inputURL.parentElement
    var lastUrl = ""

    inputURL.addEventListener('keyup', function () {
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
                    console.log(xmlhttp.responseText)
                }
            }
            xmlhttp.send(param)
        }
    })


    function startLoading() {
        inputURL.classList.add("loading")
        inputParent.classList.remove("has-success")
        inputParent.classList.remove("has-error")
        icon.classList.remove("glyphicon-ok")
        icon.classList.remove("glyphicon-remove")
        button.classList.remove("active")
        button.classList.add("disabled")
    }

    function success() {
        inputURL.classList.remove("loading")
        inputParent.classList.add("has-success")
        icon.classList.add("glyphicon-ok")
        button.classList.remove("disabled")
        button.classList.add("active")
    }

    function failed() {
        inputURL.classList.remove("loading")
        inputParent.classList.add("has-error")
        icon.classList.add("glyphicon-remove")
        button.classList.remove("active")
        button.classList.add("disabled")
    }

    console.log("Init completed.")
}