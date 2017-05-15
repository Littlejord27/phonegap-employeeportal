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