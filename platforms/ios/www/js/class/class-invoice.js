function Invoice () {
	this.id 		 = 0;
	this.salesperson = '';
	
	this.customer 			= {first:'', last:'', email:'', phoneNumber:''};
	this.customer.billing  	= {city:'', state:'', street:'', streetTwo:'', zip:''};
	this.customer.shipping 	= {city:'', state:'', street:'', streetTwo:'', zip:''};

	this.delivery			= {method:'', cost:0, date:'00/00/00', month:'00', day:'00', year:'00', location:'', notes:''};
	
	this.payments 		= [];
	this.salesLines 	= [];

	this.subtotalAmount = 0;
	this.taxPercent 	= 0.101;
	this.taxAmount 		= 0;
	this.totalAmount 	= 0;
	this.balance 		= 0;
}

Invoice.prototype.addLine = function(item){
	this.salesLines.push(item);
	NativeStorage.setItem('cart', JSON.stringify(this.salesLines), noop, noop);
	this.recalc();
};
Invoice.prototype.deleteLine = function(id){
	this.salesLines.splice(id, 1);
	NativeStorage.setItem('cart', JSON.stringify(this.salesLines), noop, noop);
	this.recalc();
};
Invoice.prototype.changeQuantity = function(id, newQuantity){
	this.salesLines[id].quantity = newQuantity;
	NativeStorage.setItem('cart', JSON.stringify(this.salesLines), noop, noop);
	this.recalc();
};
Invoice.prototype.changeLocation = function(id, location){
	var prevLocation = this.salesLines[id].location;
	this.salesLines[id].location = location;
	for (var i = 0; i < this.salesLines[id].stock.length; i++) {
		if(this.salesLines[id].stock[i].locationletter == location){
			var destinationMaxQuantity = this.salesLines[id].stock[i].available;
			this.salesLines[id].quantity = (this.salesLines[id].quantity > destinationMaxQuantity) ? destinationMaxQuantity : this.salesLines[id].quantity;
		}
	}
	NativeStorage.setItem('cart', JSON.stringify(this.salesLines), noop, noop);
	this.recalc();
};
Invoice.prototype.recalc = function(item){
	this.subtotalAmount = 0;
	this.taxAmount 		= 0;
	this.totalAmount 	= 0;
	for (var i = 0; i < this.salesLines.length; i++) {
		var quantityDollarAmount = this.salesLines[i].retailAmount * this.salesLines[i].quantity;
		this.subtotalAmount += quantityDollarAmount;
		this.taxAmount += quantityDollarAmount * this.taxPercent;
	}
	this.totalAmount = this.subtotalAmount + this.taxAmount;
};
Invoice.prototype.getRemainingBalance = function(){
	this.balance = this.totalAmount + this.delivery.cost;
	for (var i = 0; i < this.payments.length; i++) {
		this.balance -= this.payments[i].amount;
	}
	return this.balance;
}
Invoice.prototype.setFirstName = function(first){
	this.customer.first = first;
	NativeStorage.setItem('first', this.customer.first, noop, noop);
};
Invoice.prototype.setLastName = function(last){
	this.customer.last = last;
	NativeStorage.setItem('last', this.customer.last, noop, noop);
};
Invoice.prototype.setPhoneNumber = function(phoneNumber){
	this.customer.phoneNumber = phoneNumber;
	NativeStorage.setItem('phoneNumber', this.customer.phoneNumber, noop, noop);
};
Invoice.prototype.setEmail = function(email){
	this.customer.email = email;
	NativeStorage.setItem('email', this.customer.email, noop, noop);
};
Invoice.prototype.resetCustomerInfo = function(){
	this.setFirstName('');
	this.setLastName('');
	this.setPhoneNumber('');
	this.setEmail('');
};

Invoice.prototype.setBalance = function(amount){
	for (var i = 0; i < this.payments.length; i++) {
		amount -= this.payments[i].amount;
	}
	this.balance = amount;
};

