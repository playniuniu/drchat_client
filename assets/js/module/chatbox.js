"use strict";

var chatboxMod = (function(){
    
    // chatbox element
    var chatbox_messages, chatbox_messagebar;
    var chatbox_page_container = null;
    
    // 消息发送超时列表
    var message_timeout_list = {};
    
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
        // 清除 timeout 列表
        message_timeout_list = {};
        chatbox_page_container = 
        
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
            updateChatBox(JSON.stringify(messageSend), 'pending');
        });

    }

    // 处理远端消息
    function handleRemoteMessage() {
        sockeioMod.listenMessage(function(msg) {
            
            var parse_message = JSON.parse(msg);
            var toUser = parse_message.toUser; // 我方
            var fromUser = parse_message.fromUser; // 对方
            
            // 本地消息发送成功
            if( toUser === userMod.getChatUser() && fromUser === userMod.getCurrentUser() ) {
                clearPendingList(parse_message);
            }
            
            // 发送给本人的消息
            else if( toUser === userMod.getCurrentUser() && fromUser === userMod.getChatUser() ) {
                updateChatBox(msg, 'received');
            }

            // 非本对话框消息
            else {
                console.log("boardcast message will not show.");
            }
            
            
        });
    }

    // 更新对话框
    // messageType有 ['sent', 'received', 'pending'] 三种类型，其中 pending 为自定义
    function updateChatBox(messageJSON, messageType) {
        // 接收的消息的头像和名称
        var avatar, show_name, show_message;
        var parseMessage = JSON.parse(messageJSON);
        
        
        if (messageType === 'received') {
            avatar = './assets/images/chat/user_2.png';
            show_name = parseMessage.fromUser;
            show_message = parseMessage.messageBody;
        } 
        if (messageType === 'sent'){
            avatar = './assets/images/chat/user_1.png';
            show_name = null;
            show_message = parseMessage.messageBody;
        }
        if (messageType === 'pending'){
            avatar = './assets/images/chat/user_1.png';
            show_name = null;
            show_message = buildPendingMessage(parseMessage);
            addPendingList(parseMessage);
            messageType = 'sent';
        }

        // Add message
        chatbox_messages.addMessage({
            // Message text
            text: show_message,

            // 随机消息类型
            type: messageType,

            // 头像和名称
            avatar: avatar,
            name: show_name,
            
            // 日期
            day: false,
            time: false
        });
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
    
    /*
     * 针对消息超时的处理函数
     */
    
    // 获取消息的 Message ID
    function getPendingMessageId(parseMessage) {
        return parseMessage.fromUser + "_" + parseMessage.toUser + "_" + parseMessage.messageTime;
    }
    
    // 构建 pending 消息
    function buildPendingMessage(parseMessage) {
        var message_text = parseMessage.messageBody;
        var message_id = getPendingMessageId(parseMessage);
        var message_html = '<span class="pending-msg" id="' + message_id + '">' + message_text + '</span>';
        return message_html;
    }
    
    // 加入 timeout 列表
    function addPendingList(parseMessage) {
        var message_id = getPendingMessageId(parseMessage);
        message_timeout_list[message_id] = setTimeout(function() {
            showTimeOutPendingMessage(parseMessage) 
        }, 6000);
    }
    
    // 从 timeout 列表清除
    function clearPendingList(parseMessage) {
        var message_id = getPendingMessageId(parseMessage);
        clearTimeout(message_timeout_list[message_id]);
        delete message_timeout_list[message_id];
        console.log("Clear pending message: " + message_id);
    }
    
    // 显示出错消息
    function showTimeOutPendingMessage(parseMessage) {
        var message_id = getPendingMessageId(parseMessage);
        var dom_id = "#" + message_id;
        console.log("Message pending error: " + message_id);
        $$(dom_id).parent().addClass('pending-error');
    }
    
    return {
        processChatBoxPage: processChatBoxPage,
        updateChatBox: updateChatBox,
    }
    
}());
