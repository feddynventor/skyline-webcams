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

app.get('/list/cam/', (req, res) => {
    
    HTTPclient.get(`https://www.skylinewebcams.com/`,
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
            let list = [];
            const pageroot = HTMLParser.parse(page_body, {"blockTextElements": {"noscript":false,"style":false,"pre":false,"script":false}}).childNodes[1].childNodes[1].childNodes[0].childNodes[3].childNodes[0].childNodes[0].childNodes[2].childNodes[1]
            // console.log(pageroot.childNodes[3].childNodes[1].childNodes)
            pageroot.childNodes.forEach(continent => {
                continent.childNodes.forEach(pagelist => {
                    if(typeof pagelist.childNodes[1] === 'undefined') return;
                    pagelist.childNodes[1].childNodes.forEach(listitem => {
                        list.push({
                            name: listitem.childNodes[0]._rawText,
                            // uri: listitem.rawAttrs,
                            uri: listitem.childNodes[0]._rawText.toLowerCase().replaceAll(' ','-'),
                        })
                    })
                })
            })
            // pageroot.childNodes[0].childNodes[1].childNodes[0].childNodes.forEach(listitem => {
            //     list.push({
            //         name: listitem.childNodes[0]._rawText,
            //         // uri: listitem.rawAttrs,
            //         uri: listitem.childNodes[0]._rawText.toLowerCase().replace(' ','-'),
            //     })
            // })
            res.send(list)
        })
    })
})

