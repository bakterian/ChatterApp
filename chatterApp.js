var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

var redis = require('redis');
var redisClient = redis.createClient();

const clearDbShort = "-c";
const clearDbLong = "--clear";

process.argv.forEach(function (val, index, array) {
    if(val === clearDbShort || val === clearDbLong)
    {
        redisClient.del("messages");
        redisClient.del("chatters");
    }
  })

redisClient.on('connect', function()
{
    console.log("Connected to Redis.");
});
redisClient.on("error", function (err) {
    console.log("Redis error " + err);
});

function storeMsg(name,data)
{
    var redisKey = "messages";
    var redisValue = JSON.stringify({name: name,data: data});
    redisClient.lpush(redisKey,redisValue, function(err,response)
    {
       redisClient.ltrim("messages",0,9); 
    });
}

function storeChatterName(name)
{
    redisClient.sadd("chatters",name);
}

function emitMsgOnSocket(client,msg)
{
    client.broadcast.emit('messages', msg);
    client.emit("messages", msg);
}

function sendOutAllStoredMsgs(client)
{
    redisClient.lrange("messages",0,-1,function(err,messages)
    {
        messages = messages.reverse();
        messages.forEach(msg => 
        {
            msg = JSON.parse(msg.toString());
            client.emit("messages", msg.data);
        });
    });
}

function sendOutAllChatterNames(client)
{
    redisClient.smembers("chatters",function(err,names)
    {      
        names.forEach(name => 
        {
            client.emit("addChatter", name);
        });
    });
}

io.on('connection', function(client) {
  console.log("Client connected...");
 
    client.on('join', function(name)
    {
        if(name === null)
        {
            console.log("Invalid client, disconnecting");
            client.disconnect(false);
        }
        else
        {
            client.nickName = name;
            console.log("the client name is " + name);  
            client.broadcast.emit("addChatter", name);
            storeChatterName(name);
            sendOutAllChatterNames(client);
            sendOutAllStoredMsgs(client);
        }
    });

    client.on('messages', function(message)
    {
        var nickName = client.nickName;
        console.log("a message from " + nickName + " was received.");
        var chatMsg = nickName + ": " + message;
        emitMsgOnSocket(client,chatMsg);
        storeMsg(client.nickName,chatMsg);
    });

});


app.get('/',function(req,res)
{
    res.sendFile(__dirname + '/index.html');
});
 
server.listen(8080);