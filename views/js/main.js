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

const tabParam = getUrlParam('tab');
$.getScript('/js/messages.js', function(){});
$.getScript('/js/ratings.js', function(){});
$.getScript('/js/requests.js', function(){});

$(function() {
	$.ajaxSetup({ cache: false });
	$( "#datepicker" ).datetimepicker();
	$( document ).tooltip();
	$('.alert-banner').delay(5000).slideUp(300);
	$('.error-banner').delay(10000).slideUp(300);
	$('.now-loading').hide();

	if (tabParam === 'profile') {
    	getProfileInfo();
	}
    $('.profile-body').on('click', '.profile-tab', function() {
    	getProfileInfo();
        window.history.pushState('', 'Ratings', window.location.href.split('?')[0] + '?tab=profile');
    });
    $('#show-hide-filters').click(function() {
    	toggleShowFilters();
    });
    $('main').on('change', '#filters', function(e) {
    	e.preventDefault();
    	$('.request-list').empty();
    	getList();
    });
    $('.profile-body').on('click', '.proftab', function() {
		$('.now-loading').show();
    	$('#title-profile-section').empty();
    	$('#profile-container').empty();
    });
});

function toggleShowFilters () {
	if ($('#show-hide-filters').data('state') === 'open') {
		$('#show-hide-filters').data('state', 'closed').html('Show filters');
		$('#filters-form').hide();
	} else {
		$('#show-hide-filters').data('state', 'open').html('Hide filters');  
		$('#filters-form').show(); 		
	}
}

function getUrlParam (name) {
	const results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
	if (results==null) {
		return null;
	} else {
		return results[1] || 0;
	}	
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

function displayStars (rating, size) {
	if (!rating) {
		return '<span class="small">No rating yet</span>';
	}
	let htmlStars = '';
	for (let i = 0; i < 5; i++ ) { 
		if (rating > i+.75 ) { 
			htmlStars += '<img src="/images/star-full.png" width="' + size + 'px">';
		} else if (rating > i+.25 ) { 
			htmlStars += '<img src="/images/star-half.png" width="' + size + 'px">';
		} else {
			htmlStars += '<img src="/images/star-empty.png" width="' + size + 'px">';
		}
	}
	return htmlStars
}