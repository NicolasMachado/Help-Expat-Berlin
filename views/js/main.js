let listParams = {

};

$(function() {
    if ($('.request-list').length !== 0) {
    	getList()
    }
});

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
	const day = ('0' + d.getDay()).slice(-2);
	const month = ('0' + d.getMonth()).slice(-2);
	const hour = ('0' + d.getHours()).slice(-2);
	const minute = ('0' + d.getMinutes()).slice(-2);

	return `${day}/${month}/${d.getFullYear()} at ${hour}:${minute}`
}

function requestTemplate (request) {
	const price = `${request.price} €` || `Free`;
	const author = `<a href="/auth/profile/${request.author._id}">${request.author.username}</a>` || `Unknown`;
	const dateEvent = displayDate(request.dateEvent) || `Anytime`;
	const datePosted = displayDate(request.datePosted) || `Unknown`;
	const rate = request.rate === `perhour` ? `/hour` : ``;

	return template = `
			<div class="request-container">
				Author: ${author}<br>
				Type: ${request.type}<br>
				Posted: ${datePosted}<br>
				When: ${dateEvent}<br>
				Requested fee: ${price}${rate}<br>
				Description: ${request.description}<br>
			</div>
			`;
}

function displayList (results) {
	results.forEach(request => {
		$('.request-list').append(requestTemplate(request))
	});
}