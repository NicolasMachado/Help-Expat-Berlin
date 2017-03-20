const ajaxTemplate = {
    async: true,
    crossDomain: false,
    url: '',
    method: 'GET',
    headers: {},
    data: {},
    success: '',
    error: function (result, status, error) {
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
	$('.alert-banner').delay(5000).fadeOut(1000);
	$('.error-banner').delay(10000).fadeOut(1000);

    if ($('.request-list').length !== 0) {
    	getList();
    }

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
    $('.profile-body').on('click', '.profile-tab', function() {
    	$('#profile-container').empty();
    	getProfileInfo();
    });
    $('.profile-body').on('click', '.requests-tab', function() {
    	$('#profile-container').empty();
    	getProfileRequests();
    });
    $('.profile-body').on('click', '.services-tab', function() {
    	$('#profile-container').empty();
    	getProfileServices();
    });
    $('.profile-body').on('click', '.button-revokehelp', function() {
		$(this).removeClass('button-revokehelp').text('Please wait');
    	clickRevokHelpProfile($(this));
    });
});

function getProfileServices() {
	let thisAjax = ajaxTemplate;
	thisAjax.url = '/auth/get-profile-services/';
	thisAjax.success = function(requests) {
			requests.forEach(function (request) {
				$('#profile-container').append(displayIndividualServiceProfile(request));
			});
	    };
	$.ajax (thisAjax);
}

function displayIndividualServiceProfile(request) {
	return '<div class="request-container" data-id="' + request._id + '">' +
				'<p>' + request.title.replace(/&/g, '&amp;').replace(/</g, '&lt;') + '</p>' +
				'<div data-id="' + request._id + '" class="button button-revokehelp">Revoke help</div>' +
			'</div>';
}

function clickRevokHelp (button) {
	let thisAjax = ajaxTemplate;
	thisAjax.url = '/request/revokehelp/' + button.data('id');
	thisAjax.success = function() { 
			updateRequestDisplay(button, button.data('id'));
	    };
	$.ajax (thisAjax);
}

function clickRevokHelpProfile (button) {
	let thisAjax = ajaxTemplate;
	thisAjax.url = '/request/revokehelp/' + button.data('id');
	thisAjax.success = function() { 
			button.parent().remove();
	    };
	$.ajax (thisAjax);
}

function clickICanHelp (button) {
	let thisAjax = ajaxTemplate;
	thisAjax.url = '/request/proposehelp/' + button.data('id');
	thisAjax.success = function() { 
			updateRequestDisplay(button, button.data('id'));
	    };
	$.ajax (thisAjax);
}

function getProfileRequests() {
	let thisAjax = ajaxTemplate;
	thisAjax.url = '/auth/get-profile-requests/';
	thisAjax.success = function(requests) {
			$('#profile-container').html(display(requests));
	    };
	$.ajax (thisAjax);
	function display (requests) {
		let listRequests = '';
		let listInterested = '';
		const title = requests.length > 0 ? '<h3>Your requests:</h3>' : '<h3>No request posted yet</h3>';
		requests.forEach(function (request) {
			if (request.interested.length > 0) {
				listInterested += '<h4>The following users proposed their help</h4>';
				request.interested.forEach(function(interestedUser) {
					listInterested += '<div class="interested-container">' +
					'<a href="/auth/profile/' + interestedUser._id + '">' + interestedUser.username + '</a> - ' +
					'<div data-helper="' + interestedUser._id + '" data-id="' + request._id + '" class="button">Accept</div>' +
					'</div>'
				});
			}
			const removeButton = request.status === 'deleted' ? '<p><a href="/request/remove/' + request._id + '">Remove</a></p>' : '';
			listRequests += '<div class="request-container" data-id="' + request._id + '">' +
				'<p>' + request.title.replace(/&/g, '&amp;').replace(/</g, '&lt;') + '</p>' +
				removeButton +
				listInterested +
			'</div>';
			listInterested = '';
		});
		return title + listRequests;
	}
}

function getProfileInfo() {
	let thisAjax = ajaxTemplate;
	thisAjax.url = '/auth/get-current-user/';
	thisAjax.success = function(user) {
			$('#profile-container').html(
					'<p>Username: ' + user.username + '</p>' +
					'<p>Email: ' + user.email + '</p>'
				);
	    };
	$.ajax (thisAjax);
}

function updateRequestDisplay (triggerElement, id) {
	let thisAjax = ajaxTemplate;
	thisAjax.url = '/request/update-display/' + id;
	thisAjax.success = function(request) { 
	    	container = triggerElement.parent().parent();
	    	refreshRequest(container, request.result, request.user);
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
	let thisAjax = ajaxTemplate;
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