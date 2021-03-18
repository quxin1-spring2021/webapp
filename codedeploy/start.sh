#! /bin/bash
cp /var/www/webapp/webapp.service /etc/systemd/system
##add exceutable permissions to express app
sudo chmod +x /var/www/webapp/webapp.js
##Allows any users to write the app folder. Useful if using fs within the app
sudo chmod go+w /var/www/webapp
##Launches the express app
sudo npx kill-port 8080
sudo systemctl daemon-reload
sudo systemctl start webapp
sudo systemctl enable webapp