"use strict";

// 定义全局变量
var $$ = Framework7.$; // framework7 dom
var socket_port = 3000; // socket.io port
var ajax_base_url = "http://" + document.location.hostname + ":" + socket_port // server url

// 全局变量
var gUserName = null, gApp = null, gMainView = null, gIndexPageContainer = null;

var local_socket = null;
var chat_page_messages, chat_page_messagebar;
var gToUser, conversationStarted;

// 基本函数

// 显示消息
function showNotification(notification) {
    gApp.addNotification({
        title: 'drchat',
        message: notification,
        hold: 3000,
    });
}

// 处理 Ajax
function ajaxCall(ajax_type, ajax_url, ajax_data, callback_func) {
    if(ajax_type === 'get') {
        console.log("Ajax get: " + ajax_url);
        $$.get(ajax_url, null, function(response, status) {
            callback_func(response, status);
        });
    }
    else if(ajax_type === 'post') {
        console.log("Ajax post: " + ajax_url);
        $$.post(ajax_url, ajax_data, function(response, status) {
            callback_func(response, status);
        });
    }
    else {
        console.log("Ajax type not support!");
        return false;
    }
}