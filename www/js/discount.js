Invoice.prototype.calcDiscount = function(discount){
	switch(discount.type){
		case 'PMD': // item discount
			return addPMDDiscount();
			break;
		// Memorial Day Sales
		case '2SideCred': // invoice discount
			return add2SideCredDiscount();
			break;
		case 'botanBedBund': // invoice discount
			return addBotanicoreBeddingDiscount();
			break;
		case '45AdjBaseCred': // invoice discount
			return add45AdjBaseDiscount();
			break;
		case 'beddingBund': // invoice discount
			return addBeddingBundDiscount();
			break;
		case 'instockLighting': // invoice discount
			return addInstockLightingDiscount();
			break;
		case 'instockSeating': // invoice discount
			return addInstockSeatingDiscount();
			break;
	}
}
function addPMDDiscount(){
	var discount = 0;
	var rate = 69.95;
	for (var i = 0; i < invoice.salesLines.length; i++) {
		if((invoice.salesLines[i].categoryname == "Latex Mattresses" || invoice.salesLines[i].categoryname == "Zippered Latex Mattresses") && invoice.salesLines[i].retailAmount > 600){
			discount += (rate * invoice.salesLines[i].quantity);
		}
	}
	return discount;
}

function add2SideCredDiscount(){
	var creditAmt = 0;
	var beddingTotal = 0;
	for (var i = 0; i < invoice.salesLines.length; i++) {
		if(invoice.salesLines[i].brand == "2 Sided Classics" && invoice.salesLines[i].model != "Georgetown"){
			switch(invoice.salesLines[i].size){
				case 'Twin':
					creditAmt += (25 * invoice.salesLines[i].quantity);
					break;
				case 'TwinXL':
					creditAmt += (30 * invoice.salesLines[i].quantity);
					break;
				case 'Full':
					creditAmt += (35 * invoice.salesLines[i].quantity);
					break;
				case 'Queen':
					creditAmt += (40 * invoice.salesLines[i].quantity);
					break;
				case 'King':
					creditAmt += (50 * invoice.salesLines[i].quantity);
					break;
				case 'Cal King':
					creditAmt += (50 * invoice.salesLines[i].quantity);
					break;
			}
		}
		if(invoice.salesLines[i].categoryname == "Blankets"){
			beddingTotal += (invoice.salesLines[i].retailAmount * invoice.salesLines[i].quantity);
		}
	}
	return creditAmt > beddingTotal ? beddingTotal : creditAmt;
}

function addBotanicoreBeddingDiscount(){
	var creditAmt = 0;
	var beddingTotal = 0;
	for (var i = 0; i < invoice.salesLines.length; i++) {
		if(invoice.salesLines[i].categoryname == "Latex Mattresses"){
			switch(invoice.salesLines[i].size){
				case 'Twin':
					creditAmt += (50 * invoice.salesLines[i].quantity);
					break;
				case 'TwinXL':
					creditAmt += (60 * invoice.salesLines[i].quantity);
					break;
				case 'Full':
					creditAmt += (70 * invoice.salesLines[i].quantity);
					break;
				case 'Queen':
					creditAmt += (80 * invoice.salesLines[i].quantity);
					break;
				case 'King':
					creditAmt += (100 * invoice.salesLines[i].quantity);
					break;
				case 'Cal King':
					creditAmt += (100 * invoice.salesLines[i].quantity);
					break;
			}
		}
		if(invoice.salesLines[i].categoryname == "Blankets"){
			beddingTotal += (invoice.salesLines[i].retailAmount * invoice.salesLines[i].quantity);
		}
	}
	return creditAmt > beddingTotal ? beddingTotal : creditAmt;
}

function add45AdjBaseDiscount(){
	var creditAmt = 0;
	var baseTotal = 0;
	for (var i = 0; i < invoice.salesLines.length; i++) {
		if(invoice.salesLines[i].categoryname == "Latex Mattresses"){
			switch(invoice.salesLines[i].size){
				case 'TwinXL':
					creditAmt += (100 * invoice.salesLines[i].quantity);
					break;
				case 'Queen':
					creditAmt += (100 * invoice.salesLines[i].quantity);
					break;
				case 'King':
					creditAmt += (200 * invoice.salesLines[i].quantity);
					break;
			}
		}
		if(invoice.salesLines[i].categoryname == "Adjustable Beds" && invoice.salesLines[i].brand == "45th Street Bedding"){
			baseTotal += (invoice.salesLines[i].retailAmount * invoice.salesLines[i].quantity);
		}
	}
	return creditAmt > baseTotal ? baseTotal : creditAmt;
}

function addBeddingBundDiscount(){
	var discountAmt = 0;
	var rate = 0.15;
	for (var i = 0; i < invoice.salesLines.length; i++) {
		if(invoice.salesLines[i].toplevelcategoryname == "Bedding" || invoice.salesLines[i].toplevelcategoryname == "Toppers" && invoice.salesLines[i].model != 'Elite 5 Topper' && invoice.salesLines[i].model != 'Montlake Topper'){
			discountAmt += (invoice.salesLines[i].retailAmount * invoice.salesLines[i].quantity) * rate;
		}
	}
	return discountAmt;
}

function addInstockLightingDiscount(){
	var discount = 0;
	for (var i = 0; i < invoice.salesLines.length; i++) {
		if(invoice.salesLines[i].categoryname == "Lamps" && invoice.salesLines[i].location != 'SO'){
			discount += (0.2 * invoice.salesLines[i].retailAmount * invoice.salesLines[i].quantity);
		}
	}
	return discount;
}

