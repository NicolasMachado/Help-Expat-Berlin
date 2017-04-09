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
    };
}

let currentUser, unreadMessages;

const tabParam = getUrlParam('tab');
$.getScript('/js/messages.js', function(){});
$.getScript('/js/ratings.js', function(){});
$.getScript('/js/requests.js', function(){});

$(function() {
	getUser();
	$.ajaxSetup({ cache: false });
	$( "#datepicker" ).datetimepicker();
	$( document ).tooltip();
	$('.alert-banner').delay(5000).slideUp(300);
	$('.error-banner').delay(10000).slideUp(300);
	$('.now-loading').hide();

	if (tabParam === 'profile') {
    	getProfileInfo();
        $('.proftab').css('background-color',  '#6F7469');
        $('.profile-tab').css('background-color',  '#484C44');
	}
    $('.profile-body').on('click', '.profile-tab', function() {
    	getProfileInfo();
        window.history.pushState('', 'Ratings', window.location.href.split('?')[0] + '?tab=profile');
        $('.proftab').css('background-color',  '#6F7469');
        $('.profile-tab').css('background-color',  '#484C44');
    });
    $('#show-hide-filters').click(function() {
    	toggleShowFilters();
    });
    $('main').on('change', '#filters', function(e) {
    	currentPage = 0;
    	e.preventDefault();
    	$('.request-list').empty();
    	$('.prev-next').empty();
    	getList();
    });
    $('.profile-body').on('click', '.proftab', function() {
		$('.now-loading').show();
    	$('#title-profile-section').empty();
    	$('#profile-container').empty();
    });
    $('#burger').click(function() {
    	$('#realnav').toggle();
    });
    $('main').click(function() {
    	if ($('#realnav').css('font-size') !== '16px') {
    		$('#realnav').hide();
    	}
    });
});

function getUser () {
    let thisAjax = new AjaxTemplate('/auth/get-user/');
    thisAjax.success = function(response) {
        if (response.user) {
            const socket = io.connect();
            listenSocket(socket);
            socket.emit('join', String(response.user._id));
            currentUser = response.user;
            unreadMessages = currentUser.unreadMessages;
            updateNewMessagesIndicator();
        }
    };
    $.ajax (thisAjax);
}

function listenSocket(mySocket) {
    mySocket.on('newMessage', function (conv) {
        if ((conv.otherID == currentUser._id) || (conv.userID == currentUser._id)) { //check if user concerned
            // if viewing chat
            if ($('.conv-container').data('id') == conv.convID) {
                updateConversation(conv.convID);
            } else { // if I received a new messages
                if (conv.otherID == currentUser._id) {
                    unreadMessages++;
                    updateNewMessagesIndicator();
                }
            }
        }
    });
}

function colorFilters () {
    const selects = $('#filters-form').find('select  option:selected');
    selects.each(function (index, select) {
        if (select.value !== 'all' && select.value !== '-1' && select.value !=='Any') {
            $(select).parent().css('background-color', '#F0F2D9').css('color', '');
        } else {
            $(select).parent().css('background-color', '').css('color', '');
        }
    });
}

function toggleShowFilters () {
	if ($('#show-hide-filters').data('state') === 'open') {
		$('#show-hide-filters').data('state', 'closed').html('Show filters');
		$('#filters-form').slideUp(200);
	} else {
		$('#show-hide-filters').data('state', 'open').html('Hide filters');
		$('#filters-form').slideDown(200);
	}
}

function getUrlParam (name) {
	const results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
	if (results === null) {
		return null;
	} else {
		return results[1] || 0;
	}
}

function getProfileInfo() {
    $('.now-loading').show();
	let thisAjax = new AjaxTemplate('/auth/get-current-user/');
	thisAjax.success = function(user) {
			$('.now-loading').hide();
			$('#title-profile-section').text('User info');
			$('#profile-container').html(
					'<div class="request-container"><p>Username: ' + user.username + '</p>' +
					'<p>Email: ' + user.email + '</p>' +
					'<p><a href="/auth/logout">Sign out</a></p></div>'
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

	return day + '/' + month + '/' + d.getFullYear() + ' at ' + hour + ':' + minute;
}

function displayStars (rating, size) {
	if (!rating) {
		return '<span class="small">No rating yet</span>';
	}
	let htmlStars = '';
	for (let i = 0; i < 5; i++ ) {
		if (rating > i + 0.75 ) {
			htmlStars += '<img src="/images/star-full.png" width="' + size + 'px">';
		} else if (rating > i + 0.25 ) {
			htmlStars += '<img src="/images/star-half.png" width="' + size + 'px">';
		} else {
			htmlStars += '<img src="/images/star-empty.png" width="' + size + 'px">';
		}
	}
	return htmlStars;
}
