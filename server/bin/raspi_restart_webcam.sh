#!/bin/sh
# -*- coding: utf-8 -*-
# Restart webcam_stream rc-service
# Return list of status
# {
#   'rc-status': [ /* list of running services on raspi */ ]
# }
{
    rc-service webcam_stream stop
    rc-service webcam_stream start
    services=$(rc-status | awk '/^ / {print $1, $3}' | jq -R -s -c 'split("\n") | map(select(length > 0))')
} &> /dev/null
echo "HTTP/1.0 200 OK"
echo "Content-type: application/json"
echo ""
echo "{\"rc-status\": $services}"
