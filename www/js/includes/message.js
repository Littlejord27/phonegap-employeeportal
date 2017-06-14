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
var newestMessageId;
function startMessageCheck(conversationId, messageId){
    timeoutObj = setTimeout(function(){
        TM.checkNewMessages(conversationId, messageId, function(data){
            for (var i = 0; i < data.messages.length; i++) {
                var messageHTML = 'Error loading Message - '+data.messages[i].id;
                if(data.messages[i].sender == EMPLOYEE.id){
                    messageHTML = '<div class="message message-sent '+(i == data.messages.length ? 'active': '')+'">' +
                        '<div class="message-name">'+data.messages[i].sendername+'</div>' +
                        '<div class="message-text">'+data.messages[i].message+'</div>' +
                    '</div>';
                } else {
                    messageHTML = '<div class="message message-with-avatar message-received '+(i == data.messages.length ? 'active': '')+'">' +
                        '<div class="message-name">'+data.messages[i].sendername+'</div>' +
                        '<div class="message-text">'+data.messages[i].message+'</div>' +
                        '<div style="background-image:url(http://lorempixel.com/output/people-q-c-100-100-9.jpg)" class="message-avatar"></div>' +
                    '</div>';
                }
                $$('.messages').append(messageHTML);
            }
            if(data.messages.length > 0){
                startMessageCheck(conversationId, data.messages[data.messages.length-1].id);
            } else{
                startMessageCheck(conversationId, messageId);
            }
        });
    }, 5000);
}

function notificationTimeoutStart(eNum, mNum, pNum, tNum){
    var message = '';
    TM.getNotifications(function(data){
        var eNumNew = data.notifications[0].amount;
        var mNumNew = data.notifications[1].amount;
        var pNumNew = data.notifications[2].amount;
        var tNumNew = data.total;
        if(data.total > 0 && tNumNew > tNum){
            if(eNumNew > 0 && eNumNew > eNum){
                message += (eNumNew-eNum) + ' new email'+(eNumNew-eNum > 1 ? 's' : '')+'. ' + eNumNew + ' total email'+(eNumNew > 1 ? 's' : '')+'.<br>';
            }
            if(mNumNew > 0 && mNumNew > mNum){
                message += (mNumNew-mNum) + ' new email'+(mNumNew-mNum > 1 ? 's' : '')+'. ' + mNumNew + ' total email'+(mNumNew > 1 ? 's' : '')+'.<br>';
            }
            if(pNumNew > 0 && pNumNew > pNum){
                message += (pNumNew-pNum) + ' new email'+(pNumNew-pNum > 1 ? 's' : '')+'. ' + pNumNew + ' total email'+(pNumNew > 1? 's' : '')+'.<br>';
            }
            myApp.addNotification({
                title: 'Notifications',
                message: message
            });
        }
        setTimeout(function(){
            tNum = data.total;
            notificationTimeoutStart(eNumNew, mNumNew, pNumNew, tNum);
        }, 15000);
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