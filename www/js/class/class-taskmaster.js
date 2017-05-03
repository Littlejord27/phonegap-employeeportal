function TaskMaster (){
	this.host 	= "https://taskmaster.bedroomsandmore.com";
	this.key  	= 'gjkffkd63dkkdmybandm';

	this.checkUpdate = function(version, onSuccess){
		this.ajaxToServer({ 
			url: '/4DACTION/api',
			data: {
				action: 'checkUpdate',
				version: version
			},
			success: function(data) {
				onSuccess(data);
			}
	   	});
	}

	this.createConversation = function(users, message, onSuccess){
		this.ajaxToServer({ 
			url: '/4DACTION/api',
			data: {
				action: 'createConversation',
				users: users,
				message: message
			},
			success: function(data) {
				onSuccess(data);
			}
	   	});
	}

	this.deliverystatus = function(month, year, zip, onSuccess){
		this.ajaxToServer({ 
			url: '/4DACTION/api',
			data: {
				action: 'deliverystatus',
				month: month,
				year: year,
				zip: zip,
				key:this.key
			},
			success: function(data) {
				onSuccess(data);		
			}
	   	});
	}

	this.deliverystatusyear = function(year, zip, onSuccess){
		this.ajaxToServer({ 
			url: '/4DACTION/api',
			data: {
				action: 'deliverystatusyear',
				year: year,
				zip: zip
			},
			success: function(data) {
				onSuccess(data);
			}
	   	});
	}

	this.emailInvoice = function(email, invoiceNumber, onSuccess){
		this.ajaxToServer({ 
			url: '/4DACTION/api',
			data: {
				action: 'emailInvoice',
				email: email,
				invoiceNumber: invoiceNumber
			},
			success: function(data) {
				onSuccess(data);
			}
	   	});
	}

	this.getConversations = function(onSuccess){
		this.ajaxToServer({ 
			url: '/4DACTION/api',
			data: {
				action: 'getConversations'
			},
			success: function(data) {
				onSuccess(data);
			}
	   	});
	}

	this.getCustomers = function(onSuccess){
		this.ajaxToServer({ 
			url: '/4DACTION/api',
			data: {
				action: 'getCustomers'
			},
			success: function(data) {
				onSuccess(data);
			}
	   	});
	}

	this.getEmployees = function(onSuccess){
		this.ajaxToServer({ 
			url: '/4DACTION/api',
			data: {
				action: 'getEmployees'
			},
			success: function(data) {
				onSuccess(data);
			}
	   	});
	}

	this.getinvoice = function(invoicenumber, onSuccess){
		this.ajaxToServer({ 
			url: '/4DACTION/api',
			data: {
				action: 'getinvoice',
				invoicenumber: invoicenumber
			},
			success: function(data) {
				onSuccess(data);
			}
	   	});
	}

	this.getItemInfo = function(sku, onSuccess){
		this.ajaxToServer({ 
			url: '/4DACTION/api',
			data: {
				action: 'getItemInfo',
				sku: sku,
				key:this.key
			},
			success: function(data) {
				onSuccess(data);
			}
	   	});
	}

	this.getMessages = function(conversationid, onSuccess){
		this.ajaxToServer({ 
			url: '/4DACTION/api',
			data: {
				action: 'getMessages',
				conversationid: conversationid
			},
			success: function(data) {
				onSuccess(data);
			}
	   	});
	}

	this.getNotifications = function(onSuccess){
		this.ajaxToServer({ 
			url: '/4DACTION/api',
			data: {
				action: 'getNotifications',
			},
			success: function(data) {
				onSuccess(data);
			}
	   	});
	}

	this.getVariations = function(sku, onSuccess){
		this.ajaxToServer({ 
			url: '/4DACTION/api',
			data: {
				action: 'getVariations',
				sku: sku,
			},
			success: function(data) {
				onSuccess(data);
			}
	   	});
	}

	this.listPrinters = function(onSuccess){
		this.ajaxToServer({ 
			url: '/4DACTION/api',
			data: {
				action: 'listPrinters'
			},
			success: function(data) {
				onSuccess(data);
			}
	   	});
	}

	this.listStations = function(onSuccess){
		this.ajaxToServer({ 
			url: '/4DACTION/api',
			data: {
				action: 'listStations',
				key: this.key
			},
			success: function(data) {
				onSuccess(data);
			}
	   	});
	}

	this.printInvoice = function(invoicenumber, printer, onSuccess){
		this.ajaxToServer({ 
			url: '/4DACTION/api',
			data: {
				action: 'printInvoice',
				invoicenumber: invoicenumber,
				printer: printer
			},
			success: function(data) {
				onSuccess(data);	
			}
	   	});
	}

	this.searchInventory = function(q, onSuccess){
		this.ajaxToServer({ 
			url: '/4DACTION/api',
			data: {
				action: 'searchInventory',
				q: q,
				key: this.key
			},
			success: function(data) {
				onSuccess(data);
			}
	   	});
	}

	this.searchinvoices = function(customerlastname, customerfirstname, customerphone, invoicenumber, onSuccess){
		this.ajaxToServer({ 
			url: '/4DACTION/api',
			data: {
				action: 'searchinvoices',
				customerlastname: customerlastname,
				customerfirstname: customerfirstname,
				customerphone: customerphone,
				invoicenumber: invoicenumber
			},
			success: function(data) {
				onSuccess(data);
			}			
	   	});
	}

	this.sendMessage = function(conversationid, message, onSuccess){
		this.ajaxToServer({ 
			url: '/4DACTION/api',
			data: {
				action: 'sendMessage',
				conversationid: conversationid,
				message: message
			},
			success: function(data) {
				onSuccess(data);
			}
	   	});	
	}

	this.textInvoice = function(number, invoiceNumber, onSuccess){
		this.ajaxToServer({ 
			url: '/4DACTION/api',
			data: {
				action: 'textInvoice',
				number: number,
				invoiceNumber: invoiceNumber
			},
			success: function(data) {
				onSuccess(data);
			}	
	   	});
	}

	this.timeclock = function(employeeId, clockEvent, onSuccess){
		this.ajaxToServer({ 
			url: '/4DACTION/api',
			data: {
				action: 'timeclock',
				employeeId: employeeId,
				clockEvent: clockEvent
			},
			success: function(data) {
				onSuccess(data);
			}
	   	});
	}

	this.transferInvoice = function(station, invoice, onSuccess){
		this.ajaxToServer({ 
			url: '/4DACTION/api',
			data: {	
				action: 'transferInvoice',
				method: 'POST',
				station: station,
				invoice: invoice,
				key: this.key
			},
			success: function(data) {
				onSuccess(data);
			}
	   	});
	}

	this.unishippersquote = function(zip, skus, onSuccess){
		this.ajaxToServer({ 
			url: '/4DACTION/api',
			data: {
				action: 'unishippersquote',
				zip: zip,
				skus: skus
			},
			success: function(data) {
				onSuccess(data);
			}
	   	});
	}

	this.zipdeliverycost = function(street, city, state, zip, onSuccess){
		this.ajaxToServer({ 
			url: '/4DACTION/api',
			data: {	
				action: 'zipdeliverycost',
				street: street,
				city: city,
				state: state,
				zip: zip,
				key:this.key
			},
			success: function(data) {
				onSuccess(data);
			}			
	   	});
	}

	this.debugPost = function(invoice, onSuccess){
		this.ajaxToServer({ 
			url: '/4DACTION/api',
			method: 'POST',
			data: JSON.stringify({	
				action: 'debugPost',
				invoice: invoice,
				key: this.key
			}),
			success: function(data) {
				onSuccess(data);
			}			
	   	});
	}

	this.ajaxToServer= function(requestObject) {
		var requestURL= '';
		var dataObject= {};
		var callbackFunction= function() {};
		var requestMethod= 'GET';
		
		if (requestObject.hasOwnProperty('url')) { // REQUIRED
			requestURL= requestObject.url;

			if (requestObject.hasOwnProperty('data')) {
				dataObject= requestObject.data;
			}
			if (requestObject.hasOwnProperty('success')) {
				callbackFunction= requestObject.success;
			}
			if (requestObject.hasOwnProperty('method')) {
				requestMethod= requestObject.method;
			}
			
			var serverURL= this.host;
			if (requestURL.indexOf("http") > -1) {
				serverURL= requestURL;
			} else {
				serverURL+= requestURL;
			}
			
			var tempCallBack= function(data) {
				if (data.hasOwnProperty('invalidsession')) {
					invalidSessionAfterLoginAjaxCall= {
						'url': requestURL,
						'data': dataObject,
						'success': callbackFunction,
						'method': requestMethod
					};
					logoutUser();
				} else {
					callbackFunction(data);
				}
			};
			
			switch(requestMethod) {
				case 'GET':
				case 'get':
					
					$$.getJSON(serverURL, dataObject, tempCallBack);
					
					break;
				case 'POST':
				case 'post':
					
					$$.ajax({
						url: serverURL,
						method: 'POST',
						data: dataObject,
						dataType: 'json',
						success: tempCallBack
					});
	
					break;
				default:
					// unsupported other...
			}
		} else {
			// ERROR: url required...
		}
	};
}