$(function() {
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
            location.href = "/"
        },
        error: (req, status, err) => {
            console.log(err);
        }
    }); 
}