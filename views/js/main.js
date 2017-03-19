let listParams = {

};

$(function() {
	$('.alert-banner').delay(5000).fadeOut(1000);
	$('.error-banner').delay(10000).fadeOut(1000);
    if ($('.request-list').length !== 0) {
    	getList();
    }
    $('.request-list').on('click', '.button-details', function() {
    	expandDetails($(this));
    });
    $('.request-list').on('click', '.button-help', function() {
    	clickICanHelp($(this), $(this).parent().data('id'));
    });
});

function clickICanHelp (button, id) {
	button.hide();
	$.ajax ({
	    async: true,
	    crossDomain: false,
	    url: '/request/proposehelp/' + id,
	    method: 'GET',
	    headers: {},
	    data: {},
	    success: () => { 
	    	button.show();
	    },
	    error: function(x,e) {
				    if (x.status==0) {
				        alert('You are offline!!\n Please Check Your Network.');
				    } else if(x.status==404) {
				        alert('Requested URL not found.');
				    } else if(x.status==500) {
				        alert('Internel Server Error.');
				    } else if(e=='parsererror') {
				        alert('Error.\nParsing JSON Request failed.');
				    } else if(e=='timeout'){
				        alert('Request Time out.');
				    } else {
				        alert('Unknow Error.\n'+x.responseText);
				    }
				}
	});
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
	    async: true,
	    crossDomain: false,
	    url: '/request',
	    method: 'GET',
	    headers: {},
	    data: {},
	    success: displayList,
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

	return `${day}/${month}/${d.getFullYear()} at ${hour}:${minute}`
}

function requestTemplate (request, user) {
	if (request.status === `deleted`) {
		return false
	}
	let deleteButton;
	if ((user) && (user._id === request.author._id)) {
		deleteButton = `<a href="/request/delete/${request._id}">Delete<a/>`
	} else {
		deleteButton = ``;
	}
	const price = request.price ? `${request.price} €` : `Free`;
	const author = `<a href="/auth/profile/${request.author._id}">${request.author.username}</a>` || `Unknown`;
	const dateEvent = displayDate(request.dateEvent) || `Anytime`;
	const datePosted = displayDate(request.datePosted) || `Unknown`;
	const rate = request.rate === `perhour` ? `/hour` : ``;
	return `<div class="request-container">
				<div class="request-details-less">
					Author: ${author}<br>
					Type: ${request.type}<br>
					Posted: ${datePosted}<br>
					${deleteButton}<br>
				</div>
				<div class="request-details" data-id="${request._id}" hidden>
					When: ${dateEvent}<br>
					Requested fee: ${price}${rate}<br>
					Status: ${request.status}<br>
					${request.description}
					<div data-state="closed" data-id="${request._id}" class="button button-help">I can help!</div>
				</div>
				<div data-state="closed" data-id="${request._id}" class="button button-details">Show details</div>
			</div>`;
}

function displayList (ajaxResult) {
	ajaxResult.results.forEach(request => {
		$('.request-list').append(requestTemplate(request, ajaxResult.user))
	});
}