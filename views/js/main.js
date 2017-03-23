function AjaxTemplate (url) {
    this.async = true,
    this.crossDomain = false,
    this.url = url,
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
	$('.alert-banner').delay(5000).slideUp(300);
	$('.error-banner').delay(10000).slideUp(300);
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
    $('.profile-body').on('click', '.ratings-tab', function() {
    	getProfileRatings();
    });
    $('.profile-body').on('click', '.button-revokehelp', function() {
		$(this).removeClass('button-revokehelp').text('Please wait');
    	clickRevokHelpProfile($(this));
    });
    $('.profile-body').on('click', '.button-accept', function() {
		$(this).removeClass('button-accept').text('Please wait');
    	clickAcceptHelpProfile($(this));
    });
    $('.profile-body').on('click', '.close-request', function() {
		$(this).parent('.request-container').append(getWhoHelped($(this)));
		$(this).hide();
    });
    $('.profile-body').on('change', '.select-to-rate', function() {
		displayRateForm($(this));
    });
    $('.profile-body').on('click', '.conversation-container-list', function() {
    	getConversation($(this).data('id'));
    });
    $('.profile-body').on('submit', '#form-send-message', function(e) {
    	e.preventDefault();
    	postNewMessage($('#message-textarea').val().replace(/&/g, '&amp;').replace(/</g, '&lt;'), $('#form-send-message').data('id'), $('#form-send-message').data('other'));
    });
    $('.profile-body').on('submit', '.rate-user', function(e) {
    	e.preventDefault();
    	saveRating($(this).find('option:selected').text(), $(this).children('.ratetext').val(), $(this).parents('.request-container').data('id'), $(this).data('user'), $(this), $(this).data('iam'));
    });
});

function saveRating (rating, comment, request, user, triggerElement, iam) {
	console.log(iam);
	let thisAjax = new AjaxTemplate('/auth/add-rating');
	thisAjax.data = {
		rating: rating,
		comment: comment,
		request: request,
		user: user,
		iam: iam
	}
	thisAjax.success = function() {
			triggerElement.parents('.request-container').html('<div class="alert-banner">Thank you. Your rating has been saved</div>').delay(5000).fadeOut(1000);
	    };
	$.ajax (thisAjax);
}

function getProfileRatings () {
	let thisAjax = new AjaxTemplate('/auth/get-user-ratings');
	thisAjax.success = function(ratings) {
			displayRatings(ratings);
	    };
	$.ajax (thisAjax);
}

function displayRatings (ratings) {
	$('.now-loading').hide();
	$('#title-profile-section').text('Your ratings');
	ratings.forEach(rating => {
		$('#profile-container').append(
			'<div class="request-container">' + 
			'From: ' + rating.from.username + '<br>' +
			'Rating: ' + rating.rating + '<br>' +
			'Service: ' + rating.request.title + '<br>' +
			'Comment: ' + rating.comment +
			'</div>'

		);
	});
}

function displayRateForm (triggerElement) {
	if (triggerElement.val() === 'none') {
		triggerElement.parents('.request-container').children('.rate-form').html('');
	} else {
		let ratings = '';
		for (let i = 0; i<=5; i += 0.5) {
			ratings += '</option><option value="' + i + '">' + i + '</option>'
		}
		triggerElement.parents('.request-container').children('.rate-form').html(
			'Please rate your interaction with ' + triggerElement.find('option:selected').text() +
			'<form data-iam="author" data-user="' + triggerElement.find('option:selected').val() + '" class="rate-user">' +
			'<select class="select-rating-number" name="select-rating-number" required>' +
			'<option value="">Rating</option>' + ratings +
			'</select>' + ' / 5' + '<br>' +
    		'<textarea class="ratetext" name="rating-comment" cols="40" rows="5" placeholder="Leave a comment to explain your rating"></textarea><br>' +
    		'<input class="button" type="submit" value="Submit">' +
			'</form>'
		);
	}
}

function displayListHelpersRate (triggerElement, listAccepted) {
	triggerElement.parent('.request-container').children('.who-helped').remove();
	const accepted = listAccepted.result.accepted.map(accepted => {
		return '<option data-username="' + accepted.username + '" value="' + accepted._id + '">' + accepted.username + '</option>'
	});
	triggerElement.parent('.request-container').append(
		'<div class="who-helped">' +
		'Who helped?' + 
		'<select class="select-to-rate" name="accepted">' +
		'<option value="none">No one</option>' +
		accepted +
		'</select>' +
		'</div><div class="rate-form"></div>' +
		'<div class="button button-no-rating">Close without rating</div>'
		);
}

