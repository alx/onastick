#!/bin/sh
# -*- coding: utf-8 -*-
# Capture webcam image with ffmpeg
# Stop/start mjpg_stream service before/after capture
{
  monit stop webcam_stream
  ffmpeg -y -f v4l2 -s 960x720 -i /dev/video0 -ss 0:0:2 -frames:v 1 /media/mmcblk0p2/onastick/capture_%03d.jpg
  monit start webcam_stream
} &> /dev/null
echo "HTTP/1.0 200 OK"
echo "Content-type: text/plain"
echo ""
echo $(base64 /media/mmcblk0p2/onastick/capture_001.jpg)
