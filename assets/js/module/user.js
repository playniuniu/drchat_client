"use strict";

var userMod = (function() {
    
    var gCurrentUser = null; // 当前用户
    var gChatUser = null; // 对话用户

    // 设置登陆
    function setLogin(userName) {
        gCurrentUser = String(userName);
        store("gCurrentUser", gCurrentUser);
    }

    // 设置登出
    function setLogout() {
        gCurrentUser = null;
        store("gCurrentUser", null);
    }
    
    // 检测登陆
    function checkLogin() {
        if (gCurrentUser) {
            return true;
        }
        
        if( store("gCurrentUser") ) {
            gCurrentUser = String( store("gCurrentUser") );
            return true;
        }
        
        return false;
    }
    
    // 获取当前用户
    function getCurrentUser() {
        if (gCurrentUser) {
            return String(gCurrentUser);
        }
        
        if(store("gCurrentUser")) {
            gCurrentUser = String( store("gCurrentUser") );
            return gCurrentUser;
        }
        
        return null;
    }
    
    // 设置用户昵称
    function setNickname(nickname) {
        store( 'gNickname', String(nickname) );
    }
    
    // 获取用户昵称
    function getNickname() {
        return store('gNickname');
    }
    
    // 设置对话用户
    function setChatUser(username) {
        gChatUser = username;
    }
    
    // 获取对话用户
    function getChatUser() {
        return gChatUser;
    }

    // 处理用户登陆
    function processAjaxLogin(data, status) {
        var response = JSON.parse(data);

        if(response.status === 'ok') {
            var username = response.data.username;
            setLogin(username);
            gMainView.router.load({url:"index.html"});
        }
        else {
            showNotification(response.data);
        }

    }

    // 处理用户登陆
    function processLoginPage(pageContainer) {

        // 处理提交按钮
        pageContainer.find('#submmit-login').on('click', function (event) {
            // 阻止默认提交
            event.preventDefault();

            var username = pageContainer.find('input[name="username"]').val();
            var password = pageContainer.find('input[name="password"]').val();

            var ajax_url = ajax_base_url + '/user/login';
            var ajax_data = {
                "username" : username, 
                "password" : hex_sha1(password), // 加密 Password
            };

            ajaxCall('POST', ajax_url, ajax_data, processAjaxLogin);
        });

        // 处理取消按钮
        pageContainer.find('#cancel-login').on('click', function (event) {
            // 阻止默认提交
            event.preventDefault();

            pageContainer.find('input[name="username"]').val('');
            pageContainer.find('input[name="password"]').val('');

        });
    }

    // 处理用户注册
    function processAjaxRegister(data, status) {
        var response = JSON.parse(data);

        if(response.status === 'ok') {
            var username = response.data.username;
            setLogin(username);
            gMainView.router.load({url:"index.html"});
        }
        else {
            showNotification(response.data);
        }
    }

    // 处理用户注册
    function processRegisterPage(pageContainer) {

        // 处理提交按钮
        pageContainer.find('#submmit-register').on('click', function (event) {
            // 阻止默认提交
            event.preventDefault();

            var username = pageContainer.find('input[name="username"]').val();
            var password = pageContainer.find('input[name="password"]').val();

            var ajax_url = ajax_base_url + '/user/register';
            var ajax_data = {
                "username" : username, 
                "password" : hex_sha1(password), // 加密 Password
            };

            ajaxCall('POST', ajax_url, ajax_data, processAjaxRegister);
        });

        // 处理取消按钮
        pageContainer.find('#cancel-register').on('click', function (event) {
            // 阻止默认提交
            event.preventDefault();

            pageContainer.find('input[name="username"]').val('');
            pageContainer.find('input[name="password"]').val('');

        });
    }
    
    return {
        setLogin: setLogin,
        setLogout: setLogout,
        checkLogin: checkLogin,
        setChatUser: setChatUser,
        getChatUser: getChatUser,
        setNickname: setNickname,
        getNickname: getNickname,
        getCurrentUser: getCurrentUser,
        processLoginPage: processLoginPage,
        processRegisterPage: processRegisterPage,
    }

}());

