$(function() {
    checkLogin();
    // LOGIN
    /*$('#login-form').on('submit', (e) => {
        e.preventDefault();
        login();
    });*/
    // LOGOUT
    $('.logout').on('click', (e) => {
        e.preventDefault();
        logout();
    });
});

function checkLogin() {
    $.ajax({
        type: 'GET',
        url: '/',
        data: {},
        success: (req, rep, res) => {
            if (req.user) {
                console.log(req.user);
            } else {
                console.log('nope');
            }
        },
        error: (req, status, err) => {
            console.log(err);
        }
    }); 
}

function login() {
    const username = $('#login-form > .username')[0].value;
    const password = $('#login-form > .password')[0].value;
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