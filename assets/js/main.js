var socket_port = 3000;
var socket_url = "http://" + document.location.hostname + ":" + socket_port + '/drchat';
console.log("Connect to " + socket_url);
var socket = io(socket_url);

$('form').submit(function() {
    socket.emit('msg', $('#m').val());
    $('#m').val('');
    return false;
});

socket.on('msg', function(msg) {
    $('#messages').append($('<li>').text(msg));
});
