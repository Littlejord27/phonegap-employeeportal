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

// Initialize your app
var myApp = new Framework7({
});

// Export selectors engine
var $$ = Dom7;

var isAndroid = Framework7.prototype.device.android === true;
var isIos = Framework7.prototype.device.ios === true;
var isBrowser = (!isAndroid & !isIos) ? true : false;

var TM = new TaskMaster();
var invoice = new Invoice();

var DEBUG_MODE = true;

var INVOICES = [];

var EMPLOYEE = {
    id:0,
    name:'',
    department:'',
    locationid:0,
};

var userSwitch = 1;
switch(userSwitch){
    case 1:
        EMPLOYEE.id = 42;
        EMPLOYEE.name = 'JordanL';
        EMPLOYEE.department = 'IT';
        EMPLOYEE.locationid = 5;
        break;
    case 2:
        EMPLOYEE.id = 16;
        EMPLOYEE.name = 'MattD';
        EMPLOYEE.department = 'IT';
        EMPLOYEE.locationid = 5;
        break;
}

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

    invoiceInit();

    $$('.framework7-root').on('click', '.home-icon', function(){
        mainView.router.back({url:'profile.html', force:true});
    });

    $$('.framework7-root').on('click', '.pos-actions', function(){
        serviceActions();
    });

    $$('.framework7-root').on('click', '.quantity-col-card', function(){
		var elem = $$(this);
		var id = elem.data("id")
        consool(invoice.salesLines[id]);
		var stockQuantity = createStockArray(invoice.salesLines[id]);
		choicelistModal({
            type: 'modal',
            data: stockQuantity,
            success: function(index,title,data) {
            	invoice.changeQuantity(id, data[index]);
            	var classSelector = elem.parent().parent().parent().parent()[0].className;
				var idSelector = elem.parent().parent().parent().parent()[0].id;
				if(idSelector != ''){
					invoice.draw('#'+idSelector);
				} else if(classSelector == 'cart-list'){
					invoice.draw('.'+classSelector);
				}
				cartDetailsToolbarHeader();
            }
        });
	});

	$$('.framework7-root').on('click', '.location-edit-card', function(){
		var elem = $$(this);
		var id = elem.data("id")
		choicelistModal({
            type: 'modal',
            data: ['Store','Warehouse','Outlet', 'Special Order'],
            success: function(index,title,data) {
            	switch(data[index]){ // ITEM LOCATION SWITCH
            		case 'Store':
            			invoice.changeLocation(id, 'I');
            			break;
            		case 'Warehouse':
            			invoice.changeLocation(id, 'W');
            			break;
            		case 'Outlet':
            			invoice.changeLocation(id, 'O');
            			break;
                    case 'Special Order':
                        invoice.changeLocation(id, 'SO');
                        break;
            	}
            	var classSelector  = elem.parent().parent().parent().parent().parent().parent()[0].className;
				var idSelector     = elem.parent().parent().parent().parent().parent().parent()[0].id;
				if(idSelector != ''){
					invoice.draw('#'+idSelector);
				} else if(classSelector == 'cart-list'){
					invoice.draw('.'+classSelector);
				}
				cartDetailsToolbarHeader();
            }
        });
	});

	$$('.framework7-root').on('click', '.delete-line', function(){
		// TODO: Add Modal to confirm delete.
		var elem = $$(this);
		invoice.deleteLine(elem.data("id"));
		var classSelector = elem.parent().parent().parent()[0].className;
		var idSelector = elem.parent().parent().parent()[0].id;
		if(idSelector != ''){
			invoice.draw('#'+idSelector);
		} else if(classSelector == 'cart-list'){
			invoice.draw('.'+classSelector);
		}
		cartDetailsToolbarHeader();
	});

    var searchDelayTimer;
    $$('.framework7-root').on('keyup', '#search-box', function(){
        if(this.value.length > 3){
            clearTimeout(searchDelayTimer);
            (function(search){
                searchDelayTimer = setTimeout(function() {
                    TM.searchInventory(search, function(data){
                        var listNames = data.inventoryNames;
                        var listSkus = data.inventorySkus;
                        for (var i = 0; i < listNames.length; i++) {
                            var searchItem = $$('<li class="item-content" data-sku="'+listSkus[i]+'"><div class="item-inner"><div class="item-title search-result-item">'+listNames[i]+'</div></div></li>');
                            searchItem.on('click', function(){
                                TM.getItemInfo($$(this).data('sku'), function(data){
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
                                    invoice.itemPopup(itemLine);
                                });
                            });
                            $$('.search-results').append(searchItem);
                        }
                    });
                }, 500); // Will do the ajax stuff after 1000 ms, or 1 s
            })(this.value);
        }
    });

	$$('#clear-native').on('click', function(){
		NativeStorage.clear( consool, consool );
	});

    NativeStorage.getItem('sameBilling', noop, function(error){
        if(error.code == 2){ NativeStorage.setItem('sameBilling', false, noop, noop); }
    });
    NativeStorage.getItem('method', noop, function(error){
        if(error.code == 2){ invoice.setDeliveryMethod('team'); }
    });
    NativeStorage.getItem('location', noop, function(error){
        if(error.code == 2){ invoice.delivery.location = 'I'; } // DEFAULT PICK UP LOCATION
    });

    NativeStorage.getItem('invoices', function(obj){ 
        obj = JSON.parse(obj);
        for (var i = 0; i < obj.length; i++) {
            INVOICES.push(new Invoice(obj[i]));
        }
    }, function(error){ 
        if(error.code == 2){ 
            INVOICES = [];
        } else {
            consool(error);
        }
    });

    if(EMPLOYEE.id != 0){
        mainView.router.loadPage({url:'profile.html'});
    } else {
        navigator.splashscreen.hide();
    }

    $$('#password').on('focus', function(){$$(this).val('');});
    $$('.framework7-root').on('click', '.login-button', function(){
        TM.login($$('#password').val(), function(employee){
            EMPLOYEE.id = employee.id;
            EMPLOYEE.name = employee.name;
            EMPLOYEE.department = employee.department;
            EMPLOYEE.locationid = employee.store;
            invoice.setSalesperson(EMPLOYEE.name);
            mainView.router.loadPage({url:'profile.html'});
        }, consool);
    });
});

