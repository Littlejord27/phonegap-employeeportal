/*
* Application Name: MyBnMApp
* Version: 1.2 alpha
* Application URI: Google Play Address
* Description: An application that serves as an employee portal and tool
* Authors: Jordan Little and Matt Davis
*
* Supported:       ios(phone), android(phone)
* Not Supported:   Windows Phone, Web
*
*/

var myApp = new Framework7();
var $$ = Dom7;

var isAndroid = Framework7.prototype.device.android === true;
var isIos = Framework7.prototype.device.ios === true;
var isBrowser = (!isAndroid & !isIos) ? true : false;

var TaskMaster = new TaskMaster();
var Invoice = new Invoice();

var DEBUG_MODE = true;

var mainView = myApp.addView('.view-main', {
    dynamicNavbar: true,
    onAjaxStart: function (xhr) {
        myApp.showIndicator();
    },
    onAjaxComplete: function (xhr) {
        myApp.hideIndicator();
    }
});

$$(document).on('deviceready', function() {
    $$('.deviceready').text('Device Ready');

    Invoice.init();

    $$('.framework7-root').on('click', '.pos-actions', function(){
        var actions = ['Add Discount', 'Clear Discounts', 'Transfer Invoice', 'Reset Page', 'Reset Sale']; 
        choicelistModal({
            type: 'modal',
            data: actions,
            success: function(index,title,data) {
                switch(data[index]){
                    case 'Add Discount':
                        addDiscountModal();
                        break;
                    case 'Clear Discounts':
                        Invoice.setDiscounts([]);
                        cartDetailsToolbarHeader();
                        break;
                    case 'Transfer Invoice':
                        TaskMaster.listStations(function(data){
                            transferInvoiceModal(data.stations);
                        });
                        break;
                    case 'Reset Page':
                        break;
                    case 'Reset Sale':
                        Invoice.reinit();
                        mainView.router.refreshPage();
                        break;
                }
            }
        });
    });

    $$('.framework7-root').on('click', '.quantity-col-card', function(){
		var elem = $$(this);
		var id = elem.data("id")
        consool(Invoice.salesLines[id]);
		var stockQuantity = createStockArray(Invoice.salesLines[id]);
		choicelistModal({
            type: 'modal',
            data: stockQuantity,
            success: function(index,title,data) {
            	Invoice.changeQuantity(id, data[index]);
            	var classSelector = elem.parent().parent().parent().parent()[0].className;
				var idSelector = elem.parent().parent().parent().parent()[0].id;
				if(idSelector != ''){
					Invoice.draw('#'+idSelector);
				} else if(classSelector == 'cart-list'){
					Invoice.draw('.'+classSelector);
				}
				cartDetailsToolbarHeader();
            }
        });
	});

	$$('.framework7-root').on('click', '.location-col-card', function(){
		var elem = $$(this);
		var id = elem.data("id")
		choicelistModal({
            type: 'modal',
            data: ['Store','Warehouse','Outlet'],
            success: function(index,title,data) {
            	switch(data[index]){
            		case 'Store':
            			Invoice.changeLocation(id, 'I');
            			break;
            		case 'Warehouse':
            			Invoice.changeLocation(id, 'W');
            			break;
            		case 'Outlet':
            			Invoice.changeLocation(id, 'O');
            			break;
            	}
            	var classSelector = elem.parent().parent().parent().parent()[0].className;
				var idSelector = elem.parent().parent().parent().parent()[0].id;
				if(idSelector != ''){
					Invoice.draw('#'+idSelector);
				} else if(classSelector == 'cart-list'){
					Invoice.draw('.'+classSelector);
				}
				cartDetailsToolbarHeader();
            }
        });
	});

	$$('.framework7-root').on('click', '.delete-line', function(){
		// TODO: Add Modal to confirm delete.
		var elem = $$(this);
		Invoice.deleteLine(elem.data("id"));
		var classSelector = elem.parent().parent().parent()[0].className;
		var idSelector = elem.parent().parent().parent()[0].id;
		if(idSelector != ''){
			Invoice.draw('#'+idSelector);
		} else if(classSelector == 'cart-list'){
			Invoice.draw('.'+classSelector);
		}
		cartDetailsToolbarHeader();
	});

	$$('#clear-native').on('click', function(){
		NativeStorage.clear( consool, consool );
	});

    NativeStorage.getItem('sameBilling', noop, function(error){
        if(error.code == 2){ NativeStorage.setItem('sameBilling', false, noop, noop); }
    });
    NativeStorage.getItem('method', noop, function(error){
        if(error.code == 2){ Invoice.setDeliveryMethod('team'); }
    });
    NativeStorage.getItem('location', noop, function(error){
        if(error.code == 2){ Invoice.setDeliveryMethod('I'); } // DEFAULT PICK UP LOCATION
    });
});

