function TaskMaster (){
	this.host 	= "https://taskmaster.bedroomsandmore.com";

	this.checkNewMessages = function(conversationId, latestMessageId, onSuccess){
		this.ajaxToServer({ 
			url: '/4DACTION/api',
			data: {
				action: 'checkNewMessages',	
				conversationId: conversationId,
				latestMessageId: latestMessageId
			},
			success: function(data) {
				onSuccess(data);
			}
	   	});
	}

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
			method: 'POST',
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

	this.createInvoice = function(invoice, onSuccess){
		this.ajaxToServer({ 
			url: '/4DACTION/api',
			method: 'POST',
			data: {	
				action: 'createInvoice',
				invoice: invoice
			},
			success: function(data) {
				onSuccess(data);
			}
	   	});
	}

	this.deleteQuote = function(quoteId, onSuccess){
		this.ajaxToServer({ 
			url: '/4DACTION/api',
			method: 'POST',
			data: {
				action: 'deleteQuote',
				quoteId: quoteId
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
				zip: zip
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
		myApp.showIndicator();
		this.ajaxToServer({ 
			url: '/4DACTION/api',
			data: {
				action: 'getConversations'
			},
			success: function(data) {
				onSuccess(data);
				myApp.hideIndicator();
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

	this.getEvents = function(onSuccess){
		/*
		this.ajaxToServer({ 
			url: '/4DACTION/api',
			data: {
				action: 'getEvents',
			},
			success: function(data) {
				onSuccess(data);
			}
	   	});
	   	*/
	   	onSuccess([{startdate: '', enddate:'', title:'Tech Meeting', period:'BIWEEKLY'},{startdate: '', enddate: '', title:'Morning Meeting', period:'DAILY'},{startdate: '', enddate:'', title:'Meeting with Thane', period:'ONETIME'}]);
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
		myApp.showIndicator();
		this.ajaxToServer({ 
			url: '/4DACTION/api',
			data: {
				action: 'getItemInfo',
				sku: sku
			},
			success: function(data) {
				if(data.ok){
					onSuccess({
                        brand:data.item.brand,
                        categoryname:data.item.categoryname,
                        color:data.item.color,
                        customerswaiting:data.item.customerswaiting,
                        customerswaitinglist:data.item.customerswaitinglist,
                        material:data.item.material,
                        model:data.item.model,
                        name:data.item.name,
                        retailAmount:data.item.retailAmount,
                        size:data.item.size,
                        sku:data.item.sku,
                        stock:data.item.stock,
                        vendorsku:data.item.vendorsku,
                        relatedVariations: data.item.relatedVariations,
                        collection:data.item.collection,
                        toplevelcategoryname:data.item.toplevelcategoryname,
                        imageurl: (data.item.imageurl != '' ? data.item.imageurl : 'media/products/no-product-pic_icon.png')
                    });
                    myApp.hideIndicator();
				}
			}
	   	});
	}

	this.getMessages = function(conversationid, onSuccess){
		myApp.showIndicator();
		this.ajaxToServer({ 
			url: '/4DACTION/api',
			data: {
				action: 'getMessages',
				conversationid: conversationid
			},
			success: function(data) {
				onSuccess(data);
				myApp.hideIndicator();
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

	this.getQuote = function(quoteId, onSuccess){
		this.ajaxToServer({ 
			method: 'POST',
			url: '/4DACTION/api',
			data: {
				action: 'getQuote',
				quoteId: quoteId
			},
			success: function(data) {
				onSuccess(data);
			}
	   	});
	}
	this.getQuoteList = function(onSuccess, employeeId){
		if(employeeId === undefined){
			var data = {
				action: 'getQuoteList'
			}
		} else {
			var data = {
				action: 'getQuoteList',
				employeeId: employeeId
			}
		}
		this.ajaxToServer({ 
			url: '/4DACTION/api',
			data: data,
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

	this.getVariationSku = function(sku, options, onSuccess){
		this.ajaxToServer({ 
			url: '/4DACTION/api',
			method: 'POST',
			data: {
				action: 'getVariationSku',
				sku: sku,
				options: options
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
				action: 'a'
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
				action: 'listStations'
			},
			success: function(data) {
				onSuccess(data);
			}
	   	});
	}

	this.login = function(password, pushRegistrationId, onSuccess, onFail){
		this.ajaxToServer({
            method: 'POST',
            url: '/4DACTION/mobile_auth',
            data: {
                password: password,
                pushRegistrationId: pushRegistrationId,
            },
            success: function(data) {       
                if (data.success) {
                	onSuccess(data.employee);
                } else {
                	onFail(data.success);
                }
            }
        });
	}

	this.printInvoice = function(invoicenumber, numberType, printer, onSuccess){
		if(numberType == 'quote'){
			this.ajaxToServer({ 
				url: '/4DACTION/api',
				data: {
					action: 'printInvoice',
					quoteid: invoicenumber,
					printer: printer
				},
				success: function(data) {
					onSuccess(data);
				}
		   	});
		} else {
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
	}

	this.saveQuote = function(invoiceObj, onSuccess, quoteId){
		if(quoteId === undefined){
			var data = {
				action: 'saveQuote',
				invoice: invoiceObj
			}
		} else {
			var data = {
				action: 'saveQuote',
				invoice: invoiceObj,
				quoteId: quoteId
			}
		}
		this.ajaxToServer({ 
			url: '/4DACTION/api',
			method: 'POST',
			data: data,
			success: function(data) {
				onSuccess(data);
			}
	   	});
	}

	this.searchCustomer = function(q, onSuccess){
		this.ajaxToServer({ 
			url: '/4DACTION/api',
			data: {
				action: 'searchCustomer',
				q: q
			},
			success: function(data) {
				onSuccess(data);
			}
	   	});
	}

	this.searchInventory = function(q, onSuccess){
		myApp.showIndicator();
		this.ajaxToServer({ 
			url: '/4DACTION/api',
			data: {
				action: 'searchInventory',
				q: q
			},
			success: function(data) {
				onSuccess(data);
				myApp.hideIndicator();
			}
	   	});
	}

	this.searchInvoices = function(customerlastname, customerfirstname, customerphone, invoicenumber, onSuccess){
		this.ajaxToServer({ 
			url: '/4DACTION/api',
			data: {
				action: 'searchInvoices',
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

	this.sendFeedback = function(page, feedback, deviceInfo, onSuccess){
		this.ajaxToServer({ 
			url: '/4DACTION/api',
			method: 'POST',
			data: {
				action: 'sendFeedback',
				page: page,
				feedback: feedback,
				deviceInfo: deviceInfo
			},
			success: function(data) {
				onSuccess(data);
			}
	   	});	
	}

	this.sendMessage = function(conversationid, message, images, onSuccess){
		this.ajaxToServer({ 
			url: '/4DACTION/api',
			data: {
				action: 'sendMessage',
				conversationid: conversationid,
				message: message,
				images: images
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
		myApp.showIndicator();
		this.ajaxToServer({ 
			url: '/4DACTION/api',
			data: {
				action: 'timeclock',
				employeeId: employeeId,
				clockEvent: clockEvent
			},
			success: function(data) {
				onSuccess(data);
				myApp.hideIndicator();
			}
	   	});
	}

	this.transferInvoice = function(station, invoice, onSuccess){
		this.ajaxToServer({ 
			url: '/4DACTION/api',
			method: 'POST',
			data: {	
				action: 'transferInvoice',
				station: station,
				invoice: invoice
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
				zip: zip
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
			data:{	
				action: 'debugPost',
				invoice: invoice
			},
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
					logoutUser(data);
				} else {
					callbackFunction(data);
				}
			};

			$$.ajax({
				url: serverURL,
				method: requestMethod,
				data: requestMethod == 'GET' ? dataObject : JSON.stringify(dataObject),
				dataType: 'json',
				success: tempCallBack
			});
			/*
			switch(requestMethod) {
				case 'GET':
				case 'get':
					
					$$.getJSON(serverURL, dataObject, tempCallBack);
					
					break;
				case 'POST':
				case 'post':
					
					
	
					break;
				default:
					// unsupported other...
			}

			*/
		} else {
			// ERROR: url required...
		}
	};

	function logoutUser(data){
		console.log('Failed - Need to Login');
		console.log(data);
		switch(data.action){
			case 'errorLogin': loginPopup(); break;
		}
	}
	
}