#! /bin/bash
cd /home/ubuntu
pwd
ls -al
cd /home/ubuntu/webapp
pwd
ls -al
sudo npm install
echo 'RDS_HOSTNAME = ${RDS_HOSTNAME}' > /home/ubuntu/webapp/.env
echo 'RDS_USERNAME = ${RDS_USERNAME}' >> /home/ubuntu/webapp/.env
echo 'RDS_PASSWORD = ${RDS_PASSWORD}' >> /home/ubuntu/webapp/.env
echo 'RDS_DATABASE = $RDS_DATABASE' >> /home/ubuntu/webapp/.env
echo 'RDS_PORT = $RDS_PORT' >> /home/ubuntu/webapp/.env
echo 'BUCKET_NAME = $BUCKET_NAME' >> /home/ubuntu/webapp/.env