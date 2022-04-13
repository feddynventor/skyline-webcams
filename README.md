# skyline-webcams
Crawling tool for webcams around the world.
## Copyright Notes
Images are protected by skylinewebcams.com and they cannot be used for commercial purposes but only and exclusively for private use. This tool makes it easy to access the video stream in embedded devices for **private** use.

[Watermark](https://cdn.jsdelivr.net/gh/SkylineWebcams/web@main/skylinewebcams.svg)

[Source Legislation](https://www.skylinewebcams.com/en/webcam-copyright.html)

`Copyright © (2012) skylinewebcams.com - All rights reserved.`

# How To Use
Simply run the server and run the queries
- GET `/list/cam/:state` 

the parameter is based on the same query you do via browser, referring to the URI of the HTML resource in the website.

e.g. `https://www.skylinewebcams.com/en/webcam/italia.html` the parameter is `italia`


- GET `/stream/:state/:region/:city/:place`

Crawls details about the camera. The streaming URL comes from the proprietary CDN or alternatively from YouTube for Web Cameras.

```
{
    "country":"ireland",
    "region":"leinster",
    "city":"dublin",
    "place":"dublin-o-connell-street",
    "localtime":"22:29",
    "sunrise":"06:30",
    "sunset":"20:20",
    "forecast":"class=\"wi wi-night-alt-cloudy\"",
    "temperature":"11",
    "stream":"https://hd-auth.skylinewebcams.com/xxxxxxxx",
    "original":"https://www.skylinewebcams.com/en/webcam/ireland/leinster/dublin/dublin-o-connell-street.html"
}
```