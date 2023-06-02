# Santa App
Simple Node.js + React server app to send automated emails to Santa.
Original Glitch repo with rules of assignment: https://glitch.com/~js-santa-app

## How to run
1. Run `npm install` in CLI to install all required packages.
2. Create a .env file and add environment variables with your email authorisation credentials: 
    `EMAIL_USER = *******@****.****`
    `EMAIL_PASS = *******`
3. Type `npm run start` in CLI and wait for the build and deployment to complete.
4. Navigate `http://localhost:3000` into the browser.

## Operation description
A GET request renders view on the server side and sends it to the client.
There, the view is hydrated and can be processed by React as a normal node tree. 
The user enters data into the form in the view. This data is getting checked for presence in the resources:
- https://raw.githubusercontent.com/alj-devops/santa-data/master/userProfiles.json
- https://raw.githubusercontent.com/alj-devops/santa-data/master/users.json
The data is then validated and shaped with additional fields into the object required for sending the email.
Through the POST request data is sent back to the server, where the scheduler starts sending emails with it via smtp server every 15 seconds.
If there is no error, the email content is sent back to the client, where the user will be informed of the success in the view.

## Dependencies
- **Express** and **React** libs were used with no change. 
- **axios** has been added for making AJAX client-side requests.
- On the server side, **nodemailer** was added as a email transporter.
- **node-cron** is responsible for scheduling the emails sending.
- Additionally **esbuild** is used for bundling server and React component scripts.
  (cf. script commands in `package.json`)

  ## Contact details
  islamantin@gmail.com
  https://www.linkedin.com/in/islamantin/