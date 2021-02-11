# WebApp
Web Application using technology stack that meets Cloud Native Web Application Requirements.

This Assignment implementing backend APIs for the web application.

`GET ​/v1​/user​/self`
`PUT ​/v1​/user​/self`
`POST ​/v1​/user​`

## Build
Open terminal
run `npm install` to install dependencies;
run `node app.js` to start web application.

Open another terminal window to check **mysql** database;
run `mysql -u -root -p` then input password to enter mysql command line system;
run `USE TESTDB` to change database;
run `select * from users;` to check updates of users.

## Test
run `npm run test` on root directory.

Test APIs by sending requests via Postman.