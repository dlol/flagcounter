#!/bin/sh

[ -z "$(ls -A "/flagcounter/src/static")" ] && cp static-tmp/* /flagcounter/src/static
[ ! -f "/flagcounter/config/config.json" ]  && cp /flagcounter/config.json /flagcounter/config/

node src/index.js --docker
