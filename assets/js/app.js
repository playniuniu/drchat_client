// 定义 chat box 全局变量
var myApp, myMessages, myMessagebar;

// 定义 socket.io 全局变量
var local_socket;

// 定义对话初始值
var conversationStarted;

// 初始化 chat box
init_chat_box();

// 连接 socket io
connect_to_remote();

// 消息处理
handle_local_message();
handle_remote_message();

// 初始化 chat box
function init_chat_box(){
    
    // 初始化 Framework7 APP
    myApp = new Framework7({
        // If it is webapp, we can enable hash navigation:
        pushState: true,

        // Hide and show indicator during ajax requests
        onAjaxStart: function (xhr) {
            myApp.showIndicator();
        },

        onAjaxComplete: function (xhr) {
            myApp.hideIndicator();
        }
    });
    
    // 会话 flag
    conversationStarted = false;

    // Init Messages
    myMessages = myApp.messages('.messages', {
        autoLayout:true
    });

    // Init Messagebar
    myMessagebar = myApp.messagebar('.messagebar');
    
}

// 连接 socket io
function connect_to_remote(){
    var socket_port = 3000;
    var socket_url = "http://" + document.location.hostname + ":" + socket_port + '/drchat';
    local_socket = io(socket_url);
    console.log("Connected to " + socket_url);
}

// 处理本地消息
function handle_local_message(){
    var $$ = Dom7;

    // Handle message
    $$('.messagebar .link').on('click', function () {
        // Message text
        var messageText = myMessagebar.value().trim();

        // Exit if empy message
        if (messageText.length === 0) return;

        // Empty messagebar
        myMessagebar.clear()

        // 随机消息类型
        var messageType = (['sent', 'received'])[Math.round(Math.random())];

        // 将消息发送给远端
        local_socket.emit("msg", messageText);
        
        // 更新本地消息列表
        update_message_box(messageText, 'sent');
    });
    
}

// 处理远端消息
function handle_remote_message(){
    local_socket.on('msg', function(msg) {
        update_message_box(msg, 'received');
    });
}

// 更新对话框
// messageType有 ['sent', 'received'] 两种类型
function update_message_box(messageText, messageType) {
    // 接收的消息的头像和名称
    var avatar, name;
    
    if(messageType === 'received') {
        avatar = './assets/images/chat/user_2.png';
        name = 'Kate';
    }
    else {
        avatar = './assets/images/chat/user_1.png';
    }
    
    // Add message
    myMessages.addMessage({
        // Message text
        text: messageText,

        // 随机消息类型
        type: messageType,

        // 头像和名称
        avatar: avatar,
        name: name,

        // 日期
        day: !conversationStarted ? 'Today' : false,
        time: !conversationStarted ? (new Date()).getHours() + ':' + (new Date()).getMinutes() : false
    })

    // 更新会话flag
    conversationStarted = true;
}