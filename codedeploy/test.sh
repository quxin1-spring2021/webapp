#! /bin/bash
cd /home/ubuntu
pwd
ls -al
cd aws-codedeploy/
pwd
ls -al
sudo npm install
sudo npx kill-port 8080
sudo node app.js