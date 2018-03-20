var http = require('http'); //need to http
var fs = require('fs'); //need to read static files
var url = require('url');  //to parse url strings
var socket = require('socket.io');

const port = 3000
var ROOT_DIR = 'public';

var MIME_TYPES = {
    'css': 'text/css',
    'gif': 'image/gif',
    'htm': 'text/html',
    'html': 'text/html',
    'ico': 'image/x-icon',
    'jpeg': 'image/jpeg',
    'jpg': 'image/jpeg',
    'js': 'text/javascript', //should really be application/javascript
    'json': 'application/json',
    'png': 'image/png',
    'txt': 'text/plain'
};

var get_mime = function(filename) {
    var ext, type;
    for (ext in MIME_TYPES) {
        type = MIME_TYPES[ext];
        if (filename.indexOf(ext, filename.length - ext.length) !== -1) {
            return type;
        }
    }
    return MIME_TYPES['txt'];
};


const requestHandler = (request, response) => {
  console.log("THE REQUEST URL: "+request.url);
  var urlObj = url.parse(request.url, true, false);


  if(request.method == "GET"){
	        //handle GET requests as static file requests
	        var filePath = ROOT_DIR + urlObj.pathname;
	        if(urlObj.pathname === '/') filePath = ROOT_DIR + '/canvas.html';
          console.log("FILEPATH: "+ filePath);
            fs.readFile(filePath, function(err,data){
               if(err){
		         //report error to console
                 console.log('ERROR: ' + JSON.stringify(err));
		         //respond with not found 404 to client
                 response.writeHead(404);
                 response.end(JSON.stringify(err));
                 return;
               }
               response.writeHead(200, {'Content-Type': get_mime(filePath)});
               response.end(data);
               console.log("YOUR FILE WAS SERVED");
            });
	    }



  //response.end('Hello Node.js Server!')
}

const server = http.createServer(requestHandler).listen(3000);


var io = socket(server);

function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

io.on('connection', newConnection);

var players = [];

function newConnection(socket){

  console.log("NEW CONNECTION" + socket.id);
  var newX = Math.floor((Math.random() * 950) + 0);
  var newY = Math.floor((Math.random() * 400) + 0);

  var playerData = {
    x : newX,
    y : newY,
    id : socket.id,
    color: getRandomColor()
  };
  players.push(playerData);
  io.to(socket.id).emit("new player", playerData);
  socket.broadcast.emit('new other player', playerData);
  io.to(socket.id).emit('older other players', players);
  socket.on('moved', movedRect);

  function movedRect(data){
    socket.broadcast.emit('moved', data);
    console.log("DATA SHOULD BE RECEIVED");
    //console.log(data);

  }


}

/*
server.listen(port, (err) => {
  if (err) {
    return console.log('something bad happened', err)
  }

  console.log('Server Running at http://127.0.0.1:3000  CNTL-C to quit');
  console.log(`server is listening on ${port}`)
})


*/