myApp.onPageInit('pos_cart pos_customer pos_delivery pos_summary', function(page){
    PoSNavigationInit(page);
    PoSContinueInit(page);
    cartDetailsToolbarHeader();
});

myApp.onPageInit('pos_cart', function (page) {
    Invoice.draw();

    $$('#scan-button').on('click', startScan);

    $$('#search-button').on('click', startSearch);

    function startSearch(){ }

    function startScan(){
        cloudSky.zBar.scan(
            {
                text_title: "Bedrooms and More",
                text_instructions: "Scan Product QR Code",
                camera: "back",
                flash: "off",
                drawSight: true
            },
            function(qrcode) {
                var needle = qrcode.search('qr/');
                var sku = qrcode.substr(needle + 3);
                TaskMaster.getItemInfo(sku, function(data){
                    var itemLine = {
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
                        vendorsku:data.item.vendorsku
                    };
                    Invoice.itemPopup(itemLine);
                });
            }
        );
    }
});

myApp.onPageInit('pos_customer', function (page) {
    $$('#firstName').val(Invoice.customer.first);
    $$('#lastName').val(Invoice.customer.last);
    $$('#email').val(Invoice.customer.email);
    $$('#phoneNumber').val(Invoice.customer.phoneNumber);
    $$('#streetOne').val(Invoice.customer.billing.street);
    $$('#streetTwo').val(Invoice.customer.billing.streetTwo);
    $$('#city').val(Invoice.customer.billing.city);
    $$('#state').val(Invoice.customer.billing.state);
    $$('#zip').val(Invoice.customer.billing.zip);

    $$('#firstName').on('keyup', function(){ Invoice.setFirstName(this.value);});
    $$('#lastName').on('keyup', function(){ Invoice.setLastName(this.value);});
    $$('#email').on('keyup', function(){ Invoice.setEmail(this.value);});
    $$('#phoneNumber').on('keyup', function(){ Invoice.setPhoneNumber(this.value);});

    $$('#streetOne').on('keyup', function(){ Invoice.setBillingStreet(this.value);});
    $$('#streetTwo').on('keyup', function(){ Invoice.setBillingStreetTwo(this.value);});
    $$('#city').on('keyup', function(){ Invoice.setBillingCity(this.value);});
    $$('#state').on('keyup', function(){ Invoice.setBillingState(this.value);});
    $$('#zip').on('keyup', function(){ Invoice.setBillingZip(this.value);});

    $$('input').each(function(){
        if(this.value != ''){
            $$(this).attr("placeholder", '');
        }
    });
});