Invoice.prototype.setBillingStreet = function(street){
	this.customer.billing.street = street;
	NativeStorage.setItem('streetOne', this.customer.billing.street, noop, noop);
};
Invoice.prototype.setBillingStreetTwo = function(street){
	this.customer.billing.streetTwo = street;
	NativeStorage.setItem('streetTwo', this.customer.billing.streetTwo, noop, noop);
};
Invoice.prototype.setBillingCity = function(city){
	this.customer.billing.city = city;
	NativeStorage.setItem('city', this.customer.billing.city, noop, noop);
};
Invoice.prototype.setBillingState = function(state){
	this.customer.billing.state = state;
	NativeStorage.setItem('state', this.customer.billing.state, noop, noop);
};
Invoice.prototype.setBillingZip = function(zip){
	this.customer.billing.zip = zip;
	NativeStorage.setItem('zip', this.customer.billing.zip, noop, noop);
};
Invoice.prototype.getBilling = function(){
	var address = 	this.customer.billing.street + ', ' +
					this.customer.billing.city +  ', ' +
					this.customer.billing.state + ' ' + 
					this.customer.billing.zip;
	return(address);
};
Invoice.prototype.resetBillingInfo = function(){
	this.setBillingStreet('');
	this.setBillingStreetTwo('');
	this.setBillingCity('');
	this.setBillingState('');
	this.setBillingZip('');
};

Invoice.prototype.setShippingStreet = function(street){
	this.customer.shipping.street = street;
	NativeStorage.setItem('streetOne-shipping', this.customer.shipping.street, noop, noop);
};
Invoice.prototype.setShippingStreetTwo = function(street){
	this.customer.shipping.streetTwo = street;
	NativeStorage.setItem('streetTwo-shipping', this.customer.shipping.streetTwo, noop, noop);
};
Invoice.prototype.setShippingCity = function(city){
	this.customer.shipping.city = city;
	NativeStorage.setItem('city-shipping', this.customer.shipping.city, noop, noop);
};
Invoice.prototype.setShippingState = function(state){
	this.customer.shipping.state = state;
	NativeStorage.setItem('state-shipping', this.customer.shipping.state, noop, noop);
};
Invoice.prototype.setShippingZip = function(zip){
	this.customer.shipping.zip = zip;
	NativeStorage.setItem('zip-shipping', this.customer.shipping.zip, noop, noop);
};
Invoice.prototype.getShipping = function(){
	var address = 	this.customer.shipping.street + ', ' +
					this.customer.shipping.city +  ', ' +
					this.customer.shipping.state + ' ' + 
					this.customer.shipping.zip;
	return(address);
};
Invoice.prototype.resetShippingInfo = function(){
	this.setShippingStreet('');
	this.setShippingStreetTwo('');
	this.setShippingCity('');
	this.setShippingState('');
	this.setShippingZip('');
};