myApp.onPageInit('profile', function (page) {

    $$('.admin-setting-link').on('click', function(){
        //adminmenupopover();
    });

    $$('.employee-name').text(EMPLOYEE.name);
    $$('.employee-department').text(EMPLOYEE.department);

    var mySwiper = myApp.swiper('.profile-swiper', {
    });
    $$('.scan-catch').on('click', function(){
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
                choicelistModal({ 
                    type: 'modal',
                    data: ['Add to Cart', 'Other Option'],
                    success: function(index,title,data) {
                        switch(data[index]){
                            case 'Add to Cart':
                                mainView.router.loadPage('pos_cart.html');
                                TM.getItemInfo(sku, function(data){
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
                                    invoice.itemPopup(itemLine);
                                });
                                break;
                        }
                    }
                });
            }
        );
    });
    navigator.splashscreen.hide();
});

myApp.onPageInit('pos_cart pos_customer pos_delivery pos_summary', function(page){
    PoSNavigationInit(page);
    PoSContinueInit(page);
    cartDetailsToolbarHeader();
});

myApp.onPageInit('pos_cart', function (page) {
    invoice.draw();

    $$('#scan-button').on('click', startScan);

    $$('#search-button').on('click', startSearch);

    function startSearch(){
        var searchModal = myApp.modal({
            title:  'Search',
            text: '<input id="search-box">',
            afterText: '<div class="list-block search-result-div"><ul class="search-results"></ul></div>',
            buttons: [
              {
                text: 'Cancel', onClick: function() { }
              },
            ],
        });
        $$(searchModal).addClass('search-modal');
    }

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
                TM.getItemInfo(sku, function(data){
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
                    invoice.itemPopup(itemLine);
                });
            }
        );
    }
});

