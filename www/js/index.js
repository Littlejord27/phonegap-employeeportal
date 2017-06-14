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

var SHORT = 'short';
var LONG = 'long';

var INVOICES = [];

var EMPLOYEE = {
    id:0,
    name:'',
    department:'',
    locationid:0,
    invoiceLocationID:0,
};

var userSwitch = 0;
switch(userSwitch){
    case 1:
        EMPLOYEE.id = 42;
        EMPLOYEE.name = 'JordanL';
        EMPLOYEE.department = 'IT';
        EMPLOYEE.locationid = 5;
        EMPLOYEE.invoiceLocationID = 8;
        break;
    case 2:
        EMPLOYEE.id = 16;
        EMPLOYEE.name = 'MattD';
        EMPLOYEE.department = 'IT';
        EMPLOYEE.locationid = 5;
        EMPLOYEE.invoiceLocationID = 8;
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
    invoice.load();

    $$('.framework7-root').on('click', '.send-feedback', function(){
        var pageName = myApp.getCurrentView().activePage.name;
        var popupHTML = '<div class="popup feedback-popup center-align" id="feedback-pop">' +
            '<div class="popup-header"><h1>Feedback</h1></div>' +
            '<div class="content-block center-align">'+
                '<p>Thank you for submitting your feedback. All Feedback will be reviewed by Matt and Jordan</p>' +
                '<div class="left-align">Page:'+pageName+'</div>' +
                '<textarea class="feedback-input"></textarea>' +
                '<div id="submit-feedback">Submit</div>' +
                '<i id="feedback-close" class="icon f7-icons">close</i>' +
            '</div>' +
        '</div>';
        myApp.popup(popupHTML);
        $$('#submit-feedback').on('click', function(){
            var feedback = $$('.feedback-input').val();
            if(feedback.length > 0){
                TM.sendFeedback(pageName, feedback, function(){
                    toast('Feedback Submitted', SHORT);
                    $$('.feedback-input').val('');
                });
            } else {
                toast('No Feedback', SHORT);
            }
        });
        $$('#feedback-close').on('click', function(){
            myApp.closeModal('#feedback-pop');
        });
    });

    $$('.framework7-root').on('click', '.home-icon', function(){
        mainView.router.back({url:'profile.html', force:true});
    });

    $$('.framework7-root').on('click', '.message-list-icon', function(){
        mainView.router.loadPage('msg_list.html');
    });

    $$('.framework7-root').on('click', '.pos-actions', function(){
        serviceActions();
    });

    $$('.framework7-root').on('click', '.quantity-col-card', function(){
		var elem = $$(this);
		var id = elem.data("id");
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
		var id = elem.data("id");
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
        var elem = $$(this);
        var classSelector = elem.parent().parent().parent()[0].className;
        var idSelector = elem.parent().parent().parent()[0].id;
        confirmModal('Delete this item?',function(){
            invoice.deleteLine(elem.data("id"));
            if(idSelector != ''){
                invoice.draw('#'+idSelector);
            } else if(classSelector == 'cart-list'){
                invoice.draw('.'+classSelector);
            }
            cartDetailsToolbarHeader();
            cartDetailsSummaryScreen();
        });
	});

    $$('.framework7-root').on('click', '.minimize-line', function(){
        var elem = $$(this);
        invoice.salesLines[elem.data('id')].minimized = true;
        var elemContent = elem.parent().parent().find('.card-content');
        elem.removeClass('minimize-line');
        elem.addClass('restore-line');
        elem.empty().append('<i class="icon f7-icons">up</i>');
        elemContent.hide();
    });
    $$('.framework7-root').on('click', '.restore-line', function(){
        var elem = $$(this);
        invoice.salesLines[elem.data('id')].minimized = false;
        var elemContent = elem.parent().parent().find('.card-content');
        elem.removeClass('restore-line');
        elem.addClass('minimize-line');
        elem.empty().append('<i class="icon f7-icons">down</i>');
        elemContent.show();
    });

    var searchDelayTimer;
    $$('.framework7-root').on('keyup', '#search-box', function(){
        if(this.value.length > 3){
            clearTimeout(searchDelayTimer);
            (function(search){
                searchDelayTimer = setTimeout(function() {
                    TM.searchInventory(search, function(data){
                        $$('.search-results').empty();
                        var listNames = data.inventoryNames;
                        var listSkus = data.inventorySkus;
                        for (var i = 0; i < listNames.length; i++) {
                            var searchItem = $$('<li class="item-content" data-sku="'+listSkus[i]+'"><div class="item-inner"><div class="item-title search-result-item">'+listNames[i]+'</div></div></li>');
                            searchItem.on('click', function(){
                                TM.getItemInfo($$(this).data('sku'), invoice.itemPopup);
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
            notificationTimeoutStart(0,0,0,0);
            // TODO turn off notification check when logged out and invalid login.
            EMPLOYEE.id = employee.id;
            EMPLOYEE.name = employee.name;
            EMPLOYEE.department = employee.department;
            EMPLOYEE.locationid = employee.store;
            EMPLOYEE.invoiceLocationID = employee.invoiceLocationID;
            invoice.setSalesperson(EMPLOYEE.name);
            if($$('.login-popup').length > 0){
                myApp.closeModal('.login-popup');
                toast('Logged In - ' + EMPLOYEE.name, SHORT);
            } else {
                mainView.router.loadPage({url:'profile.html'});
            }
        }, function(error){
            if($$('.login-popup').length > 0){
                toast('Invalid Login - Popup', SHORT);
            } else {
                toast('Invalid Login', SHORT);
            }
            //mainView.router.loadPage({url:'clk_home.html'});
        });
    });

    $$('.framework7-root').on('click', '.lightbox-image', function(){
        closeLightbox();
        $$('.framework7-root').off('click', 'body', closeLightbox);
        $$('.framework7-root').on('click', 'body', closeLightbox);
        $$('body').append('<div style="top:150px;" class="img-lightbox"><div class="img-lightbox-inner"><img class="lightbox-img" src="'+$$(this).prop('src')+'"></div></div>');
    });

    function closeLightbox(){
        $$('.img-lightbox').remove();
    }
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
                                TM.getItemInfo(sku, invoice.itemPopup);
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
                TM.getItemInfo(sku, invoice.itemPopup);
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
    var emptyVar = '[None Given]';

    $$('#summary-div-billingInfo-name').text(invoice.customer.first + ' ' + invoice.customer.last);
    $$('#summary-div-billingInfo-phone').text((invoice.customer.phoneNumber == '' ? emptyVar : invoice.customer.phoneNumber));
    $$('#summary-div-billingInfo-email').text((invoice.customer.email == '' ? emptyVar : invoice.customer.email));
    $$('#summary-div-billingInfo-addr').text(invoice.getBilling());

    switch(invoice.delivery.method){
        case 'shipping':
        case 'team':
            $$('#summary-div-receiving-method').text(invoice.delivery.method == 'team' ? 'In-Home Delivery' : 'Shipping');
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
            $$('#summary-div-receiving-method').text('Pick Up');
            $$('#summary-div-receiving-addr').hide();
            $$('#summary-div-receiving-date').text(invoice.delivery.date);
            break;
        case 'carryout':
        case 'later':
            $$('#summary-div-receiving-method').text('N/A');
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

    if(invoice.delivery.notes.length > 0){
        $$('#summary-delivery-notes').text(invoice.delivery.notes);
    } else {
        $$('#note-card-summary').hide();
    }

    $$('.pos-pay').on('click', function(){
        //invoice.xfactorsModal();
        if(invoice.totalAmount + invoice.delivery.cost > 0){
        	invoice.paymentPopup();
        }
    });
});

myApp.onPageInit('pos__thankyou', function (page) {
    invoice.employee = EMPLOYEE;

    var invoiceno = page.query.data.invoicenumber;

    $$('#ty_invoice_number').text(page.query.data.invoicenumber);

    $$('#email-rec').on('click', function(){
        var searchModal = myApp.modal({
            title:  'Email Receipt',
            text: '<input id="email-rec-input">',
            afterText: '',
            buttons: [
              {
                text: 'Cancel', onClick: function() { }
              },
              {
                text: 'Send', onClick: function() {
                    TM.emailInvoice($$('#email-rec-input').val(), invoiceno, consool);
                }
              },
            ],
        });
        $$('#email-rec-input').val(page.query.email);
    });

    $$('#print-rec').on('click', function(){
        TM.listPrinters(function(printerData){
            choicelistModal({
                type: 'modal',
                data: printerData.altnames,
                success: function(index,title,data) {
                    TM.printInvoice(invoiceno, 'invoice', printerData.names[index], consool);
                }
            });
        });
    });

    $$('#none-rec').on('click', function(){
        mainView.router.loadPage('profile.html');
    });
});

myApp.onPageInit('clk_home', function(page){
    var currentFullDate = new Date();
    var currentDate = (currentFullDate.getMonth()+1) +' '+ currentFullDate.getDate() +' '+ currentFullDate.getFullYear();
    var h = currentFullDate.getHours();
    h = h > 12 ? h-12 : h;
    var m = currentFullDate.getMinutes();
    m = m < 10 ? "0"+m : m;
    var s = currentFullDate.getSeconds();
    s = s < 10 ? "0"+s : s;
    $$('.current-clock-time').text(h+':'+m+':'+s);

    setInterval(function(){
        var exactDate = new Date();
        var h = exactDate.getHours();
        h = h > 12 ? h-12 : h;
        var m = exactDate.getMinutes();
        m = m < 10 ? "0"+m : m;
        var s = exactDate.getSeconds();
        s = s < 10 ? "0"+s : s;
        $$('.current-clock-time').text(h+':'+m+':'+s);
    }, 1000);

    TM.timeclock(invoice.id, 'STATUS', function(data){
        var clockHistoryHtml = '';
        if(data.currentlyClockedIn){
            $$('#clockin-button').addClass('inactive');
            $$('#clockout-button').removeClass('inactive');
        } else {
            $$('#clockin-button').removeClass('inactive');
            $$('#clockout-button').addClass('inactive');
        }
        clockHistoryHtml += '<div class="list-block-label clockhistory-list-label">'+unixTimeToDateString(data.timecards[0].clockInUnixTimeStamp)+'</div>';
        for (var i = 0; i < data.timecards.length; i++) {
            if(i > 0 && data.timecards[i].clockInDate != data.timecards[i - 1].clockInDate){
                clockHistoryHtml += '<div class="list-block-label clockhistory-list-label">'+unixTimeToDateString(data.timecards[i].clockInUnixTimeStamp)+'</div>';
            }
            clockHistoryHtml += '<li class="item-content"><div class="item-inner">' +
                '<div class="row row-fullwidth">'+
                    '<div class="col-50 left-align">'+unixToStandard(data.timecards[i].clockInUnixTimeStamp)+''+
                    '</div>' +
                    '<div class="col-50 right-align">'+unixToStandard(data.timecards[i].clockOutUnixTimeStamp)+''+
                    '</div>' +
                '</div>' +
            '</div></li>';
        }
        $$('.clock-history').append(clockHistoryHtml);
    });

    $$('.clock-button').on('click', function(){
        if(!$$(this).hasClass('inactive')){
            var event = $$(this).data("clockevent");
            TM.timeclock(EMPLOYEE.id, event, function(data){
                if(data.ok && event == 'start'){
                    $$('#clockin-button').addClass('inactive');
                    $$('#clockout-button').removeClass('inactive');
                    toast('Clocked In', SHORT);
                } else if(data.ok && event == 'stop'){
                    $$('#clockin-button').removeClass('inactive');
                    $$('#clockout-button').addClass('inactive');
                    toast('Clocked Out', SHORT);
                }
            });
        }
    });

    function unixToStandard(unixTime){
        if(unixTime > 0){
            var unixDate = new Date(unixTime * 1000);
            var h = unixDate.getHours();
            var m = unixDate.getMinutes();
            var s = unixDate.getSeconds();
            var pm = false;
            if(h > 12){
                pm = true;
                h-=12;
            }
            h=(h<10)?'0'+h : h;
            m=(m<10)?'0'+m : m;
            s=(s<10)?'0'+s : s;
            var time = h+':'+m+':'+s;
            time+=(pm)?' PM':' AM';
            return time;
        } else {
            return '';
        }
    }
    function unixTimeToDateString(unixTime){
        if(unixTime > 0){
            var unixDate = new Date(unixTime * 1000);
            return (unixDate.getMonth()+1) +'/'+ unixDate.getDate() +'/'+ unixDate.getFullYear();
            return time;
        } else {
            return 'Error getting date';
        }
    }
});

myApp.onPageInit('msg_list', function(page){

    $$('#conversations').on('click', '.conversation', function(){
        var tarId = $$(this).data('id');
        mainView.router.load({url:'msg_msg.html', query:{id:tarId}});
    });

    TM.getConversations(function(data){
        var conversations = data.conversations;
        var conversationListHtml = '';
        for (var i = 0; i < conversations.length; i++) {
            conversationListHtml += '<li class="conversation" data-id="'+conversations[i].id+'">' +
              '<a href="#" class="item-link item-content">' +
                '<div class="item-inner">' +
                  '<div class="item-title-row">' +
                    '<div class="item-title">'+conversations[i].membersString+'</div>' +
                    '<div class="item-after">'+(conversations[i].recentMessages.length > 0 ? conversations[i].recentMessages[0].timestring : '')+'</div>' +
                  '</div>' +
                  '<div class="item-subtitle">'+(conversations[i].newMessageStatusBool ? 'New Message from '+conversations[i].recentMessages[0].sendername : '')+'</div>' +
                  '<div class="item-text">'+(conversations[i].recentMessages.length > 0 ? conversations[i].recentMessages[0].message : '')+'</div>' +
                '</div>' +
              '</a>' +
            '</li>';
        }
        $$('#conversations').append(conversationListHtml);
    });

    $$('.compose-new-message').on('click', function(){
    	var popupHTML = '<div class="popup payment-popup" id="payment-pop">' +
			'<div class="popup-header"><h1>New Message</h1></div>' +
			'<div class="content-block center-align"></div>' +
			'<div class="toolbar messagebar">' +
	          '<div class="toolbar-inner">' +
	            '<textarea id="composed-message" placeholder="Message"></textarea><a id="send-message" href="#" class="link">Send</a>' +
	          '</div>' +
	        '</div>' +
		'</div>';
		myApp.popup(popupHTML);
    });

});

myApp.onPageInit('msg_msg', function(page){
    var conversationId = page.query.id;

    $$('.messages').empty();
    TM.getMessages(conversationId, drawMessages);

    $$('#send-message').on('click', function(){
        var newMessage = $$('#composed-message').val();
        TM.sendMessage(conversationId, newMessage, function(){
            var messageHTML =  '<div class="message message-sent">' +
                '<div class="message-name">'+EMPLOYEE.name+'</div>' +
                '<div class="message-text">'+newMessage+'</div>' +
            '</div>';
            $$('.messages').append(messageHTML);
            scrollMessageToBottom();
            $$('#composed-message').val('');
        });
    });

});

myApp.onPageAfterBack('msg_msg', function(page){
    clearTimeout(timeoutObj);
});

myApp.onPageInit('tools', function(page){

});

myApp.onPageInit('user_setting', function(page){

});





