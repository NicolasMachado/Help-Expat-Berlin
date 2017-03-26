# Help Expat Berlin


## Description
help-expat-berlin is a website that lets users obtain or provide help to each others, especially for administrative
tasks, or anything that poses a language barrier issue to foreigners in Berlin.

Users can post requests and decide if they are willing to offer a price or not for the required service. Other users
can then propose their help for said request. The requester then gets to choose which users can help him, depending on
their ratings. If he accepts the help of a user, both parties are put in contact through the message section.

Once the help is provided, the requester can select which user helped him and close the request. Once done, both parties
can rate each others out of 5 and optionnally leave a comment.
The ratings are public. They are a way to screen potential abuse.

## To work on the project locally:
- Install node
- Install mongo
- Run npm install
- Copy the config.js file from the config/ folder into a config/local folder
- In the file you've just created, set DATABASE_URL to your local database
- Create a FB app for FB login
- Set FACEBOOKAUTH clientID, clientSecret, callbackURL as well in your local config file
- Run node server.js
- Run mongod
- The website should be available at the following address: http://127.0.0.1:8080/