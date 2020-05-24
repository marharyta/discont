# Discont Web App experiment

### Node.js based Web crawler for fashion online stores

N.B.:

\*\*Discont as an application was created by me a couple of years back in order to watch some discounts on the items online that I liked.

This service is not in use anymore and any update in this service will be made for solely educational purposes, you should read your customer agreement (part that mentions web scraping) before doing anything with it.\*\*

N.B. 2:
At the moment of creating this app I had no idea about shoptagr.com and how well they have implemented it! In case if you do want to watch some discounts you should opt for Shoptagr instead, since they do not use scraping but create integrations with shops.

Architecture
the project was started for two purposes:

experimentation and exploring
getting discount info (ahahaha)
The exploration part: I wanted to demonstrate the pattern of software development evolution from single file monolith system to single responsibility files and microservices and separation of front-end and back-end part to vertical decomposition. A lot of Node.js tutorials are showing very basic introduction to Node.js, yet fail to describe the natural progression of the application development.

The repository structure
Repository consists of several major branches:

master - this one, mostly docs
monolith-app-sample - zero module separation, the very first version of the application, minimum functionality
single-responsibility-files - application with separate files, devided by a single responsibility principle
json-web-token-authentification - (based on single-responsibility-files )an attempt to create JWT authentification instead of session-based (not finished for now)
3-layer-architecture - (based on single-responsibility-files + 3 tier architecture) -
How to use
monolith-app-sample

npx nodemon server.js

single-responsibility-files

npx nodemon server.js npx nodemon asosServer.js

Useful links
More inforation about web crawling / web scraping / etc.

Ideas: EJS templates: https://scotch.io/tutorials/use-ejs-to-template-your-node-application

Info here: https://medium.com/p/e6471942b43c/edit

Ideas: EJS templates: https://scotch.io/tutorials/use-ejs-to-template-your-node-application

Info here: https://medium.com/p/e6471942b43c/edit

More inforation about web crawling / web scraping / etc.

Ideas: EJS templates: https://scotch.io/tutorials/use-ejs-to-template-your-node-application

Info here: https://medium.com/p/e6471942b43c/edit

Tutorials:

https://scotch.io/tutorials/learn-to-use-the-new-router-in-expressjs-4

Authentification:

https://hackernoon.com/why-do-we-need-the-json-web-token-jwt-in-the-modern-web-k29l3sfd https://itnext.io/so-what-the-heck-is-jwt-or-json-web-token-dca8bcb719a6

// https://www.airpair.com/node.js/posts/top-10-mistakes-node-developers-make

// https://scotch.io/tutorials/use-ejs-to-template-your-node-application

// https://thecodebarbarian.com/sending-web-push-notifications-from-node-js.html
// for push notifications
// for email notifications
// https://thecodebarbarian.com/sending-web-push-notifications-from-node-js.html

// https://scotch.io/tutorials/build-and-understand-a-simple-nodejs-website-with-user-authentication

//postgresql
// https://itnext.io/production-ready-node-js-rest-apis-setup-using-typescript-postgresql-and-redis-a9525871407