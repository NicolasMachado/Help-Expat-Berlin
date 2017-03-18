let listParams = {

};

$(function() {
    if ($('.request-list').length !== 0) {
    	getList();
    }
    $('.request-list').on('click', '.details-button', function() {
    	expandDetails($(this));
    });
});

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
	    data: {
	    },
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
				<div class="request-details" hidden>
					When: ${dateEvent}<br>
					Requested fee: ${price}${rate}<br>
					Status: ${request.status}<br>
					${request.description}
				</div>
				<div data-state="closed" data-id="${request._id}" class="details-button">Show details</div>
			</div>`;
}

function displayList (ajaxResult) {
	ajaxResult.results.forEach(request => {
		$('.request-list').append(requestTemplate(request, ajaxResult.user))
	});
}