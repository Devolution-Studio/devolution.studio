#! /bin/bash

webpack --mode production
minify ./public/css/main.css > ./public/css/main.min.css
node ./src/server.js