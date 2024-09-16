#!/bin/bash
hugo && rsync -r ./public/ root@192.168.8.178:/media/mmcblk0p2/www/onastick/
