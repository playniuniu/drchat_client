"use strict";

// 定义全局变量
var $$ = Framework7.$;
var gApp, mainView, indexPageContainer;

init_chat_box();

// 初始化 chat box
function init_chat_box() {

    // 初始化 Framework7 APP
    gApp = new Framework7({
        // Disable init
        init: false,

        // enable pushState
        pushState: true,
        pushStateSeparator: "#",

        // Hide and show indicator during ajax requests
        onAjaxStart: function (xhr) {
            gApp.showIndicator();
        },

        onAjaxComplete: function (xhr) {
            gApp.hideIndicator();
        }
    });

    // 初始化 mainView
    mainView = gApp.addView(".view-main");
    
    // 初始化 page event
    initPageEvent();
    
    // Init app
    gApp.init();
}

function initPageEvent() {
    // 处理主页
    gApp.onPageInit('index', function (page) {
        // 检查登陆情况
        if (checkLoginStatus() === null) {
            mainView.router.load({url:"login.html", ignoreCache: true});
        }
        else {
             indexPageContainer = $$(page.container);
             initIndexPageEvent(indexPageContainer);
             ajaxDataUpdate('messageList', updateMessageList, checkLoginStatus());
             ajaxDataUpdate('contactList', updateContactList, checkLoginStatus());
        }
    });

    // 处理登录页
    gApp.onPageInit('login', function (page) {
        var pageContainer = $$(page.container);
        processLogin(pageContainer, mainView, gApp);
    });
    
    // 处理注册页
    gApp.onPageInit('register', function (page) {
        var pageContainer = $$(page.container);
        processRegister(pageContainer, mainView, gApp);
    });

    // 处理聊天页
    gApp.onPageInit('chat', function (page) {
        var pageContainer = $$(page.container);
        
        // 初始化聊天 App
        init_chat_page(gApp);
        // 初始化页面响应
        init_chat_page_event(pageContainer);
        // 获取发送至谁
        gToUser = pageContainer.find("#chat-box").data("toUser");
        
        // 直接刷新 #chat.html, 有 bug
        if(gToUser) {
            // 更新聊天记录
            ajaxDataUpdate('chatHistory', updateChatHistory, gToUser);
        }
    });

    gApp.onPageBack('chat', function (page) {
        // disconnect socket io
        disconnect_remote();
        ajaxDataUpdate('messageList', updateMessageList, checkLoginStatus());
    });
}

function ajaxDataUpdate(updateType, callback, params) {
    var ajax_url;
    
    if(updateType === 'messageList') {
        var username = params;
        ajax_url = "http://" + document.location.hostname + ":" + socket_port + '/messagelist/' + username;
    }
    
    if (updateType === 'contactList') {
        var username = params;
        ajax_url = "http://" + document.location.hostname + ":" + socket_port + '/contactlist/' + username;
    }
    
    if (updateType === 'chatHistory') {
        var fromUser = checkLoginStatus();
        var toUser = params;
        ajax_url = "http://" + document.location.hostname + ":" + socket_port + '/messages/' + fromUser + '/' + toUser;
    }
    
    if(ajax_url === null) {
        return;
    }
    
    console.log("Ajax fetch: " + ajax_url);

    $$.get(ajax_url, null, function(data) {
        callback(data);
    });
}
                    

// 更新消息列表
function updateMessageList(data) {
    // 取得回调数据
    var recv_msg = JSON.parse(data);
    if(recv_msg.status !== 'ok') {
        return;
    }
    
    // 获取数据
    var html_data = {
        msgItem: recv_msg.data
    }
    
    // 组装 html
    var html_template = $$('script#messageList').html();
    var html_compile = Template7.compile(html_template);
    var html_dom = html_compile(html_data);
    
    // 更新 dom
    indexPageContainer.find('#tab-msg').html('');
    indexPageContainer.find('#tab-msg').append(html_dom);
    
}

// 更新联系人列表
function updateContactList(data) {
    // 取得回调数据
    var recv_msg = JSON.parse(data);
    if(recv_msg.status !== 'ok') {
        return;
    }
    
    // 获取数据
    var html_data = {
        contactItem: recv_msg.data
    }
    
    // 组装 html
    var html_template = $$('script#contactList').html();
    var html_compile = Template7.compile(html_template);
    var html_dom = html_compile(html_data);
    
    // 更新 dom
    indexPageContainer.find('#tab-contact').html('');
    indexPageContainer.find('#tab-contact').append(html_dom);
    
}

// 主页面响应
function initIndexPageEvent(pageContainer) {

    var $logout_btn = pageContainer.find('#logout-btn');
    var $nick_name = pageContainer.find('#nick-name');
    var $save_btn = pageContainer.find('#save-btn');
    var $login_name = pageContainer.find('#login-name');

    // 设置登录名
    $login_name.val(checkLoginStatus());

    // 设置昵称
    $nick_name.val(store('gNickName'));

    // 处理退出按钮
    $logout_btn.on('click', function (event) {
        setLogout();
    });

    // 处理用户昵称
    $nick_name.on('input', function (event) {
        $save_btn.removeClass('disabled');
        if ($nick_name.val() === '') {
            $save_btn.addClass('disabled');
        }
    });

    // 处理保存按钮
    $save_btn.on('click', function (event) {
        $save_btn.addClass('disabled');
        store('gNickName', $nick_name.val());
    });
}