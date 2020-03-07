const log = require("./log")

module.exports = {

    parseFormats: function parseFormats(formats) {

        const result = {
            universal: [],
            audios: [],
            videos: []
        }

        for (f of formats) {
            if (!f.container) {
                log.error("Format without container: ", f)
                continue
            }

            try {
                const codecs = f.codecs.split(",").map(it => it.split(".")[0])
                const format = {
                    itag: f.itag,
                    container: f.container,
                    codecs: codecs,
                    url: f.url
                }

                if (codecs.length == 2) {
                    const label = f.qualityLabel.substring(0, f.qualityLabel.indexOf('p') + 1)
                    format.label = label + (f.fps ? " " + f.fps + "fps" : "")
                    result.universal.push(format)
                }
                else if (f.mimeType.includes("audio")) {
                    format.label = (f.audioBitrate ? f.audioBitrate : f.bitrate) + "kbps"
                    result.audios.push(format)
                }
                else {
                    const label = f.qualityLabel.substring(0, f.qualityLabel.indexOf('p') + 1)
                    format.label = label + (f.fps ? " " + f.fps + "fps" : "")
                    result.videos.push(format)                
                }

            } catch (error) {
                log.error("Parse error", error)
            }
        }

        if (result.universal.length == 0
            && result.audios.length == 0
            && result.videos.length == 0
        )
            return null

        return result
    }
}