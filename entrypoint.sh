#!/bin/sh

[ ! -d "/flagcounter/config/static/" ]     && mv static-tmp/* /flagcounter/src/static && rm -rf static-tmp
[ ! -f "/flagcounter/config/config.json" ] && mv /flagcounter/config.json /flagcounter/config/

node src/index.js --docker
