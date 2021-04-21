# Books Management Web Application
This is a Web Application uses technology stack that meets Cloud Native Web Application Requirements.
This Application is designed to be use with whole infrastructures on AWS, AWS Lambda functions and GitHub Actions.
- PS: This application is not designed to run locally.
## Features
You can create users, who can make CRUD operations on books and manage images for books they created.

If you don't have a account or not a user, you can also get the information of all books in the database, or information of a specific book if you query with its book ID.

This application offer you 8 APIs. APIs marked with **Auth** means you need to configure Authorization to get right responses. The authorization type this application uses is Basic Auth.

### User
- `POST ​/v1​/user​`  
Create a new user.
Body attributes: 
    - username **should be a valid email address.**
    - password **should use a strong password**
    - first_name 
    - last_name


- **Auth** `GET ​/v1​/user​/self` 
Get information of current user.

- **Auth**`PUT ​/v1​/user​/self` 
Update information of current user.
Body attributes: 
    - password **should use a strong password**
    - first_name 
    - last_name

### Books
- `GET /books/` 
Get all books' information.

- `GET /books/:id` 
Get a book's information.

- **Auth**`POST /books/` 
Create a book with current user.
Body attributes: 
    - title 
    - author 
    - isbn 
    - published_date

- **Auth**`DELETE /books/:id` 
Delete a book under current user.

### Images
- **Auth**`POST /books/:id/image/` 
Add a image under a book.
  - **PS:** To send this request, use Postman Desktop as example, in Body section, choose `form-data` tab, set key as `file`, then you can upload a image file in your device.

- **Auth**`DELETE /books/:id/image/:imageId` 
Delete a image under a book.

---

### Tech Stack used:
Node.js
Express
MySQL
Mocha

### AWS Components used:
EC2 Instances, Security Groups, AMI, Auto Scaling, Load Balancer
IAM
RDS
S3
DynamoDB
VPC
CodeDeploy Logging, Metrics
Route 53
Lambda
SNS
SES
Certificate Manager

----

### Verify SSL connections between RDS and Web Application.
Edit in-bound rule in the security group of webapp, add ingress port 22 to allow SSH connection, then SSH into the instance.
After SSH into instance, install MySQL server use command below:
```
sudo apt update
sudo apt install mysql-server
```
After MySQL server installed, modify command below with your RDS endpoint and username you set when creating the RDS instance infrastructure. 3306 is default port for MySQL. You need to input your database password after run the command to log into the RDS server.
```
mysql -h mysql–instance1.123456789012.us-east-1.rds.amazonaws.com -P 3306 -u mymasteruser -p
```
Connected RDS Database in MySQL CLI, run `status` command to check Encryption Status.