Invoice.prototype.getDeliveryMethod = function() { return this.delivery.method; };
Invoice.prototype.setDeliveryMethod = function(method) {
	this.delivery.method = method;
	NativeStorage.setItem('method', this.delivery.method, noop, noop);
};
Invoice.prototype.getDeliveryCost = function() { return this.delivery.cost; };
Invoice.prototype.setDeliveryCost = function(cost) {
	this.delivery.cost = cost;
	NativeStorage.setItem('cost', this.delivery.cost, noop, noop);
};
Invoice.prototype.getDeliveryDateString = function() { return this.delivery.date; };
Invoice.prototype.setDeliveryDateString = function(month, day, year) {
	this.delivery.month = month;
	this.delivery.day = day;
	this.delivery.year = year;
	this.delivery.date = month+'/'+day+'/'+year;
	NativeStorage.setItem('month', this.delivery.month, noop, noop);
	NativeStorage.setItem('day', this.delivery.day, noop, noop);
	NativeStorage.setItem('year', this.delivery.year, noop, noop);
	NativeStorage.setItem('date', this.delivery.date, noop, noop);
};
Invoice.prototype.getTaxPercent = function() { return this.taxPercent; };
Invoice.prototype.setTaxPercent = function(taxPercent) {
	this.taxPercent = taxPercent;
	NativeStorage.setItem('taxPercent', this.taxPercent, noop, noop);
	this.recalc();
};
Invoice.prototype.getDeliveryLocation = function() { return this.delivery.location; };
Invoice.prototype.setDeliveryLocation = function(location) {
	this.delivery.location = location;
	NativeStorage.setItem('location', this.delivery.location, noop, noop);
};
Invoice.prototype.getDeliveryNotes = function() { return this.delivery.notes; };
Invoice.prototype.setDeliveryNotes = function(notes) {
	this.delivery.notes = notes;
	NativeStorage.setItem('notes', this.delivery.notes, noop, noop);
};
Invoice.prototype.resetDeliveryInfo = function(){
	this.setDeliveryMethod('team');
	this.setDeliveryCost(0);
	this.setDeliveryDateString('00', '00', '00');
	this.setTaxPercent(0.101);
	this.setDeliveryNotes('');
	this.recalc();
};
Invoice.prototype.setSalesLines = function(cartObject){
	this.salesLines = cartObject;
	this.recalc();
};
Invoice.prototype.setPayments = function(paymentObject){
	this.payments = paymentObject;
	NativeStorage.setItem('payments', JSON.stringify(this.payments), noop, noop);
};
Invoice.prototype.addPayments = function(paymentObject){
	this.payments = this.payments.concat(paymentObject);
	NativeStorage.setItem('payments', JSON.stringify(this.payments), noop, noop);
};

Invoice.prototype.createInvoice = function(){
	//var tm = new TaskMaster();
	//tm.createInvoice();
};

Invoice.prototype.draw = function(selector){
	var cart = '';
	for (var i = 0; i < this.salesLines.length; i++) {
		cart += '<div class="card" data-id="'+i+'">' +
				    '<div class="card-header">'+this.salesLines[i].model+'<span class="delete-line" data-id="'+i+'"><i class="icon f7-icons">close_round</i></span></div>' +
				    '<div class="card-content">' + /* TODO : Find Better Way To Show Characteristics */
				        '<div class="card-content-inner">'+this.salesLines[i].name+'</div>' +
				    '</div>' +
				    '<div class="card-footer">'+
					    '<div class="row" style="width: 100%; text-align: center;">' +
					    	'<div class="col-33">' +
					    		'<p>' + this.salesLines[i].retailAmount + '</p>'+
					    	'</div>' +
					    	'<div class="col-33 quantity-col-card" data-id="'+i+'">' +
					    		'<p>QTY:' + this.salesLines[i].quantity + '</p>'+
					    	'</div>' +
					    	'<div class="col-33 location-col-card" data-id="'+i+'">' +
					    		'<p>' +this.salesLines[i].location + '</p>'+
					    	'</div>' +
					    '</div>' +
				    '</div>' +
				'</div>';
		 
	}
	if (selector !== undefined) {
		$$(selector).empty();
		$$(selector).append(cart);
	} else {
		$$('.cart-list').empty();
		$$('.cart-list').append(cart);
	}
};

