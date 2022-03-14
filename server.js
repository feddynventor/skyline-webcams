const express = require('express');
const HTMLParser = require('node-html-parser');
const html2json = require('html2json').html2json;
const HTTPclient = require('https')

// Constants
const PORT = 8099;
const HOST = '0.0.0.0';

// App
const app = express();
app.use(express.json()); // built-in middleware for express

app.get('/', (req, res) => {
  res.send('Hello World');
});

app.get('/search', (req, res) => {

    HTTPclient.get("https://www.skylinewebcams.com/it/webcam/italia/lazio/roma/piazza-venezia.html",
    function (query) {
        if (query.statusCode!=200){
            res.end()
            return
        }
        let page_body = "";
        let response_draft = [];
        query.on('data', function (chuck) {
            page_body+=chuck
        })
        query.on('end', function (){
            const pageroot = HTMLParser.parse(page_body, {"blockTextElements": {"noscript":false,"style":false,"pre":false,"script":true}})
            // let test = pageroot.querySelectorAll(".table-int")[0].childNodes[1].childNodes[1]
//            console.log(pageroot)
            let scriptTag = pageroot.childNodes[1].childNodes[1].childNodes[7].childNodes[0]._rawText
            res.status(200).send("https://hd-auth.skylinewebcams.com/livee.m3u8?a="+scriptTag.substr(scriptTag.indexOf("source:'livee.m3u8?a=")+21,26))
        })
    }).on('error', function(e) {
        res.send(JSON.stringify({
            err: "Errore query",
            details: e
        }))
        res.end()
    })

})

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