myApp.onPageInit('pos_delivery', function (page) {
    setShippingFields();

    $$('#delivery-method').val(Invoice.delivery.method);

    $$('#additional-notes').val(Invoice.delivery.notes);

    switch(Invoice.delivery.method){
        case 'team':
            $$('#method-title').text('Delivery (WA Only)');
            break;
        case 'shipping':
            $$('#method-title').text('Shipping');
            break;
        case 'carryout':
            $$('#method-title').text('Carryout');
            $$('#section-two').hide();
            $$('#section-three').hide();
            $$('#section-five').show();
            break;
        case 'pickup':
            $$('#method-title').text('Pick Up');
            $$('#section-two').hide();
            $$('#section-three').hide();
            $$('#section-four').show();
            break;
        case 'later':
            $$('#method-title').text('Decide Later');
            $$('#section-two').hide();
            $$('#section-three').hide();
            $$('#section-five').show();
            break;
    }

    switch(Invoice.delivery.location){
    	case 'I':
    		$$('#pickup-location-id').text('Seattle Store');
    		break;
    	case 'W':
    		$$('#pickup-location-id').text('Warehouse');
    		break;
    	default:
    		consool('broke');
    		consool(Invoice.delivery.location);
    		break;
    }
    
    $$('#delivery-method').on('change', function(){
        var shippingMethod = this.value;
        Invoice.resetDeliveryInfo();
        switch(shippingMethod){
            case 'team':
                Invoice.setDeliveryMethod('team');
                setShippingFields();
                $$('#section-two').show();
                $$('#section-four').hide();
                displayThirdSection();
                break;
            case 'shipping':
                Invoice.setDeliveryMethod('shipping');
                setShippingFields();
                $$('#section-two').show();
                $$('#section-three').hide();
                $$('#section-four').hide();
                break;
            case 'pickup':
            	Invoice.setDeliveryMethod('pickup');
            	$$('#section-two').hide();
				$$('#section-three').hide();
            	$$('#section-four').show();
            	$$('#section-five').show();
            	break;
            case 'carryout':
                Invoice.setDeliveryMethod('carryout');
                $$('#section-two').hide();
                $$('#section-three').hide();
                $$('#section-four').hide();
                $$('#section-five').show();
                break;
            case 'later':
                Invoice.setDeliveryMethod('later');
                $$('#section-two').hide();
                $$('#section-three').hide();
                $$('#section-four').hide();
                $$('#section-five').show();
                break;
        }
    });

    $$('#pickup-location').on('change', function(){
        var pickupLocation = this.value;
        Invoice.setDeliveryLocation(pickupLocation);
    });

    $$('.delivery-input').on('keyup', displayThirdSection);

    $$('#streetOne-delivery').on('keyup', function(){
        if($$("#same-as-billing").prop( "checked")){
            Invoice.setBillingStreet(this.value);
        } else {
            Invoice.setShippingStreet(this.value);
        }
    });
    $$('#streetTwo-delivery').on('keyup', function(){
        if($$("#same-as-billing").prop( "checked")){
            Invoice.setBillingStreetTwo(this.value);
        } else {
            Invoice.setShippingStreetTwo(this.value);
        }
    });
    $$('#city-delivery').on('keyup', function(){
        if($$("#same-as-billing").prop( "checked")){
            Invoice.setBillingCity(this.value);
        } else {
            Invoice.setShippingCity(this.value);
        }
    });
    $$('#state-delivery').on('keyup', function(){
        if($$("#same-as-billing").prop( "checked")){
            Invoice.setBillingState(this.value);
        } else {
            Invoice.setShippingState(this.value);
        }
    });
    $$('#zip-delivery').on('keyup', function(){
        if($$("#same-as-billing").prop( "checked")){
            Invoice.setBillingZip(this.value);
        } else {
            Invoice.setShippingZip(this.value);
        }
    });

    $$('#same-as-billing').on('change', function(){
        var isChecked = this.checked;
        NativeStorage.setItem('sameBilling', isChecked, noop, noop);
        if(isChecked){
            setShippingFromBilling();
        } else {
            setShippingFromSaved();
        }
    });

    $$('#additional-notes').on('keyup', function(){
        Invoice.setDeliveryNotes(this.value);
    });

    function setShippingFromBilling(){
        $$('#streetOne-delivery').val(Invoice.customer.billing.street);
        $$('#streetTwo-delivery').val(Invoice.customer.billing.streetTwo);
        $$('#city-delivery').val(Invoice.customer.billing.city);
        $$('#state-delivery').val(Invoice.customer.billing.state);
        $$('#zip-delivery').val(Invoice.customer.billing.zip);
        displayThirdSection();
    }

    function setShippingFromSaved(){
        $$('#streetOne-delivery').val(Invoice.customer.shipping.street);
        $$('#streetTwo-delivery').val(Invoice.customer.shipping.streetTwo);
        $$('#city-delivery').val(Invoice.customer.shipping.city);
        $$('#state-delivery').val(Invoice.customer.shipping.state);
        $$('#zip-delivery').val(Invoice.customer.shipping.zip);
        displayThirdSection();
    }

    function displayThirdSection(){
        var streetOne = $$('#streetOne-delivery').val();
        var city = $$('#city-delivery').val();
        var state = $$('#state-delivery').val();
        var zip = $$('#zip-delivery').val();

        if(streetOne != '' && city != '' && state != '' && zip.length > 4 && Invoice.delivery.method == 'team'){
            TaskMaster.zipdeliverycost(streetOne, city, state, zip,  function(data){
                Invoice.setDeliveryCost(data.costOfDelivery);
                Invoice.setTaxPercent(data.totaltaxpercent);
                cartDetailsToolbarHeader();
            });
            TaskMaster.deliverystatus(0, '2017', zip, fillCalendar);
            $$('#section-three').show();
        } else if(zip.length > 4 && Invoice.delivery.method == 'shipping'){
            //TaskMaster.unishippersquote(Invoice.getSkus(), zip,  consool);
        } else {
            Invoice.setDeliveryCost(0);
            Invoice.setDeliveryDateString('00', '00', '00');
            cartDetailsToolbarHeader();
            $$('#section-three').hide();
        }
    }

    function setShippingFields(){
        NativeStorage.getItem('sameBilling', function(obj){
            if(Invoice.delivery.method == 'team' || Invoice.delivery.method == 'shipping'){
                if(obj){
                    setShippingFromBilling();
                } else {
                    setShippingFromSaved();
                }
            }
            $$("#same-as-billing").prop( "checked", obj);
        }, consool);
    }

    var monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August' , 'September' , 'October', 'November', 'December'];
    var calendarInline = myApp.calendar({
        container: '#delivery-calendar',
        value: [new Date()],
        weekHeader: true,
        firstDay: 0,
        minDate: new Date(),
        dateFormat: 'yy-m-d',
        toolbarTemplate: 
            '<div class="toolbar calendar-custom-toolbar">' +
                '<div class="toolbar-inner">' +
                    '<div class="left">' +
                        '<a href="#" class="link icon-only"><i class="icon icon-back"></i></a>' +
                    '</div>' +
                    '<div class="center"></div>' +
                    '<div class="right">' +
                        '<a href="#" class="link icon-only"><i class="icon icon-forward"></i></a>' +
                    '</div>' +
                '</div>' +
            '</div>',
        onOpen: function (p) {
            $$('.calendar-custom-toolbar .center').text(monthNames[p.currentMonth] +', ' + p.currentYear);
            $$('.calendar-custom-toolbar .left .link').on('click', function () {
                calendarInline.prevMonth();
            });
            $$('.calendar-custom-toolbar .right .link').on('click', function () {
                calendarInline.nextMonth();
            });
            if(Invoice.getDeliveryDateString() != '00/00/00'){
                //$$('.picker-calendar-day-selected').removeClass('picker-calendar-day-selected');
                var today = $$('.picker-calendar-day-selected');
                var selectedDate = Invoice.delivery.year+'-'+(Invoice.delivery.month -1)+'-'+Invoice.delivery.day;
                $$('.picker-calendar-day-selected').removeClass('picker-calendar-day-selected');
                $$('.picker-calendar-day[data-date="'+selectedDate+'"]').addClass('picker-calendar-day-selected');
                $$('#delivery-date').text(' - '+ Invoice.getDeliveryDateString());
            }
        },
        onMonthYearChangeStart: function (p) {
            //TaskMaster.deliverystatus(parseInt(p.currentMonth) +1, p.currentYear, Invoice.customer.shipping.zip, fillCalendar);
            NativeStorage.getItem('sameBilling', function(obj){
                if(obj){ 
                    TaskMaster.deliverystatus((parseInt(p.currentMonth) + 1), p.currentYear, Invoice.customer.billing.zip, fillCalendar);
                } else {
                    TaskMaster.deliverystatus((parseInt(p.currentMonth) + 1), p.currentYear, Invoice.customer.shipping.zip, fillCalendar);
                }
            }, function(error){
                consool(error);
            });
            $$('.calendar-custom-toolbar .center').text(monthNames[p.currentMonth] +', ' + p.currentYear);
        },
        onDayClick: function(p, dayContainer, year, month, day){
            month = parseInt(month) + 1;
            var dayStatus = $$(dayContainer).data('status');
            switch(dayStatus){
                case 'Green':
                    break;
                case 'Red':
                    break;
                case 'Black':
                    break;
            }
            Invoice.setDeliveryDateString(month, day, year);
            $$('#delivery-date').text(' - '+ Invoice.getDeliveryDateString());
        }
    }); // End Calendar Init

    var calendarDateFormat = myApp.calendar({
        input: '#pickup-date-input',
        dateFormat: 'DD, MM dd, yyyy',
        weekHeader: true,
        firstDay: 0,
        minDate: new Date(),
        closeOnSelect: true,
        onDayClick: function(p, dayContainer, year, month, day){
            alert(month+'/'+day+'/'+year);
        }
    });          

    function fillCalendar(data){
        var dates = data.dates;
        for (var i = 0; i < dates.length; i++) {
            var y = dates[i].dateYear;
            var m = dates[i].dateMonth - 1;
            var d = dates[i].dateDay;
            var day = $$('.picker-calendar-day[data-year="'+y+'"][data-month="'+m+'"][data-day="'+d+'"]');
            day.css('background-color', dates[i].colorName).css('color', 'white');
            day.data('status', dates[i].colorName);
        }
    }
});

