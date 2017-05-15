	function Invoice (draft) {

		if(draft === undefined){
			this.id 		 = 0;
			this.salesperson = '';
			this.title 		 = 'draft';
			
			this.customer 			= {first:'', last:'', email:'', phoneNumber:''};
			this.customer.billing  	= {city:'', state:'', street:'', streetTwo:'', zip:''};
			this.customer.shipping 	= {city:'', state:'', street:'', streetTwo:'', zip:''};

			this.delivery			= {method:'', cost:0, date:'00/00/00', month:'00', day:'00', year:'00', location:'', notes:''};

			this.payments 		= [];
			this.salesLines 	= [];
			this.discounts 		= [];

			this.subtotalAmount = 0;
			this.taxPercent 	= 0.101;
			this.taxAmount 		= 0;
			this.totalAmount 	= 0;
			this.balance 		= 0;
			this.discount 		= 0;
		} else {
			this.id 		 = draft.id;
			this.salesperson = draft.salesperson;
			this.title 		 = draft.title;
			
			this.customer 			= draft.customer;
			this.customer.billing 	= draft.customer.billing;
			this.customer.shipping 	= draft.customer.shipping;

			this.delivery			= draft.delivery;
			
			this.payments 		= draft.payments;
			this.salesLines 	= draft.salesLines;
			this.discounts 		= draft.discounts;

			this.subtotalAmount = draft.subtotalAmount;
			this.taxPercent 	= draft.taxPercent;
			this.taxAmount 		= draft.taxAmount;
			this.totalAmount 	= draft.totalAmount;
			this.balance 		= draft.balance;
			this.discount 		= draft.discount;
		}
	}

/* Invoice Header */

	Invoice.prototype.setSalesperson = function(salesperson){
		this.salesperson = salesperson;
	}
	Invoice.prototype.setTitle = function(title){
		this.title = title;
		NativeStorage.setItem('title', this.customer.first, noop, noop);
	}

/* Cart Functions */

	Invoice.prototype.changeQuantity = function(id, newQuantity){
		this.salesLines[id].quantity = newQuantity;
		NativeStorage.setItem('cart', JSON.stringify(this.salesLines), noop, noop);
		this.recalc();
	}
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
	}
	Invoice.prototype.addLine = function(item){
		this.salesLines.push(item);
		NativeStorage.setItem('cart', JSON.stringify(this.salesLines), noop, noop);
		this.recalc();
	}
	Invoice.prototype.deleteLine = function(id){
		this.salesLines.splice(id, 1);
		NativeStorage.setItem('cart', JSON.stringify(this.salesLines), noop, noop);
		this.recalc();
	}
	Invoice.prototype.createInvoice = function(){
		TaskMaster.createInvoice();
	}

/* Money Functions */

	Invoice.prototype.addPayments = function(paymentObject){
		this.payments = this.payments.concat(paymentObject);
		NativeStorage.setItem('payments', JSON.stringify(this.payments), noop, noop);
	}

	Invoice.prototype.addDiscount = function(discount){
		for (var i = 0; i < this.discounts.length; i++) {
			if(this.discounts[i].type == discount.type){
				consool('already in');
				return;
			}
		}
		this.discounts.push(discount);
		NativeStorage.setItem('discounts', JSON.stringify(this.discounts), noop, noop);
		this.recalc();
	}

	Invoice.prototype.recalc = function(item){
		this.subtotalAmount = 0;
		this.taxAmount 		= 0;
		this.totalAmount 	= 0;
		this.discount 		= 0;
		for (var i = 0; i < this.salesLines.length; i++) {
			var quantityDollarAmount = this.salesLines[i].retailAmount * this.salesLines[i].quantity;
			this.subtotalAmount += quantityDollarAmount;
			this.taxAmount += quantityDollarAmount * this.taxPercent;
		}
		for (var i = 0; i < this.discounts.length; i++) {
			this.discount += this.calcDiscount(this.discounts[i]);
		}
		this.subtotalAmount = roundTo(this.subtotalAmount, 2);
		this.taxAmount = roundTo(this.taxAmount, 2);
		this.discount = roundTo(this.discount, 2);
		this.totalAmount = roundTo(this.subtotalAmount + this.taxAmount - this.discount, 2);
	}

	// discount function
	Invoice.prototype.calcDiscount = function(discount){
		switch(discount.type){
			case 'PMD':
				return addPMDDiscount();
				break;
		}
	}
	function addPMDDiscount(){
		var discount = 0;
		for (var i = 0; i < invoice.salesLines.length; i++) {
			if((invoice.salesLines[i].categoryname == "Latex Mattresses" || invoice.salesLines[i].categoryname == "Zippered Latex Mattresses") && invoice.salesLines[i].retailAmount > 600){
				discount += (69.95 * invoice.salesLines[i].quantity);
			}
		}
		return discount;
	}

	

