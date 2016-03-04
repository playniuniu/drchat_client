"use strict";

var
    $$ = Framework7.$, // 定义 Dom

    myApp, myMessages, myMessagebar, mainView, currentPage, conversationStarted, // 定义全局变量

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

    // 初始化 mainView
    mainView = myApp.addView(".view-main", {
        dynamicNavbar: true
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
        myMessagebar.clear()

        // 将消息发送给远端
        local_socket.emit("msg", messageText);

        // 更新本地消息列表
        update_message_box(messageText, 'sent');
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
function update_message_box(messageText, messageType) {
    // 接收的消息的头像和名称
    var avatar, name;

    if (messageType === 'received') {
        avatar = './assets/images/chat/user_2.png';
        name = 'Kate';
    } else {
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

// 检测登陆状况
function checkLogin() {
    var userName = window.localStorage ? localStorage.getItem("userName") : Cookie.read("userName");
    if (userName) {
        return true;
    }
    return false;
}

// 获取登录名
function getLoginName() {
    return window.localStorage ? localStorage.getItem("userName") : Cookie.read("userName");
}

// 设置登陆信息
function setLogin(userName) {
    if (window.localStorage) {
        localStorage.setItem("userName", userName);
    } else {
        Cookie.write("userName", userName);
    }
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