app.get('/list/cam/:state', (req, res) => {

    if (req.params.state == 'web') req.params.state = 'live-cams-category/live-web-cams';
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
                    // if (detail.rawTagName == 'img'){
                    //     meta['thumb'] = detail.rawAttrs.substr(5, detail.rawAttrs.indexOf('.jpg')-1)
                    // }
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

    HTTPclient.get(`https://www.skylinewebcams.com/en/webcam/${req.params.state}/${req.params.region}/${req.params.city}/${req.params.place}.html`,
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

            try {
                scriptTag = pageroot.childNodes[1].childNodes[1].childNodes[7].childNodes[0]._rawText

                let localtime = pageroot.childNodes[1].childNodes[1].childNodes[1].childNodes[0].childNodes[2].childNodes[0].childNodes[1].childNodes[0].childNodes[0].childNodes[2].childNodes[0].childNodes[2].childNodes[0]._rawText;
                HTTPclient.get(`https://www.skylinewebcams.com/en/weather/${req.params.state}/${req.params.region}/${req.params.city}.html`,
                function (query) {
                    //console.log(query.headers['set-cookie'][0].substr(0,query.headers['set-cookie'][0].indexOf(';')))
                    if (query.statusCode!=200){
                        res.status(200).send({
                            country: req.params.state,
                            region: req.params.region,
                            city: req.params.city,
                            place: req.params.place,
                            localtime,
                            stream: "https://hd-auth.skylinewebcams.com/live.m3u8?a="+scriptTag.substr(scriptTag.indexOf("source:'livee.m3u8?a=")+21,26),
                            // original: `https://www.skylinewebcams.com/en/webcam/${req.params.state}/${req.params.region}/${req.params.city}/${req.params.place}.html`
                        })

                        return
                    }
                    let page_body = "";
                    query.on('data', function (chuck) {
                        page_body+=chuck
                    })
                    query.on('end', function (){
                        const pageroot = HTMLParser.parse(page_body, {"blockTextElements": {"noscript":false,"style":false,"pre":false,"script":true}}).childNodes[1].childNodes[1].childNodes[1].childNodes[0].childNodes[0].childNodes[0]
                        let weather = pageroot.childNodes[2].childNodes[0].childNodes[0].childNodes[1]
                        let sundata = pageroot.childNodes[4].childNodes[0].childNodes[2].childNodes[0].childNodes[1]._rawText
                        // console.log(sundata, weather.childNodes[0].rawAttrs, weather.childNodes[1].childNodes[0]._rawText)

                        res.status(200).send({
                            country: req.params.state,
                            region: req.params.region,
                            city: req.params.city,
                            place: req.params.place,
                            localtime,
                            sunrise: sundata.substring(sundata.indexOf(':')-2,sundata.indexOf(':')+3),
                            sunset: sundata.substring(sundata.lastIndexOf(':')-2,sundata.lastIndexOf(':')+3),
                            forecast: weather?.childNodes[0]?.rawAttrs ?? null,
                            temperature: weather?.childNodes[1]?.childNodes[0]?._rawText ?? null,
                            stream: "https://hd-auth.skylinewebcams.com/live.m3u8?a="+scriptTag.substr(scriptTag.indexOf("source:'livee.m3u8?a=")+21,26),
                            // original: `https://www.skylinewebcams.com/en/webcam/${req.params.state}/${req.params.region}/${req.params.city}/${req.params.place}.html`
                        })
                    })
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
                            let youtube_page = "";
                            query.on('data', function (chuck) {
                                youtube_page+=chuck
                            })
                            query.on('end', function (){
                                
                                let localtime = pageroot.childNodes[1].childNodes[1].childNodes[1].childNodes[0].childNodes[2].childNodes[0].childNodes[1].childNodes[0].childNodes[0].childNodes[2].childNodes[0].childNodes[2].childNodes[0]._rawText;
                                HTTPclient.get(`https://www.skylinewebcams.com/en/weather/${req.params.state}/${req.params.region}/${req.params.city}.html`,
                                function (query) {
                                    //console.log(query.headers['set-cookie'][0].substr(0,query.headers['set-cookie'][0].indexOf(';')))
                                    if (query.statusCode!=200){
                                        res.status(200).send({
                                            country: req.params.state,
                                            region: req.params.region,
                                            city: req.params.city,
                                            place: req.params.place,
                                            localtime,
                                            stream: youtube_page.substring(youtube_page.indexOf("hlsManifestUrl")+17,youtube_page.indexOf("index.m3u8")+10),
                                            // original: `https://www.skylinewebcams.com/en/webcam/${req.params.state}/${req.params.region}/${req.params.city}/${req.params.place}.html`
                                        })

                                        return
                                    }
                                    let page_body = "";
                                    query.on('data', function (chuck) {
                                        page_body+=chuck
                                    })
                                    query.on('end', function (){
                                        const pageroot = HTMLParser.parse(page_body, {"blockTextElements": {"noscript":false,"style":false,"pre":false,"script":true}}).childNodes[1].childNodes[1].childNodes[1].childNodes[0].childNodes[0].childNodes[0]
                                        let weather = pageroot.childNodes[2].childNodes[0].childNodes[0].childNodes[1]
                                        let sundata = pageroot.childNodes[4].childNodes[0].childNodes[2].childNodes[0].childNodes[1]._rawText
                                        // console.log(sundata, weather.childNodes[0].rawAttrs, weather.childNodes[1].childNodes[0]._rawText)

                                        res.status(200).send({
                                            country: req.params.state,
                                            region: req.params.region,
                                            city: req.params.city,
                                            place: req.params.place,
                                            localtime,
                                            sunrise: sundata.substring(sundata.indexOf(':')-2,sundata.indexOf(':')+3),
                                            sunset: sundata.substring(sundata.lastIndexOf(':')-2,sundata.lastIndexOf(':')+3),
                                            forecast: weather?.childNodes[0]?.rawAttrs ?? null,
                                            temperature: weather?.childNodes[1]?.childNodes[0]?._rawText ?? null,
                                            stream: youtube_page.substring(youtube_page.indexOf("hlsManifestUrl")+17,youtube_page.indexOf("index.m3u8")+10),
                                            // original: `https://www.skylinewebcams.com/en/webcam/${req.params.state}/${req.params.region}/${req.params.city}/${req.params.place}.html`
                                        })
                                    })
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
