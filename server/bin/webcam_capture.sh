#!/bin/sh
# -*- coding: utf-8 -*-
# Capture webcam image with ffmpeg
# Stop/start mjpg_stream service before/after capture
{
  rc-service webcam_stream stop
  sleep .5
  ffmpeg -y -f v4l2 -s 960x720 -i /dev/video0 -ss 0:0:2 -frames 1 /media/mmcblk0p2/onastick/capture.jpg
  sleep .5
  rc-service webcam_stream start
} &> /dev/null
echo "HTTP/1.0 200 OK"
echo "Content-type: text/plain"
echo ""
echo $(base64 /media/mmcblk0p2/onastick/capture.jpg)
