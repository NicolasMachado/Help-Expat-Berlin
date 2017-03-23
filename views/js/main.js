function AjaxTemplate () {
    this.async = true,
    this.crossDomain = false,
    this.url = '',
    this.method = 'GET',
    this.headers = {},
    this.data = {},
    this.success = '',
    this.error = function (result, status, error) {
        console.log(result + " - " + status + " - " + error);
    	if (error === 'Unauthorized') {
    		window.location.href = '/auth/account-login-request';
    	}
    }
};

$(function() {
	$.ajaxSetup({ cache: false });
	$( "#datepicker" ).datetimepicker();
	$( document ).tooltip();
	$('.alert-banner').delay(5000).slideUp( 300 );
	$('.error-banner').delay(10000).slideUp( 300 );
	$('.now-loading').hide();

	// TAB SELECTION
	const tabParam = getUrlParam('tab');
	if (tabParam === 'requests') {
    	getProfileRequests();		
	}
	if (tabParam === 'profile') {
    	getProfileInfo();		
	}
	if (tabParam === 'messages') {
    	getListMessages();	
	}
	if (tabParam === 'services') {
    	getProfileServices();		
	}

    if ($('.request-list').length !== 0) {
    	getList();
    }

    // CLICKS
    $('.request-list').on('click', '.button-details', function() {
    	expandDetails($(this));
    });
    $('.request-list').on('click', '.button-help', function() {
		$(this).removeClass('button-help').text('Please wait');
    	clickICanHelp($(this));
    });
    $('.request-list').on('click', '.button-revokehelp', function() {
		$(this).removeClass('button-revokehelp').text('Please wait');
    	clickRevokHelp($(this));
    });
    // empty profile section when tab switch
    $('.profile-body').on('click', '.proftab', function() {
		$('.now-loading').show();
    	$('#title-profile-section').empty();
    	$('#profile-container').empty();
    });
    // profile tabs
    $('.profile-body').on('click', '.profile-tab', function() {
    	getProfileInfo();
    });
    $('.profile-body').on('click', '.requests-tab', function() {
    	getProfileRequests();
    });
    $('.profile-body').on('click', '.services-tab', function() {
    	getProfileServices();
    });
    $('.profile-body').on('click', '.messages-tab', function() {
    	getListMessages();
    });
    $('.profile-body').on('click', '.button-revokehelp', function() {
		$(this).removeClass('button-revokehelp').text('Please wait');
    	clickRevokHelpProfile($(this));
    });
    $('.profile-body').on('click', '.button-accept', function() {
		$(this).removeClass('button-accept').text('Please wait');
    	clickAcceptHelpProfile($(this));
    });
    $('.profile-body').on('click', '.conversation-container-list', function() {
    	getConversation($(this).data('id'));
    });
    $('.profile-body').on('submit', '#form-send-message', function(e) {
    	e.preventDefault();
    	postNewMessage($('#message-textarea').val().replace(/&/g, '&amp;').replace(/</g, '&lt;'), $('#form-send-message').data('id'), $('#form-send-message').data('other'));
    });
});

getUrlParam = function(name){
	var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
	if (results==null){
		return null;
	}else{
		return results[1] || 0;
	}	
}

function postNewMessage (messageBody, convId, other) {
	let thisAjax = new AjaxTemplate();
	thisAjax.url = '/auth/newmessage/' + convId;
	thisAjax.data = {
		messageBody : messageBody,
		other: other
	};
	thisAjax.method = 'POST';
	thisAjax.success = function(response) {
			thisAjax.method = 'GET';
			getConversation(convId);
	    };
	$.ajax (thisAjax);
}

function getConversation (id) {
	let thisAjax = new AjaxTemplate();
	thisAjax.url = '/auth/get-conversation/' + id;
	thisAjax.success = function(response) {
			$('.now-loading').hide();
			const otherUser = response.conversation.users[0]._id === response.user._id ? response.conversation.users[1] : response.conversation.users[0];
			$('#title-profile-section').html(response.conversation.messages.length > 0 ? otherUser.username + '' : otherUser.username + '<br>No message yet');
			$('#profile-container').empty().append('<div class="conv-container"></div>');
			response.conversation.messages.forEach(function (message) {
				$('.conv-container').append(returnIndividualMessage(message, otherUser));
			});
			$('.conv-container').append(
				'<form id="form-send-message" method="post" data-other="' + otherUser._id + '" data-id="' + response.conversation._id + '">' +
				'<input name="other" value="' + otherUser._id + '" hidden>' +
			    '<label for="messageBody">Send a message</label>' +
			    '<br>' +
			    '<textarea id="message-textarea" name="messageBody" cols="40" rows="5" placeholder="Send a message" required></textarea><br>' +
    			'<input type="submit" value="Send">' +
				'</form>'
				);
	    };
	$.ajax (thisAjax);	
}