function getWhoHelped (triggerElement, requestId) {
	let thisAjax = new AjaxTemplate('/request/update-display/' + triggerElement.data('id'));
	thisAjax.success = function(listAccepted) {
			displayListHelpersRate(triggerElement, listAccepted);
	    };
	$.ajax (thisAjax);
}

const getUrlParam = function(name){
	const results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
	if (results==null) {
		return null;
	} else {
		return results[1] || 0;
	}	
}

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
    			'<input class="button" type="submit" value="Send">' +
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
	let thisAjax = new AjaxTemplate('/auth/get-profile-messages/');
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
	let thisAjax = new AjaxTemplate('/request/accepthelp/');
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
	let thisAjax = new AjaxTemplate('/auth/get-profile-services/');
	thisAjax.success = function(response) {
			$('.now-loading').hide();
			$('#title-profile-section').text(response.requests.length > 0 ? 'Your services:' : 'No service proposed yet');
			response.requests.forEach(function (request) {
				if (request.status !== 'deleted' && (request.status !== 'closed' || request.helper === response.currentUser._id)) {
					$('#profile-container').append(returnIndividualServiceProfile(request, response.currentUser));
				}
			});
	    };
	$.ajax (thisAjax);
}

function returnIndividualServiceProfile(request, currentUser) {
	let option = '';
	if (request.helper && request.helper === currentUser._id) {
		let ratings = '';
		for (let i = 0; i<=5; i += 0.5) {
			ratings += '</option><option value="' + i + '">' + i + '</option>'
		}
		option = 'You have provided a service to this user, please rate your interaction.' +
			'<form data-iam="helper" data-user="' + request.author + '" class="rate-user">' +
			'<select class="select-rating-number" name="select-rating-number" required>' +
			'<option value="">Rating</option>' + ratings +
			'</select>' + ' / 5' + '<br>' +
    		'<textarea class="ratetext" name="rating-comment" cols="40" rows="5" placeholder="Leave a comment to explain your rating"></textarea><br>' +
    		'<input class="button" type="submit" value="Submit">' +
			'</form>'
	} else {
		option = '<div data-id="' + request._id + '" class="button button-revokehelp">Revoke help</div>';
	}
	return '<div class="request-container" data-id="' + request._id + '">' +
				'<p>' + request.title.replace(/&/g, '&amp;').replace(/</g, '&lt;') + '</p>' +
				option +
			'</div>';
}

function clickRevokHelp (button) {
	let thisAjax = new AjaxTemplate('/request/revokehelp/' + button.data('id'));
	thisAjax.success = function() { 
			updateRequestDisplay(button);
	    };
	$.ajax (thisAjax);
}

function clickRevokHelpProfile (button) {
	let thisAjax = new AjaxTemplate('/request/revokehelp/' + button.data('id'));
	thisAjax.success = function() { 
			button.parent().remove();
	    };
	$.ajax (thisAjax);
}

function clickICanHelp (button) {
	let thisAjax = new AjaxTemplate('/request/proposehelp/' + button.data('id'));
	thisAjax.success = function() { 
			updateRequestDisplay(button);
	    };
	$.ajax (thisAjax);
}

function getProfileRequests() {
	let thisAjax = new AjaxTemplate('/auth/get-profile-requests/');
	thisAjax.success = function(requests) {
			$('.now-loading').hide();
			$('#title-profile-section').text(requests.length > 0 ? 'Your requests:' : 'No request posted yet');			
			requests.forEach(function (request) {
				if (request.status !== 'closed') {
					$('#profile-container').append(returnIndividualProfileRequest(request));
				}
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
	const closeRequest = request.accepted.length > 0 ? '<br><div data-id="' + request._id + '" class="button close-request">Close request</div>' : '';
	return '<div class="request-container" data-id="' + request._id + '">' +
				'<p>' + request.title.replace(/&/g, '&amp;').replace(/</g, '&lt;') + '</p>' +
				removeButton +
				listInterested +
				closeRequest +
			'</div>';
}

function getProfileInfo() {
	let thisAjax = new AjaxTemplate('/auth/get-current-user/');
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
	let thisAjax = new AjaxTemplate('/request/update-display/' + triggerElement.data('id'));
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
	let thisAjax = new AjaxTemplate('/request');
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
		if (request.status !== 'deleted' && request.status !== 'closed') {
			$('.request-list').append('<div data-id="' +  request._id + '" class="request-container">' + requestTemplate(request, user) + '</div>');
		}
	});
}