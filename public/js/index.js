window.onload=function(){function e(){if(""===s.value)return v="",void a();var e;if(e=(s.value.startsWith("http"),"https://"+s.value),!isValidUrl(e))return v=s.value,void a();if(""!==s.value&&v!==s.value){v=s.value;var t="url="+v;xmlhttp=new XMLHttpRequest,xmlhttp.open("POST","/validateURL",!0),xmlhttp.onreadystatechange=function(){4==xmlhttp.readyState&&200==xmlhttp.status&&("true"===xmlhttp.responseText?i():a())},xmlhttp.send(t)}}function t(){l(),clearTimeout(u),u=setTimeout(e,500)}function n(e,t){for(f of t){var n=e.tBodies[0],d=n.insertRow(n.rows.length);d.insertCell().innerHTML=f.codecs,d.insertCell().innerHTML="<b>"+f.container+"</b>",d.insertCell().innerHTML=f.label;var o=document.createElement("a");o.href=f.url,o.target="_blank",o.rel="noopener noreferrer",o.download=document.getElementById("title").innerText,o.title="Click here to download",o.classList.add("btn","btn-info");var r=document.createTextNode("Download");o.appendChild(r);const t=d.insertCell();t.classList.add("align-middle"),t.appendChild(o)}}function d(e){var t=e.getElementsByTagName("tbody")[0],n=document.createElement("tbody");e.replaceChild(n,t)}function o(){var e=p[E.selectedIndex],t=y[b.selectedIndex];if(!e||!t)return void(document.getElementById("div-custom").hidden=!0);const n=document.getElementById("convert");var d=!0,o=!0;"webm"!==e.container&&"webm"!==t.container||(d=!1),"webm"===e.container&&"webm"===t.container||(o=!1);var r=document.getElementById("dummy-container");d?(r.value="mp4",n.value="Convert to MP4"):o?(r.value="webm",n.value="Convert to WEBM"):(r.value="mkv",n.value="Convert to MKV")}function r(e){for(var t=e+"=",n=decodeURIComponent(document.cookie),d=n.split(";"),o=0;o<d.length;o++){for(var r=d[o];" "==r.charAt(0);)r=r.substring(1);if(0==r.indexOf(t))return r.substring(t.length,r.length)}return""}function l(){m.hidden=!1,s.style.width="calc(100% - 50px)",s.classList.remove("valid"),s.classList.remove("invalid"),c.classList.add("btn-secondary"),c.classList.remove("btn-primary"),c.disabled=!0}function i(){m.hidden=!0,s.style.width="100%",s.classList.add("valid"),c.classList.add("btn-primary"),c.classList.remove("btn-secondary"),c.disabled=!1}function a(){m.hidden=!0,s.style.width="100%",s.classList.add("invalid"),c.classList.add("btn-secondary"),c.classList.remove("btn-primary"),c.disabled=!0}var s=document.getElementById("input-url"),c=document.getElementById("button-download");const m=this.document.getElementById("loader");var u,v="",h=document.getElementById("div-error");window.location.href.indexOf("error")>-1&&(h.hidden=!1),s.addEventListener("keyup",t),s.addEventListener("paste",t);var g=[],p=[],y=[],E=document.getElementById("video-select"),b=document.getElementById("audio-select");E.addEventListener("change",function(){o()}),b.addEventListener("change",function(){o()});var I=document.getElementById("convert");I.addEventListener("click",function(){I.disabled=!0,document.getElementById("div-convert-loading").hidden=!1,document.getElementById("form-custom").hidden=!0;var e=document.getElementById("progress-convert");e.classList.add("progress-bar-striped"),e.classList.remove("bg-success"),e.innerText="Converting...";var t=setInterval(function(){var n=r("downloadComplete");"true"===n&&(e.classList.add("bg-success"),e.classList.remove("progress-bar-striped"),e.innerText="Download started",document.cookie="downloadComplete=; Max-Age=-99999999;",clearInterval(t))});document.getElementById("form-custom").submit()}),c.addEventListener("click",function(){h.hidden=!0;var e=document.getElementById("div-loading");e.hidden=!1;var t=document.getElementById("div-info");t.hidden=!0;var r=document.getElementById("div-custom");r.hidden=!0;var l=document.getElementById("div-tracks");l.hidden=!0;var i=document.getElementById("div-fulls");i.hidden=!0;var a=document.getElementById("fulls"),s=document.getElementById("videoOnly"),c=document.getElementById("audioOnly");for(d(a),d(s),d(c),document.getElementById("div-convert-loading").hidden=!0,document.getElementById("form-custom").hidden=!1;E.options.length>0;)E.remove(0);for(;b.options.length>0;)b.remove(0);g=[],p=[],y=[];var m="url="+v;xmlhttp=new XMLHttpRequest,xmlhttp.open("POST","/getInfo",!0),xmlhttp.onreadystatechange=function(){if(e.hidden=!0,4==xmlhttp.readyState&&200==xmlhttp.status){var d=JSON.parse(xmlhttp.responseText);if(d.error)h.hidden=!1,h.children[0].innerText="Error: "+d.error;else{for(f of d.formats.universal)g.push(f);for(f of d.formats.videos){p.push(f);var m=document.createElement("option");m.value=f.itag,m.text=f.codecs+" | "+f.label,E.add(m)}for(f of d.formats.audios){y.push(f);m=document.createElement("option");m.value=f.itag,m.text=f.codecs+" | "+f.label,b.add(m)}document.getElementById("title").innerText=d.title,document.getElementById("description").innerText="Uploaded by: "+d.author,document.getElementById("thumbnail").src=d.thumb,document.getElementById("dummy-name").value=d.title,document.getElementById("dummy-url").value=d.url,t.hidden=!1,i.hidden=!1,l.hidden=!1,I.disabled=!1,r.hidden=!1,n(a,g),n(s,p),n(c,y),o()}}},xmlhttp.send(m)}),""!==s.value&&t(),console.log("Init completed.")};const isValidUrl=e=>{try{return new URL(e),!0}catch(e){return!1}};