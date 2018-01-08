# YoutubeDownloader
Nodejs youtube downloader website.  
Check it out at [kosert.me/youtube](http://kosert.me/youtube)  

## Features
- Provides direct download links for all available formats
- Allows to merge custom video and audio tracks to a single file
- Custom format supports MP4, WEBM and MKV
- Front-end powered by Bootstrap CSS

## Usage note
Branch `master` is intended to work behind nginx reverse proxy (`location /youtube`). Thus it will not work correctly when accessed directly. If you want to run the project without reverse proxy use branch `develop`. Alternatively, you can change paths in `main.js` file to as they appear on branch `develop`.

## Attributions
- [Nodejs](https://nodejs.org/)
- [Bootstrap](https://getbootstrap.com/)
- [express](https://github.com/expressjs/express)
- [ytdl-core](https://github.com/fent/node-ytdl-core)
- [tmp](https://github.com/raszi/node-tmp)
- [ffmpeg](http://www.ffmpeg.org/)
- [fluent-ffmpeg](https://github.com/fluent-ffmpeg/node-fluent-ffmpeg)
- [morgan](https://github.com/expressjs/morgan)

## Additional Information
Author: Robert Kosakowski  
**Note**: I am not affiliated with Youtube by any means.  