myApp.onPageInit('pos_summary', function (page) {
    $$('#summary-customer-name-first').text(Invoice.customer.first);
    $$('#summary-customer-name-last').text(Invoice.customer.last);
    $$('#summary-customer-phone').text(Invoice.customer.cell);
    $$('#summary-customer-email').text(Invoice.customer.email);

    $$('#summary-billing-info').text(Invoice.getBilling());

    Invoice.setBalance(Invoice.totalAmount + Invoice.delivery.cost);

    NativeStorage.getItem('sameBilling', function(obj){
        if(obj){ //if same as billing
            $$('#summary-shipping-info').html('<b> Same as Billing </b>');
        } else {
            $$('#summary-shipping-info').text(Invoice.getShipping());
        }
    }, function(error){
        consool(error);
        $$('#summary-shipping-info').hide();
    });

    Invoice.draw('#summary-cart');

    //$$('.summary-delivery-method-class').hide();
    switch(Invoice.delivery.method){
        case 'team':
            $$('#summary-delivery-method').text(Invoice.delivery.method);
            $$('#summary-delivery-cost').text(formatNumberMoney(Invoice.delivery.cost));
            $$('#summary-delivery-date').text(Invoice.delivery.date);
            break;
        case 'shipping':
            $$('#summary-delivery-method').text(Invoice.delivery.method);
            $$('#summary-delivery-cost').text(formatNumberMoney(Invoice.delivery.cost));
            $$('#summary-delivery-date').text(Invoice.delivery.date);
            break;
        case 'carryout':
            $$('#summary-delivery-method').text(Invoice.delivery.method);
            $$('.summary-delivery-cost-class').hide();
            $$('.summary-delivery-date-class').hide();
            break;
        case 'pickup':
            $$('#summary-delivery-method').text(Invoice.delivery.method);
            $$('#summary-delivery-date').text(Invoice.delivery.date);
            $$('.summary-delivery-cost-class').hide();
            $$('.summary-delivery-date-class').hide();
            break;
        case 'later':
            $$('.summary-delivery-cost-class').hide();
            $$('.summary-delivery-date-class').hide();
            break;
    }

    if(Invoice.delivery.notes == ''){
        $$('#summary-delivery-notes').hide();    
    } else {
        $$('#summary-delivery-notes').text(Invoice.delivery.notes);
    }

    if(Invoice.salesLines.length < 1){
        $$('#customer-cart-div').hide();
        $$('#cart-title').hide();
    } else {
        $$('#summary-subtotal').text(formatNumberMoney(Invoice.subtotalAmount));
        $$('#summary-tax').text(formatNumberMoney(Invoice.taxAmount));
        $$('#summary-delivery').text(formatNumberMoney(Invoice.delivery.cost));
        $$('#summary-total').text(formatNumberMoney(Invoice.totalAmount + Invoice.delivery.cost));
        if(Invoice.totalAmount - Invoice.getRemainingBalance() == 0){
            $$('#summary-paid-label').hide();
        } else {
            $$('#summary-paid').text(formatNumberMoney(Invoice.getRemainingBalance()));
        }
    }

    $$('#pay-button').on('click', function(){
        //Invoice.xfactorsModal();
        Invoice.paymentPopup();
    });
});

