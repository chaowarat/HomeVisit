define(['app', 'js/contactModel', 'hbs!js/map/map'], function (app, Contact, dailyForm) {
    var $ = Dom7;
    var contact;

    function render(params) {
        contact = params.model;
	    var template = dailyForm({ model: params.model });
		app.f7.popup(template);
		bindEvents(params.bindings);
		bindUIEvent(params.saveAddressHandle);
	}

	function bindEvents(bindings) {
		for (var i in bindings) {
			$(bindings[i].element).on(bindings[i].event, bindings[i].handler);
		}
	}

	function bindUIEvent(saveAddressHandle) {
	    $('.close-map').on('click', function () {
	        app.f7.closeModal('#mapModal');
	    });
	    $('.edit-address-link').on('click', function () {
	        app.f7.popover('.popover-address', this);
            $('#popover_houseNumber').val(contact.houseNumber);
            $('#popover_mooNumber').val(contact.mooNumber);
            $('#popover_province option[value="' + contact.provinceId + '"]').attr('selected', 'selected');
            $('#popover_city option[value="' + contact.cityId + '"]').attr('selected', 'selected');
            $('#popover_tumbon option[value="' + contact.tumbonId + '"]').attr('selected', 'selected');
            $('#popover_village option[value="' + contact.villageId + '"]').attr('selected', 'selected');
            $('#popover_postCode').val(contact.postCode);
	    });
	    $('.save-address-button').on('click', function () {
	        var buttons = [
                {
                    text: 'บันทึกข้อมูลที่อยู่ใหม่',
                    bold: true,
                    onClick: function () {
                        var e = document.getElementById("popover_province");
                        var selectedProvince = e.options[e.selectedIndex].value;
                        var selectedProvinceText = e.options[e.selectedIndex].text;
                        e = document.getElementById("popover_city");
                        var selectedCity = e.options[e.selectedIndex].value;
                        var selectedText = e.options[e.selectedIndex].text;
                        e = document.getElementById("popover_tumbon");
                        var selectedTumbon = e.options[e.selectedIndex].value;
                        var selectedTumbonText = e.options[e.selectedIndex].text;
                        e = document.getElementById("popover_village");
                        var selectedVillage = e.options[e.selectedIndex].value;
                        var selectedVillageText = e.options[e.selectedIndex].text;
                        saveAddressHandle(
                            $('#popover_houseNumber').val(), $('#popover_mooNumber').val(),
                            selectedProvince, selectedProvinceText, selectedCity, selectedText,
                            selectedTumbon, selectedTumbonText, selectedVillage, selectedVillageText,
                            $('#popover_postCode').val());
                        app.f7.closeModal('.popover-address');
                    }
                },
                {
                    text: 'ยกเลิก'
                }
	        ];
	        app.f7.actions(buttons);	        
	    });
	}

	function setHeader(distance, duration) {
	    $('#mapTitle').text(distance + '(' + duration + ')');
	}

	return {
	    render: render,
	    setHeader: setHeader
	};
});