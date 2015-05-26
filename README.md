# CAPS.Server
This is the source code of the server of the Child Adult and Pet Safety Device.

It uses NodeJS and MongoDB as database.

## Setup
- Make sure to install NodeJS and nodemon on your computer
- For each pull, you must run npm install to download all dependencies
- Make sure to change the MongoDB server on this line `mongoose.connect("mongodb://yourserveraddress")` inside app.js
- Run using `nodemon bin/www`
