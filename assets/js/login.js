"use strict";

var gUserName = null;

// 检测登陆状况
function checkLoginStatus() {
    if (gUserName) {
        return gUserName;
    }

    try {
        gUserName = window.localStorage ? localStorage.getItem("userName") : Cookie.read("userName");
    } catch (err) {
        console.log("ERROR: Can't read localStorage or cookies from your browser!");
    }
    return gUserName;
}

// 设置登陆信息
function setLogin(userName) {
    gUserName = userName;

    try {
        if (window.localStorage) {
            localStorage.setItem("userName", userName);
        } else {
            Cookie.write("userName", userName);
        }
    } catch (err) {
        console.log("ERROR: Can't set localStorage or cookies from your browser!");
    }
}

// 设置登出
function setLogout() {
    gUserName = null;

    try {
        if (window.localStorage) {
            localStorage.removeItem("userName");
        } else {
            Cookie.write("userName", "");
        }
    } catch (err) {
        console.log("ERROR: Can't set localStorage or cookies from your browser!");
    }
}

// 处理登陆对话框
function processLogin(pageContainer, mainView, gApp) {

    // 处理提交按钮
    pageContainer.find('#submmit-login').on('click', function (event) {
        // 阻止默认提交
        event.preventDefault();
        
        var username = pageContainer.find('input[name="username"]').val();
        var password = pageContainer.find('input[name="password"]').val();

        if ( (username !== 'drchat' && username !== 'aws') || password !== '123') {
            gApp.addNotification({
                title: 'drchat',
                message: '登陆用户名或者密码错误!',
                hold: 3000,
            });
            return false;
        }

        setLogin(username);
        mainView.router.back();
    });
    
    // 处理取消按钮
    pageContainer.find('#cancel-login').on('click', function (event) {
        // 阻止默认提交
        event.preventDefault();
        
        pageContainer.find('input[name="username"]').val('');
        pageContainer.find('input[name="password"]').val('');
        
    });
}