#! /bin/bash
sudo cp /home/ubuntu/webapp/webapp.service /etc/systemd/system
##add exceutable permissions to express app
sudo chmod +x /home/ubuntu/webapp
##Allows any users to write the app folder. Useful if using fs within the app
sudo chmod go+w /var/www/webapp
##Launches the express app
sudo npx kill-port 8080

cd /home/ubuntu/webapp/

# sudo nohup node webapp.js > /dev/null 2> /dev/null < /dev/null &
sudo node webapp.js > /home/ubuntu/webapp/services/applogs/runninglog.log 2> /home/ubuntu/webapp/services/applogs/runninglog.log &

echo "starting application on 8080"