/*
** Point of Sale Navigation Init
*/
function PoSNavigationInit(page){
    var pageContainer= $$(page.container);
    posNav = pageContainer.find(".pos-navigation");

    if(page.name != 'pos_cart'){
        if(Invoice.salesLines.length > 0){
            posNav.find('.pos-cart-button').addClass('pos-button-complete');
        } else {
            posNav.find('.pos-cart-button').addClass('pos-button-incomplete');
        }
    } else{
        posNav.find('.pos-cart-button').addClass('pos-button-active');
    }

    if(page.name != 'pos_customer'){
        if(Invoice.customer.first != ''){
            posNav.find('.pos-customer-button').addClass('pos-button-complete');
        } else {
            posNav.find('.pos-customer-button').addClass('pos-button-incomplete');
        }
    } else{
        posNav.find('.pos-customer-button').addClass('pos-button-active');
    }

    if(page.name != 'pos_delivery'){ // Add other methods
    	var teamMethod = (Invoice.delivery.method == 'team' && Invoice.getDeliveryDateString() != '00/00/00');
    	//var shippingMethod = (Invoice.delivery.method == 'shipping' && );
    	var shippingMethod = false;
    	var carryoutMethod = (Invoice.delivery.method == 'carryout');
    	var pickupMethod = (Invoice.delivery.method == 'pickup' && Invoice.delivery.store != '');
    	var laterMethod = (Invoice.delivery.method == 'later');
        if(teamMethod || shippingMethod || pickupMethod || carryoutMethod || laterMethod){
            posNav.find('.pos-delivery-button').addClass('pos-button-complete');
        } else {
            posNav.find('.pos-delivery-button').addClass('pos-button-incomplete');
        }
    } else{
        posNav.find('.pos-delivery-button').addClass('pos-button-active');
    }

    if(page.name != 'pos_summary'){
        if(false){
            posNav.find('.pos-summary-button').addClass('pos-button-complete');
        } else {
            posNav.find('.pos-summary-button').addClass('pos-button-incomplete');
        }
    } else{
        posNav.find('.pos-summary-button').addClass('pos-button-active');
    }
};