Invoice.prototype.itemPopup = function(item){
	var stockTable 	= 	createStockTable(item.stock);
	var popupHTML = '<div class="popup stock-popup">'+
						'<div class="content-block center-align">'+
							'<div><h1>'+item.model+'</h1></div>'+
							'<div><h3>'+item.brand+'</h3></div>'+
							'<div><p class="low-vis-black">'+item.categoryname+'</p></div>'+
							'<div class="row attribute-border">' +
								'<div class="col-33">'+item.size+'</div>' +
								'<div class="col-33">'+item.color+'</div>' +
								'<div class="col-33">'+item.material+'</div>' +
							'</div>' +
							'<div><img src="media/products/no-product-pic_icon.png"></div>'+
							'<div><p>'+formatNumberMoney(item.retailAmount)+'</p></div>'+
							'<div class="stock-table">' +
								'<div class="list-block-title left-align">Choose Stock</div>' +
							'</div>' +
							'<div class="row popup-action-button-div">' +
								'<div class="col-50 popup-action-button close-popup" style="background-color:red;"><p>Close</p></div>'+
								'<div class="col-50 popup-action-button add-to-cart"><p>Add to Cart</p></div>'+
							'</div>' +
							'<div><p class="low-vis-black">'+item.sku+'</p></div>'+
						'</div>'+
					'</div>';
	myApp.popup(popupHTML);

	$$('.stock-table').append(stockTable);

	$$('.add-to-cart').on('click', function(){
		var stockOptions = $$('.stock-table-quantity');

		for (var i = 0; i < stockOptions.length; i++) {
			if(stockOptions[i].value > 0){
				var lineItem = JSON.parse(JSON.stringify(item));
				lineItem.quantity = stockOptions[i].value;
				lineItem.location = $$(stockOptions[i]).data('location');
				Invoice.addLine(lineItem);
			}
		}
		Invoice.draw();
		myApp.closeModal('.stock-popup');
		cartDetailsToolbarHeader();
	});

	$$('.quantity-down').on('click', function(){
		var locationLine = $$(this.parentElement.parentElement.parentElement);
		var stockMax = parseInt(locationLine.find('input').data('stock'));
		var inputAmt = parseInt(locationLine.find('input').val());
		if(inputAmt <= 0){
			locationLine.find('input').val(0);
		} else {
			locationLine.find('input').val(inputAmt - 1);
		}
	});
	$$('.quantity-up').on('click', function(){
		var locationLine = $$(this.parentElement.parentElement.parentElement);
		var stockMax = parseInt(locationLine.find('input').data('stock'));
		var inputAmt = parseInt(locationLine.find('input').val());
		if(inputAmt >= stockMax){
			locationLine.find('input').val(stockMax);
		} else {
			locationLine.find('input').val(inputAmt + 1);
		}
	});
};

function createStockTable(stock){
	var stockTable = 	'<table>' +
							'<tr>' +
								'<th>Location</th>' +
								'<th></th>' +
								'<th></th>' +
							'</tr>';
	for (var i = 0; i < stock.length; i++) {
		if(stock[i].available > 0){
			var locationNickname = getLocationNickname(stock[i]);
			var stockLocationLine =	'<tr id="locationLine'+i+'" class="locationLine">' +
										'<td>'+locationNickname+ ' - ' +stock[i].available+'</td>' +
										'<td><input id="locationLineInput'+i+'" class="stock-table-quantity" type="number" value="0" data-stock="'+stock[i].available+'" data-location="'+stock[i].locationletter+'"></td>' +
										'<td><div class="row">' + 
											'<div class="col-50 quantity-down"><i class="icon f7-icons">arrow_left_fill</i></div>' +
											'<div class="col-50 quantity-up"><i class="icon f7-icons">arrow_right_fill</i></div>' +
										'</div></td>' +
									'</tr>';
			stockTable += stockLocationLine;
		} else {
			stockTable += '<td colspan="3" style="text-align: center;">'+stock[i].locationname+' - Out Of Stock</td>';
		}
	}
	stockTable += '</table>';
	return stockTable;
}

function getLocationNickname(stock){
	switch(stock.locationid){
		case 1:
			return 'Store';
		case 2:
			return 'Warehouse';
		case 5:
			return 'Outlet';
		case -1:
			return 'FM';
		default:
			return 'XX';
	}
}

