#!/bin/sh
# -*- coding: utf-8 -*-
# Return console output from server in json format:
# {
#   'rc-status': [ /* list of running services on raspi */ ]
# }
{
    services=$(rc-status | awk '/^ / {print $1, $3}' | jq -R -s -c 'split("\n") | map(select(length > 0))')
} &> /dev/null
echo "HTTP/1.0 200 OK"
echo "Content-type: application/json"
echo ""
echo "{\"rc-status\": $services}"
