"use strict";

// 定义全局变量
var $$ = Framework7.$;
var gApp, mainView, indexPageContainer;

init_chat_box();

// 初始化 chat box
function init_chat_box() {

    // 初始化 Framework7 APP
    gApp = new Framework7({
        // Disabel init
        init: false,

        // Init model name
        modalTitle: 'drchat',

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
    
    // 检查登陆情况
    if (checkLoginStatus() === null) {
        mainView.router.loadPage("login.html");
    }
}

function initPageEvent() {
    // 处理主页
    gApp.onPageInit('index', function (page) {
        indexPageContainer = $$(page.container);
        initIndexPageEvent(indexPageContainer);
    });
    
    // 处理登录页
    gApp.onPageInit('login', function (page) {
        var pageContainer = $$(page.container);
        processLogin(pageContainer, mainView, gApp);
    });
    
    gApp.onPageBack('login', function(page) {
        initIndexPageEvent(indexPageContainer);
    });
    
    // 处理聊天页
    gApp.onPageInit('chat', function(page) {
        init_chat_page(gApp);
    });
    
    gApp.onPageBack('chat', function(page) {
        disconnect_remote();
    });
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
        if($nick_name.val() === '') {
            $save_btn.addClass('disabled');
        }
    });
    
    // 处理保存按钮
    $save_btn.on('click', function(event) {
        $save_btn.addClass('disabled');
        store('gNickName', $nick_name.val());
    });
}
