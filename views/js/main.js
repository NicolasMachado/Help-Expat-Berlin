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

function displayList (results) {
	console.log(results)
}