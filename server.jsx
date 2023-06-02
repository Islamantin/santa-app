import React from "react";
import express from "express";
import path from "path";
import morgan from "morgan";
import App from "./src/views/App";
import ReactDOMServer from "react-dom/server";
import nodemailer from "nodemailer";
import cron from "node-cron";
import fs from "fs";

const app = express();

// setting up email transporter
const transporter = nodemailer.createTransport({
  host: "smtp.ethereal.email",
  port: 587,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// appying needed middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan("dev"));
// making those folders avaliable for client
app.use(express.static("public"));
app.use(express.static("dist"));

// get request
app.get("/", (req, res) => {
  // reading original html file to render react component on it
  fs.readFile(path.resolve("./index.html"), "utf8", (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).send("An error occurred");
    }
    // sending rendered html to the client
    return res.send(
      data.replace(
        '<div id="root">',
        `<div id="root">${ReactDOMServer.renderToStaticMarkup(
          <App />
          // note the addition of an extra script to run on the client
        )}</div><script src="bundle.js"></script>`
      )
    );
  });
});

const mailInfo = {
  from: "do_not_reply@northpole.com",
  to: "santa@northpole.com",
  subject: "Christmas wish",
};

// post request
app.post("/", (req, res) => {
  console.log(req.body);
  const data = req.body;
  // if data is invalid send back "Bad Request"
  if (!data.username && !data.address && !data.wish) {
    res.sendStatus(400);
    res.json({
      error: "Invalid data",
      message: "The data you submitted is not in the correct format.",
    });
    return;
  }
  // forming email contents
  const mail = { ...mailInfo };
  mail.subject += " from " + data.username;
  mail.text = `${data.username}\n ${data.address}\n ${data.wish}`;
  // set up scheduller to send email every 15 seconds
  cron.schedule("*/15 * * * * *", () => {
    transporter.sendMail(mail, (error, info) => {
      if (error) {
        console.error("Error:", error);
      } else {
        console.log("Email sent:", info.response);
      }
    });
  });
  // sending back email data
  res.json(mail);
});

const listener = app.listen(process.env.PORT || 3000, function () {
  console.log("Your app is listening on port " + listener.address().port);
});