/* Setters setters */

	// Customer Information

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

	// Billing Information

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

	// Shipping Information

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
	Invoice.prototype.setDeliveryMethod = function(method) {
		this.delivery.method = method;
		NativeStorage.setItem('method', this.delivery.method, noop, noop);
	};

	Invoice.prototype.setDeliveryCost = function(cost) {
		this.delivery.cost = cost;
		NativeStorage.setItem('cost', this.delivery.cost, noop, noop);
	};

	// Invoice information

	Invoice.prototype.setSalesLines = function(cartObject){
		this.salesLines = cartObject;
		this.recalc();
	};
	Invoice.prototype.setPayments = function(paymentObject){
		this.payments = paymentObject;
		NativeStorage.setItem('payments', JSON.stringify(this.payments), noop, noop);
	};
	Invoice.prototype.setDiscounts = function(discountObject){
		this.discounts = discountObject;
		NativeStorage.setItem('discounts', JSON.stringify(this.discounts), noop, noop);
		this.recalc();
	};

	Invoice.prototype.setBalance = function(amount){
		for (var i = 0; i < this.payments.length; i++) {
			amount -= this.payments[i].amount;
		}
		this.balance = roundTo(amount, 2);
	};

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
	Invoice.prototype.setTaxPercent = function(taxPercent) {
		this.taxPercent = taxPercent;
		NativeStorage.setItem('taxPercent', this.taxPercent, noop, noop);
		this.recalc();
	};
	Invoice.prototype.setDeliveryLocation = function(location) {
		this.delivery.location = location;
		NativeStorage.setItem('location', this.delivery.location, noop, noop);
	};
	Invoice.prototype.setDeliveryNotes = function(notes) {
		this.delivery.notes = notes;
		NativeStorage.setItem('notes', this.delivery.notes, noop, noop);
	};

/* Getters getters */

	Invoice.prototype.getDeliveryMethod = function() { return this.delivery.method; };
	Invoice.prototype.getDeliveryCost = function() { return this.delivery.cost; };
	Invoice.prototype.getDeliveryDateString = function() { return this.delivery.date; };
	Invoice.prototype.getTaxPercent = function() { return this.taxPercent; };
	Invoice.prototype.getDeliveryLocation = function() { return this.delivery.location; };
	Invoice.prototype.getDeliveryNotes = function() { return this.delivery.notes; };
	Invoice.prototype.getRemainingBalance = function(){
		this.balance = this.totalAmount + this.delivery.cost;
		for (var i = 0; i < this.payments.length; i++) {
			this.balance -= this.payments[i].amount;
		}
		return this.balance;
	}
	Invoice.prototype.getBilling = function(){
		var address = 	this.customer.billing.street + ', ' +
						this.customer.billing.city +  ', ' +
						this.customer.billing.state + ' ' + 
						this.customer.billing.zip;
		return this.customer.billing.street == '' ? '' : address;
	};
	Invoice.prototype.getShipping = function(){
		var address = 	this.customer.shipping.street + ', ' +
						this.customer.shipping.city +  ', ' +
						this.customer.shipping.state + ' ' + 
						this.customer.shipping.zip;
		return this.customer.shipping.street == '' ? '' : address;
	};
	Invoice.prototype.getSkus = function(){
		var skus = '';
		for (var i = 0; i < this.salesLines.length; i++) {
			skus += this.salesLines[i].sku + ',';
		}
		skus = skus.substring(0, skus.length-1);
		return skus;
	}

