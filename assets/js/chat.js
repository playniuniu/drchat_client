"use strict";

// 初始化 chat 页面
function init_chat_page(gApp) {
    // 初始化变量
    conversationStarted = false;

    // 初始化 Message 对话框
    chat_page_messages = gApp.messages('.messages', {
        autoLayout: true,
    });

    // 初始化 Messagebar
    chat_page_messagebar = gApp.messagebar('.messagebar');

    // 初始化 socket io
    connect_to_remote();

    // 初始化消息处理函数
    handle_local_message();
    handle_remote_message();
}

// 连接 socket io
function connect_to_remote() {
    if(local_socket === null) {
        var socket_url = "http://" + document.location.hostname + ":" + socket_port + '/drchat';
        local_socket = io(socket_url);
        console.log("Connected to " + socket_url);
    }

    else {
        console.log("SocketIO already connect");
    }
}

// 断开 socket.io 连接
function disconnect_remote() {
    console.log("Disconnecting SockeIO ...");
    local_socket.disconnect();
    local_socket = null;
}

// 处理本地消息
function handle_local_message() {

    // Handle message
    $$('.messagebar .link').on('click', function () {
        // Message text
        var messageText = chat_page_messagebar.value().trim();

        // Exit if empy message
        if (messageText.length === 0) return;

        // Empty messagebar
        chat_page_messagebar.clear();

        var messageSend = {
            fromUser: checkLoginStatus(),
            toUser: gToUser,
            fromNickName: store('gNickName') ? store('gNickName') : checkLoginStatus(),
            messageFormat: "text",
            messageTime: Date.now(),
            messageBody: messageText
        }

        // 将消息发送给远端
        local_socket.emit("msg", JSON.stringify(messageSend));

        // 更新本地消息列表
        update_message_box(JSON.stringify(messageSend), 'sent');
    });

}

// 处理远端消息
function handle_remote_message() {
    local_socket.on('msg', function (msg) {
        
        var local_user = JSON.parse(msg).toUser.toString(); // 我方
        var remote_user = JSON.parse(msg).fromUser.toString(); // 对方
        
        // 非本对话框消息
        if( local_user !== checkLoginStatus() || remote_user !== gToUser) {
            console.log("debug: not owner messages");
            return;
        }
        
        // 更新消息列表
        update_message_box(msg, 'received');
    });
}

// 更新对话框
// messageType有 ['sent', 'received'] 两种类型
function update_message_box(messageJSON, messageType) {
    // 接收的消息的头像和名称
    var avatar, showName;
    var parseMessage = JSON.parse(messageJSON);

    if (messageType === 'received') {
        avatar = './assets/images/chat/user_2.png';
        if(parseMessage.fromNickName === parseMessage.fromUser) {
            showName = parseMessage.fromUser;
        } else {
            showName = parseMessage.fromNickName + ' ( ' + parseMessage.fromUser + ' )';
        }
        
    } else {
        avatar = './assets/images/chat/user_1.png';
        showName = null;
    }

    // Add message
    chat_page_messages.addMessage({
        // Message text
        text: parseMessage.messageBody,

        // 随机消息类型
        type: messageType,

        // 头像和名称
        avatar: avatar,
        name: showName,

        // 日期
        day: !conversationStarted ? 'Today' : false,
        time: !conversationStarted ? (new Date()).getHours() + ':' + (new Date()).getMinutes() : false
    })

    // 更新会话flag
    conversationStarted = true;
}

// 更新历史消息
function updateChatHistory(data) {
    // 取得回调数据
    var recv_msg = JSON.parse(data);
    if( recv_msg.status !== 'ok' || recv_msg.data === null ) {
        return;
    }
    
    var msg_list = recv_msg.data;
    
    // 读取的时候消息是按从新到旧排列的，因此需要倒序
    msg_list = msg_list.reverse();
    
    for(var i=0; i< msg_list.length; i++) {
        var el = JSON.parse(msg_list[i]);
        
        // 检测本人发送
        if(el.fromUser === checkLoginStatus()) {
            update_message_box(msg_list[i], "sent");
        }
        
        // 检测本人接收
        if(el.toUser === checkLoginStatus()) {
            update_message_box(msg_list[i], "received");
        }
    }
}

function init_chat_page_event(pageContainer) {
    var $clear_btn = pageContainer.find('#clear-btn');
    
    // 处理清空按钮
    $clear_btn.on('click', function (event) {
        chat_page_messages.clean();
    });
}