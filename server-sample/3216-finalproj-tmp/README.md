cs3216-dest
===========
# Planendar (54.179.177.82)
===========

# Contributors
###Ho Tack Kian A0081229H ###
* Backend / Database Programmer
* Database Schema
* Facebook Events Pulling
* Welfare in-charge

### Ho Ze Wei Daryl A0110987Y ###
* Angular.js Programmer
* Agenda View
* Event & Tasks Creation/Update Page
* Chief tester. 

### Liew Chun Tze Eldric A0086591U ###
* Tanker (UI, Angular.js, Database),
* Week View
* Database Queries/Integration
* Controller Service
* Chief Debugger
* Team Leader

### Nguyen Quoc Dat A0116703N ###
* Angular.js Programmer
* Month View
* Task Bar Functions
* Drag & Drop Functionality
* Chief Entertainer

### Sim Shi Xian A0088244Y ###
* UI Designer
* Planning of layout and HTML/CSS implementation
* Facebook Plugins
* Project Manager


# Installation instructions:

## Requirements:
* mysql - you could try installing MySQL Community Server from http://dev.mysql.com/downloads/mysql/  
  * Alternatively (zip version)... refer to http://ts1-blackening.blogspot.sg/2014/07/installing-redmine.html, see step 4.
* node.js - grab from http://nodejs.org/ and install appropriate version.
  
## Setting up the env:
  Create an mysql account with the following:  
>  user     : 'desk_user',  
>  password : 'desk_password'  

Run new_database_script.sql and new_database_default_entries.sql.    

git clone this repo  
open a command window, nav to the directory  
npm install - this will install ALL dependencies.  
npm start OR node app.js  

navigate to localhost:8080

# For future implementers:

Please get familiar with the following:    

* Async-js - https://github.com/caolan/async    
   * You need this because just about everything in node.js is async.    
   * This makes your callback hell somewhat more manageable. Good luck writing async.parallel by yourself.    
* Bacon-js - https://github.com/baconjs/bacon.js    
   * This is used to pipe events around. Better than callback hell.    
   * The idea here is that your services emit events, which other services watch for and act on. I have defined eventStream to emit LOGIN events as a demonstration.    
* IssueControllerService - this literally binds the client together.   
   * If you see other developers doing this: event.attr = value, kill them for me (BlacKeNinG).
   
Also, if you see curry and you don't understand what it means, see: http://en.wikipedia.org/wiki/Currying    
If you still don't understand, let me explain. We are simply pre-applying function arguments.    
For example, suppose f = function(x,y) { ... } f.curry(10) essentially makes the function f(y), with x = 10 already defined.    
It makes the code somewhat tidier than    
function(y){ return f(10, y); }    
