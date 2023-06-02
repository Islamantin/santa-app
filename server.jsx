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

const transporter = nodemailer.createTransport({
  host: "smtp.ethereal.email",
  port: 587,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// changed to internal express middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(express.static("dist"));
app.use(express.json());
app.use(morgan("dev"));

app.get("/", (req, res) => {
  fs.readFile(path.resolve("./index.html"), "utf8", (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).send("An error occurred");
    }
    return res.send(
      data.replace(
        '<div id="root">',
        `<div id="root">${ReactDOMServer.renderToStaticMarkup(
          <App />
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

app.post("/", (req, res) => {
  console.log(req.body);
  const data = req.body;
  const mail = { ...mailInfo };
  mail.subject += " from " + data.username;
  mail.text = `${data.username}\n ${data.address}\n ${data.wish}`;
  cron.schedule("*/15 * * * * *", () => {
    transporter.sendMail(mail, (error, info) => {
      if (error) {
        console.error("Error:", error);
      } else {
        console.log("Email sent:", info.response);
      }
    });
  });
  res.json(mail);
});

const listener = app.listen(process.env.PORT || 3000, function () {
  console.log("Your app is listening on port " + listener.address().port);
});
