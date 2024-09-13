#!/bin/bash

hugo
git add public
git commit -m 'build: udpate public'
git push

ssh root@192.168.8.178 'cd /opt/onastick; git pull'
