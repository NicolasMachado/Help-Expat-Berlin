$(function() {
    if (tabParam === 'ratings') {
        getProfileRatings();
        $('.proftab').css('background-color',  '#696b74');
        $('.ratings-tab').css('background-color',  '#44464d');
    }
    if ($('#ratings-other').length > 0) {
        getProfileOtherRatings();
    }
    $('.profile-body').on('click', '.ratings-tab', function() {
        getProfileRatings();
        window.history.pushState('', 'Ratings', window.location.href.split('?')[0] + '?tab=ratings');
        $('.proftab').css('background-color',  '#696b74');
        $('.ratings-tab').css('background-color',  '#44464d');
    });
    $('.profile-body').on('change', '.select-to-rate', function() {
        displayRateForm($(this));
    });
    $('.profile-body').on('submit', '.rate-user', function(e) {
        e.preventDefault();
        saveRating($(this).find('option:selected').text(), $(this).children('.ratetext').val(), $(this).parents('.request-container').data('id'), $(this).data('user'), $(this), $(this).data('iam'));
    });
    $('.profile-body').on('click', '.button-no-rating', function(e) {
        e.preventDefault();
        saveNoRating($(this).parents('.request-container').data('id'), $(this));
    });
});

function saveNoRating (request, triggerElement) {
    let thisAjax = new AjaxTemplate('/request/close-no-rating/' + request );
    thisAjax.success = function() {
            triggerElement.parents('.request-container').html('<div class="alert-banner">Thank you. Your request has been closed.</div>').delay(5000).fadeOut(1000);
        };
    $.ajax (thisAjax);
}

function saveRating (rating, comment, request, user, triggerElement, iam) {
    let thisAjax = new AjaxTemplate('/auth/add-rating');
    thisAjax.data = {
        rating: rating,
        comment: comment,
        request: request,
        user: user,
        iam: iam
    };
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

function getProfileOtherRatings () {
    let thisAjax = new AjaxTemplate('/auth/get-other-ratings/' + $('#ratings-other').data('id'));
    thisAjax.success = function(ratings) {
            displayOtherRatings(ratings);
        };
    $.ajax (thisAjax);
}

function displayOtherRatings (ratings) {
    $('.now-loading').hide();
    if (ratings.length > 0) {
        $('#title-profile-section').text('Ratings');
    } else {
        $('#title-profile-section').text('Not rated yet');
    }
    ratings.forEach(rating => {
        $('#ratings-other').append(
            '<div class="request-container">' +
                '<p class="title-request-container">Request: <b>' + rating.request.title + '</b></p>' +
                '<p>Rated ' + displayStars(rating.rating, 15) + ' by <a href="/auth/profile/' + rating.from._id + '">' + rating.from.username + '</a></p>' +
                '<p class="comment">' + rating.comment.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/\r?\n/g, '<br />') + '</p>' +
            '</div>'
        );
    });
}

function displayRatings (ratings) {
    $('.now-loading').hide();
    if (ratings.length > 0) {
        $('#title-profile-section').text('Your ratings');
    } else {
        $('#title-profile-section').text('Not rated yet');
    }
    ratings.forEach(rating => {
        $('#profile-container').append(
            '<div class="request-container">' +
                '<p class="title-request-container">Request: <b>' + rating.request.title + '</b></p>' +
                '<p>Rated ' + displayStars(rating.rating, 15) + ' by <a href="/auth/profile/' + rating.from._id + '">' + rating.from.username + '</a></p>' +
                '<p class="comment">' + rating.comment.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/\r?\n/g, '<br />') + '</p>' +
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
            ratings += '</option><option value="' + i + '">' + i + '</option>';
        }
        triggerElement.parents('.request-container').children('.rate-form').html(
            'Please rate your interaction with ' + triggerElement.find('option:selected').text() +
            '<form data-iam="author" data-user="' + triggerElement.find('option:selected').val() + '" class="rate-user">' +
            '<p><select class="select-rating-number" name="select-rating-number" required>' +
            '<option value="">Rating</option>' + ratings +
            '</select>' + ' / 5' + '</p>' +
            '<textarea class="ratetext" name="rating-comment" rows="5" placeholder="Leave a comment to explain your rating"></textarea>' +
            '<p><input class="button" type="submit" value="Submit"></p>' +
            '</form>'
        );
    }
}

function displayListHelpersRate (triggerElement, listAccepted) {
    triggerElement.parent('.request-container').children('.who-helped').remove();
    const accepted = listAccepted.result.accepted.map(accepted => {
        return '<option data-username="' + accepted.username + '" value="' + accepted._id + '">' + accepted.username + '</option>';
    });
    triggerElement.parent('.request-container').append(
        '<div class="who-helped">' +
        '<p>Who helped?</p>' +
        '<p><select class="select-to-rate" name="accepted">' +
        '<option value="none">No one</option>' +
        accepted +
        '</select></p>' +
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
