# ZBudgeT
ZBudget was made to help facilitate budget and reimbursement management for the MIT Zeta Beta Tau fraternity. It is a web interface built on the Express framework and backed by MongoDB.

## Table of Contents
- [ZBudgeT](#zbudget)
    - [Table of Contents](#table-of-contents)
    - [Get Started](#get-started)
    - [Developer Documentation](#developer-documentation)
        - [Structure](#structure)

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
Below, I will outline the core functions and the project structure.
### Structure
```
├── app.js
├── app.yaml
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
    - Contains server port number, ExpressJS initialization, Body Parser Initialization

