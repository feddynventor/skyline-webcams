# skyline-webcams
Crawling tool for webcams around the world.
## Copyright Notes
Images are protected by skylinewebcams.com and they cannot be used for commercial purposes but only and exclusively for private use. This tool makes it easy to access the video stream in embedded devices for **private** use.
[Watermark](https://cdn.jsdelivr.net/gh/SkylineWebcams/web@main/skylinewebcams.svg)

[Source Legislation](https://www.skylinewebcams.com/en/webcam-copyright.html)

`Copyright © (2012) skylinewebcams.com - All rights reserved.`

# Streaming Side
## [Text overlay](https://ffmpeg.org/ffmpeg-filters.html#drawtext)
```
ffmpeg -i Development/test.mp4 -vf "drawtext=fontfile=/usr/share/fonts/truetype/ubuntu/Ubuntu-B.ttf:textfile=/home/fedele/test.txt:reload=1:fontcolor=white:fontsize=24:box=1:boxcolor=black@0.5:boxborderw=5:x=(w-text_w)/2:y=(h-text_h)/2" -codec:a copy output.mp4
```
## ReStream HLS to RTMP
```
ffmpeg -hide_banner -re -i "https://hd-auth.skylinewebcams.com/live.m3u8?a=xxxxxidxxxxx" -codec:a copy -codec:v copy -segment_list_flags +live -f flv rtmp://10.0.0.9/sec
```
## Main Stream
```
ffmpeg -re -i rtmp://10.0.0.9/sec \
	-vf "drawtext=fontfile=/usr/share/fonts/truetype/ubuntu/Ubuntu-B.ttf:textfile=/home/fedele/test.txt:reload=1:fontcolor=white:fontsize=24:box=1:boxcolor=black@0.5:boxborderw=5:x=(w-text_w)/2:y=(h-text_h)/2" \
	-codec:v libx264 -preset ultrafast -b:v 1000k \
	-f flv rtmp://10.0.0.9/main
```

# External Web API 
### Geo Coordinates
`https://geocode.xyz/luxemburg?json=1`
```
{
	"standard": {
		"city": "Luxemburg",
		"prov": "LU"
	}, 
	longt, 
	latt
}
```
### Sunrise and Sunset Timings
`https://api.sunrise-sunset.org/json?lat=49.59840&lng=6.12994`
```
{
	"results": {
		"sunrise": "5:38:35 AM",
		"sunset": "5:47:53 PM",
		"solar_noon": "11:43:14 AM",
		"day_length": "12:09:18",
		"civil_twilight_begin": "5:08:17 AM",
		"civil_twilight_end": "6:18:12 PM",
		"nautical_twilight_begin": "4:30:39 AM",
		"nautical_twilight_end": "6:55:49 PM",
		"astronomical_twilight_begin": "3:51:46 AM",
		"astronomical_twilight_end": "7:34:43 PM"
	},
	"status": "OK"
}
```
### Flags
`https://www.countryflagicons.com/SHINY/64/LU.png`