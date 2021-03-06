const resultsPerPage = 10;
let currentPage = 0;

$(function() {
    if ($('.request-list').length !== 0) {
        if ($('#filters').data('loggedin')) {
            toggleShowFilters();
            getList();
        } else {
            toggleShowFilters();
            getList();
        }
    }
    if (tabParam === 'requests') {
        getProfileRequests();
        $('.proftab').css('background-color',  '#696b74');
        $('.requests-tab').css('background-color',  '#44464d');
    }
    if (tabParam === 'services') {
        getProfileServices();
        $('.proftab').css('background-color',  '#696b74');
        $('.services-tab').css('background-color',  '#44464d');
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
    $('.profile-body').on('click', '.requests-tab', function() {
        getProfileRequests();
        window.history.pushState('', 'Ratings', window.location.href.split('?')[0] + '?tab=requests');
        $('.proftab').css('background-color',  '#696b74');
        $('.requests-tab').css('background-color',  '#44464d');
    });
    $('.profile-body').on('click', '.services-tab', function() {
        getProfileServices();
        window.history.pushState('', 'Ratings', window.location.href.split('?')[0] + '?tab=services');
        $('.proftab').css('background-color',  '#696b74');
        $('.services-tab').css('background-color',  '#44464d');
    });
    $('.profile-body').on('click', '.button-revokehelp', function() {
        $(this).removeClass('button-revokehelp').text('Please wait');
        clickRevokHelpProfile($(this));
    });
    $('.profile-body').on('click', '.button-accept', function() {
        $(this).removeClass('button-accept').removeClass('fakelink').text('Please wait');
        clickAcceptHelpProfile($(this));
    });
    $('.profile-body').on('click', '.close-request', function() {
        $(this).parent('.request-container').append(getWhoHelped($(this)));
        $(this).hide();
    });
    $('.profile-body').on('click', '.delete-request', function() {
        $(this).parent().siblings('.confirm-delete').show();
    });
    $('.profile-body').on('click', '.cancel-delete', function() {
        $(this).parent().hide();
    });
    $('.prev-next').on('click', '.button-next', function() {
        $('.request-list').empty();
        $('.prev-next').empty();
        currentPage++;
        getList();
    });
    $('.prev-next').on('click', '.button-previous', function() {
        $('.request-list').empty();
        $('.prev-next').empty();
        currentPage--;
        getList();
    });
});

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
            $('#profile-container').empty();
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
    if (!request.author.banned) {
        if (request.helper && request.helper === currentUser._id) {
            let ratings = '';
            for (let i = 0; i<=5; i += 0.5) {
                ratings += '</option><option value="' + i + '">' + i + '</option>';
            }
            option = 'You have provided a service for this request.</p><p>Please rate your interaction with <a href="/auth/profile/' + request.author._id + '">' + request.author.username + '</a>.' +
                '<form data-iam="helper" data-user="' + request.author._id + '" class="rate-user">' +
                '<p><select class="select-rating-number" name="select-rating-number" required>' +
                '<option value="">Rating</option>' + ratings +
                '</select> / 5</p>' +
                '<textarea class="ratetext" name="rating-comment" rows="5" placeholder="Leave a comment to explain your rating"></textarea>' +
                '<p><input class="button" type="submit" value="Submit"></p>' +
                '</form>';
        } else if (_.contains(request.accepted, currentUser._id)) {
            option = '<p>' + request.author.username + ' has accepted your help.</p><p>You can now communicate with them in the <a href="/auth/profile/' + currentUser._id + '?tab=messages">messages</a> section.</p>';
        } else {
            option = '<p>' + request.author.username + ' has not accepted your help yet.</p>' +
            '<div data-id="' + request._id + '" class="button button-revokehelp">Revoke help</div>';
        }
        return '<div class="request-container" data-id="' + request._id + '">' +
                    '<p class="title-request-container"><b>' + request.title.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/\r?\n/g, '<br />') + '</b></p>' +
                    option +
                '</div>';
    }
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
            $('#profile-container').empty();
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
        listInterested += '<p>The following users proposed their help:</p>';
        request.interested.forEach(function(interestedUser) {
            if (!interestedUser.banned) {
                const classButtonHelp = _.contains(request.accepted, interestedUser._id) ? {class: '', text: 'You can now send messages to this user'} : {class: 'fakelink button-accept', text: 'Accept'};
                listInterested += '<div class="interested-container">' +
                '<a href="/auth/profile/' + interestedUser._id + '">' + interestedUser.username + '</a> - ' +
                '<span data-helper="' + interestedUser._id + '" data-id="' + request._id + '" class="' + classButtonHelp.class + '">' + classButtonHelp.text + '</span>' +
                '</div>';
            }
        });
    } else {
        listInterested += '<p>No help proposed yet</p>';
    }
    const closeRequest = request.accepted.length > 0 ? '<div data-id="' + request._id + '" class="button close-request">Close request</div>' : '';
    return '<div class="request-container" data-id="' + request._id + '">' +
                '<p class="title-request-container"><b>' + request.title.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/\r?\n/g, '<br />') + '</b></p>' +
                '<p><span class="fakelink delete-request">Delete</span></p>' +
                '<p class="confirm-delete">Your request will be deleted permanently, are you sure ?<br><br><a href="/request/remove/' + request._id + '">Confirm</a> - <span class="cancel-delete fakelink">Cancel</span></p>' +
                listInterested +
                '<p>' + closeRequest + '</p>' +
            '</div>';
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
        button.siblings('.request-details').slideDown(200);
    } else {
        button.data('state', 'closed').text('Show details');
        button.siblings('.request-details').slideUp(200);
    }
}

