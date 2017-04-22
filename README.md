# Help Expat Berlin

Thinkful (https://www.thinkful.com/) second portfolio project.

## Technology

<img src="https://raw.githubusercontent.com/NicolasMachado/Help-Expat-Berlin/master/views/images/icons/html5.png" height="40px" alt="HTML5" title="HTML5" /> <img src="https://raw.githubusercontent.com/NicolasMachado/Help-Expat-Berlin/master/views/images/icons/css3.png" height="40px" alt="CSS3" title="CSS3" /> <img src="https://raw.githubusercontent.com/NicolasMachado/Help-Expat-Berlin/master/views/images/icons/javascript.png" height="40px" alt="Javascript" title="Javascript" /> <img src="https://raw.githubusercontent.com/NicolasMachado/Help-Expat-Berlin/master/views/images/icons/ajax.png" height="40px" alt="Ajax" title="Ajax" /> <img src="https://raw.githubusercontent.com/NicolasMachado/Help-Expat-Berlin/master/views/images/icons/jquery.png" height="40px" alt="jQuery" title="jQuery" /> <img src="https://raw.githubusercontent.com/NicolasMachado/Help-Expat-Berlin/master/views/images/icons/jqueryui.png" height="40px" alt="jQuery UI" title="jQuery UI" /> <img src="https://raw.githubusercontent.com/NicolasMachado/Help-Expat-Berlin/master/views/images/icons/nodejs.png" height="40px" alt="Node JS" title="Node JS" /> <img src="https://raw.githubusercontent.com/NicolasMachado/Help-Expat-Berlin/master/views/images/icons/express.png" height="40px" alt="Express" title="Express" /> <img src="https://raw.githubusercontent.com/NicolasMachado/Help-Expat-Berlin/master/views/images/icons/mongodb.png" height="40px" alt="Mongo DB" title="Mongo DB" /> <img src="https://raw.githubusercontent.com/NicolasMachado/Help-Expat-Berlin/master/views/images/icons/socketio.png" height="40px" alt="Socket IO" title="Socket IO" />

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

# The sections

## Main list

<img src="https://content.screencast.com/users/zeroots/folders/Jing/media/b4fadfb4-360f-468a-b342-997fc9085126/2017-04-04_2222.png" />

## Request creation form

This section is where users can create new requests.

<img src="https://content.screencast.com/users/zeroots/folders/Jing/media/79e45c5c-9308-412d-a38f-c5c4c77a363b/2017-04-04_2225.png" />

## Profile / Requests section

In this section of the user profile dashboard, users can check the requests they have posted, accept help from users, delete their
requests or close them

<img src="https://content.screencast.com/users/zeroots/folders/Jing/media/61c73e0e-43f5-499a-95e7-b550dbb1f392/2017-04-04_2226.png" />

## Profile / Services section

The services section of the user profile dashboard lets users check the services they have either proposed on provided. They can revoke
their help or rate a requester back when the request is closed.

<img src="https://content.screencast.com/users/zeroots/folders/Jing/media/d76e5fd6-8793-4887-8614-c1ac73c65396/2017-04-04_2228.png" />

## Profile / Messages section

The messages section is where user can interact once the requester has accepted another user's help. It is a LIVE chat, thanks to the use
of a socket. If the receiver is not in the chat room, he gets alerted in the main interface.

<img src="https://content.screencast.com/users/zeroots/folders/Jing/media/9ece2834-2ec5-4aff-bc9e-d4c3d396e4d9/2017-04-04_2229.png" />

## Profile / Ratings section

This is where a user can check the ratings he received.

<img src="https://content.screencast.com/users/zeroots/folders/Jing/media/0c2e5585-12ff-41ae-b241-22f82941dc9a/2017-04-04_2230.png" />
