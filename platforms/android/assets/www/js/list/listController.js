﻿define(["app", "js/contactModel", "js/list/listView"], function (app, Contact, ListView) {

    var menu = [];

    var bindings = [{
        element: '.list-group li.contact-item',
        event: 'click',
        handler: openContact
    }];

    var state = {
        isFavorite: false
    };

    function init() {        
        if (!JSON.parse(localStorage.getItem('templates'))) {
            templateInitializeStorage();
        }
        var contacts = loadContacts();
        generateMenu();
        for (var i = 0; i < menu.length; i++) {
            var obj = {
                element: '#' + menu[i].id,
                event: 'click',
                handler: menuClick
            };
            bindings.push(obj);
        }
        ListView.render({
            bindings: bindings,
            model: contacts,
            menu: menu,
            loginCallback: login,
            header: getHeaderName(0)
        });        
    }

    function countUnSync() {
        return app.utils.getEditAddress().length + app.utils.getAnswers().length;
    }

    function login(user, pass) {
        if (user && pass) {
            app.f7.showIndicator();
            var url = 'http://newtestnew.azurewebsites.net/ServiceControl/GetEduService.svc/getCheckUser?USERNAME=' + user + '&PASSWORD=' + pass;
            Dom7.ajax({
                url: url,
                dataType: 'json',
                success: function (msg) {
                    app.f7.hideIndicator();
                    var response = JSON.parse(msg);
                    localStorage.setItem("staff", response.data.StaffID);
                    localStorage.setItem("user", response.data.Name);
                    localStorage.setItem("host", response.data.HostID);
                    if (response.status.toLowerCase() == 'ok') {
                        var memo = { 0: app.utils.Base64.encode(user), 1: app.utils.Base64.encode(pass) };
                        localStorage.setItem("memo", JSON.stringify(memo));
                        app.f7.closeModal('.login-screen');
                        if (loadContacts().length == 0) {
                            app.f7.alert('ต้องการนำเข้าข้อมูลนักเรียนหรือไม่?', 'ไม่พบข้อมูลนักเรียน!', function () {
                                app.router.load('sync');
                            });
                        }
                    }
                    else {
                        app.f7.alert(response.errorMessage, 'ERROR!');
                    }
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    app.f7.hideIndicator();
                    app.f7.alert(xhr.responseText + 'โปรดลงทะเบียนที่ระบบหลัก', 'ERROR!');
                }
            });            
        }        
    }

    function generateMenu() {
        var rooms = getRooms();
        menu = [
            { id: 0, text: localStorage.getItem('user'), value: '0', icon: 'icon ion-person' }
        ];
        for (i = 0; i < rooms.length; i++) {
            menu.push({ id: (i + 1), text: rooms[i], value: rooms[i], icon: 'icon ion-clipboard' });
        }
        menu.push({ id: rooms.length + 1, text: 'จัดการข้อมูล', value: '' + (rooms.length + 1), icon: 'icon ion-loop', unSync: countUnSync() });
        //menu.push({ id: rooms.length + 2, text: 'ตั้งค่าแบบฟอร์ม', value: '' + (rooms.length + 2), icon: 'icon ion-settings' });
        menu.push({ id: rooms.length + 2, text: 'ออกจากระบบ', value: '' + (rooms.length + 2), icon: 'icon ion-log-in' });
    }

    function getRooms() {
        var contacts = JSON.parse(localStorage.getItem("f7Contacts"));
        var groups = _.groupBy(contacts, function (value) {
            return value.class + '/' + value.roomId;
        });
        var tmp = Object.keys(groups);        
        tmp.sort(function (a, b) {
            if (a > b && a.split(' ')[0] == b.split(' ')[0]) {
                return 1;
            }
            return -1;
        })
        return tmp;
    }

    function getHeaderName(id) {
        if (id == 0) {
            return 'รายชื่อนักเรียนทั้งหมด';
        }
        for (var i = 0; i < menu.length; i++) {
            if (menu[i].id == id) {
                return 'รายชื่อนักเรียน ' + menu[i].text;
            }
        }
    }

    function menuClick(e) {
        var target = e.target.parentNode.parentNode;
        var value = target.getAttribute('value');
        if (value) {
            if (value == '0') { // Home
                var contacts = loadContacts();
                ListView.reRender({ bindings: bindings, model: contacts, header: getHeaderName(target.getAttribute('id')) });
            }
            else if (value == menu.length - 1) { // logout
                app.f7.showIndicator();
                localStorage.clear();
                setTimeout(function () { app.f7.hideIndicator(); location.reload(); }, 1000);
            }
            //else if (value == menu.length - 2) { // formEdit
            //    app.router.load('formTemplate');
            //}
            else if (value == menu.length - 2) { // data management
                app.router.load('sync');
            }
            else { // room
                var split = value.split('/');
                var filter = { "roomId": split[1], "class": split[0] };
                var contacts = loadContacts(filter);
                ListView.reRender({ bindings: bindings, model: contacts, header: getHeaderName(target.getAttribute('id')) });
            }
        }
    }

    function openContact(e) {
        var target = e.target;
        var i = 0;
        while (target.getAttribute('class') != 'contact-item' && i < 10) {
            target = target.parentNode;
            i++;
        }
        app.router.load('menu', { id: target.getAttribute('data-id') });
    }

    function showAll() {
        state.isFavorite = false;
        var contacts = loadContacts();
        ListView.reRender({ model: contacts, header: "Contacts" });
    }

    function showFavorites() {
        state.isFavorite = true;
        var contacts = loadContacts({ isFavorite: true });
        ListView.reRender({ model: contacts, header: "Favorites" });
    }

    function loadContacts(filter) {
        var f7Contacts = localStorage.getItem("f7Contacts");
        if (!f7Contacts) {
            return [];
        }
        var contacts = JSON.parse(f7Contacts);
        if (filter) {
            contacts = _.filter(contacts, filter);
        }
        contacts.sort(contactSort);
        contacts = _.groupBy(contacts, function (contact) { return contact.firstName.charAt(0); });
        contacts = _.toArray(_.mapValues(contacts, function (value, key) { return { 'letter': key, 'list': value }; }));
        return contacts;
    }

    function templateInitializeStorage() {
        var templates = [{
            id: app.utils.generateGUID(), name: 'แบบฟอร์มพื้นฐาน', content: '',
            template: reFormat((JSON.parse(defaultTemplate))),
            selected: true,
            isDefault: true
        }];        
        for (var i = 0; i < templates.length; i++) {            
            templates[i].content = generateContent(templates[i].template);
        }
        localStorage.setItem("templates", JSON.stringify(templates));
    }

    function reFormat(data) {
        var array = [];
        for (var i = 0; i < data.length; i++) { // section
            var sections = [];
            var tmp = data[i].data;
            for (var j = 0; j < tmp.length; j++) {
                sections.push({ id: tmp[j].QTID + ':' + tmp[j].QID, text: tmp[j].text, isQuestion: true, answers: tmp[j].answer });                
            }
            array.push({ id: data[i].FID, text: data[i].text, isQuestion: false, details: sections });
        }
        return array;
    }

    function generateContent(data) {
        var text = '', line = '';
        for (var i = 0; i < data.length; i++) {
            line = data[i].text + '<br>';
            var index = 0;
            while (index < 3) {
                line += '&nbsp&nbsp&nbsp&nbsp' + data[i].details[index].text.substring(0, 40) + '...<br>';
                index++;
            }
            text += line;
        }
        if (text.length == 0) {
            text = '...ไม่พบข้อมูลแบบฟอร์ม...';
        }
        return text;
    }

    function contactSort(a, b) {
        if (a.firstName > b.firstName) {
            return 1;
        }
        if (a.firstName === b.firstName && a.lastName >= b.lastName) {
            return 1;
        }
        return -1;
    }

    return {
        init: init
    };
});