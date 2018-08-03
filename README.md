# ZBudgeT
ZBudget was made to help facilitate budget and reimbursement management for the MIT Zeta Beta Tau fraternity. It is a web interface built on the Express framework and backed by MongoDB.

## Table of Contents
- [ZBudgeT](#zbudget)
    - [Table of Contents](#table-of-contents)
    - [Get Started](#get-started)
    - [Developer Documentation](#developer-documentation)
        - [Root Project Structure (*./*)](#root-project-structure)
        - [Controllers Folder (*./controllers*)](#controllers-folder-controllers)
        - [Middlewares Folder (*./middlewares*)](#middlewares-folder-middlewares)
        - [Models Folder (*./models*)](#models-folder-models)
        - [Public Folder (*./public*)](#public-folder-public)
        - [Resources Folder (*./resources*)](#resources-folder-resources)
        - [Test Folder (*./test*)](#test-folder-test)
        - [Views Folder (*./views*)](#views-folder-views)

## Get Started
1. Clone the repo from Github:
 ```
 git clone https://github.com/TypingKoala/ZBudgeT.git
 ```
2. Create your .env file or set your environment variables as follows. Fill in the appropriate API keys and URLs:
```
# Required
mongoDev=<MongoDB Connection String for Development Colllection>
mongoProd=<MongoDB Connection String for Production Collection>

# MIT OIDC Secrets for MIT OIDC Login
oidc_client_id=<OIDC Client ID>
oidc_client_secret=<OIDC Client Secret>

# For Session Persistance via MongoStore
mongoStoreSecret=<Generate a random string>

# Only Necessary for Local Logins
reCaptchaSiteKey=<Site Key from Google ReCaptcha>
reCaptchaSecret=<Secret from Google ReCaptcha>

# Only Necessary for Password Resets
mailgunKey=<Mailgun API Key>
mailgunDomain=<Mailgun Domain>
resetAddress=http://<domainname.com:3000>
```

[MongoDB Connection Strings](https://docs.mongodb.com/manual/reference/connection-string/)

[MIT OpenID Connect Pilot](https://oidc.mit.edu/)

[Google ReCaptcha Developer Documentation](https://developers.google.com/recaptcha/intro)

[Mailgun Documentation](https://documentation.mailgun.com/en/latest/)

3. Install the dependencies:
```
npm install
```

4. Start the server:
```
npm start
```
- For development work, consider using [nodemon](https://github.com/remy/nodemon).
- For production use, consider using [forever](https://github.com/foreverjs/forever).

## Developer Documentation
If you will be using this project for your own purposes, you will need to make some changes to the code. I have outlined below the purpose of each file in the code.

### Root Project Structure (*./*)
```
├── app.js
├── controllers
├── LICENSE.md
├── middlewares
├── models
├── package-lock.json
├── package.json
├── public
├── README.md
├── resources
├── test
└── views
```
- **app.js**: the main NodeJS file of the project
    - Contains server port number, ExpressJS initialization, render engine (Pug) initialization, connecting the 'controllers' router, and starting the server
- **[controllers](#controllers-folder-controllers)**: folder for application functionality
- **LICENSE<span></span>.md]**: MIT License file
- **[middlewares](#middlewares-folder-middlewares)**: folder for ExpressJS middleware
- **[models](#models-folder-models)**: folder for MongoDB models
- **package-lock.json & package.json**: npm package files
- **[public](#public-folder-public)**: folder for public assets
- **README<span></span>.md**: the documentation you are currently reading
- **[resources](#resources-folder-resources)**: folder for general application templates/resources
- **[test](#test-folder-test)**: folder for tests
- **[views](#views-folder-views)**: folder for Pug templates

### Controllers Folder (*./controllers*)
This folder contains Javascript files that control the application's functionality. 
```
├── api.js
├── budgets.js
├── home.js
├── index.js
├── passwordreset.js
├── reports.js
├── roles.js
├── settings.js
├── signin.js
├── signup.js
├── spending.js
└── toggles.json
```
- **index.js**: contains the main application Router and Passport.js functionality
    - Initializes Mongoose from the middlewares folder
    - Initializes feature-toggles
    - Initializes express-flash
    - Initializes body-parser
    - Initializes express-session and MongoStore
    - Initializes Passport.js with LocalStrategy and OpenID Connect (OIDC) Strategy based on Feature Toggles
    - Initializes Passport.js seralizeUser and deseralizeUser methods
    - Starts Static Server in folder "./public"
    - Routes traffic to other controllers
    - Implements '/signout' functionality with Passport.js
    - Catches 404 and 500 errors

### Middlewares Folder (*./middlewares*)

### Models Folder (*./models*)

### Public Folder (*./public*)

### Resources Folder (*./resources*)

### Test Folder (*./test*)

### Views Folder (*./views*)

