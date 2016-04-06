"use strict";

// 定义全局变量
var $$ = Framework7.$; // framework7 dom
var server_port = 3000; // socket.io server port
var ajax_base_url = "http://" + document.location.hostname + ":" + server_port; // server url

// 显示消息
function showNotification(notify_msg) {
    gApp.addNotification({
        title: 'drchat',
        message: notify_msg,
        hold: 3000,
    });
}

// 处理 Ajax
function ajaxCall(ajax_type, ajax_url, ajax_data, callback_func) {
    console.log("Ajax " + ajax_type + ": " + ajax_url);
    
    $$.ajax({
        method: ajax_type,
        url: ajax_url,
        data: ajax_data,
        success: function(response, status) {
            callback_func(response, status);
        },
        error: function(xhr, status) {
            showNotification("Ajax Error: " + ajax_url + ", status: " + status);
        },
        complete: function(xhr, status) {
        }
    });
}
