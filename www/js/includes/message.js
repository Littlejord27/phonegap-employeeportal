/*
** Message Functions
*/

function drawMessages(data){
    $$('#contact').text(data.membersString);
    var messages = data.messages;
    for (var i = 0; i < messages.length; i++) {
        var messageHTML = 'Error loading Message - '+messages[i].id;
        if(i == 0){ //first message
            $$('.messages').append('<div class="messages-date">'+messages[i].datestring+'<span>'+messages[i].timestring+'</span></div>');
        } else {
            if(messages[i].datestring != messages[i-1].datestring){ //not the same day
                //now need to break it by time.
                $$('.messages').append('<div class="messages-date">'+messages[i].datestring+'<span>'+messages[i].timestring+'</span></div>');
            }
        }
        if(messages[i].sender == EMPLOYEE.id){
            messageHTML = '<div class="message message-sent">' +
                '<div class="message-name">'+messages[i].sendername+'</div>' +
                '<div class="message-text">'+messages[i].message+'</div>' +
            '</div>';
        } else {
            messageHTML = '<div class="message message-with-avatar message-received">' +
                '<div class="message-name">'+messages[i].sendername+'</div>' +
                '<div class="message-text">'+messages[i].message+'</div>' +
                '<div style="background-image:url(http://lorempixel.com/output/people-q-c-100-100-9.jpg)" class="message-avatar"></div>' +
            '</div>';
        }
        $$('.messages').append(messageHTML);
    }

    scrollMessageToBottom();
    startMessageCheck(data.conversationId,messages[messages.length-1].id);
}

var timeoutObj;
function startMessageCheck(conversationId, messageId){
    timeoutObj = setTimeout(function(){
        TM.checkNewMessages(conversationId, messageId, function(data){
            console.log(data);
        });
        startMessageCheck(conversationId, messageId);
    }, 5000);
}

function notificationTimeoutStart(){
    TM.getNotifications(function(data){
        if(data.total > 0){
            //has notification
        }
        setTimeout(notificationTimeoutStart, 15000);
    });
}

function scrollMessageToBottom(){
    var lastMessage = $$( ".message" ).filter( 
        function(index){
            return index === ($$( ".message" ).length - 1);
        }
    );

    $$('.page-content').scrollTop(lastMessage[0].offsetTop);
}