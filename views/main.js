$(function() {
    checkLogin();
    // LOGIN
    $('#login-form').on('submit', (e) => {
        e.preventDefault();
        login();
    });
    // LOGOUT
    $('.logout').on('click', (e) => {
        e.preventDefault();
        logout();
    });
});

function login() {
    const username = $('#login-form > .username')[0].value;
    const password = $('#login-form > .password')[0].value;
    console.log(`logging in with ${username} and ${password}`);
    $.ajax({
        type: 'POST',
        url: '/users/login',
        contentType: 'application/json',
        data: JSON.stringify({
            "username": username,
            "password": password
        }),
        success: () => {
            checkLogin();
        },
        error: (res, status, err) => {
            console.log(res.responseText);
        }
    }); 
}

function logout() {
    console.log("logging out frontend");
    $.ajax({
        type: 'GET',
        url: '/users/logout',
        data: {},
        success: (req, rep, res) => {
            checkLogin();
        },
        error: (req, status, err) => {
            console.log(err);
        }
    }); 
}

function checkLogin() {   
    $.ajax({
        type: 'GET',
        url: '/users/me',
        success: (data) => {
            console.log(data);
            if (data.user) {
                $('.logged-in').show().text(`You are logged in as ${data.user.username}`);
                $('.not-logged-in').hide();
            } else {
                $('.logged-in').hide();
                $('.not-logged-in').show();
            }
        },
        error: (req, status, err) => {
            console.log("Error when checking login (frontend): " + err);
        }
    }); 
}