Invoice.prototype.paymentPopup = function(){
	var balance = this.balance;
	var payments = [];
	var popupHTML = '<div class="popup payment-popup" id="payment-pop">'+
						'<div class="popup-header"><h1>Payment Received Today</h1></div>'+
						'<div class="content-block center-align">'+
							'<div id="date-payment-div">Date:<b>4/24/17</b></div>'+
							'<div id="balance-payment-div">Balance:<b><span id="remaining-balance">'+formatNumberMoney(balance)+'</span></b></div>'+
							'<div>Amount:<input id="balance-input" type="number"><span class="payment-type-button" data-type="Full"><-- Pay in Full</span></div>'+
							'<div class="row">' +
								'<div class="col-50"><p class="payment-type-button right-float" data-type="Cash">Cash</p></div>'+
								'<div class="col-50"><p class="payment-type-button left-float" data-type="Check">Check</p></div>'+
							'</div>' +
							'<div class="row">' +
								'<div class="col-50"><p class="payment-type-button right-float" data-type="Charge">Charge</p></div>'+
								'<div class="col-50"><p class="payment-type-button left-float" data-type="Finance">Finance</p></div>'+
							'</div>' +
							'<div class="row">' +
								'<div class="col-50"><p class="payment-type-button right-float" data-type="Paypal">Paypal</p></div>'+
								'<div class="col-50"><p class="payment-type-button left-float" data-type="InstoreCredit">InstoreCredit</p></div>'+
							'</div>' +
							'<div class="row">' +
								'<div class="col-50"><p class="payment-type-button right-float" data-type="Stripe4Woocomerce">Stripe4Woocomerce</p></div>'+
								'<div class="col-50"><p class="payment-type-button left-float" data-type="Admin">Admin Write Off</p></div>'+
							'</div>' +
							'<div class="row">' +
								'<div class="col-50"><p class="payment-type-button right-float" data-type="Gift">Gift Card</p></div>'+
								'<div class="col-50"><p class="payment-type-button left-float" data-type="Multi">Multi</p></div>'+
							'</div>' +
							'<div class="row popup-action-button-div">' +
								'<div class="col-30 popup-action-button close-popup" style="background-color:red;"><p>Close</p></div>'+
								'<div class="col-10"></div>'+
								'<div class="col-30 popup-action-button"><p>No Payment</p></div>'+
								'<div class="col-30 popup-action-button add-payments"><p>Okay</p></div>'+
							'</div>' +
						'</div>'+
					'</div>';
	myApp.popup(popupHTML);

	$$('#balance-input').on('keyup', function(){
		if(this.value > balance){
			$$('#balance-input').val(balance.toFixed(2));
		}
	});

	$$('.payment-type-button').on('click', function(){
		var amount = $$('#balance-input').val();
		var type = $$(this).data('type');
		if(type == "Full" || amount > 0 && !isNaN(amount) && type != "Full"){
			switch(type){
				case 'Cash':
					payments.push({type:type, amount:amount});
					break;
				case 'Check':
					payments.push({type:type, amount:amount});
					break;
				case 'Charge':
					payments.push({type:type, amount:amount});
					break;
				case 'Finance':
					payments.push({type:type, amount:amount});
					break;
				case 'Paypal':
					payments.push({type:type, amount:amount});
					break;
				case 'InstoreCredit':
					payments.push({type:type, amount:amount});
					break;
				case 'Stripe4Woocomerce':
					payments.push({type:type, amount:amount});
					break;
				case 'Admin':
					payments.push({type:type, amount:amount});
					break;
				case 'Gift':
					payments.push({type:type, amount:amount});
					break;
				case 'Multi':
					payments.push({type:type, amount:amount});
					break;
				case 'Full':
					$$('#balance-input').val(balance.toFixed(2));
					break;
			}
			if(type != 'Full'){
				balance -= amount;
				$$('#remaining-balance').text(formatNumberMoney(balance));
				Invoice.drawPayments(payments);
				$$('#balance-input').val('');
			}
		}
	});
	$$('.add-payments').on('click', function(){
		Invoice.addPayments(payments);
		$$('#summary-paid').text(formatNumberMoney(Invoice.getRemainingBalance()));
		$$('#summary-paid-label').show();
		myApp.closeModal('#payment-pop');
	});
};

