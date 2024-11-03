#!/bin/sh
# -*- coding: utf-8 -*-
# Capture webcam image with ffmpeg
# Stop/start mjpg_stream service before/after capture
rc-service webcam_stream stop
ffmpeg -y -f v4l2 -s 960x720 -i /dev/video0 -ss 0:0:2 -frames 1 /media/mmcblk0p2/onastick/capture.jpg
rc-service webcam_stream start
cat << EOF
Content-Type: text/html

<html><head><title>Capture</title><meta charset="UTF-8"></head>
<body><img src="/capture.jpg"/></body></html>
EOF