/* UI Functions */

	// TODO: Show Discounts
	Invoice.prototype.draw = function(selector){
		var cart = '';
		for (var i = this.salesLines.length-1; i >= 0; i--) {
			cart += '<div class="card" data-id="'+i+'">' +
					    '<div class="card-header">'+this.salesLines[i].model+'<span class="delete-line" data-id="'+i+'"><i class="icon f7-icons">close_round</i></span></div>' +
					    '<div class="card-content">' +
					        '<div class="card-content-inner">' +
					        	'<div class="row">' +
					        		'<div class="col-40"><img class="prod-img" src="media/products/no-product-pic_icon.png"></div>' +
					        		'<div class="col-35" style="text-align: center;">' +
					        			'<span>'+ formatNumberMoney(this.salesLines[i].retailAmount) +' ea.</span><br>' +
					        			(this.salesLines[i].size != '' ? '<span>'+this.salesLines[i].size+'</span><br>' : '')+
					        			(this.salesLines[i].color != '' ? '<span>'+this.salesLines[i].color+'</span><br>' : '')+
					        			(this.salesLines[i].material != '' ? '<span>'+this.salesLines[i].material+'</span><br>' : '')+
					        			'<p class="location-edit-card" data-id="'+i+'">' + getLocationNickname(this.salesLines[i].location) + '</p>' +
					        		'</div>' +
					        		'<div class="col-25">' + discountAmountLine(this.salesLines[i])+ '</div>' +
					        	'</div>' +
					        	'<span> Special Note </span>' +
					        '</div>' +
					    '</div>' +
					    '<div class="card-footer">'+
						    '<div class="row" style="width: 100%;">' +
						    	'<div class="col-50">' +
						    		'<p>' + formatNumberMoney(this.salesLines[i].retailAmount * this.salesLines[i].quantity) + '</p>'+
						    	'</div>' +
						    	'<div class="col-50 quantity-col-card right-float right-align" data-id="'+i+'">' +
						    		'<p>QTY:' + this.salesLines[i].quantity + '</p>'+
						    	'</div>' +
						    '</div>' +
					    '</div>' +
					'</div>';
			cart += getDiscountHTML(this.salesLines[i]);
		}

	    //var shippingMethod = (invoice.delivery.method == 'shipping' && );
	    var shippingMethod = false;

	    if(invoice.delivery.method == 'team' && invoice.getDeliveryDateString() != '00/00/00'){
	    	cart +=	'<div class="card">' +
						'<div class="card-content">' +
		    				'<div class="card-content-inner">In-House Delivery - ' + invoice.getDeliveryDateString() + ' - ' + invoice.delivery.cost + '</div>' +
		  				'</div>' +
					'</div>';
	    } else if(shippingMethod){
	    	cart +=	'<div class="card">' +
						'<div class="card-content">' +
		    				'<div class="card-content-inner">Shipping</div>' +
		  				'</div>' +
					'</div>';
	    }  else if(invoice.delivery.method == 'carryout'){
	    	cart +=	'<div class="card">' +
						'<div class="card-content">' +
		    				'<div class="card-content-inner">Carryout</div>' +
		  				'</div>' +
					'</div>';
	    }  else if(invoice.delivery.method == 'pickup' && invoice.delivery.store != ''){
	    	cart +=	'<div class="card">' +
						'<div class="card-content">' +
		    				'<div class="card-content-inner">Pick Up - ' + invoice.delivery.store + '</div>' +
		  				'</div>' +
					'</div>';
	    }  else if(invoice.delivery.method == 'later'){
	    	cart +=	'<div class="card">' +
						'<div class="card-content">' +
		    				'<div class="card-content-inner">No Delivery Scheduled</div>' +
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

	function getDiscountHTML(lineItem){
		var returnHTML = '';
		for (var i = 0; i < invoice.discounts.length; i++) {
			switch(invoice.discounts[i].type){
				case 'PMD':
					if((lineItem.categoryname == "Latex Mattresses" || lineItem.categoryname == "Zippered Latex Mattresses") && lineItem.retailAmount > 600){
						returnHTML +='<div class="card">' +
										'<div class="card-content">' +
						    				'<div class="card-content-inner">Premium Mattress Discount</div>' +
						  				'</div>' +
									'</div>';
					}
					break;
			}
		}
		return returnHTML;
	}

	function discountAmountLine(lineItem){
		var lineDiscount = 0;
		for (var i = 0; i < invoice.discounts.length; i++) {
			switch(invoice.discounts[i].type){
				case 'PMD':
					if((lineItem.categoryname == "Latex Mattresses" || lineItem.categoryname == "Zippered Latex Mattresses") && lineItem.retailAmount > 600){
						lineDiscount += (69.95 * lineItem.quantity);
					}
					break;
			}
		}
		return (lineDiscount > 0) ? 'Discount: '+formatNumberMoney(lineDiscount) : '';
	}

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
					invoice.addLine(lineItem);
				}
			}
			invoice.draw();
			myApp.closeModal('.stock-popup');
			myApp.closeModal('.search-modal')
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
		stock.push({
			"locationid": 42,
			"locationname": "Special Order",
			"locationletter": "SO",
			"available": 1000,
			'onorderavailable': 0
		});
		var stockTable = 	'<table>' +
								'<tr>' +
									'<th>Location</th>' +
									'<th></th>' +
									'<th></th>' +
								'</tr>';
		for (var i = 0; i < stock.length; i++) {
			if(stock[i].locationid!=42){
				stock[length-1].onorderavailable += stock[i].onorderavailable;
			}
			if(stock[i].available > 0){
				var locationNickname = getLocationNickname(stock[i].locationid);
				var stockLocationLine =	'<tr id="locationLine'+i+'" class="locationLine">' +
											'<td>'+locationNickname+ ' ' +((stock[i].locationid==42) ? '<span class="orange">'+(stock[i].onorderavailable > 0 ? '- '+stock[i].onorderavailable : '' )+'</span>' : '- '+stock[i].available)+'</td>' +
											'<td><input id="locationLineInput'+i+'" class="stock-table-quantity"' +
												' type="number" value="0" data-stock="'+stock[i].available+'" data-location="'+stock[i].locationletter+'">'+
											'</td>' +
											'<td><div class="row">' + 
												'<div class="col-50 quantity-down"><i class="icon f7-icons">arrow_left_fill</i></div>' +
												'<div class="col-50 quantity-up"><i class="icon f7-icons">arrow_right_fill</i></div>' +
											'</div></td>' +
										'</tr>';
				stockTable += stockLocationLine;
			} else {
				stockTable += '<tr id="locationLine'+i+'" class="locationLine"><td colspan="3" style="text-align: center;">'+stock[i].locationname+' - Out Of Stock</td></tr>';
			}
		}
		stockTable += '</table>';
		return stockTable;
	}

	Invoice.prototype.xfactorsModal = function(){
		myApp.modal({
		title:  'XFactors',
		text: '<div class="Test">Test</div>',
		buttons: [
		  {
		    text: 'Cancel',
		    onClick: function() {
		      	myApp.alert('You clicked Cancel.');
		    }
		  },
		  {
		    text: 'Okay',
		    bold: true,
		    onClick: function() {
		    	invoice.paymentPopup();
		      	myApp.alert('You clicked Okay.');
		    }
		  },
		],
		})
	};

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

		invoice.drawPayments(invoice.payments, '#payment-pop');

		$$('#balance-input').on('keyup', function(){
			if(this.value > balance){
				$$('#balance-input').val(balance);
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
						$$('#balance-input').val(balance);
						break;
				}
				if(type != 'Full'){
					balance = Math.abs(balance - amount);
					$$('#remaining-balance').text(formatNumberMoney(balance));
					invoice.drawPayments(payments, '#payment-pop');
					$$('#balance-input').val('');
				}
			}
		});
		$$('.add-payments').on('click', function(){
			invoice.addPayments(payments);
			$$('#summary-paid').text(formatNumberMoney(invoice.getRemainingBalance()));
			$$('#summary-paid-label').show();
			myApp.closeModal('#payment-pop');
			if(invoice.getRemainingBalance() > 0){
				invoice.drawPayments(payments, '#customer-cart-div');
			} else {
				mainView.router.loadPage('pos__thankyou.html');
			}
		});
	};

	Invoice.prototype.drawPayments = function(payments, selector){
		$$('#payment-popup-div').remove();
		var html = '<div id="payment-popup-div" class="list-block"><ul>';
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
		$$(selector).append(html+'</ul></div>');
	}

