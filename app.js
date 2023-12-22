import express from "express";
import https from "https";
import fs from "fs";
import path from "path";
import indexRouter from "./routes/index.js";
import HttpError from "http-errors";
import authorization from "./middlewares/authorization.js";
import errorHandler from "./middlewares/errorHandler.js";
import cors from "./middlewares/cors.js";
import scheduler from './helper/scheduler.js';

const app = express();

app.use(cors);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.resolve('public')));

app.use(authorization)

app.use(indexRouter)

app.use((req, res, next) => {
  next(HttpError(404))
})

app.use(errorHandler)

scheduler.startScheduledTasks();

/*const httpsOptions = {
  key: fs.readFileSync('public/key.pem'),
  cert: fs.readFileSync('public/cert.pem'),
};*/

//const server = https.createServer(httpsOptions, app);

app.listen(4000, () => {
  console.log('Server started...');
})
