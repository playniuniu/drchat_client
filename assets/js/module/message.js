"use strict";

var messageMod = (function(){
    var gUpdateMessageInterval = null;
    
    // 处理消息列表
    function processAjaxMessage(data, status) {
        
        // 解析消息数据
        function getMessageChatuser(data) {
            if( data.fromUser == userMod.getCurrentUser() ) {
                data.username = data.toUser;
            }
            else {
                data.username = data.fromUser;
            }

            return data;
        }

        // 取得回调数据
        var recv_msg = JSON.parse(data);
        if(recv_msg.status !== 'ok') {
            return;
        }

        // 获取数据
        var html_data = {
            msgItem: recv_msg.data.map(getMessageChatuser)
        }
        
        // 组装 html
        var html_template = $$('script#messageList').html();
        var html_compile = Template7.compile(html_template);
        var html_dom = html_compile(html_data);

        // 更新 dom
        gIndexPageContainer.find('#tab-message').html('');
        gIndexPageContainer.find('#tab-message').append(html_dom);

        // 更新 chat 相应信息
        gIndexPageContainer.find('.chat-link').on("click", function(event) {
            userMod.setChatUser( $$(this).data("toUser") );
        });

        // 处理删除按钮
        gIndexPageContainer.find('.message-delete').on("click", function(event) {
            var ajax_url = ajax_base_url + '/msglist/' + userMod.getCurrentUser();
            var ajax_data = {'username' : $$(this).data("delUser").toString()}
            ajaxCall('DELETE', ajax_url, ajax_data, function(data, status) {
                var response = JSON.parse(data);
                if(response.status !== 'ok') {
                    showNotification(response.data);
                }
                else {
                    updateMessageList();
                }
            });
        })
    }

    // 处理消息列表
    function updateMessageList() {
        var ajax_url = ajax_base_url + '/msglist/' + userMod.getCurrentUser();
        ajaxCall('GET', ajax_url, null, processAjaxMessage);
    }
    
    // 设置定时更新
    function setIntervalUpdateMessageList() {
        
        if(gUpdateMessageInterval) {
            clearInterval(gUpdateMessageInterval);
        }
        
        gUpdateMessageInterval = setInterval(function() {
            messageMod.updateMessageList();
        },10000);
    }
    
    // 删除定时更新
    function clearIntervalUpdateMessageList() {
        if(gUpdateMessageInterval) {
            clearInterval(gUpdateMessageInterval);
        }
    }
    
    return {
        updateMessageList: updateMessageList,
        setIntervalUpdateMessageList: setIntervalUpdateMessageList,
        clearIntervalUpdateMessageList: clearIntervalUpdateMessageList,
    }
    
}());
