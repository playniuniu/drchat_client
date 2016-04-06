"use strict";

var contactMod = (function(){
    
    // 处理联系人列表
    function processAjaxContact(data, status) {

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
        gIndexPageContainer.find('#tab-contact').html('');
        gIndexPageContainer.find('#tab-contact').append(html_dom);

        // 更新 chat 相应信息
        gIndexPageContainer.find('.chat-link').on("click", function(event) {
            userMod.setChatUser( $$(this).data("toUser") );
        });

        // 处理删除按钮
        gIndexPageContainer.find('.contact-delete').on("click", function(event) {
            var ajax_url = ajax_base_url + '/contact/' + userMod.getCurrentUser();
            var ajax_data = {'username' : $$(this).data("delUser").toString()}
            ajaxCall('DELETE', ajax_url, ajax_data, function(data, status) {
                var response = JSON.parse(data);
                if(response.status !== 'ok') {
                    showNotification(response.data);
                }
                else {
                    updateContactList();
                }
            });
        })
    }

    // 处理联系人列表
    function updateContactList() {
        var ajax_url = ajax_base_url + '/contact/' + userMod.getCurrentUser();
        ajaxCall('GET', ajax_url, null, processAjaxContact);
    }

    // 处理添加联系人
    function processAddContactPage(pageContainer) {

        // 处理提交按钮
        pageContainer.find('#submmit-addcontact').on('click', function (event) {
            // 阻止默认提交
            event.preventDefault();

            var username = pageContainer.find('input[name="username"]').val();
            var nickname = pageContainer.find('input[name="nickname"]').val();

            var ajax_url = ajax_base_url + '/contact/' + userMod.getCurrentUser();
            var ajax_data = {
                "username" : username, 
                "nickname" : nickname,
            };

            ajaxCall('PUT', ajax_url, ajax_data, function(data, status) {
                gMainView.router.back({url:"index.html"});
            });
        });
    }
    
    return {
        updateContactList: updateContactList,
        processAddContactPage: processAddContactPage,
    }
    
}());
