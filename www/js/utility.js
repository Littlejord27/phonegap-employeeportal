function cartDetailsToolbarHeader(){
    if(invoice.taxFree || invoice.isTaxFreeDiscountActive()){
        $$('.tax-toolbar').html('No Tax');
    } else {
        $$('.tax-toolbar').html(formatNumberMoney(invoice.taxAmount));
    }
    $$('.taxpercent').html((invoice.taxPercent * 100).toFixed(1) + '%');
    $$('.delivery-toolbar').html(formatNumberMoney(invoice.delivery.cost));
    if(EMPLOYEE.invoiceLocationID != 0){
        $$('.invoicelocation-toolbar').html(getLocationNickname(EMPLOYEE.invoiceLocationID));
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
function cartDetailsSummaryScreen(){
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
function confirmModal(text, onConfirm){
    myApp.confirm(text, onConfirm);
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
function nameNotTaken(name){
    for (var i = 0; i < INVOICES.length; i++) {
        if(name == INVOICES[i].title){
            return i;
        }
    }
    return true;
}
function decoupleObj(obj){
    return JSON.parse(JSON.stringify(obj));
}
function getPagename(){
    return $$('.page-on-center').data('page');
}
function toast(bread, heat){
    window.plugins.toast.showWithOptions(
        {
          message: bread,
          duration: heat, // which is 2000 ms. "long" is 4000. Or specify the nr of ms yourself.
          position: "bottom",
          addPixelsY: -20  // added a negative value to move it up a bit (default 0)
        }
    );
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
function serviceActions(){
    var less = '<-- Draft & Quotes';
    var more = '--> Invoice Actions';
    //var actions = [less, 'Discount Actions', 'Fee Actions', more];
    var actions = [less, 'Discount Actions', more];
    choicelistModal({
        type: 'modal',
        title: 'Services:',
        data: actions,
        success: function(index,title,data) {
            switch(data[index]){
                case less: draftAndQUoteActions(); break;
                case 'Discount Actions': discountActions(); break;
                case 'Fee Actions': feeActions(); break;
                case more: invoiceActions(); break;
            }
        }
    });
}
function discountActions(){
    var actions = ['Add Discount', 'Tax Exempt', 'Clear Discounts', '<-- Back']; 
    choicelistModal({
        type: 'modal',
        title: 'Services:',
        data: actions,
        success: function(index,title,data) {
            switch(data[index]){
                case 'Add Discount': addDiscountModal(); break;
                case 'Tax Exempt': taxExemptModal();break;
                case 'Clear Discounts': invoice.setDiscounts([]); invoice.setTaxFree(false); mainView.router.refreshPage(); break;
                case '<-- Back': serviceActions(); break;
            }
        }
    });
}

function taxExemptModal(){
    var taxExemptModalElem = myApp.modal({
        title:  'Enter Driver\'s License',
        text: '<input id="driver-license-number">',
        buttons: [
          {
            text: 'Cancel', onClick: function() { }
          },
          {
            text: 'Okay', onClick: function() {
                var licenseNumber = $$('#driver-license-number').val();
                invoice.setTaxFree(true);
                toast('Tax Exempt',SHORT);
            }
          },
        ],
    });
    $$(taxExemptModalElem).addClass('save-draft-modal');
}
function feeActions(){
    var actions = ['Add Fee', 'Clear Fees', '<-- Back']; 
    choicelistModal({
        type: 'modal',
        title: 'Services:',
        data: actions,
        success: function(index,title,data) {
            switch(data[index]){
                case 'Add Fee': addFeeModal(); break;
                case 'Clear Fees': break;
                case '<-- Back': serviceActions(); break;
            }
        }
    });
}
function invoiceActions(){
    //var less = '<a href="#" class="link icon-only"><i class="icon f7-icons">arrow_left</i></a>';
    var less = '<-- Cart Actions';
    //var more = '<a href="#" class="link icon-only"><i class="icon f7-icons">arrow_right</i></a>';
    var more = '--> Draft & Quotes';
    var actions = [less, 'Change Location', 'Transfer Invoice', 'Reset Sale', more]; 
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
                case 'Reset Sale': invoice.reinit(); mainView.router.refreshPage(); break;
                case more:
                    draftAndQUoteActions();
                    break;
            }
        }
    });
}
function locationChangeChoicelist() {
    var actions = ['Store', 'Outlet', 'Hospatility', '45th Street Bedding', 'Bedrooms & More Online', 'Philanthropy']; 
    choicelistModal({
        type: 'modal',
        data: actions,
        success: function(index,title,data) {
            switch(data[index]){
                case 'Store':
                    EMPLOYEE.invoiceLocationID = 1;
                    break;
                case 'Outlet':
                    EMPLOYEE.invoiceLocationID = 5;
                    break;
                case 'Hospatility':
                    EMPLOYEE.invoiceLocationID = 6;
                    break;
                case '45th Street Bedding':
                    EMPLOYEE.invoiceLocationID = 7;
                    break;
                case 'Bedrooms & More Online':
                    EMPLOYEE.invoiceLocationID = 8;
                    break;
                case 'Philanthropy':
                    EMPLOYEE.invoiceLocationID = 9;
                    break;
            }
            $$('.invoicelocation-toolbar').html(getLocationNickname(EMPLOYEE.invoiceLocationID));
        }
    });
}
function transferInvoiceModal(stations){
    choicelistModal({
        type: 'modal',
        data: stations,
        success: function(index,title,data) {
            invoice.invoiceLocationID = EMPLOYEE.invoiceLocationID;
            invoice.employee = EMPLOYEE;
            TM.transferInvoice(data[index], invoice, consool);
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
function addDiscountModal(){
    choicelistModal({
        type: 'modal',
        //data: ['Standard Discount', 'Custom Discount', 'Memorial Day', '<-- Back'], // TODO : Get tax array from TM
        data: ['Standard Discount', '<-- Back'],
        success: function(index,title,data) {
            switch(data[index]){
                case 'Standard Discount':
                    standardDiscountModal();
                    break;
                case 'Custom Discount':
                    customDiscountModal();
                    break;
                case 'Memorial Day':
                    memorialDaySale();
                    break;
                case '<-- Back': discountActions(); break;
            }
            mainView.router.refreshPage();
        }
    }); 
}

function standardDiscountModal(){
    choicelistModal({
        type: 'modal',
        data: ['PMD', 'Tax Free', 'Toll Bridge', '<-- Back'], // TODO : Get tax array from TM
        success: function(index,title,data) {
            switch(data[index]){
                case 'PMD':
                    invoice.addDiscount({type:'PMD'});
                    break;
                case 'Tax Free':
                    invoice.addDiscount({type:'Tax'});
                    break;
                case 'Toll Bridge':
                    invoice.addDiscount({type:'Toll'});
                    break;
                case '<-- Back': standardDiscountModal(); break;
            }
            mainView.router.refreshPage();
        }
    }); 
}

function customDiscountModal(){
    var items = [], type = "", amt = "";
    var customItemSelectionHtml = '<div class="list-block">' +
      '<ul class="custom-discount-item-select">' +
        '<li class="accordion-item"><a href="#" class="item-content item-link">' +
            '<div class="item-inner">' +
              '<div class="item-title">Select Items</div>' +
            '</div></a>' +
          '<div class="accordion-item-content">' +
            '<div class="content-block">' +
              '<ul id="cart-discount-list">' +
              '</ul>' +
            '</div>' +
          '</div>' +
        '</li>' +
      '</ul>' +
      '<div class="custom-discount-type-div"><span class="custom-discount-type" data-type="dollar">$</span><span class="custom-discount-or">OR</span><span class="custom-discount-type" data-type="percent">%</span></div>' +
      '<div class="custom-discount-amount-div"><input type="number" id="custom-discount-amount"></div>' +
    '</div>';

    var customDiscountModal = myApp.modal({
        title:  'Custom Discount',
        text: customItemSelectionHtml,
        buttons: [
          {
            text: 'Cancel', onClick: function() { }
          },
          {
            text: 'Add', onClick: function() { }
          },
        ],
    });

    $$(customDiscountModal).addClass('custom-discount-modal');

    var addButton = $$(customDiscountModal).find('.modal-button')[1];
    
    $$(addButton).attr('disabled',true);

    for (var i = 0; i < invoice.salesLines.length; i++) {
        var customItem = '<div class="row item-select" data-id="'+i+'">' +
            '<div class="col-15">' +
                '<div class="custom-discount-list-item"></div>' +
            '</div>' +
            '<div class="col-85">' +
                '<span class="custom-discount-list-item-label">'+invoice.salesLines[i].name+'</span>' +
            '</div>' +
        '</div>';
        $$('#cart-discount-list').append(customItem);
    }
    $$('.item-select').on('click', function(){
        var elem = $$(this);
        var lineId = $$(this).data('id');
        if(elem.hasClass('active')){
            elem.removeClass('active');
            for(var i = 0; i < items.length; i++){
                if(items[i] == lineId){
                    items.splice(i, 1);
                }
            }
            task(items, type, amt, addButton);
        } else {
            items.push(lineId);
            elem.addClass('active');
            task(items, type, amt, addButton);
        }
    });

    $$('.custom-discount-type').on('click', function(){
        $$('.custom-discount-type').removeClass('active');
        $$(this).addClass('active');
        type = $$(this).data('type');
        task(items, type, amt, addButton);
    });

    $$('#custom-discount-amount').on('keyup', function(){
        amt = $$(this).val();
        task(items, type, amt, addButton);
    });
}

function task(items, type, amt, addButton){
    if(items.length > 0 && type != '' && amt > 0 && amt != ''){
        consool(items);
        consool(type);
        consool(amt);
        $$(addButton).attr('disabled',false);
    } else {
        $$(addButton).attr('disabled',true);
    }
}

function draftActions(){
    var actions = ['Save Draft', 'Load Draft', 'Delete Draft', '<-- Back'];
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
                    loadDraftChoicelist('load');
                    break;
                case 'Delete Draft':
                    loadDraftChoicelist('delete');
                    break;
                case '<-- Back':
                    draftAndQUoteActions();
                    break;
            }
        }
    });
}
function quoteActions(){
    var actions = ['Save Quote', 'Load Quote', 'Print Quote', 'Delete Quote', '<-- Back'];
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
                    loadQuoteChoicelist('load');
                    break;
                case 'Print Quote':
                    loadQuoteChoicelist('print');
                    break;
                case 'Delete Quote':
                    loadQuoteChoicelist('delete');
                    break;
                case '<-- Back':
                    draftAndQUoteActions();
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
function saveQuote(){
    var saveQuoteModal = myApp.modal({
        title:  'Save Quote?',
        text: '<input id="quote-name-box">',
        buttons: [
          {
            text: 'Cancel', onClick: function() { }
          },
          {
            text: 'Save', onClick: function() {
                var proposedName = $$('#quote-name-box').val();
                invoice.setTitle(proposedName);
                invoice.setPayments([]);
                TM.saveQuote(invoice, function(data){
                });
            }
          },
        ],
    });
    $$(saveQuoteModal).addClass('save-quote-modal');
}
function loadDraftChoicelist(optionDraft){
    var actions = []; 
    for (var i = 0; i < INVOICES.length; i++) {
        actions.push(INVOICES[i].title);
    }
    choicelistModal({
        type: 'modal',
        data: actions,
        success: function(index,title,data){
            switch(optionDraft){
                case 'load':
                    invoice = new Invoice(decoupleObj(INVOICES[index]));
                    invoice.recalc();
                    mainView.router.refreshPage();
                    break;
                case 'delete':
                    if (index > -1) {
                        INVOICES.splice(index, 1);
                    }
                    break;
            }
        }
    });
}
function loadQuoteChoicelist(optionQuote){
    TM.getQuoteList(function(data){
        var quotes = data.quotes;
        var quoteNameArr = [];
        for (var i = 0; i < quotes.length; i++) {
            quoteNameArr.push(quotes[i].name);
        }
        choicelistModal({
            type: 'modal',
            data: quoteNameArr,
            success: function(index,title,data){
                switch(optionQuote){
                    case 'load':
                        TM.getQuote(quotes[index].id, function(data){
                            invoice = new Invoice(data.quote);
                            mainView.router.refreshPage();
                        });
                        break;
                    case 'print':
                        var quoteToPrint = quotes[index];
                        TM.listPrinters(function(data){
                            var printers = [];
                            var printNames = [];
                            for (var i = 0; i < data.altnames.length; i++) {
                                printers.push(data.altnames[i]);
                                printNames.push(data.names[i]);
                            }
                            choicelistModal({
                                type: 'modal',
                                data: printers,
                                success: function(index,title,data){
                                    consool(quoteToPrint.id);
                                    consool(printNames[index]);
                                    TM.printInvoice(quoteToPrint.id, 'quote', printNames[index], consool);
                                }
                            });
                        });
                        break;
                    case 'delete':
                        TM.deleteQuote(quotes[index].id, function(data){
                            consool(data);
                            //mainView.router.refreshPage();
                        });
                        break;
                }
            }
        });
    });
}
function memorialDaySale(){
    choicelistModal({
        type: 'modal',
        data: ['2-Sided Classics Credit', 'Botanicore Bedding Bundle', '45th Adjustable Base Credit', 'Bedding Bundle', 'In-Stock Lighting', 'In-Stock Seating'],
        success: function(index,title,data) {
            switch(data[index]){
                case '2-Sided Classics Credit':
                    invoice.addDiscount({type:'2SideCred'});
                    break;
                case 'Botanicore Bedding Bundle':
                    invoice.addDiscount({type:'botanBedBund'});
                    break;
                case '45th Adjustable Base Credit':
                    invoice.addDiscount({type:'45AdjBaseCred'});
                    break;
                case 'Bedding Bundle':
                    invoice.addDiscount({type:'beddingBund'});
                    break;
                case 'In-Stock Lighting':
                    invoice.addDiscount({type:'instockLighting'});
                    break;
                case 'In-Stock Seating':
                    invoice.addDiscount({type:'instockSeating'});
                    break;
            }
            mainView.router.refreshPage();
        }
    }); 
}

var loginPopup = function(params){
    var popupHTML = '<div class="popup login-popup">' +
                            '<div class="login-popup-content">' +
                                '<p class="center-align"><img src="media/symbol.png" class="login-symbol"></p>' +
                                '<h2 class="center-align white">Employee Portal</h2>' +
                                '<div class="bottom-center">' +
                                    '<div>' +
                                        '<p class="center-align"><input type="password" id="password-popup" placeholder="Password" class="password-login" pattern="[0-9]*" inputmode="numeric"></p>' +
                                        '<p class="center-align"><button class="login-popup-button">Login</button></p>' +
                                        '<p class="center-align"> Forgot Password?</p>' +
                                        '<p class="center-align"> Contact Matt to reset.</p>' +
                                    '</div>' +
                                '</div>' +
                            '</div>' +
                        '</div>';
    myApp.popup(popupHTML);
    $$('.login-popup-button').on('click', function(){
        login($$('#password-popup').val());
    });
};

var login = function(password){
    myApp.showIndicator();
    TM.login(password, function(employee){
        notificationTimeoutStart(0,0,0,0);

        if(!isAndroid){
            setupPush();
        }

        // TODO turn off notification check when logged out and invalid login.
        EMPLOYEE.id = employee.id;
        EMPLOYEE.name = employee.name;
        EMPLOYEE.department = employee.department;
        EMPLOYEE.locationid = employee.store;
        EMPLOYEE.invoiceLocationID = employee.invoiceLocationID;
        invoice.setSalesperson(EMPLOYEE.name);
        myApp.hideIndicator();
        if($$('.login-popup').length > 0){
            myApp.closeModal('.login-popup');
            toast('Logged In - ' + EMPLOYEE.name, SHORT);
        } else {
            mainView.router.loadPage({url:'profile.html'});
        }
    }, function(error){
        myApp.hideIndicator();
        consool(error);
        if($$('.login-popup').length > 0){
            toast('Invalid Login - Popup', SHORT);
        } else {
            toast('Invalid Login', SHORT);
        }
        //mainView.router.loadPage({url:'clk_home.html'});
    });
};

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