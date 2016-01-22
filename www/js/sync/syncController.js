define(["app", "js/contactModel", "js/sync/syncView"], function (app, Contact, View) {

    var bindings = [{
        element: '.navbar-inner .left .back.link',
        event: 'click',
        handler: backClick
    },
	{
	    element: '.page-content.pull-to-refresh-content',
	    event: 'refresh',
	    handler: syncData
	},
	{
	    element: '.room-item',
	    event: 'click',
	    handler: roomClick
	},
	{
	    element: '.panel-close',
	    event: 'click',
	    handler: closeRightPanel
	}, {
	    element: '.upload-answer',
	    event: 'click',
	    handler: uploadAnswer
	}, {
	    element: '.upload-all',
	    event: 'click',
	    handler: uploadAllAnswer
	}];

    var model = { 'updateTime': null, rooms: [] };
    var tmpContacts = [];
    var tmpIndex = 0;
    var url = 'http://newtestnew.azurewebsites.net/ServiceControl/service.svc/';

    function init(query) {
        loadModel();        
        View.render({ model: model, bindings: bindings, unSync: countUnSync(), contactUnSync: contactUnSync()});
    }

    /////////////////////////////////////////////////////////////////////////////
    ////// function for notification tab
    /////////////////////////////////////////////////////////////////////////////
    function countUnSync() {
        return app.utils.getAnswers().length;
    }

    function uploadAllAnswer() {
        [].forEach.call(document.getElementsByTagName('a'), function (el) {
            if (el.innerText == 'อัพโหลด') {
                uploadAnswer({ 'target': el });
            }
        });
    }

    function uploadAnswer(e) {
        if (!navigator.onLine) {
            app.f7.alert('ไม่สามารถเชื่อมต่ออินเตอร์เน็ตได้ โปรดตรวจสอบการตั้งค่า');
            return;
        }
        e.target.style.display = 'none';
        e.target.nextElementSibling.style.display = '';
        var CID = e.target.getAttribute('data-CID');
        var answerId = e.target.getAttribute('data-value');
        var memo = JSON.parse(localStorage.getItem("memo"));
        if (!memo['0'] || !memo['1']) {
            return;
        }
        var _tmp = JSON.parse(localStorage.getItem("answer-" + answerId));
        var array = [];
        var answer = _.map(_tmp.answers, function (value) { var key = Object.keys(value)[0]; return key + ':' + value[key] });
        var postData = encodeURIComponent(JSON.stringify(answer));
        var _url = url + 'SaveRecord?Mode=0000&CID=' + CID;
        _url += '&StaffId=' + localStorage.getItem('staff');
        _url += '&HostId=' + localStorage.getItem('host');
        _url += '&RecDate=' + _tmp.recordDate;
        _url += '&SystemType=00001&src=02&Data=' + postData;

        Dom7.ajax({
            url: _url,
            method: 'GET',
            dataType: "json",
            crossDomain: true,
            success: function (msg) {
                e.target.nextElementSibling.style.display = 'none';
                e.target.innerText = '';
                e.target.style.display = 'block';
                localStorage.removeItem("answer-" + answerId);
                View.updateCountUnSync(countUnSync());
                var icon = document.createElement("i");
                icon.className = 'icon ion-checkmark';
                e.target.appendChild(icon);
                setTimeout(function () {
                    e.target.parentElement.parentElement.parentElement.remove();
                }, 1000);
            },
            error: function (error) {
                app.f7.alert('โปรดติดต่อผู้ดูแลระบบ', 'ERROR! ' + error.statusText);
                app.f7.pullToRefreshDone();
            }
        });
    }

    function contactUnSync() {
        var f7Contacts = localStorage.getItem("f7Contacts");
        if (!f7Contacts) {
            return 0;
        }
        var contacts = JSON.parse(f7Contacts);
        var answers = app.utils.getAnswers();
        var result = [];
        for (var i = 0; i < answers.length; i++) {
            for (var j = 0; j < contacts.length; j++) {
                if (answers[i].personId == contacts[j].id) {
                    var tmp = contacts[j];
                    tmp['answerId'] = answers[i].id;
                    result.push(tmp);
                }
            }
        }
        result.sort(contactSort);
        result = _.map(result, function (value) { return { name: value.firstName + ' ' + value.lastName, id: value.answerId, class: value.classId, room: value.roomId, CID: value.CID } });
        return result;
    }

    /////////////////////////////////////////////////////////////////////////////
    ////// function for database tab
    /////////////////////////////////////////////////////////////////////////////

    function loadModel() {
        var tmp = JSON.parse(localStorage.getItem("rooms"));
        if (tmp) {
            model = tmp;
        }
    }

    function syncData() {
        app.f7.confirm('', 'อัพเดทข้อมูลหรือไม่?',
            function () {
                setTimeout(function () {
                    var memo = JSON.parse(localStorage.getItem("memo"));
                    if (!memo['0'] || !memo['1']) {
                        return;
                    }
                    var url = 'http://private-edu.azurewebsites.net/webservices/getservice.svc/getStudents?USERNAME=' + app.utils.Base64.decode(memo['0']) + '&PASSWORD=' + app.utils.Base64.decode(memo['1']) + '&YEAR=' + (new Date()).getFullYear();
                    Dom7.ajax({
                        url: url,
                        dataType: 'json',
                        success: function (msg) {                            
                            var response = JSON.parse(msg);
                            if (response.status.toLowerCase() == 'ok') {
                                model.updateTime = app.utils.getDateTimeNow();
                                model.rooms = [];
                                var data = response.data;
                                var contacts = [];
                                tmpContacts = [];
                                for (var i = 0; i < data.length; i++) {
                                    var rooms = data[i].rooms;
                                    for (var j = 0; j < rooms.length; j++) {
                                        model.rooms.push({
                                            id: data[i].classId + '' + rooms[j].roomId,
                                            classId: data[i].classId,
                                            roomId: rooms[j].roomId,
                                            text: data[i].className + '/' + rooms[j].roomId
                                        });
                                        var students = rooms[j].students;
                                        for (var k = 0; k < students.length; k++) {
                                            if (students[k].Name) {
                                                var name = students[k].Name.split(' ').slice(1).join(' ').trim();
                                                contacts.push(new Contact({
                                                    "firstName": name.split(' ')[0],
                                                    "lastName": name.split(' ').slice(1).join(' ').trim(),
                                                    "class": data[i].className,
                                                    "classId": data[i].classId,
                                                    "roomId": rooms[j].roomId,
                                                    "pic": students[k].Pic,
                                                    "CID": students[k].CID,
                                                    "studentId": students[k].StudentId,
                                                    "company": "",
                                                    "phone": "", "email": "",
                                                    "city": "", "isFavorite": true,
                                                    "lat": students[k].Lat, "long": students[k].Long,
                                                    "addressId" : '',
                                                    "houseNumber": '',
                                                    "mooNumber": '',
                                                    "alley": '',
                                                    "streetName": '',
                                                    "villageId": '',
                                                    "villageName": '',
                                                    "tumbonId": '',
                                                    "tumbonDescription": '',
                                                    "provinceId": '',
                                                    "provinceDescription": '',
                                                    "postCode": '',
                                                    "homeCode": ''
                                                }));
                                            }
                                        }
                                    }
                                }
                                tmpContacts = contacts.slice();
                                localStorage.setItem("rooms", JSON.stringify(model));
                                tmpIndex = 0;
                                getAddress();                                
                            }
                            else {
                                app.f7.alert(response.errorMessage);
                                app.f7.pullToRefreshDone();
                            }
                        },
                        error: function (error) {
                            console.log(error)
                            app.f7.alert(error.statusText + ' โปรดติดต่อผู้ดูแลระบบ');
                            app.f7.pullToRefreshDone();
                        }
                    });                    
                }, 1000);
            },
            function () {
                app.f7.pullToRefreshDone();
            }
        );
    }

    function getAddress() {
        var CID = tmpContacts[tmpIndex].CID;
        var _url = url + 'getAddress?CID=' + CID + '&AddressType=002';

        Dom7.ajax({
            url: _url,
            method: 'GET',
            dataType: "json",
            crossDomain: true,
            success: function (msg) {                
                var response = JSON.parse(msg);
                if (response.status.toLowerCase() == 'ok') {
                    tmpContacts[tmpIndex].addressId = response.addressID;
                    tmpContacts[tmpIndex].houseNumber = response.houseNumber;
                    tmpContacts[tmpIndex].mooNumber = response.mooNumber;
                    tmpContacts[tmpIndex].alley = response.alley;
                    tmpContacts[tmpIndex].streetName = response.streetName;
                    tmpContacts[tmpIndex].villageId = response.villageId;
                    tmpContacts[tmpIndex].villageName = response.villageName;
                    tmpContacts[tmpIndex].tumbonId = response.tumbonId;
                    tmpContacts[tmpIndex].tumbonDescription = response.tumbonDescription;
                    tmpContacts[tmpIndex].provinceId = response.provinceId;
                    tmpContacts[tmpIndex].provinceDescription = response.provinceDescription;
                    tmpContacts[tmpIndex].postCode = response.postCode;
                    tmpContacts[tmpIndex].homeCode = response.homeCode;
                    tmpIndex++;
                    if (tmpIndex < tmpContacts.length) {
                        getAddress();
                    }
                    else {
                        localStorage.setItem("f7Contacts", JSON.stringify(tmpContacts));
                        tmpContacts = [];
                        app.router.load('list');
                        app.f7.pullToRefreshDone();
                        View.render({ model: model, bindings: bindings, unSync: countUnSync(), contactUnSync: contactUnSync() });
                    }
                }
                else {
                    app.f7.alert('ไม่สามารถโหลดที่อยู่ของ ' + CID + ' ได้', 'ERROR! ' + response.errorMessage);
                    localStorage.setItem("f7Contacts", JSON.stringify(tmpContacts));
                    tmpContacts = [];
                    app.router.load('list');
                    app.f7.pullToRefreshDone();
                    View.render({ model: model, bindings: bindings, unSync: countUnSync(), contactUnSync: contactUnSync() });
                    return;
                }
            },
            error: function (error) {
                app.f7.alert('ไม่สามารถโหลดที่อยู่ของ ' + CID + ' ได้', ' SERVICE ERROR! ' + error.statusText);
                localStorage.setItem("f7Contacts", JSON.stringify(tmpContacts));
                tmpContacts = [];
                app.router.load('list');
                app.f7.pullToRefreshDone();
                View.render({ model: model, bindings: bindings, unSync: countUnSync(), contactUnSync: contactUnSync() });
                return;
            }
        });
    }

    function roomClick(e) {
        var id = e.target.getAttribute('data-value');
        if (!id) {
            return;
        }

        var room = model.rooms.filter(function isBigEnough(obj) {
            return obj.id == id;
        });

        var filter = { "roomId": room[0].roomId, "classId": room[0].classId };
        var contacts = loadContacts(filter);
        View.renderRight(room[0].text, contacts);
        app.f7.openPanel('right');
    }

    function loadContacts(filter) {
        var f7Contacts = localStorage.getItem("f7Contacts");
        var contacts = f7Contacts ? JSON.parse(f7Contacts) : tempInitializeStorage();
        if (filter) {
            contacts = _.filter(contacts, filter);
        }
        contacts.sort(contactSort);
        contacts = _.map(contacts, function (value) { return value.firstName + ' ' + value.lastName });
        return contacts;
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

    function closeRightPanel() {
        app.f7.closePanel();
    }

    function backClick() {
        app.router.load('list');
        closePage();
    }

    function closePage() {       
        app.f7.closeModal();
    }

    return {
        init: init
    };
});