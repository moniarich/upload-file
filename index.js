const { v4 } = require("uuid");
const fs = require("fs");
const {
  pipe,
  gotenberg,
  convert,
  html,
  please,
} = require("gotenberg-js-client");
const bb = require("express-busboy");

const express = require("express");

const cors = require("cors");
const AWS = require("aws-sdk");

const app = express();
const port = process.env.PORT || 3001;
const gotenberUrl = process.env.GOTENBERG_URL || "http://localhost:8000";
const s3 = new AWS.S3({
  accessKeyId: process.env.ACCESS_KEY_ID || "",
  secretAccessKey: process.env.SECRET_ACCESS_KEY || "",
});
const publicDir = "./public";

/*
 const acceptedExtension = {
        doc: true,
        docm: true,
        docx: true,
        dot: true,
        dotx: true,
        html: true,
        htm: true,
        mht: true,
        mhtml: true,
        odt: true,
        txt: true,
        xml: true,
      };
*/
const acceptedExtension = {
  "application/msword": true,
  "text/html": true,
  "application/vnd.ms-word.document.macroEnabled.12": true,
  "xml/html": true,
  "text/plain": true,
  "application/vnd.openxmlformats-officedocument.wordprocessingml.template": true,
  "application/rtf": true,
  "application/vnd.openxmlformats-officedocument.presentationml.pr": true,
  "application/vnd.ms-powerpoint": true,
  "multipart/related application/x-mimearchive": true,
  "application/vnd.oasis.opendocum": true,
  "application/xml": true,
  "application/xhtml+xml": true,
  "text/xml": true,
};
bb.extend(app, {
  upload: true,
  path: publicDir,
  allowedPath: /./,
  //   mimeTypeLimit: [],
});
const toPDF = pipe(gotenberg(gotenberUrl), convert, html, please);
const frontendURL = process.env.FRONTEND_URL || "http://localhost:3000";

const corsOptions = {
  origin: frontendURL,
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  preflightContinue: true,
  credentials: true,
  optionsSuccessStatus: 204, // some legacy browsers (IE11, various SmartTVs) choke on 204
};

app.use(cors(corsOptions));

app.post("/upload", async (req, res) => {
  console.log(req.files);

  if (acceptedExtension[req.files.file.mimetype] !== true) {
    res.setHeader("content-type", "application/json");
    res.status(400).end(
      JSON.stringify({
        message: "The file extension you have entered is not supported",
      })
    );
    return;
  }

  const uploadedFileName = `${v4()}.pdf`;
  const file = fs.createReadStream(req.files.file.file);
  const pdf = await toPDF(file);
  const pdfPath = `${publicDir}/${uploadedFileName}`;

  const f = fs.createWriteStream(pdfPath);
  pdf.pipe(f);

  const uploadToS3 = async () => {
    const f2 = fs.createReadStream(pdfPath);

    await s3
      .putObject({
        Bucket: "monika-pdf-convert",
        Key: `${uploadedFileName}`,
        Body: f2,
      })
      .promise();

    const url = await s3.getSignedUrlPromise("getObject", {
      Bucket: "monika-pdf-convert",
      Key: `${uploadedFileName}`,
    });

    await fs.promises.rm(req.files.file.file);
    await fs.promises.rm(pdfPath);

    return url;
  };

  f.on("finish", async () => {
    try {
      const presignedUrl = await uploadToS3();

      res.setHeader("content-type", "application/json");

      res.send(
        JSON.stringify({
          message: "Your file was successful upload",
          presignedUrl,
        })
      );
    } catch (e) {
      console.error(e);
      res.status(500);
      res.send(
        JSON.stringify({
          message: "error",
        })
      );
    }
  });
});

(async () => {
  try {
    await fs.promises.mkdir(publicDir);
  } catch (e) {}

  app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
  });
})();