function getList () {
    $('.now-loading').show();
    let thisAjax = new AjaxTemplate('/request?' + $('#filters-form').serialize() + '&page=' + currentPage + '&perpage=' + resultsPerPage);
    thisAjax.success = function (ajaxResult) {
            displayPrevNext(ajaxResult.nbResults);
            displayAllRequests(ajaxResult.results, ajaxResult.user);
            colorFilters();
            $('.now-loading').hide();
        };
    $.ajax (thisAjax);
}

function displayPrevNext (total) {
    if (currentPage > 0) {
        $('.prev-next').append('<div class="button floatleft prevnext button-previous"><img src="./images/left-chevron.png" width="15px" /></div>');
    }
    if ((currentPage * resultsPerPage + resultsPerPage) < total) {
        $('.prev-next').append('<div class="button floatright prevnext button-next"><img src="./images/right-chevron.png" width="15px" /></div>');
    }
    if (resultsPerPage >= total) {
        $('.prev-next').hide();
    } else {
        $('.prev-next').show();
    }
}

function displayAllRequests (results, user) {
    if (results.length <= 0) {
        $('.request-list').html('<h3>No request found</h3>');
    }
    results.forEach(function(request) {
        if (!request.author.banned) {
            $('.request-list').append('<div data-id="' +  request._id + '" class="request-container">' + requestTemplate(request, user) + '</div>');
        }
    });
}

function requestTemplate (request, user, open) {

    var helpbutton = '';
    if (user) {
        const buttonHelpClass =  $.inArray( user._id, request.interested ) > -1 ? {class : 'button-revokehelp', text: 'Revoke help' } : {class : 'button-help', text : 'I can help!'};
        helpbutton = '<div data-id="' + request._id + '" class="button ' + buttonHelpClass.class + '">' + buttonHelpClass.text + '</div>';
    } else {
        helpbutton = '<div data-id="' + request._id + '" class="button button-help">I can help!</div>';
    }
    if ((user) && (user._id === request.author._id)) {
        helpbutton = '';
    }
    const price = request.price ? request.price + ' €' : 'None';
    const author = '<a href="/auth/profile/' + request.author._id + '">' + request.author.username + '</a>' || 'Unknown';
    const dateEvent = displayDate(request.dateEvent) || 'Anytime';
    const datePosted = displayDate(request.datePosted) || 'Unknown';
    const rate = request.rate === 'perhour' ? '/hour' : '';
    const nbPlural = request.author.nbRatings > 1 ? 's' : '';
    const nbRatingString = request.author.nbRatings > 0 ? '<p class="no-lb small">(' + request.author.nbRatings + ' rating' + nbPlural + ')</p>' : '';
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
                '<p class="title-request-container"><b>' + request.title.replace(/&/g, '&amp;').replace(/</g, '&lt;') + '</b></p>' +
                '<div class="author-container">' +
                    '<p class="no-lb">' + author + '</p>' +
                    '<p class="no-lb">' + displayStars(request.author.rating, 20) + '</p>' +
                    nbRatingString +
                '</div>' +
                '<div class="details-less-container">' +
                    '<p class="small"><img src="images/category-icon.png"> ' + request.type + '</p>' +
                    '<p class="small"><b>' + request.interested.length + '</b> interested</p>' +
                    '<div class="no-lb small">Posted: ' + datePosted + '</div>' +
                '</div>' +
            '</div>' +
            '<div class="request-details" data-id="' + request._id + '" ' + openOrclosed.classDetails + '>' +
                '<div class="details-more-container">' +
                    '<p class="small"><img src="images/date-icon.png"></img> ' + dateEvent + '</p>' +
                    '<p class="small"><img src="images/location-icon.png"></img> ' + request.location + '</p>' +
                    '<p class="small"><img src="images/fee-icon.png"></img> ' + price + rate + '</p>' +
                '</div>' +
                '<p class="comment">' + request.description.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/\r?\n/g, '<br />') + '</p>' +
                helpbutton +
            '</div>' +
            '<div data-state="' + openOrclosed.buttonState + '" data-id="' + request._id + '" class="button-details">' + openOrclosed.buttonText + '</div>';
}