myApp.onPageInit('pos_customer', function (page) {
    $$('#firstName').val(invoice.customer.first);
    $$('#lastName').val(invoice.customer.last);
    $$('#email').val(invoice.customer.email);
    $$('#phoneNumber').val(invoice.customer.phoneNumber);
    $$('#streetOne').val(invoice.customer.billing.street);
    $$('#streetTwo').val(invoice.customer.billing.streetTwo);
    $$('#city').val(invoice.customer.billing.city);
    $$('#state').val(invoice.customer.billing.state);
    $$('#zip').val(invoice.customer.billing.zip);

    $$('#firstName').on('keyup', function(){ invoice.setFirstName(this.value);});
    $$('#lastName').on('keyup', function(){ invoice.setLastName(this.value);});
    $$('#email').on('keyup', function(){ invoice.setEmail(this.value);});
    $$('#phoneNumber').on('keyup', function(){  invoice.setPhoneNumber(this.value); });

    $$('#streetOne').on('keyup', function(){ invoice.setBillingStreet(this.value);});
    $$('#streetTwo').on('keyup', function(){ invoice.setBillingStreetTwo(this.value);});
    $$('#city').on('keyup', function(){ invoice.setBillingCity(this.value);});
    $$('#state').on('keyup', function(){ invoice.setBillingState(this.value);});
    $$('#zip').on('keyup', function(){ invoice.setBillingZip(this.value);});

    $$('input').each(function(){
        if(this.value != ''){
            $$(this).attr("placeholder", '');
        }
    });
});

