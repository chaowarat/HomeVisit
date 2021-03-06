require.config({
    paths: {
        handlebars: "lib/handlebars",
        text: "lib/text",
        hbs: "lib/hbs"
    },
    shim: {
        handlebars: {
            exports: "Handlebars"
        }
    }
});
define('app', ['js/router', 'js/utils'], function(Router, Utils) {
    Router.init();    
	var f7 = new Framework7({
		modalTitle: 'Contacts7',
		swipePanel: 'left',
		animateNavBackIcon: true,
		material: true
	});
	f7.loginScreen();
    var mainView = f7.addView('.view-main', {
        dynamicNavbar: true
    });
    var mySearchbar = f7.searchbar('.searchbar', {
        searchList: '.contacts-list',
        searchIn: '.item-title'
    });

    var isGetMap = false;
	
	var memo = JSON.parse(localStorage.getItem("memo"));
	if (memo) {
	    if(navigator.onLine){
			f7.confirm('อัพเดทข้อมูลหรือไม่?', 'เชื่อมต่ออินเตอร์เน็ตอยู่',
				function () {
					localStorage.setItem("autoupdate", "true");
					Router.load('sync');
				},
				function () {
				}
			);			
		}
	}
		
	return {
		f7: f7,
		mainView: mainView,
		router: Router,
		utils: Utils,
		isGetMap: isGetMap
	};
});