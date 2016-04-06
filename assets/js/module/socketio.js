"use strict";

var sockeioMod = (function() {
    // local socket io
    var local_socket_io = null;
    var namespace = 'drchat';
    
    // 连接 socket io
    function connect() {
        if(local_socket_io === null) {
            var socket_url = ajax_base_url + '/' + namespace;
            local_socket_io = io(socket_url);
            console.log("Connected to " + socket_url);
        }

        else {
            console.log("SocketIO already connect");
        }
    }

    // 断开连接
    function disconnect() {
        console.log("Disconnecting SockeIO");
        if(local_socket_io) {
            local_socket_io.disconnect();
            local_socket_io = null;
        }
        
    }
    
    // 发送消息
    function sendMessage(message) {
        local_socket_io.emit("msg", message);
    }
    
    // 监听消息
    function listenMessage(callback_func) {
        local_socket_io.on('msg', function (message) {
            callback_func(message);
        });
    }
    
    return {
        connect: connect,
        disconnect: disconnect,
        sendMessage: sendMessage,
        listenMessage: listenMessage,
    }
    
}());