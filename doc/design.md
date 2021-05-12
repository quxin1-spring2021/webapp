## AWS Services Used in this Project

### EC2 Instances, Security Groups, AMI, Auto Scaling, Load Balancer
Created Ubuntu Server 20.04 instances to serve the application.
#### Auto Scaling
Set Auto Scaling policies to auto scale up and down based on the average CPU utilization of instance.
#### Load Balancer
#### Security Groups
#### AMI

### IAM
Created IAM roles for GitHub Action, CodeDeploy, Instances and Databases. Created IAM policies to secure resources.
### RDS
Created relational database instance, store users and book data. Connections between RDS and EC2 instances are secured with SSL.
### S3
Created S3 buckets to store image files and artifacts for CodeDeploy to update Lambda funciton and web application.
### DynamoDB
Created to store published messages information to avoid duplicate operation emails sent.
### VPC
Created a Virtual Private Cloud which is a private network that isolates resources from public network.
### CloudWatch Logging, Metrics
Lambda, logging 
### CodeDeploy
Created CodeDeploy applications for application and lambda function, 
### Route 53
Created a host zone and records for APIs.
### SNS
Used AWS-SDK in the web application, publish messages when book is created or deleted, invoke Lambda function for further operations.
### Lambda
Created Lambda function to invoke Amazon SES to send notification emails to users.
### SES
Applied for Production Access to send notification emails to any users.
### Certificate Manager
Added third party SSL certification. Connections to Load Balancer use SSL to confirm security.