function PoSContinueInit(page){
    var pageContainer= $$(page.container);
    continueButton = pageContainer.find('.pos-continue');

    if(page.name == 'pos_cart'){
        continueButton.on('click', function(){
            mainView.router.loadPage('pos_customer.html');
        });
    }

    if(page.name == 'pos_customer'){
        continueButton.on('click', function(){
            mainView.router.loadPage('pos_delivery.html');
        });
    }

    if(page.name == 'pos_delivery'){
        continueButton.on('click', function(){
            mainView.router.loadPage('pos_summary.html');
        });
    }
};



function cartDetailsToolbarHeader(){
    $$('.tax-toolbar').html(formatNumberMoney(Invoice.taxAmount));
    $$('.taxpercent').html((Invoice.taxPercent * 100).toFixed(1) + '%');
    $$('.delivery-toolbar').html(formatNumberMoney(Invoice.delivery.cost));
    if(Invoice.delivery.date != '00/00/00'){
        $$('.delivery-date-toolbar').html(Invoice.delivery.date);
    }
    $$('.subtotal-toolbar').html(formatNumberMoney(Invoice.subtotalAmount));
    if(Invoice.discount > 0){
        $$('.discount-toolbar').html('<span style="color:green;">' + formatNumberMoney(Invoice.discount) + '</span>');
        $$('.discount-label-toolbar').show();
    } else {
        $$('.discount-toolbar').html(''); 
        $$('.discount-label-toolbar').hide();
    }
    $$('.total-toolbar').html(formatNumberMoney(Invoice.totalAmount + Invoice.delivery.cost));
}



function formatNumberMoney(money){
    return '$' + money.toFixed(2);
}
function noop(){
    return this;
}
function consool(msg){
	if(DEBUG_MODE){
		console.log(msg);
	}
}
function createStockArray(line){
	var location = line.location;
	var limit = 10;
	switch(location){
		case 'I':
			return numberArrayize(line.stock[0].available, limit);
			break;
		case 'W':
			return numberArrayize(line.stock[1].available, limit);
			break;
		case 'O':
			return numberArrayize(line.stock[2].available, limit);
			break;
	}
}
function numberArrayize(number, limit){
	var tempArray = [];
	limit = (number > limit) ? limit : number;
	for (var i = 0; i < limit; i++) {
		tempArray[i] = i + 1;
	}
	return tempArray;
}

