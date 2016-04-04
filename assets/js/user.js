"use strict";

// 检测登陆状况
function checkLoginStatus() {
    if (gUserName) {
        return gUserName;
    }
    return store("gUserName");
}

// 设置登陆信息
function setLogin(userName) {
    gUserName = userName;
    store("gUserName", gUserName);
}

// 设置登出
function setLogout() {
    gUserName = null;
    store("gUserName", null);
}

// 处理用户登陆
function processAjaxLogin(data, status) {
    var response = JSON.parse(data);
    
    if(response.status === 'ok') {
        var username = response.data.username;
        setLogin(username);
        gMainView.router.load({url:"index.html", ignoreCache: true});
    }
    else {
        showNotification(response.data);
    }
    
}

// 处理用户登陆
function processLogin(pageContainer) {

    // 处理提交按钮
    pageContainer.find('#submmit-login').on('click', function (event) {
        // 阻止默认提交
        event.preventDefault();
        
        var username = pageContainer.find('input[name="username"]').val();
        var password = pageContainer.find('input[name="password"]').val();
        
        var ajax_url = ajax_base_url + '/user/login';
        var ajax_data = {
            "username" : username, 
            "password" : password,
        };
        
        ajaxCall('post', ajax_url, ajax_data, processAjaxLogin);
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
        gMainView.router.load({url:"index.html", ignoreCache: true});
    }
    else {
        showNotification(response.data);
    }
}

// 处理用户注册
function processRegister(pageContainer) {

    // 处理提交按钮
    pageContainer.find('#submmit-register').on('click', function (event) {
        // 阻止默认提交
        event.preventDefault();
        
        var username = pageContainer.find('input[name="username"]').val();
        var password = pageContainer.find('input[name="password"]').val();
        
        var ajax_url = ajax_base_url + '/user/register';
        var ajax_data = {
            "username" : username, 
            "password" : password,
        };
        
        ajaxCall('post', ajax_url, ajax_data, processAjaxRegister);
    });
    
    // 处理取消按钮
    pageContainer.find('#cancel-register').on('click', function (event) {
        // 阻止默认提交
        event.preventDefault();
        
        pageContainer.find('input[name="username"]').val('');
        pageContainer.find('input[name="password"]').val('');
        
    });
}
