"use strict";

var gApp = null, gMainView = null, gIndexPageContainer = null;

var mainApp = (function(){
    // 初始化 APP
    function initApp() {

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

        // 初始化 gMainView
        gMainView = gApp.addView(".view-main");

        // 初始化所有页面响应
        initAllPageEvent();

        // Init app
        gApp.init();
    }

    function initAllPageEvent() {
        // 处理主页
        gApp.onPageInit('index', function (page) {
            // 检查登陆情况
            if (userMod.checkLogin() === null) {
                gMainView.router.load({url:"login.html", ignoreCache: true});
            }
            else {
                gIndexPageContainer = $$(page.container);
                processIndexPage(gIndexPageContainer);
            }
        });

        // 处理登录页
        gApp.onPageInit('login', function (page) {
            userMod.processLoginPage($$(page.container));
        });

        // 处理注册页
        gApp.onPageInit('register', function (page) {
            userMod.processRegisterPage($$(page.container));
        });

        // 处理联系人页
        gApp.onPageInit('addcontact', function (page) {
            contactMod.processAddContactPage($$(page.container));
        });

        gApp.onPageBack('addcontact', function (page) {
            // 更新联系人列表
            contactMod.updateContactList();
        });

        // 处理聊天页
        gApp.onPageInit('chatbox', function (page) {
            messageMod.clearIntervalUpdateMessageList();
            chatboxMod.processChatBoxPage(gApp, $$(page.container));
        });

        gApp.onPageBack('chatbox', function (page) {
            // disconnect socket io
            sockeioMod.disconnect();
            
            // clear chatUser
            userMod.setChatUser(null);
            
            // 更新消息列表
            messageMod.updateMessageList();
            messageMod.setIntervalUpdateMessageList();
        });
    }

    // 主页面响应
    function processIndexPage(pageContainer) {

        var $tab_link = pageContainer.find('.tab-link');
        var $reload_btn = pageContainer.find('#reload_btn');
        var $logout_btn = pageContainer.find('#logout-btn');
        var $nick_name = pageContainer.find('#nick-name');
        var $save_btn = pageContainer.find('#save-btn');
        var $login_name = pageContainer.find('#login-name');
        
        // 处理 tab 按钮
        $tab_link.on('click', function(event) {
            var tab_href = $$(this).attr('href');
            
            if(tab_href === '#tab-message') {
                messageMod.updateMessageList();
                $reload_btn.show();
            }
            
            if(tab_href === '#tab-contact') {
                contactMod.updateContactList();
                $reload_btn.hide();
            }
            
            if(tab_href === '#tab-my') {
                $reload_btn.hide();
            }
        
        });
        
        // 处理刷新按钮
        $reload_btn.on('click', function(event) {
            messageMod.updateMessageList();
        });
        

        // 设置登录名
        $login_name.val(userMod.getCurrentUser());

        // 设置昵称
        $nick_name.val(userMod.getNickname());

        // 处理退出按钮
        $logout_btn.on('click', function (event) {
            userMod.setLogout();
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
            userMod.setNickname($nick_name.val());
        });
        
        // 更新消息列表
        messageMod.updateMessageList();
        messageMod.setIntervalUpdateMessageList();
    }    
    
    return {
        initApp : initApp,
    }

}());

mainApp.initApp();