# Help Expat Berlin

Thinkful (https://www.thinkful.com/) second portfolio project.

## Description
help-expat-berlin is a website that lets users obtain or provide help to each others, especially for administrative
tasks, or anything that poses a language barrier issue to foreigners in Berlin.

Users can post requests and decide if they are willing to offer a price or not for the required service. Other users
can then propose their help for said request. The requester then gets to choose which users can help him, depending on
their ratings. If he accepts the help of a user, both parties are put in contact through the message section.

Once the help is provided, the requester can select which user helped him and close the request. Once done, both parties
can rate each others out of 5 and optionnally leave a comment.
The ratings are public. They are a way to screen potential abuse.

## User interface

The website is designed to work on mobile, tablets and desktop. Its interface is meant to be simple and intuitive. Every
section is accessible within 3 clicks or less.

## Under the hood

* The frontend is built using HTML5, CSS, Javascript, JQuery, Jquery UI and AJAX. The backend uses Node, Express and MongoDB.
* The website is fully responsive, adapting for mobile, table and desktop viewports.
* Log in is made through the facebook authentication API and is handled using Passport in the backend.
* Sockets are used to allow real-time chat and real time messages notifications.
* A test suite containing 25 test cases is implemented. Most of them use SuperAgent to test logged in features.

## Test version

If you want to test the features of the website, head to https://help-expat-berlin.herokuapp.com/auth/account-login,
and log in with any of the test accounts.


## To work on the project locally:
* Install node
* Install mongo
* Run npm install
* Copy the config.js file from the config/ folder into a config/local folder
* In the file you've just created, set DATABASE_URL to your local database
* Create a FB app for FB login
* Set FACEBOOKAUTH clientID, clientSecret, callbackURL as well in your local config file
* Run node server.js
* Run mongod
* The website should be available at the following address: http://127.0.0.1:8080/

## The sections

# Main list

<img src="https://content.screencast.com/users/zeroots/folders/Jing/media/b4fadfb4-360f-468a-b342-997fc9085126/2017-04-04_2222.png" />