function returnIndividualMessage (message, otherUser) {
	const messageClass = message.from._id === otherUser._id ? 'message-other' : 'message-mine';
	return '<div class="message-container ' + messageClass + '" data-id="' + message._id + '">' +
			message.body + '</br>'
			message.date +
			'</div>';	
}

function getListMessages () {
	let thisAjax = new AjaxTemplate();
	thisAjax.url = '/auth/get-profile-messages/';
	thisAjax.success = function(response) {
			$('.now-loading').hide();
			$('#title-profile-section').text(response.conversations.length > 0 ? 'Your conversations:' : 'No conversation open yet');
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

function clickAcceptHelpProfile (button) {
	let thisAjax = new AjaxTemplate();
	thisAjax.url = '/request/accepthelp/';
	thisAjax.data = {
		request : button.data('id'),
		helper : button.data('helper')
	};
	thisAjax.success = function(request) {
			button.parents('.request-container').replaceWith(returnIndividualProfileRequest(request));
	    };
	$.ajax (thisAjax);
}

function getProfileServices() {
	let thisAjax = new AjaxTemplate();
	thisAjax.url = '/auth/get-profile-services/';
	thisAjax.success = function(requests) {
			$('.now-loading').hide();
			$('#title-profile-section').text(requests.length > 0 ? 'Your services:' : 'No service proposed yet');
			requests.forEach(function (request) {
				$('#profile-container').append(returnIndividualServiceProfile(request));
			});
	    };
	$.ajax (thisAjax);
}

function returnIndividualServiceProfile(request) {
	return '<div class="request-container" data-id="' + request._id + '">' +
				'<p>' + request.title.replace(/&/g, '&amp;').replace(/</g, '&lt;') + '</p>' +
				'<div data-id="' + request._id + '" class="button button-revokehelp">Revoke help</div>' +
			'</div>';
}

function clickRevokHelp (button) {
	let thisAjax = new AjaxTemplate();
	thisAjax.url = '/request/revokehelp/' + button.data('id');
	thisAjax.success = function() { 
			updateRequestDisplay(button);
	    };
	$.ajax (thisAjax);
}

function clickRevokHelpProfile (button) {
	let thisAjax = new AjaxTemplate();
	thisAjax.url = '/request/revokehelp/' + button.data('id');
	thisAjax.success = function() { 
			button.parent().remove();
	    };
	$.ajax (thisAjax);
}

function clickICanHelp (button) {
	let thisAjax = new AjaxTemplate();
	thisAjax.url = '/request/proposehelp/' + button.data('id');
	thisAjax.success = function() { 
			updateRequestDisplay(button);
	    };
	$.ajax (thisAjax);
}

function getProfileRequests() {
	let thisAjax = new AjaxTemplate();
	thisAjax.url = '/auth/get-profile-requests/';
	thisAjax.success = function(requests) {
			$('.now-loading').hide();
			$('#title-profile-section').text(requests.length > 0 ? 'Your requests:' : 'No request posted yet');			
			requests.forEach(function (request) {
				$('#profile-container').append(returnIndividualProfileRequest(request));
			});
	    };
	$.ajax (thisAjax);
	function display (requests) {
	}
}

function returnIndividualProfileRequest (request) {
	let listInterested = '';
	if (request.interested.length > 0) {
		listInterested += '<h5>The following users proposed their help:</h5>';
		request.interested.forEach(function(interestedUser) {
			const classButtonHelp = _.contains(request.accepted, interestedUser._id) ? {class: '', text: 'Accepted'} : {class: 'button-accept', text: 'Accept'};
			listInterested += '<div class="interested-container">' +
			'<a href="/auth/profile/' + interestedUser._id + '">' + interestedUser.username + '</a> - ' +
			'<div data-helper="' + interestedUser._id + '" data-id="' + request._id + '" class="button ' + classButtonHelp.class + '">' + classButtonHelp.text + '</div>' +
			'</div>'
		});
	} else {
		listInterested += '<h5>No help proposed yet</h5>';	
	}
	const removeButton = request.status === 'deleted' ? '<p><a href="/request/remove/' + request._id + '">Remove</a></p>' : '';
	const closeRequest = request.accepted.length > 0 ? '<br><a class="button close-request" href="">Close request</a>' : '';
	return '<div class="request-container" data-id="' + request._id + '">' +
				'<p>' + request.title.replace(/&/g, '&amp;').replace(/</g, '&lt;') + '</p>' +
				removeButton +
				listInterested +
				closeRequest +
			'</div>';
}

function getProfileInfo() {
	let thisAjax = new AjaxTemplate();
	thisAjax.url = '/auth/get-current-user/';
	thisAjax.success = function(user) {
			$('.now-loading').hide();
			$('#title-profile-section').text('User info');
			$('#profile-container').html(
					'<p>Username: ' + user.username + '</p>' +
					'<p>Email: ' + user.email + '</p>'
				);
	    };
	$.ajax (thisAjax);
}

function updateRequestDisplay (triggerElement) {
	let thisAjax = new AjaxTemplate();
	thisAjax.url = '/request/update-display/' + triggerElement.data('id');
	thisAjax.success = function(request) { 
	    	refreshRequest(triggerElement.parent().parent(), request.result, request.user);
	    };
	$.ajax (thisAjax);
}

function refreshRequest(container, request, user) {
	container.empty().html(requestTemplate(request, user, true));
}

function expandDetails (button) {
	if (button.data('state') === 'closed') {
		button.data('state', 'open').text('Hide details');
		button.siblings('.request-details').show();
	} else {
		button.data('state', 'closed').text('Show details');;
		button.siblings('.request-details').hide();
	}	
}

function getList (listParams) {
	let thisAjax = new AjaxTemplate();
	thisAjax.url = '/request';
	thisAjax.success = function (ajaxResult) {
	    	displayAllRequests(ajaxResult.results, ajaxResult.user);
	    };
	$.ajax (thisAjax);
}

function displayDate (date) {
	if (!date) {
		return false;
	}
	const d = new Date(date);
	const day = ('0' + d.getDate()).slice(-2);
	const month = ('0' + (d.getMonth()+1)).slice(-2);
	const hour = ('0' + d.getHours()).slice(-2);
	const minute = ('0' + d.getMinutes()).slice(-2);

	return day + '/' + month + '/' + d.getFullYear() + ' at ' + hour + ':' + minute
}

function requestTemplate (request, user, open) {

	var deleteButton = '', helpbutton = '';
	if (user) {
		const buttonHelpClass =  $.inArray( user._id, request.interested ) > -1 ? {class : 'button-revokehelp', text: 'Revoke help' } : {class : 'button-help', text : 'I can help!'};
		helpbutton = '<div data-id="' + request._id + '" class="button ' + buttonHelpClass.class + '">' + buttonHelpClass.text + '</div>';
	}
	if ((user) && (user._id === request.author._id)) {
		deleteButton = '<a href="/request/delete/' + request._id + '">Delete</a>';
		helpbutton = '';
	}
	const price = request.price ? request.price + ' €' : 'None';
	const author = '<a href="/auth/profile/' + request.author._id + '">' + request.author.username + '</a>' || 'Unknown';
	const dateEvent = displayDate(request.dateEvent) || 'Anytime';
	const datePosted = displayDate(request.datePosted) || 'Unknown';
	const rate = request.rate === 'perhour' ? '/hour' : '';
	const openOrclosed = open ? { 
		classDetails : '', 
		buttonText: 'Hide details',
		buttonState: 'open'
	} : { 
		classDetails : 'hidden', 
		buttonText: 'Show details',
		buttonState: 'closed'
	};
	return '<div class="request-details-less">' +
				'<b>' + request.title.replace(/&/g, '&amp;').replace(/</g, '&lt;') + '</b><br>' +
				'Author: ' + author + '<br>' +
				'Interested: ' + request.interested.length + '<br>' +
				'Type: ' + request.type + '<br>' +
				'Posted: ' + datePosted + '<br>' +
				deleteButton +
			'</div>' +
			'<div class="request-details" data-id="' + request._id + '" ' + openOrclosed.classDetails + '>' +
				'When: ' + dateEvent + '<br>' +
				'Requested fee: ' + price + rate + '<br>' +
				'Status: ' + request.status + '<br>' +
				request.description.replace(/&/g, '&amp;').replace(/</g, '&lt;') + '<br>' +
				helpbutton +
			'</div>' +
			'<div data-state="' + openOrclosed.buttonState + '" data-id="' + request._id + '" class="button button-details">' + openOrclosed.buttonText + '</div>'
}

function displayAllRequests (results, user) {
	results.forEach(function(request) {
		if (request.status !== 'deleted') {
			$('.request-list').append('<div data-id="' +  request._id + '" class="request-container">' + requestTemplate(request, user) + '</div>');
		}
	});
}