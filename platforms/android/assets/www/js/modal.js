function transferInvoiceModal(stations){
	choicelistModal({
        type: 'modal',
        data: stations,
        success: function(index,title,data) {
        	alert(data[index]);
        }
    });
}