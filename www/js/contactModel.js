define(['app'],function(app) {

    function Contact(values) {
		values = values || {};
		this.id = values['id'] || app.utils.generateGUID();
		this.picId = values['picId'] || app.utils.getRandomInt(1, 10);
		this.pic = values['pic'] || '';
		this.createdOn = values['createdOn'] || new Date();
		this.CID = values['CID'] || null;
		this.studentId = values['studentId'] || 1;
		this.class = values['class'] || 'อนุบาล';
		this.classId = values['classId'] || '01';
		this.roomId = values['roomId'] || 1;
		this.firstName = values['firstName'] || '';
		this.lastName = values['lastName'] || '';
		this.company = values['company'] || '';
		this.phone = values['phone'] || '';
		this.email = values['email'] || '';
		this.city = values['city'] || '';
		this.lat = values['lat'] || null;
		this.long = values['long'] || null;
		this.addressId = values['addressId'] || '';
		this.houseNumber = values['houseNumber'] || '';
		this.mooNumber = values['mooNumber'] || '';		
		this.alley = values['alley'] || '';
		this.streetName = values['streetName'] || '';
		this.villageId = values['villageId'] || '';
		this.villageName = values['villageName'] || '';
		this.tumbonId = values['tumbonId'] || '';
		this.tumbonDescription = values['tumbonDescription'] || '';
		this.provinceId = values['provinceId'] || '';
		this.provinceDescription = values['provinceDescription'] || '';
		this.postCode = values['postCode'] || '';
		this.homeCode = values['homeCode'] || '';
		this.isFavorite = values['isFavorite'] || false;
    }

	Contact.prototype.setValues = function(inputValues) {
		for (var i = 0, len = inputValues.length; i < len; i++) {
			var item = inputValues[i];
			if (item.type === 'checkbox') {
				this[item.id] = item.checked;
			}
			else {
				this[item.id] = item.value;
			}
		}
	};

	Contact.prototype.validate = function() {
		var result = true;
		if (_.isEmpty(this.firstName) && _.isEmpty(this.lastName)) {
			result = false;
		}
		return result;
	};

    return Contact;
});