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
            $('#popover_postCode').val(contact.postCode);

            if ($('#popover_province').html().length > 0) return;
            $.ajax({
                type: "GET",
                url: "js/thailand/provinces.js",
                dataType: "json",
                success: function (data) {
                    data.sort(function (a, b) {
                        return a.text.localeCompare(b.text);
                    });
                    var ddl = $('#popover_province');
                    for (var i = 0; i < data.length; i++) {
                        var option = '<option value="' + data[i].id + '">' + data[i].text + '</option>';
                        ddl.append(option);
                    }

                    $('#popover_province').off('change').on('change', function (e) {
                        var e = document.getElementById("popover_province");
                        var selectedProvince = e.options[e.selectedIndex].value;
                        $.ajax({
                            type: "GET",
                            url: "js/thailand/cities.js",
                            dataType: "json",
                            success: function (data) {                                
                                var ddl = $('#popover_city');
                                ddl.html('');
                                data = data.filter(function (el) {
                                    return el.provinceId == selectedProvince;
                                });
                                data.sort(function (a, b) {
                                    return a.text.localeCompare(b.text);
                                });
                                for (var i = 0; i < data.length; i++) {
                                    var option = '<option value="' + data[i].id + '">' + data[i].text + '</option>';
                                    ddl.append(option);
                                }

                                ddl.off('change').on('change', function (e) {
                                    var e = document.getElementById("popover_city");
                                    var selectedCity = e.options[e.selectedIndex].value;
                                    $.ajax({
                                        type: "GET",
                                        url: "js/thailand/tumbons.js",
                                        dataType: "json",
                                        success: function (data) {
                                            var ddl = $('#popover_tumbon');
                                            ddl.html('');
                                            data = data.filter(function (el) {
                                                return el.cityId == selectedCity;
                                            });
                                            data.sort(function (a, b) {
                                                return a.text.localeCompare(b.text);
                                            });
                                            for (var i = 0; i < data.length; i++) {
                                                var option = '<option value="' + data[i].id + '">' + data[i].text + '</option>';
                                                ddl.append(option);
                                            }

                                            ddl.off('change').on('change', function (e) {
                                                var e = document.getElementById("popover_tumbon");
                                                var selectedTumbon = e.options[e.selectedIndex].value;
                                                $.ajax({
                                                    type: "GET",
                                                    url: "js/thailand/villages.js",
                                                    dataType: "json",
                                                    success: function (data) {
                                                        var ddl = $('#popover_village');
                                                        ddl.html('');
                                                        data = data.filter(function (el) {
                                                            return el.tumbonId == selectedTumbon;
                                                        });
                                                        data.sort(function (a, b) {
                                                            return a.text.localeCompare(b.text);
                                                        });
                                                        for (var i = 0; i < data.length; i++) {
                                                            var option = '<option value="' + data[i].id + '">' + data[i].text + '</option>';
                                                            ddl.append(option);
                                                        }
                                                        $('#popover_village option[value="' + contact.villageId + '"]').attr('selected', 'selected');
                                                    },
                                                    error: function (e) {
                                                        alert('ไม่สามารถโหลดรายชื่อหมู่บ้านได้');
                                                        console.log(e);
                                                    }
                                                });
                                            });
                                            $('#popover_tumbon option[value="' + contact.tumbonId + '"]').attr('selected', 'selected');
                                            ddl.trigger("change");
                                        },
                                        error: function (e) {
                                            alert('ไม่สามารถโหลดรายชื่อตำบลได้');
                                            console.log(e);
                                        }
                                    });
                                });
                                $('#popover_city option[value="' + contact.cityId + '"]').attr('selected', 'selected');
                                ddl.trigger("change");
                            },
                            error: function (e) {
                                alert('ไม่สามารถโหลดรายชื่ออำเภอได้');
                                console.log(e);
                            }
                        });
                    });
                    $('#popover_province option[value="' + contact.provinceId + '"]').attr('selected', 'selected');
                    ddl.trigger("change");

                },
                error: function (e) {
                    alert('ไม่สามารถโหลดรายชื่อจังหวัดได้');
                    console.log(e);
                }
            });
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
                        var selectedVillage = '';
                        var selectedVillageText = '';
                        if (e.selectedIndex > 0) {
                            var selectedVillage = e.options[e.selectedIndex].value;
                            var selectedVillageText = e.options[e.selectedIndex].text;
                        }                        
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