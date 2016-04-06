"use strict";

var chatboxMod = (function(){
    
    // chatbox element
    var chatbox_messages, chatbox_messagebar;
    
    function processChatBoxPage(main_app, pageContainer) {
        // 初始化对话框
        initChatBox(main_app);
        
        // 更新历史消息
        var ajax_url = ajax_base_url + '/msghistory/' + userMod.getCurrentUser() + '/' + userMod.getChatUser();
        ajaxCall('GET', ajax_url, null, ajaxUpdateChatBoxHistory);
        
        // 处理清空按钮
        var $clear_btn = pageContainer.find('#clear-btn');
        $clear_btn.on('click', function (event) {
            chatbox_messages.clean();
            ajaxCall('DELETE', ajax_url, null, function(data, response){
                
            });
        });
    }

    // 初始化 chat 页面
    function initChatBox(main_app) {
        // 初始化 Message 对话框
        chatbox_messages = main_app.messages('.messages', {
            autoLayout: true,
        });

        // 初始化 Messagebar
        chatbox_messagebar = main_app.messagebar('.messagebar');

        // 连接 socket.io
        sockeioMod.connect();

        // 初始化消息处理函数
        handleLocalMessage();
        handleRemoteMessage();
    }

    // 处理本地消息
    function handleLocalMessage() {

        // Handle message
        $$('.messagebar .link').on('click', function () {
            // Message text
            var messageText = chatbox_messagebar.value().trim();

            // Exit if empy message
            if (messageText.length === 0) return;

            // Empty messagebar
            chatbox_messagebar.clear();

            var messageSend = {
                fromUser: userMod.getCurrentUser(),
                toUser: userMod.getChatUser(),
                fromNickname: userMod.getNickname(),
                messageFormat: "text",
                messageTime: Date.now(),
                messageBody: messageText
            }

            // 将消息发送给远端
            sockeioMod.sendMessage( JSON.stringify(messageSend) );

            // 更新本地消息列表
            updateChatBox(JSON.stringify(messageSend), 'sent');
        });

    }

    // 处理远端消息
    function handleRemoteMessage() {
        sockeioMod.listenMessage(function(msg) {
            
            var local_user = JSON.parse(msg).toUser; // 我方
            var remote_user = JSON.parse(msg).fromUser; // 对方

            // 非本对话框消息
            if( local_user !== userMod.getCurrentUser() || remote_user !== userMod.getChatUser() ) {
                console.log("debug: not owner messages");
                return;
            }

            // 更新消息列表
            updateChatBox(msg, 'received');
            
        });
    }

    // 更新对话框
    // messageType有 ['sent', 'received'] 两种类型
    function updateChatBox(messageJSON, messageType) {
        // 接收的消息的头像和名称
        var avatar, showName;
        var parseMessage = JSON.parse(messageJSON);

        if (messageType === 'received') {
            avatar = './assets/images/chat/user_2.png';
            showName = parseMessage.fromUser;
        } else {
            avatar = './assets/images/chat/user_1.png';
            showName = null;
        }

        // Add message
        chatbox_messages.addMessage({
            // Message text
            text: parseMessage.messageBody,

            // 随机消息类型
            type: messageType,

            // 头像和名称
            avatar: avatar,
            name: showName,

            // 日期
            day: false,
            time: false
        })
    }
    
    // 更新历史消息
    function ajaxUpdateChatBoxHistory(data, status) {
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
            if(el.fromUser === userMod.getCurrentUser()) {
                updateChatBox(msg_list[i], "sent");
            }

            // 检测本人接收
            if(el.toUser === userMod.getCurrentUser()) {
                updateChatBox(msg_list[i], "received");
            }
        }
    }
    
    return {
        processChatBoxPage: processChatBoxPage,
        updateChatBox: updateChatBox,
    }
    
}());
