"use strict";

var
    $$ = Framework7.$, // 定义 Dom

    myApp, myMessages, myMessagebar, mainView, myUserName, currentPage, conversationStarted, // 定义全局变量

    local_socket; // 定义 socket.io 全局变量

// 初始化 chat box
init_chat_box();

// 初始化 chat box
function init_chat_box() {

    // 登陆完成后，重新初始化 mainView
    var reinit_main_view = function () {
        // 初始化 conversationStarted
        conversationStarted = false;

        // 初始化 Message 对话框
        myMessages = myApp.messages('.messages', {
            autoLayout: true,
        });

        // 初始化 Messagebar
        myMessagebar = myApp.messagebar('.messagebar');
        
        // 处理 panel 消息
        handle_panel_message();

        // 初始化 socket io
        connect_to_remote();

        // 初始化消息处理函数
        handle_local_message();
        handle_remote_message();
    }


    // 初始化 Framework7 APP
    myApp = new Framework7({
        // not init at first
        init: false,

        // Init model name
        modalTitle: 'drchat',

        // disable pushState, seems safari bug
        pushState: false,

        // Hide and show indicator during ajax requests
        onAjaxStart: function (xhr) {
            myApp.showIndicator();
        },

        onAjaxComplete: function (xhr) {
            myApp.hideIndicator();
        }
    });

    // 初始化 mainView
    mainView = myApp.addView(".view-main");
    
    // 初始化 left panel
    $$('.open-panel').on('click', function (e) {
        myApp.openPanel('left');
    });

    // 响应 pageInit
    $$(document).on('pageInit', function (e) {
        currentPage = e.detail.page;
        // Code for About page
        if (currentPage.name === 'index') {
            if (!checkLogin()) {
                mainView.router.loadPage("login.html");
            } else {
                reinit_main_view();
            }
        }
    });

    // 响应 pageBack
    $$(document).on('pageBack', function (e) {
        // 响应 login pageBack
        if (e.detail.page.url === 'login.html') {
            if (!checkLogin()) {
                myApp.addNotification({
                    title: 'drchat',
                    message: '登陆失败'
                });
            } else {
                reinit_main_view();
            }
        }
    });

    myApp.init();
}

// 
function handle_panel_message() {
    $$("#btn-logout").on('click', function(e) {
        setLogout();
        myApp.closePanel();
        mainView.router.loadPage("login.html");
    });
}


// 连接 socket io
function connect_to_remote() {
    var socket_port = 3000;
    var socket_url = "http://" + document.location.hostname + ":" + socket_port + '/drchat';
    local_socket = io(socket_url);
    console.log("Connected to " + socket_url);
}

// 处理本地消息
function handle_local_message() {
    var $$ = Dom7;

    // Handle message
    $$('.messagebar .link').on('click', function () {
        // Message text
        var messageText = myMessagebar.value().trim();

        // Exit if empy message
        if (messageText.length === 0) return;

        // Empty messagebar
        myMessagebar.clear();
        
        var messageSend = {
            from: getLoginName(),
            to: "admin",
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
        showName = parseMessage.from;
    } else {
        avatar = './assets/images/chat/user_1.png';
        showName = null;
    }
    
    

    // Add message
    myMessages.addMessage({
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

// 检测登陆状况
function checkLogin() {
    if(myUserName) {
        return true;
    }
    
    var userName = window.localStorage ? localStorage.getItem("userName") : Cookie.read("userName");
    
    if (userName) {
        return true;
    }
    return false;
}

// 获取登录名
function getLoginName() {
    if(myUserName) {
        return myUserName;
    }
    
    return window.localStorage ? localStorage.getItem("userName") : Cookie.read("userName");
}

// 设置登陆信息
function setLogin(userName) {
    if (window.localStorage) {
        localStorage.setItem("userName", userName);
    } else {
        Cookie.write("userName", userName);
    }
    myUserName = userName;
}

// 设置登出
function setLogout() {
    if (window.localStorage) {
        localStorage.removeItem("userName");
    } else {
        Cookie.write("userName", "");
    }
    myUserName = null;
}

// 处理登陆提交
function submitLogin() {
    var pageContainer = $$(currentPage.container);
    var username = pageContainer.find('input[name="username"]').val();
    var password = pageContainer.find('input[name="password"]').val();

    if (password !== '123') {
        myApp.addNotification({
            title: 'drchat',
            message: '密码错误'
        });
        return false;
    }

    setLogin(username);
    mainView.router.back();
}