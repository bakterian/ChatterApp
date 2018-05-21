# ChatterApp
A simple online chatting application written in node js

# Prerequesties
After cloning, run npm install to acquire all the node depandancies
A redis server will be also need for persisting chat data.
Windows based redis service installer can be found here:
[GitHub](https://github.com/rgl/redis/downloads)


# How to run
* Start redis server (either by starting the redis-server process or the service)
* start the node js app, "node chatterApp.js". A -c parameter can be provide to clear the database.
* test using your local browsers by opening http://localhost:8080, add as many client as you wish