/* Reset Functions */

	Invoice.prototype.resetCustomerInfo = function(){
		this.setFirstName('');
		this.setLastName('');
		this.setPhoneNumber('');
		this.setEmail('');
	};

	Invoice.prototype.resetBillingInfo = function(){
		this.setBillingStreet('');
		this.setBillingStreetTwo('');
		this.setBillingCity('');
		this.setBillingState('');
		this.setBillingZip('');
	};

	Invoice.prototype.resetShippingInfo = function(){
		this.setShippingStreet('');
		this.setShippingStreetTwo('');
		this.setShippingCity('');
		this.setShippingState('');
		this.setShippingZip('');
	};

	Invoice.prototype.resetDeliveryInfo = function(){
		this.setDeliveryMethod('team');
		this.setDeliveryCost(0);
		this.setDeliveryDateString('00', '00', '00');
		this.setTaxPercent(0.101);
		this.setDeliveryNotes('');
		this.recalc();
	};

/* Loading */

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
    this.setDiscounts([]);
    this.recalc();
    mainView.router.refreshPage();
};

Invoice.prototype.load = function(){
	NativeStorage.getItem('title', function(obj){  invoice.setTitle(obj); }, function(error){ if(error.code == 2){ invoice.setTitle('draft'); } else { consool(error); }});

	NativeStorage.getItem('first', function(obj){  invoice.setFirstName(obj); }, function(error){ if(error.code == 2){ invoice.setFirstName(''); } else { consool(error); }});
	NativeStorage.getItem('last', function(obj){  invoice.setLastName(obj); }, function(error){ if(error.code == 2){ invoice.setLastName(''); }});
	NativeStorage.getItem('phoneNumber', function(obj){  invoice.setPhoneNumber(obj); }, function(error){ if(error.code == 2){ invoice.setPhoneNumber(''); }});
	NativeStorage.getItem('email', function(obj){ invoice.setEmail(obj); }, function(error){ if(error.code == 2){ invoice.setEmail(''); }});

	NativeStorage.getItem('streetOne', function(obj){ invoice.setBillingStreet(obj); }, function(error){ if(error.code == 2){ invoice.setBillingStreet(''); }});
	NativeStorage.getItem('streetTwo', function(obj){ invoice.setBillingStreetTwo(obj); }, function(error){ if(error.code == 2){ invoice.setBillingStreetTwo(''); }});
	NativeStorage.getItem('city', function(obj){ invoice.setBillingCity(obj); }, function(error){ if(error.code == 2){ invoice.setBillingCity(''); }});
	NativeStorage.getItem('state', function(obj){ invoice.setBillingState(obj); }, function(error){ if(error.code == 2){ invoice.setBillingState(''); }});
	NativeStorage.getItem('zip', function(obj){ invoice.setBillingZip(obj); }, function(error){ if(error.code == 2){ invoice.setBillingZip(''); }});

	NativeStorage.getItem('streetOne-shipping', function(obj){ invoice.setShippingStreet(obj); }, function(error){ if(error.code == 2){ invoice.setShippingStreet(''); } else { consool(error); }});
	NativeStorage.getItem('streetTwo-shipping', function(obj){ invoice.setShippingStreetTwo(obj); }, function(error){ if(error.code == 2){ invoice.setShippingStreetTwo(''); } else { consool(error); }});
	NativeStorage.getItem('city-shipping', function(obj){ invoice.setShippingCity(obj); }, function(error){ if(error.code == 2){ invoice.setShippingCity(''); } else { consool(error); }});
	NativeStorage.getItem('state-shipping', function(obj){ invoice.setShippingState(obj); }, function(error){ if(error.code == 2){ invoice.setShippingState(''); } else { consool(error); }});
	NativeStorage.getItem('zip-shipping', function(obj){ invoice.setShippingZip(obj); }, function(error){ if(error.code == 2){ invoice.setShippingZip(''); } else { consool(error); }});

	NativeStorage.getItem('method', function(obj){ invoice.setDeliveryMethod(obj); }, function(error){ if(error.code == 2){ invoice.setDeliveryMethod(''); } else { consool(error); }});
	NativeStorage.getItem('cost', function(obj){ invoice.setDeliveryCost(obj); }, function(error){ if(error.code == 2){ invoice.setDeliveryCost(0); } else { consool(error); }});
	NativeStorage.getItem('date', function(obj){ invoice.delivery.date = obj; }, function(error){ if(error.code == 2){ invoice.delivery.date = '00/00/00'; } else { consool(error); }});
	NativeStorage.getItem('month', function(obj){ invoice.delivery.month = obj; }, function(error){ if(error.code == 2){ invoice.delivery.month = '00'; } else { consool(error); }});
	NativeStorage.getItem('day', function(obj){ invoice.delivery.day = obj; }, function(error){ if(error.code == 2){ invoice.delivery.day = '00'; } else { consool(error); }});
	NativeStorage.getItem('year', function(obj){ invoice.delivery.year = obj; }, function(error){ if(error.code == 2){ invoice.delivery.year = '00'; } else { consool(error); }});
	NativeStorage.getItem('location', function(obj){ invoice.delivery.location = obj; }, function(error){ if(error.code == 2){ invoice.delivery.location = ''; } else { consool(error); }});
	NativeStorage.getItem('notes', function(obj){ invoice.delivery.notes = obj; }, function(error){ if(error.code == 2){ invoice.delivery.notes = ''; } else { consool(error); }});

	NativeStorage.getItem('cart', function(obj){ invoice.setSalesLines(JSON.parse(obj)); }, function(error){ if(error.code == 2){ invoice.setSalesLines([]); } else { consool(error); }});
	NativeStorage.getItem('payments', function(obj){ invoice.setPayments(JSON.parse(obj)); }, function(error){ if(error.code == 2){ invoice.setPayments([]); } else { consool(error); }});
	NativeStorage.getItem('discounts', function(obj){ invoice.setDiscounts(JSON.parse(obj)); }, function(error){ if(error.code == 2){ invoice.setDiscounts([]); } else { consool(error); }});
};