var choicelistModal= function(params) {
    // DEFAULTS
    var ModalParamsObject= {
        data: [],
        title: 'Please Choose:',
        success: function() {},
        error: function() {},
        closeModal: true,
        searchbar: false,
        searchbarDataUrl: '', // If the data is elsewhere
        closeModal: true,
        type: 'modal'
    };

    $$.each(params,function(key, value) {
        ModalParamsObject[key]= value;
    });

    if (ModalParamsObject.data.length> 0) {
        
        // TODO: allow a small modal INSTEAD of a popup...
        switch(ModalParamsObject.type) {
            case 'modal':
                var closeModalClass= (ModalParamsObject.closeModal == true) ? ' close-modal': '';
                var modalHTML= '';
                if (ModalParamsObject.searchbar) {
                    modalHTML+= '<form class="searchbar">'+
                                    '<div class="searchbar-input">'+
                                        '<input type="search" placeholder="Search">'+
                                        '<a href="#" class="searchbar-clear"></a>'+
                                    '</div>'+
                                    '<a href="#" class="searchbar-cancel">Cancel</a>'+
                                '</form>';
                }
                modalHTML+= '<div class="scrollableContainer modalScrollable">'+
                                    '<div class="list-block list-blockModal searchbar-found" style="margin: 0px;">'+
                                        '<ul>';
                typeOfData= Object.prototype.toString.call(ModalParamsObject.data[0]);
                switch (typeOfData) {
                    case '[object String]':
                    case '[object Number]':
                        for (var i= 0; i< ModalParamsObject.data.length; i++) {
                            modalHTML+= '<li>'+
                                            '<a href="#" data-index="'+i+'" data-id="'+i+'" class="item-link choicelistselect'+closeModalClass+'">'+
                                                '<div class="item-content">'+
                                                    '<div class="item-inner">'+
                                                        '<div class="item-title">'+ModalParamsObject.data[i]+'</div>'+
                                                    '</div>'+
                                                '</div>'+
                                            '</a>'+
                                        '</li>';
                        }
                        break;
                    case '[object Object]':
                        for (var i= 0; i< ModalParamsObject.data.length; i++) {
                            modalHTML+= '<li>'+
                                            '<a href="#" data-index="'+i+'" data-id="'+ModalParamsObject.data[i].id+'" class="item-link choicelistselect'+closeModalClass+'">'+
                                                '<div class="item-content">'+
                                                    '<div class="item-inner">'+
                                                        '<div class="item-title">'+ModalParamsObject.data[i].text+'</div>'+
                                                    '</div>'+
                                                '</div>'+
                                            '</a>'+
                                        '</li>';
                        }
                        break;
                }
                modalHTML+=         '</ul>'+
                                '</div>'+
                            '</div>';
                
                myApp.modal({
                    title: ModalParamsObject.title,
                    text: modalHTML,
                    buttons: [
                        {
                            text: 'Cancel'
                        }
                    ]
                });
                
                $$('.modal-overlay.modal-overlay-visible').on('click',function() {
                    myApp.closeModal('.modal');
                });
                
                $$('.modal-in .modal-inner').css('padding-right','0px').css('padding-bottom','0px').css('padding-left','0px');
                
                $$('.modal-in .modal-title').css('width','100%').css('text-align','center');
                $$('.modal-in .modal-text').css('width','100%');
                
                break;
            case 'picker': // TODO: fix this...
                var closePickerClass= (ModalParamsObject.closeModal == true) ? ' close-picker': '';
            
                var pickerHTML= '<div class="picker-modal">'+
                      '<div class="toolbar">' +
                        '<div class="toolbar-inner">' +
                          '<div class="left">'+ModalParamsObject.title+'</div>' +
                          '<div class="right"><a href="#" class="close-picker">Close</a></div>' +
                        '</div>' +
                      '</div>' +
                      '<div class="picker-modal-inner">' +
                        '<div class="scrollableContainer modalScrollable">'+
                            '<div class="list-block" style="margin: 0px;">'+
                                '<ul>';
                typeOfData= Object.prototype.toString.call(ModalParamsObject.data[0]);
                
                switch (typeOfData) {
                    case '[object String]':
                    case '[object Number]':
                        for (var i= 0; i< ModalParamsObject.data.length; i++) {
                            pickerHTML+= '<li>'+
                                            '<a href="#" data-index="'+i+'" data-id="'+i+'" class="item-link choicelistselect'+closePickerClass+'">'+
                                                '<div class="item-content">'+
                                                    '<div class="item-inner">'+
                                                        '<div class="item-title">'+ModalParamsObject.data[i]+'</div>'+
                                                    '</div>'+
                                                '</div>'+
                                            '</a>'+
                                        '</li>';
                        }
                        break;
                    case '[object Object]':
                        for (var i= 0; i< ModalParamsObject.data.length; i++) {
                            pickerHTML+= '<li>'+
                                            '<a href="#" data-index="'+i+'" data-id="'+ModalParamsObject.data[i].id+'" class="item-link choicelistselect'+closePickerClass+'">'+
                                                '<div class="item-content">'+
                                                    '<div class="item-inner">'+
                                                        '<div class="item-title">'+ModalParamsObject.data[i].text+'</div>'+
                                                    '</div>'+
                                                '</div>'+
                                            '</a>'+
                                        '</li>';
                        }
                        break;
                }

                pickerHTML+=        '</ul>'+
                                '</div>'+
                              '</div>'+
                            '</div>';
                    
                if ($$('.picker-modal.modal-in').length > 0) {
                    myApp.closeModal('.picker-modal.modal-in');
                }
                myApp.pickerModal(pickerHTML);

                break;
            case 'popup': // Popup is default...
            default:
                var closePopupClass= (ModalParamsObject.closeModal == true) ? ' close-popup': '';
                
                var popupHTML= '<div class="popup choicelistPopup">'+
                                    '<a href="#" class="popupClose close-popup"><i class="f7-icons">close_round</i></a>'+
                                    '<div class="content-block"><div class="content-block-inner">'+ModalParamsObject.title+'</div></div>'+
                                    '<div class="list-block">'+
                                        '<ul>';
                typeOfData= Object.prototype.toString.call(ModalParamsObject.data[0]);

                switch (typeOfData) {
                    case '[object String]':
                    case '[object Number]':
                        for (var i= 0; i< ModalParamsObject.data.length; i++) {
                            popupHTML+= '<li>'+
                                            '<a href="#" data-index="'+i+'" data-id="'+i+'" class="item-link choicelistselect'+closePopupClass+'">'+
                                                '<div class="item-content">'+
                                                    '<div class="item-inner">'+
                                                        '<div class="item-title">'+ModalParamsObject.data[i]+'</div>'+
                                                    '</div>'+
                                                '</div>'+
                                            '</a>'+
                                        '</li>';
                        }
                        break;
                    case '[object Object]':
                        for (var i= 0; i< ModalParamsObject.data.length; i++) {
                            popupHTML+= '<li>'+
                                            '<a href="#" data-index="'+i+'" data-id="'+ModalParamsObject.data[i].id+'" class="item-link choicelistselect'+closePopupClass+'">'+
                                                '<div class="item-content">'+
                                                    '<div class="item-inner">'+
                                                        '<div class="item-title">'+ModalParamsObject.data[i].text+'</div>'+
                                                    '</div>'+
                                                '</div>'+
                                            '</a>'+
                                        '</li>';
                        }
                        break;
                }
                
                popupHTML+=         '</ul>'+
                                '</div>'+
                            '</div>';
                            
                myApp.popup(popupHTML);
        }

        if (ModalParamsObject.searchbar) {
            var mySearchbar= MyApp.searchbar('.searchbar', {
                searchList: '.list-blockModal',
                searchIn: '.item-title'
            });

            $$('.searchbar-input input').focus();
        }

        $$('.choicelistselect').click(function() {
            if (ModalParamsObject.closeModal) {
                switch(ModalParamsObject.type) {
                    case 'modal':
                        myApp.closeModal('.modal');
                };
            }
            var thisObject= $$(this);
            ModalParamsObject.success(parseInt(thisObject.attr("data-index")),thisObject.find('.item-title').text(),ModalParamsObject.data,parseInt(thisObject.attr("data-id")));
        });

    } else {
        // No choices... error?
    }
};

function addDiscountModal(){
    choicelistModal({
        type: 'modal',
        data: ['PMD', 'Tax Free', 'Troll Bridge'], // TODO : Get tax array from TM
        success: function(index,title,data) {
            switch(data[index]){
                case 'PMD':
                    Invoice.addDiscount({type:'PMD'});
                    break;
                case 'Tax':
                    Invoice.addDiscount({type:'Tax'});
                    break;
                case 'Troll':
                    Invoice.addDiscount({type:'Troll'});
                    break;
            }
            cartDetailsToolbarHeader();
        }
    }); 
}

function transferInvoiceModal(stations){
    choicelistModal({
        type: 'modal',
        data: stations,
        success: function(index,title,data) {
            //TaskMaster.transferInvoice(data[index], Invoice, consool);
            TaskMaster.debugPost(Invoice, consool);
        }
    });
}