function addInstockSeatingDiscount(){
	var discount = 0;
	var rate = 0.2;
	for (var i = 0; i < invoice.salesLines.length; i++) {
		if(invoice.salesLines[i].toplevelcategoryname == "Seating" && invoice.salesLines[i].location != 'SO'){
			discount += (invoice.salesLines[i].retailAmount * invoice.salesLines[i].quantity)* rate;
		}
	}
	return discount;
}

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
			case 'instockLighting': // invoice discount
				if(invoice.salesLines[i].categoryname == "Lamps" && invoice.salesLines[i].location != 'SO'){
						returnHTML +='<div class="card">' +
										'<div class="card-content">' +
						    				'<div class="card-content-inner">In-Stock Lighting Discount</div>' +
						  				'</div>' +
									'</div>';
					}
				break;
			case 'instockSeating': // invoice discount
				if(invoice.salesLines[i].categoryname == "Chairs" && invoice.salesLines[i].location != 'SO'){
						returnHTML +='<div class="card">' +
										'<div class="card-content">' +
						    				'<div class="card-content-inner">In-Stock Seating Discount</div>' +
						  				'</div>' +
									'</div>';
					}
				break;
		}
	}
	return returnHTML;
}

function getInvoiceDiscountHTML(){
	var returnHTML = '';
	for (var i = 0; i < invoice.discounts.length; i++) {
		switch(invoice.discounts[i].type){
			case '2SideCred':
				var creditAmt = 0;
				for (var i = 0; i < invoice.salesLines.length; i++) {
					if(invoice.salesLines[i].brand == "2 Sided Classics"){
						switch(invoice.salesLines[i].size){
							case 'Twin':
								creditAmt += (25 * invoice.salesLines[i].quantity);
								break;
							case 'TwinXL':
								creditAmt += (30 * invoice.salesLines[i].quantity);
								break;
							case 'Full':
								creditAmt += (35 * invoice.salesLines[i].quantity);
								break;
							case 'Queen':
								creditAmt += (40 * invoice.salesLines[i].quantity);
								break;
							case 'King':
								creditAmt += (50 * invoice.salesLines[i].quantity);
								break;
							case 'Cal King':
								creditAmt += (50 * invoice.salesLines[i].quantity);
								break;
						}
					}
				}
				if(creditAmt > 0){
					returnHTML +='<div class="card">' +
									'<div class="card-content">' +
					    				'<div class="card-content-inner">2 Sided Credit - '+formatNumberMoney(creditAmt)+'</div>' +
					  				'</div>' +
								'</div>';
				}
				break;
			case 'botanBedBund':
				var creditAmt = 0;
				for (var i = 0; i < invoice.salesLines.length; i++) {
					if(invoice.salesLines[i].categoryname == "Latex Mattresses"){
						switch(invoice.salesLines[i].size){
							case 'Twin':
								creditAmt += (50 * invoice.salesLines[i].quantity);
								break;
							case 'TwinXL':
								creditAmt += (60 * invoice.salesLines[i].quantity);
								break;
							case 'Full':
								creditAmt += (70 * invoice.salesLines[i].quantity);
								break;
							case 'Queen':
								creditAmt += (80 * invoice.salesLines[i].quantity);
								break;
							case 'King':
								creditAmt += (100 * invoice.salesLines[i].quantity);
								break;
							case 'Cal King':
								creditAmt += (100 * invoice.salesLines[i].quantity);
								break;
						}
					}
				}
				if(creditAmt > 0){
					returnHTML +='<div class="card">' +
									'<div class="card-content">' +
					    				'<div class="card-content-inner">Botanicore Bedding Bundle - '+formatNumberMoney(creditAmt)+'</div>' +
					  				'</div>' +
								'</div>';
				}
				break;
			case '45AdjBaseCred':
				var creditAmt = 0;
				for (var i = 0; i < invoice.salesLines.length; i++) {
					if(invoice.salesLines[i].categoryname == "Latex Mattresses"){
						switch(invoice.salesLines[i].size){
							case 'TwinXL':
								creditAmt += (100 * invoice.salesLines[i].quantity);
								break;
							case 'Queen':
								creditAmt += (100 * invoice.salesLines[i].quantity);
								break;
							case 'King':
								creditAmt += (200 * invoice.salesLines[i].quantity);
								break;
						}
					}
				}
				if(creditAmt > 0){
					returnHTML +='<div class="card">' +
									'<div class="card-content">' +
					    				'<div class="card-content-inner">Adjustable Base Discount - '+formatNumberMoney(creditAmt)+'</div>' +
					  				'</div>' +
								'</div>';
				}
				break;

			case 'beddingBund':
				var discountAmt = 0;
				var rate = 0.15;
				for (var i = 0; i < invoice.salesLines.length; i++) {
					if(invoice.salesLines[i].toplevelcategoryname == "Bedding"){
						discountAmt += (invoice.salesLines[i].retailAmount * invoice.salesLines[i].quantity) * rate;
					}
				}
				if(discountAmt > 0){
					returnHTML +='<div class="card">' +
									'<div class="card-content">' +
					    				'<div class="card-content-inner">Bedding Bundle - '+formatNumberMoney(discountAmt)+'</div>' +
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