Invoice.prototype.drawPayments = function(payments){
	$$('#payment-div').remove();
	var html = '<div id="payment-div" class="list-block"><ul>';
	for (var i = payments.length - 1; i >= 0 ; i--) {
		var paymentLine = 	'<li class="item-content">' +
								'<div class="item-media"></div>' +
								'<div class="item-inner">' +
									'<div class="item-title">'+payments[i].amount+'</div>' +
									'<div class="item-after">'+payments[i].type+'</div>' +
								'</div>' +
							'</li>';
		html += paymentLine;
	}
	$$('#payment-pop').append(html+'</ul></div>');
}


Invoice.prototype.getSkus = function(){
	var skus = '';
	for (var i = 0; i < this.salesLines.length; i++) {
		skus += this.salesLines[i].sku + ',';
	}
	skus = skus.substring(0, skus.length-1);
	return skus;
};

Invoice.prototype.reinit = function(){
	this.resetCustomerInfo();
    this.resetBillingInfo();
    this.resetShippingInfo();
    this.resetDeliveryInfo();
    this.salesLines = [];
    NativeStorage.setItem('cart', '', noop, noop);
    this.payments = [];
    NativeStorage.setItem('payments', '', noop, noop);
    this.setBalance(0);
    this.recalc();
    mainView.router.refreshPage();
};

Invoice.prototype.init = function(){
	NativeStorage.getItem('first', function(obj){  Invoice.setFirstName(obj); }, consool);
	NativeStorage.getItem('last', function(obj){  Invoice.setLastName(obj); }, consool);
	NativeStorage.getItem('phoneNumber', function(obj){  Invoice.setPhoneNumber(obj); }, consool);
	NativeStorage.getItem('email', function(obj){ Invoice.setEmail(obj); }, consool);

	NativeStorage.getItem('streetOne', function(obj){ Invoice.setBillingStreet(obj); }, consool);
	NativeStorage.getItem('streetTwo', function(obj){ Invoice.setBillingStreetTwo(obj); }, consool);
	NativeStorage.getItem('city', function(obj){ Invoice.setBillingCity(obj); }, consool);
	NativeStorage.getItem('state', function(obj){ Invoice.setBillingState(obj); }, consool);
	NativeStorage.getItem('zip', function(obj){ Invoice.setBillingZip(obj); }, consool);

	NativeStorage.getItem('streetOne-shipping', function(obj){ Invoice.setShippingStreet(obj); }, consool);
	NativeStorage.getItem('streetTwo-shipping', function(obj){ Invoice.setShippingStreetTwo(obj); }, consool);
	NativeStorage.getItem('city-shipping', function(obj){ Invoice.setShippingCity(obj); }, consool);
	NativeStorage.getItem('state-shipping', function(obj){ Invoice.setShippingState(obj); }, consool);
	NativeStorage.getItem('zip-shipping', function(obj){ Invoice.setShippingZip(obj); }, consool);

	NativeStorage.getItem('method', function(obj){ Invoice.setDeliveryMethod(obj); }, consool);
	NativeStorage.getItem('cost', function(obj){ Invoice.setDeliveryCost(obj); }, consool);
	NativeStorage.getItem('date', function(obj){ Invoice.delivery.date = obj; }, consool);
	NativeStorage.getItem('month', function(obj){ Invoice.delivery.month = obj; }, consool);
	NativeStorage.getItem('day', function(obj){ Invoice.delivery.day = obj; }, consool);
	NativeStorage.getItem('year', function(obj){ Invoice.delivery.year = obj; }, consool);
	NativeStorage.getItem('location', function(obj){ Invoice.delivery.location = obj; }, consool);
	NativeStorage.getItem('notes', function(obj){ Invoice.delivery.notes = obj; }, consool);

	NativeStorage.getItem('cart', function(obj){ Invoice.setSalesLines(JSON.parse(obj)); }, consool);
	NativeStorage.getItem('payments', function(obj){ Invoice.setPayments(JSON.parse(obj)); }, consool);
};