﻿function LoginViewModel() {
    var self = this;

    var tokenKey = 'accessToken';

    self.result = ko.observable();
    self.user = ko.observable();
    self.loggedIn = ko.observable(false);

    self.showMenu = function() {
        if (authManager.getToken())
            self.loggedIn(true);
        else
            self.loggedIn(false);
    }

    self.showMenu();

    self.registerEmail = ko.observable().extend({
        email: true,
        required: true
    });
    self.registerPassword = ko.observable().extend({
        minLength: 6,
        maxLength: 15,
        required: true
    });
    self.registerPassword2 = ko.observable().extend({
        equal: self.registerPassword,
        required: true
    });
    self.firstName = ko.observable().extend({
        required: true,
        minLength: 3,
        maxLength: 15
    });
    self.lastName = ko.observable().extend({
        required: true,
        minLength: 3,
        maxLength: 15
    });

    self.loginEmail = ko.observable().extend({
        email: true,
        required: true
    });
    self.loginPassword = ko.observable();

    function showError(jqXHR) {
        self.result(jqXHR.status + ': ' + jqXHR.statusText);
    }

    self.callApi = function () {
        self.result('');

        var token = localStorage.getItem(tokenKey);
        var headers = {};
        if (token) {
            headers.Authorization = 'Bearer ' + token;
        }

        $.ajax({
            type: 'GET',
            url: 'https://localhost:44300/api/values',
            headers: headers
        }).done(function (data) {
            self.result(data);
        }).fail(showError);
    }

    self.register = function () {
        self.result('');

        var data = {
            Email: self.registerEmail(),
            Password: self.registerPassword(),
            ConfirmPassword: self.registerPassword2(),
            FirstName: self.firstName(),
            LastName: self.lastName()
        };

        $.ajax({
            type: "POST",
            url: 'https://localhost:44300/api/Account/Register',
            contentType: 'application/json; charset=utf-8',
            data: JSON.stringify(data)
        }).done(function (data) {
            self.result("Done!");
            toastr.success('Możesz się teraz zalogować.', 'Rejestracja przebiegła pomyślnie');
        }).fail(function () {
            toastr.error('Nieprawidłowe hasło.', 'Błąd');
        });
    }

    self.login = function () {
        self.result("");

        var loginData = {
            grant_type: "password",
            username: self.loginEmail(),
            password: self.loginPassword()
        };

        $.ajax({
            type: "POST",
            url: 'https://localhost:44300/Token',
            data: loginData
        }).done(function (data) {
            self.user(data.userName);
            self.loggedIn(true);
            // Cache the access token in session storage.
            localStorage.setItem(tokenKey, data.access_token);
            app.current("TaskList-nc");
        }).fail(function () {
            toastr.error('Błędny login lub hasło.', 'Błąd');
        });
    }

    self.logout = function () {
        self.user("");
        self.loggedIn(false);
        localStorage.removeItem(tokenKey);
        app.current("Login-nc")
    }
}