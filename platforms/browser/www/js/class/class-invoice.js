function Invoice () {
	this.id 		 = 0;
	this.salesperson = '';
	
	this.customer 			= {first:'', last:'', email:'', cell:''};
	this.customer.billing  	= {billing_city:'', billing_state:'', billing_street:'', billing_zip:''};
	this.customer.shipping 	= {shipping_city:'', shipping_state:'', shipping_street:'', shipping_zip:''};
	
	this.payments 		= [];
	this.salesLine 		= [];

	this.subtotalAmount = 0;
	this.taxpercent 	= 10.1;
	this.taxAmount 		= 0;
	this.totalAmount 	= 0;
}

Invoice.prototype.addLine = function(){

}

Invoice.prototype.setBilling = function(street, city, state, zip){
	this.shipping.billing_street = street
	this.shipping.billing_state  = state;
	this.shipping.billing_city	  = city;
	this.shipping.billing_zip	  = zip;
	this.saveShipping();
};

Invoice.prototype.saveBilling = function() {
	// TODO : Save to sqlite database
};

Invoice.prototype.setShipping = function(street, city, state, zip){
	this.shipping.shipping_street = street
	this.shipping.shipping_state  = state;
	this.shipping.shipping_city	  = city;
	this.shipping.shipping_zip	  = zip;
	this.saveShipping();
}

Invoice.prototype.saveShipping = function() {
	// TODO : Save to sqlite database
};