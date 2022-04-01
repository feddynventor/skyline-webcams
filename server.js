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

app.get('/list/cam/:state', (req, res) => {

    HTTPclient.get(`https://www.skylinewebcams.com/en/webcam/${req.params.state}.html`,
    function (query) {
        let list = []
        if (query.statusCode!=200){
            res.status(404).send()
            return
        }
        let page_body = "";
        query.on('data', function (chuck) {
            page_body+=chuck
        })
        query.on('end', function (){
            // console.log(HTMLParser.parse(page_body, {"blockTextElements": {"noscript":false,"style":false,"pre":false,"script":false}}).childNodes[1].childNodes[1].childNodes[1].childNodes[0])
            // const pageroot = HTMLParser.parse(page_body, {"blockTextElements": {"noscript":false,"style":false,"pre":false,"script":false}}).childNodes[1].childNodes[1].childNodes[1].childNodes[0].childNodes[1]
            const pageroot = HTMLParser.parse(page_body, {"blockTextElements": {"noscript":false,"style":false,"pre":false,"script":false}}).childNodes[1].childNodes[1].childNodes[1].childNodes[0].childNodes[0]
            pageroot.childNodes.forEach(element => {
                
                let meta = {};
                element.childNodes[0].childNodes.forEach(detail => {
                    if (detail.rawAttrs == 'class="tcam"'){
                        meta['title'] = detail.childNodes[0]._rawText
                    }
                    if (detail.rawAttrs == 'class="subt"'){
                        meta['desc'] = detail.childNodes[0]._rawText
                    }
                    if (detail.rawAttrs == 'class="lcam"'){
                        meta['tag'] = detail.childNodes[0]._rawText
                    }
                })
                if (!Object.keys(meta).length) return;

                let queryDet = element.rawAttrs.substring(element.rawAttrs.indexOf("en/webcam/")+10, element.rawAttrs.indexOf(".html")).split("/")

                list.push({
                    country: queryDet[0],
                    region: queryDet[1],
                    city: queryDet[2],
                    place: queryDet[3],
                    meta,
                    // flag: `https://www.countryflagicons.com/SHINY/64/${countryCode}.png`
                })
            })
            res.send(list)
        })
    })

})

app.get('/stream/:state/:region/:city/:place', (req, res) => {

    HTTPclient.get(`https://www.skylinewebcams.com/it/webcam/${req.params.state}/${req.params.region}/${req.params.city}/${req.params.place}.html`,
    function (query) {
        //console.log(query.headers['set-cookie'][0].substr(0,query.headers['set-cookie'][0].indexOf(';')))
        if (query.statusCode!=200){
            res.status(404).send()
            return
        }
        let page_body = "";
        query.on('data', function (chuck) {
            page_body+=chuck
        })
        query.on('end', function (){
            const pageroot = HTMLParser.parse(page_body, {"blockTextElements": {"noscript":false,"style":false,"pre":false,"script":true}})
            let scriptTag;

            try {
                scriptTag = pageroot.childNodes[1].childNodes[1].childNodes[7].childNodes[0]._rawText
                res.status(200).send({
                    country: req.params.state,
                    region: req.params.region,
                    city: req.params.city,
                    place: req.params.place,
                    stream: "https://hd-auth.skylinewebcams.com/live.m3u8?a="+scriptTag.substr(scriptTag.indexOf("source:'livee.m3u8?a=")+21,26),
                    original: `https://www.skylinewebcams.com/en/webcam/${req.params.state}/${req.params.region}/${req.params.city}/${req.params.place}.html`
                })
            } catch (e) {
                console.log("Stream Not Found, checking youtube...",e)
                try {
                    scriptTag = pageroot.childNodes[1].childNodes[1].childNodes[6].childNodes[0]._rawText

                    if (scriptTag.indexOf("videoId:'")==-1) { res.sendStatus(404); return; }
                    HTTPclient.get("https://www.youtube.com/watch?v="+scriptTag.substr(scriptTag.indexOf("videoId:'")+9,11),
                        function (query) {
                            if (query.statusCode!=200){
                                res.status(404).send()
                                return
                            }
                            let page_body = "";
                            query.on('data', function (chuck) {
                                page_body+=chuck
                            })
                            query.on('end', function (){
                                res.status(200).send({
                                    country: req.params.state,
                                    region: req.params.region,
                                    city: req.params.city,
                                    place: req.params.place,
                                    stream: page_body.substring(page_body.indexOf("hlsManifestUrl")+17,page_body.indexOf("index.m3u8")+10),
                                    original: `https://www.skylinewebcams.com/en/webcam/${req.params.state}/${req.params.region}/${req.params.city}/${req.params.place}.html`
                                })
                            })
                        }
                    )

                } catch (e) {
                    console.log("Stream Not Found",e)
                    res.status(503).send()
                    return;
                }

            }

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