myApp.onPageInit('pos_delivery', function (page) {
    setShippingFields();

    $$('#delivery-method').val(invoice.delivery.method);

    $$('#additional-notes').val(invoice.delivery.notes);

    switch(invoice.delivery.method){
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

    switch(invoice.delivery.location){
    	case 'I':
    		$$('#pickup-location-id').text('Seattle Store');
    		break;
    	case 'W':
    		$$('#pickup-location-id').text('Warehouse');
    		break;
    	default:
    		consool('broke');
    		consool(invoice.delivery.location);
    		break;
    }
    
    $$('#delivery-method').on('change', function(){
        var shippingMethod = this.value;
        invoice.resetDeliveryInfo();
        switch(shippingMethod){
            case 'team':
                invoice.setDeliveryMethod('team');
                setShippingFields();
                $$('#section-two').show();
                $$('#section-four').hide();
                displayThirdSection();
                break;
            case 'shipping':
                invoice.setDeliveryMethod('shipping');
                setShippingFields();
                $$('#section-two').show();
                $$('#section-three').hide();
                $$('#section-four').hide();
                break;
            case 'pickup':
            	invoice.setDeliveryMethod('pickup');
            	$$('#section-two').hide();
				$$('#section-three').hide();
            	$$('#section-four').show();
            	$$('#section-five').show();
            	break;
            case 'carryout':
                invoice.setDeliveryMethod('carryout');
                $$('#section-two').hide();
                $$('#section-three').hide();
                $$('#section-four').hide();
                $$('#section-five').show();
                break;
            case 'later':
                invoice.setDeliveryMethod('later');
                $$('#section-two').hide();
                $$('#section-three').hide();
                $$('#section-four').hide();
                $$('#section-five').show();
                break;
        }
    });

    $$('#pickup-location').on('change', function(){
        var pickupLocation = this.value;
        invoice.setDeliveryLocation(pickupLocation);
    });

    $$('.delivery-input').on('keyup', displayThirdSection);

    $$('#streetOne-delivery').on('keyup', function(){
        if($$("#same-as-billing").prop( "checked")){
            invoice.setBillingStreet(this.value);
        } else {
            invoice.setShippingStreet(this.value);
        }
    });
    $$('#streetTwo-delivery').on('keyup', function(){
        if($$("#same-as-billing").prop( "checked")){
            invoice.setBillingStreetTwo(this.value);
        } else {
            invoice.setShippingStreetTwo(this.value);
        }
    });
    $$('#city-delivery').on('keyup', function(){
        if($$("#same-as-billing").prop( "checked")){
            invoice.setBillingCity(this.value);
        } else {
            invoice.setShippingCity(this.value);
        }
    });
    $$('#state-delivery').on('keyup', function(){
        if($$("#same-as-billing").prop( "checked")){
            invoice.setBillingState(this.value);
        } else {
            invoice.setShippingState(this.value);
        }
    });
    $$('#zip-delivery').on('keyup', function(){
        if($$("#same-as-billing").prop( "checked")){
            invoice.setBillingZip(this.value);
        } else {
            invoice.setShippingZip(this.value);
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
        invoice.setDeliveryNotes(this.value);
    });

    function setShippingFromBilling(){
        $$('#streetOne-delivery').val(invoice.customer.billing.street);
        $$('#streetTwo-delivery').val(invoice.customer.billing.streetTwo);
        $$('#city-delivery').val(invoice.customer.billing.city);
        $$('#state-delivery').val(invoice.customer.billing.state);
        $$('#zip-delivery').val(invoice.customer.billing.zip);
        displayThirdSection();
    }

    function setShippingFromSaved(){
        $$('#streetOne-delivery').val(invoice.customer.shipping.street);
        $$('#streetTwo-delivery').val(invoice.customer.shipping.streetTwo);
        $$('#city-delivery').val(invoice.customer.shipping.city);
        $$('#state-delivery').val(invoice.customer.shipping.state);
        $$('#zip-delivery').val(invoice.customer.shipping.zip);
        displayThirdSection();
    }

    function displayThirdSection(){
        var streetOne = $$('#streetOne-delivery').val();
        var city = $$('#city-delivery').val();
        var state = $$('#state-delivery').val();
        var zip = $$('#zip-delivery').val();

        if(streetOne != '' && city != '' && state != '' && zip.length > 4 && invoice.delivery.method == 'team'){
            TM.zipdeliverycost(streetOne, city, state, zip,  function(data){
                invoice.setDeliveryCost(data.costOfDelivery);
                invoice.setTaxPercent(data.totaltaxpercent);
                cartDetailsToolbarHeader();
            });
            TM.deliverystatus(0, '2017', zip, fillCalendar);
            $$('#section-three').show();
        } else if(zip.length > 4 && invoice.delivery.method == 'shipping'){
            //TM.unishippersquote(invoice.getSkus(), zip,  consool);
        } else {
            invoice.setDeliveryCost(0);
            invoice.setDeliveryDateString('00', '00', '00');
            cartDetailsToolbarHeader();
            $$('#section-three').hide();
        }
    }

    function setShippingFields(){
        NativeStorage.getItem('sameBilling', function(obj){
            if(invoice.delivery.method == 'team' || invoice.delivery.method == 'shipping'){
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
            if(invoice.getDeliveryDateString() != '00/00/00'){
                //$$('.picker-calendar-day-selected').removeClass('picker-calendar-day-selected');
                var today = $$('.picker-calendar-day-selected');
                var selectedDate = invoice.delivery.year+'-'+(invoice.delivery.month -1)+'-'+invoice.delivery.day;
                $$('.picker-calendar-day-selected').removeClass('picker-calendar-day-selected');
                $$('.picker-calendar-day[data-date="'+selectedDate+'"]').addClass('picker-calendar-day-selected');
                $$('#delivery-date').text(' - '+ invoice.getDeliveryDateString());
            }
        },
        onMonthYearChangeStart: function (p) {
            //TM.deliverystatus(parseInt(p.currentMonth) +1, p.currentYear, invoice.customer.shipping.zip, fillCalendar);
            NativeStorage.getItem('sameBilling', function(obj){
                if(obj){ 
                    TM.deliverystatus((parseInt(p.currentMonth) + 1), p.currentYear, invoice.customer.billing.zip, fillCalendar);
                } else {
                    TM.deliverystatus((parseInt(p.currentMonth) + 1), p.currentYear, invoice.customer.shipping.zip, fillCalendar);
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
            invoice.setDeliveryDateString(month, day, year);
            $$('#delivery-date').text(' - '+ invoice.getDeliveryDateString());
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
            invoice.setDeliveryDateString(month, day, year);
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
    invoice.setBalance(roundTo(invoice.totalAmount + invoice.delivery.cost, 2));

    $$('#summary-div-billingInfo-name').text(invoice.customer.first + ' ' + invoice.customer.last);
    $$('#summary-div-billingInfo-phone').text(invoice.customer.cell);
    $$('#summary-div-billingInfo-email').text(invoice.customer.email);
    $$('#summary-div-billingInfo-addr').text(invoice.getBilling());

    switch(invoice.delivery.method){
        case 'shipping':
        case 'team':
            $$('#summary-div-receiving-method').text(invoice.delivery.method);
            $$('#summary-div-receiving-addr').show();
            $$('#summary-div-receiving-date').text(invoice.delivery.date);
            NativeStorage.getItem('sameBilling', function(obj){ 
                if(obj){ 
                    $$('#summary-div-receiving-addr').text(invoice.getBilling());
                } else {
                    $$('#summary-div-receiving-addr').text(invoice.getShipping());
                }
            }, function(error){

            });
            break;
        case 'pickup':
            $$('#summary-div-receiving-method').text(invoice.delivery.method);
            $$('#summary-div-receiving-addr').hide();
            $$('#summary-div-receiving-date').text(invoice.delivery.date);
            break;
        case 'carryout':
        case 'later':
            $$('#summary-div-receiving-method').text(invoice.delivery.method);
            $$('#summary-div-receiving-addr').hide();
            $$('#summary-div-receiving-date').hide();
            break;
    }

    invoice.draw('#summary-cart');

    if(invoice.salesLines.length < 1){
        $$('#customer-cart-div').hide();
        $$('#cart-title').hide();
    } else {
        $$('#summary-subtotal').text(formatNumberMoney(invoice.subtotalAmount));
        $$('#summary-tax').text(formatNumberMoney(invoice.taxAmount));
        $$('#summary-delivery').text(formatNumberMoney(invoice.delivery.cost));
        $$('#summary-total').text(formatNumberMoney(invoice.totalAmount + invoice.delivery.cost));
        if(invoice.totalAmount - invoice.getRemainingBalance() == 0){
            $$('#summary-paid-label').hide();
        } else {
            $$('#summary-paid').text(formatNumberMoney(invoice.getRemainingBalance()));
        }
    }

    $$('#summary-delivery-notes').text(invoice.delivery.notes);

    $$('.pos-pay').on('click', function(){
        //invoice.xfactorsModal();
        invoice.paymentPopup();
    });
});

myApp.onPageInit('pos__thankyou', function (page) {
    $$('#text').text('This was added by Jquery');
});

/*
** Point of Sale Navigation Init
*/
function PoSNavigationInit(page){
    var pageContainer= $$(page.container);
    posNav = pageContainer.find(".pos-navigation");

    if(invoice.salesLines.length > 0){
        posNav.find('.pos-cart-button .checkmark-wrapper').html('<i class="icon f7-icons">check_round</i>');
    } else {
        posNav.find('.pos-cart-button .checkmark-wrapper').html('');
    }

    if(invoice.customer.first != ''){
        posNav.find('.pos-customer-button .checkmark-wrapper').html('<i class="icon f7-icons">check_round</i>');
    } else {
        posNav.find('.pos-customer-button .checkmark-wrapper').html('');
    }

    var teamMethod = (invoice.delivery.method == 'team' && invoice.getDeliveryDateString() != '00/00/00');
    //var shippingMethod = (invoice.delivery.method == 'shipping' && );
    var shippingMethod = false;
    var carryoutMethod = (invoice.delivery.method == 'carryout');
    var pickupMethod = (invoice.delivery.method == 'pickup' && invoice.delivery.store != '');
    var laterMethod = (invoice.delivery.method == 'later');
    if(teamMethod || shippingMethod || pickupMethod || carryoutMethod || laterMethod){
        posNav.find('.pos-delivery-button .checkmark-wrapper').html('<i class="icon f7-icons">check_round</i>');
    } else {
        posNav.find('.pos-delivery-button .checkmark-wrapper').html('');
    }

    if(false){
        posNav.find('.pos-summary-button .checkmark-wrapper').html('<i class="icon f7-icons">check_round</i>');
    } else {
        posNav.find('.pos-summary-button .checkmark-wrapper').html('');
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
    $$('.tax-toolbar').html(formatNumberMoney(invoice.taxAmount));
    $$('.taxpercent').html((invoice.taxPercent * 100).toFixed(1) + '%');
    $$('.delivery-toolbar').html(formatNumberMoney(invoice.delivery.cost));
    if(EMPLOYEE.locationid != 0){
        $$('.invoicelocation-toolbar').html(getLocationNickname(EMPLOYEE.locationid));
    }
    $$('.subtotal-toolbar').html(formatNumberMoney(invoice.subtotalAmount));
    if(invoice.discount > 0){
        $$('.discount-toolbar').html('<span style="color:green;">' + formatNumberMoney(invoice.discount) + '</span>');
        $$('.discount-label-toolbar').show();
    } else {
        $$('.discount-toolbar').html('');
        $$('.discount-label-toolbar').hide();
    }
    $$('.total-toolbar').html(formatNumberMoney(invoice.totalAmount + invoice.delivery.cost));
}



function formatNumberMoney(money){
    return '$' + roundTo(money, 2).toFixed(2);
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
	switch(location){ // ITEM LOCATION SWITCH
		case 'I':
			return numberArrayize(line.stock[0].available, limit);
			break;
		case 'W':
			return numberArrayize(line.stock[1].available, limit);
			break;
		case 'O':
			return numberArrayize(line.stock[2].available, limit);
			break;
        case 'SO':
            return numberArrayize(line.stock[line.stock.length-1].available, limit);
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

function roundTo(n, digits) {
 if (digits === undefined) {
   digits = 0;
 }

 var multiplicator = Math.pow(10, digits);
 n = parseFloat((n * multiplicator).toFixed(11));
 var test =(Math.round(n) / multiplicator);
 return +(test.toFixed(2));
}

function getLocationNickname(locationid){
    switch(locationid){
        case 'I':
            //fall through
        case 1:
            return 'Store';
        case 'W':
            //fall through
        case 2:
            return 'Warehouse';
        case 'O':
            //fall through
        case 5:
            return 'Outlet';
        case 'H':
            //fall through
        case 6:
            return 'Hospatility';
        case '45th':
            //fall through
        case 7:
            return '45th St Bedding';
        case 'BMO':
            //fall through
        case 8:
            return 'B&M Online';
        case 'P':
            //fall through
        case 9:
            return 'Philanthropy';
        case 'SO':
        case 42:
            return 'Special Order';
        default:
            return 'XX';
    }
}

function invoiceInit(){
    invoice.load();
}


function adminmenupopover(){
    var clickedLink = this;
    var popoverHTML = '<div class="popover">'+
                      '<div class="popover-inner">'+
                        '<div class="list-block">'+
                          '<ul>'+
                          '<li><a href="#" class="item-link list-button user-settings">Settings</li>'+
                          '<li><a href="#" class="item-link list-button user-logout">Logout</li>'+
                          /*'<li><a href="#" class="item-link list-button">Link 3</li>'+*/
                          '</ul>'+
                        '</div>'+
                      '</div>'+
                    '</div>';
    //myApp.popover(popoverHTML, clickedLink);

    //$$('.user-settings').on('click', function(){ myApp.closeModal('.popover'); mainView.router.loadPage('settings.html'); });
    //$$('.user-logout').on('click', function(e) { myApp.closeModal('.popover'); logoutUser(e)});
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
function serviceActions(){
    //var less = '<a href="#" class="link icon-only"><i class="icon f7-icons">arrow_left</i></a>';
    var less = '<-- Draft & Quotes';
    //var more = '<a href="#" class="link icon-only"><i class="icon f7-icons">arrow_right</i></a>';
    var more = '--> Invoice Actions';
    var actions = [less, 'Add Discount', 'Add Fee', 'Clear Discounts', 'Clear Fees', 'Reset Sale', more]; 
    choicelistModal({
        type: 'modal',
        title: 'Services:',
        data: actions,
        success: function(index,title,data) {
            switch(data[index]){
                case less:
                    draftAndQUoteActions();
                    break;
                case 'Add Discount':
                    addDiscountModal();
                    break;
                case 'Add Fee':
                    addDiscountModal();
                    break;
                case 'Clear Discounts':
                    invoice.setDiscounts([]);
                    cartDetailsToolbarHeader();
                    break;
                case 'Clear Fees':
                    break;
                case 'Reset Sale':
                    invoice.reinit();
                    mainView.router.refreshPage();
                    break;
                case more:
                    invoiceActions();
                    break;
            }
        }
    });
}

function invoiceActions(){
    //var less = '<a href="#" class="link icon-only"><i class="icon f7-icons">arrow_left</i></a>';
    var less = '<-- Cart Actions';
    //var more = '<a href="#" class="link icon-only"><i class="icon f7-icons">arrow_right</i></a>';
    var more = '--> Draft & Quotes';
    var actions = [less, 'Change Location', 'Transfer Invoice', more]; 
    choicelistModal({
        type: 'modal',
        title: 'Invoice Options:',
        data: actions,
        success: function(index,title,data) {
            switch(data[index]){
                case less:
                    serviceActions();
                    break;
               case 'Change Location':
                    locationChangeChoicelist();
                    cartDetailsToolbarHeader();
                    break;
                case 'Transfer Invoice':
                    TM.listStations(function(data){
                        transferInvoiceModal(data.stations);
                    });
                    break;
                case more:
                    draftAndQUoteActions();
                    break;
            }
        }
    });
}

function draftAndQUoteActions(){
    var less = '<-- Invoice Actions';
    var more = '--> Cart Actions';
    var actions = [less, 'Drafts', 'Quotes', more]; 
    choicelistModal({
        type: 'modal',
        title: 'Drafts & Quotes',
        data: actions,
        success: function(index,title,data) {
            switch(data[index]){
                case less:
                    invoiceActions();
                    break;
               case 'Drafts':
                    draftActions();
                    break;
                case 'Quotes':
                    quoteActions();
                    break;
                case more:
                    serviceActions();
                    break;
            }
        }
    });
}

function draftActions(){
    var actions = ['Save Draft', 'Load Draft', 'Delete Draft'];
    choicelistModal({
        type: 'modal',
        title: 'Clear:',
        data: actions,
        success: function(index,title,data) {
            switch(data[index]){
                case 'Save Draft':
                    saveDraft();
                    break;
                case 'Load Draft':
                    loadDraftChoicelist();
                    break;
                case 'Delete Draft':
                    break;
            }
        }
    });
}

function quoteActions(){
    var actions = ['Save Quote', 'Load Quote', 'Delete Quote'];
    choicelistModal({
        type: 'modal',
        title: 'Clear:',
        data: actions,
        success: function(index,title,data) {
            switch(data[index]){
                case 'Save Quote':
                    saveQuote();
                    break;
                case 'Load Quote':
                    loadQuoteChoicelist();
                    break;
                case 'Delete Quote':
                    break;
            }
        }
    });
}

function saveDraft(){
    var saveDraftModal = myApp.modal({
        title:  'Save Draft?',
        text: '<input id="draft-name-box">',
        buttons: [
          {
            text: 'Cancel', onClick: function() { }
          },
          {
            text: 'Save', onClick: function() {
                var proposedName = $$('#draft-name-box').val();
                var resp = nameNotTaken(proposedName);
                if(resp){
                    invoice.setTitle(proposedName);
                    INVOICES.push(decoupleObj(invoice));
                    NativeStorage.setItem('invoices', JSON.stringify(INVOICES), noop, consool);
                } else if(!isNaN(resp)) { // If name is taken, return draft that has conflicting name
                    consool('name taken');
                    consool(INVOICES[resp]);
                }
            }
          },
        ],
    });
    $$(saveDraftModal).addClass('save-draft-modal');
}

function loadDraftChoicelist(){
    var actions = []; 
    for (var i = 0; i < INVOICES.length; i++) {
        actions.push(INVOICES[i].title);
    }
    choicelistModal({
        type: 'modal',
        data: actions,
        success: function(index,title,data){
            invoice = new Invoice(decoupleObj(INVOICES[index]));
            mainView.router.refreshPage();
        }
    });
}

function saveQuote(){
    var saveDraftModal = myApp.modal({
        title:  'Save Quote?',
        text: '<input id="draft-name-box">',
        buttons: [
          {
            text: 'Cancel', onClick: function() { }
          },
          {
            text: 'Save', onClick: function() {
                var proposedName = $$('#draft-name-box').val();
                var resp = nameNotTaken(proposedName);
                if(resp){
                    invoice.setTitle(proposedName);
                    INVOICES.push(decoupleObj(invoice));
                    NativeStorage.setItem('invoices', JSON.stringify(INVOICES), noop, consool);
                } else if(!isNaN(resp)) { // If name is taken, return draft that has conflicting name
                    consool('name taken');
                    consool(INVOICES[resp]);
                }
            }
          },
        ],
    });
    $$(saveDraftModal).addClass('save-draft-modal');
}

function loadQuoteChoicelist(){
    var actions = []; 
    for (var i = 0; i < INVOICES.length; i++) {
        actions.push(INVOICES[i].title);
    }
    choicelistModal({
        type: 'modal',
        data: actions,
        success: function(index,title,data){
            invoice = new Invoice(decoupleObj(INVOICES[index]));
            mainView.router.refreshPage();
        }
    });
}

function nameNotTaken(name){
    for (var i = 0; i < INVOICES.length; i++) {
        if(name == INVOICES[i].title){
            return i;
        }
    }
    return true;
}

function locationChangeChoicelist() {
    var actions = ['Store', 'Outlet', 'Hospatility', '45th Street Bedding', 'Bedrooms & More Online', 'Philanthropy']; 
    choicelistModal({
        type: 'modal',
        data: actions,
        success: function(index,title,data) {
            switch(data[index]){
                case 'Store':
                    EMPLOYEE.locationid = 1;
                    break;
                case 'Outlet':
                    EMPLOYEE.locationid = 5;
                    break;
                case 'Hospatility':
                    EMPLOYEE.locationid = 6;
                    break;
                case '45th Street Bedding':
                    EMPLOYEE.locationid = 7;
                    break;
                case 'Bedrooms & More Online':
                    EMPLOYEE.locationid = 8;
                    break;
                case 'Philanthropy':
                    EMPLOYEE.locationid = 9;
                    break;
            }
        }
    });
}

function addDiscountModal(){
    choicelistModal({
        type: 'modal',
        data: ['PMD', 'Tax Free', 'Troll Bridge'], // TODO : Get tax array from TM
        success: function(index,title,data) {
            switch(data[index]){
                case 'PMD':
                    invoice.addDiscount({type:'PMD'});
                    break;
                case 'Tax':
                    invoice.addDiscount({type:'Tax'});
                    break;
                case 'Troll':
                    invoice.addDiscount({type:'Troll'});
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
            //TM.transferInvoice(data[index], invoice, consool);
            TM.debugPost(invoice, consool);
        }
    });
}

function decoupleObj(obj){
    return JSON.parse(JSON.stringify(obj));
}