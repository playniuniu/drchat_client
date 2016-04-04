"use strict";

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
}

// 处理联系人列表
function updateContactList() {
    var ajax_url = ajax_base_url + '/contact/' + checkLoginStatus();
    ajaxCall('get', ajax_url, null, processAjaxContact);
}

// 处理添加联系人
function processAddContact(pageContainer) {

    // 处理提交按钮
    pageContainer.find('#submmit-addcontact').on('click', function (event) {
        // 阻止默认提交
        event.preventDefault();
        
        var username = pageContainer.find('input[name="username"]').val();
        var nickname = pageContainer.find('input[name="nickname"]').val();
        
        var ajax_url = ajax_base_url + '/contact/' + checkLoginStatus();
        var ajax_data = {
            "username" : username, 
            "nickname" : nickname,
        };
        
        ajaxCall('post', ajax_url, ajax_data, function(data, status) {
            gMainView.router.back({url:"index.html"});
        });
    });
}