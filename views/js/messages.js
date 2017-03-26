$(function() {
    $('.profile-body').on('click', '.messages-tab', function() {
        getListMessages();
        window.history.pushState('', 'Ratings', window.location.href.split('?')[0] + '?tab=messages');
    });
    $('.profile-body').on('click', '.conversation-container-list', function() {
        getConversation($(this).data('id'));
    });
    $('.profile-body').on('submit', '#form-send-message', function(e) {
        e.preventDefault();
        postNewMessage($('#message-textarea').val().replace(/&/g, '&amp;').replace(/</g, '&lt;'), $('#form-send-message').data('id'), $('#form-send-message').data('other'));
    });
    if (tabParam === 'messages') {
        getListMessages();
    }
});

function postNewMessage (messageBody, convId, other) {
    let thisAjax = new AjaxTemplate('/auth/newmessage/' + convId);
    thisAjax.data = {
        messageBody : messageBody,
        other: other
    };
    thisAjax.method = 'POST';
    thisAjax.success = function(response) {
            //thisAjax.method = 'GET';
            getConversation(convId);
        };
    $.ajax (thisAjax);
}

function getConversation (id) {
    let thisAjax = new AjaxTemplate('/auth/get-conversation/' + id);
    thisAjax.success = function(response) {
            $('.now-loading').hide();
            const otherUser = response.conversation.users[0]._id === response.user._id ? response.conversation.users[1] : response.conversation.users[0];
            $('#title-profile-section').html(response.conversation.messages.length > 0 ? otherUser.username + '' : otherUser.username + '<p>No message yet<p>');
            $('#profile-container').empty().append('<div class="conv-container"></div>');
            response.conversation.messages.forEach(function (message) {
                $('.conv-container').append(returnIndividualMessage(message, otherUser));
            });
            $('.conv-container').append(
                '<form id="form-send-message" method="post" data-other="' + otherUser._id + '" data-id="' + response.conversation._id + '">' +
                '<input name="other" value="' + otherUser._id + '" hidden>' +
                '<p><label for="messageBody">Send a message</label></p>' +
                '<textarea id="message-textarea" name="messageBody" rows="5" placeholder="Send a message" required></textarea>' +
                '<p><input class="button" type="submit" value="Send"></p>' +
                '</form>'
                );
        };
    $.ajax (thisAjax);  
}

function returnIndividualMessage (message, otherUser) {
    const messageClass = message.from._id === otherUser._id ? 'message-other' : 'message-mine';
    return '<div class="message-container ' + messageClass + '" data-id="' + message._id + '">' +
            message.body.replace(/\r?\n/g, '<br />') + '</br>'
            message.date +
            '</div>';   
}

function getListMessages () {
    let thisAjax = new AjaxTemplate('/auth/get-profile-messages/');
    thisAjax.success = function(response) {
            $('.now-loading').hide();
            $('#title-profile-section').text(response.conversations.length > 0 ? 'Your conversations:' : 'No conversation open yet');
            $('#profile-container').empty();
            response.conversations.forEach(function (conv) {
                let otherUser, currentuser;
                if (conv.users[0]._id === response.user._id) {
                    otherUser = conv.users[1];
                    currentuser = conv.users[0];
                } else {
                    otherUser = conv.users[0];
                    currentuser = conv.users[1];
                }
                $('#profile-container').append(returnIndividualConvListProfile(conv, otherUser, currentuser));
            });
        };
    $.ajax (thisAjax);
}

function returnIndividualConvListProfile (conv, otherUser, currentuser) {
    const unread = (conv.nbUnread > 0 && currentuser._id == conv.unreadUser) ? ' <b>(' + conv.nbUnread + ' new)<b/>' : '';
    return '<div class="conversation-container-list proftab" data-id="' + conv._id + '">' +
            'With ' + otherUser.username + ' - ' +  conv.messages.length +' messages' + unread +
            '</div>';   
}