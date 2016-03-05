"use strict";

// 定义全局变量
var $$ = Framework7.$;
var gApp, mainView;

init_chat_box();

// 初始化 chat box
function init_chat_box() {

    // 初始化 Framework7 APP
    gApp = new Framework7({

        // Init model name
        modalTitle: 'drchat',

        // enable pushState
        pushState: true,
        pushStateSeparator: "",

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
    
    // 检查登陆情况
    if (checkLoginStatus() === null) {
        mainView.router.loadPage("login.html");
    }
}

function initPageEvent() {
    gApp.onPageInit('login', function (page) {
        var pageContainer = $$(page.container);
        processLogin(pageContainer, mainView, gApp);
    });
    
    gApp.onPageInit('chat', function(page) {
       init_chat_page(gApp); 
    });
}
