# WebApp

demo2

Web Application using technology stack that meets Cloud Native Web Application Requirements.

This Assignment implementing backend APIs for the web application.

`GET ​/v1​/user​/self`

`PUT ​/v1​/user​/self`

`POST ​/v1​/user​`

`GET /books/`

`GET /books/:id`

`POST /books/`

`DELETE /books/:id`

## Prerequisites
You have installed **mysql** server on your machine, since the database of this application is based on mysql.

You have installed Node.js and npm.

## Build
Open terminal
run `npm install` to install dependencies;
run `node app.js` to start web application.

Open another terminal window to check **mysql** database;
run `mysql -u root -p` then input password to enter mysql command line system;
run `USE TESTDB` to change database;
run `select * from users;` to check all users.
run `select * from books;` to check books.

## Test
run `npm run test` on root directory.

Test APIs by sending requests via Postman.
