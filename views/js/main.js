let listParams = {

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
    	clickICanHelp($(this), $(this).parent().data('id'));
    });
    $('.request-list').on('click', '.button-revokehelp', function() {
		$(this).removeClass('button-revokehelp').text('Please wait');
    	clickRevokHelp($(this), $(this).parent().data('id'));
    });
});

function clickRevokHelp (button, id) {
	$.ajax ({
	    async: true,
	    crossDomain: false,
	    url: '/request/revokehelp/' + id,
	    method: 'GET',
	    headers: {},
	    data: {},
	    success: function() { 
			updateRequestDisplay(button, id);
	    },
	    error: function (result, status, error) {
	        console.log(result + " - " + status + " - " + error);
	    }
	});
}

function clickICanHelp (button, id) {
	$.ajax ({
	    async: true,
	    crossDomain: false,
	    url: '/request/proposehelp/' + id,
	    method: 'GET',
	    headers: {},
	    data: {},
	    success: function(res, err, conf) { 
			updateRequestDisplay(button, id);
	    },
	    error: function (result, status, error) {
	        console.log(result + " - " + status + " - " + error);
	    	if (error === 'Unauthorized') {
	    		window.location.href = '/auth/account-login-request';
	    	}
	    }
	});
}

function updateRequestDisplay (triggerElement, id) {
	$.ajax ({
	    async: true,
	    crossDomain: false,
	    url: '/request/update-display/' + id,
	    method: 'GET',
	    headers: {},
	    data: {},
	    success: function(request) { 
	    	container = triggerElement.parent().parent();
	    	refreshRequest(container, request.result, request.user);
	    },
	    error: function (result, status, error) {
	        console.log(result + " - " + status + " - " + error);
	    }
	});
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
	$.ajax ({
	    crossDomain: false,
	    url: '/request',
	    method: 'GET',
	    headers: {},
	    data: {},
	    success: function (ajaxResult) {
	    	displayAllRequests(ajaxResult.results, ajaxResult.user);
	    },
	    error: function (result, status, error) {
	        console.log(result + " - " + status + " - " + error);
	    }
	});
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
		//helpbutton = `<div data-id="${request._id}" class="button ${buttonHelpClass.class}">${buttonHelpClass.text}</div>`;	
		helpbutton = '<div data-id="' + request._id + '" class="button ' + buttonHelpClass.class + '">' + buttonHelpClass.text + '</div>';
	}
	if ((user) && (user._id === request.author._id)) {
		//deleteButton = `<a href="/request/delete/${request._id}">Delete<a/>`;
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
				request.description + '<br>' +
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