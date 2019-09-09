const http = require('http');
const formidable = require('formidable');
const fs = require('fs');
const express = require('express')
const app = express();
const server = http.Server(app);

const AWS = require('aws-sdk');
/*AWS.config.update({
    accessKeyId: "AKIAI7PZANJNHHKMEZCA",
    secretAccessKey: "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"
});*/
//var thumb = require('node-thumbnail').thumb;


server.listen(8888);

let startingTime;


app.get("/", function (req, res) {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write('<form action="fileupload" method="post" enctype="multipart/form-data">');
    res.write('<input type="file" name="filetoupload"><br>');
    res.write('<input type="submit">');
    res.write('</form>');
    return res.end();
})


app.post("/fileupload", function (req, res) {

    startingTime = new Date().getTime()

    var form = new formidable.IncomingForm();

    form.parse(req, function (err, fields, files) {
        if (err) {
            console.log("Error" + err);
            res.end("File parse Error");
            return
        }

        const uploadingTime = new Date().getTime();
        console.log("Time Taken to upload on server " + (uploadingTime - startingTime));

        uploadToS3(res)

    })
});


function uploadToS3(res) {
    const bucketName = "pigeondata";
    const keyName = makeid() + ".jpg";

    const objectParams = {Bucket: bucketName, Key: keyName, Body: "Hahahha"};
    const uploadPromise = new AWS.S3({apiVersion: '2006-03-01'}).putObject(objectParams).promise();

    uploadPromise.then(
        function (data1) {
            const d = new Date();
            const n = d.getTime();
            const result = "Successfully uploaded  key -" + keyName + " " + (n - startingTime);
            console.log(result);
            res.end("Uploaded with thumb")
        }).catch(function (e) {

        console.log("Upload Error" + e);
        res.end("Upload Error")
    });

}


function makeid() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < 5; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}


function download() {
    var s3 = new AWS.S3();
    var s3Params = {
        Bucket: bucketName,
        Key: 'path/to/the/file.ext'
    };
    s3.getObject(s3Params, function (err, res) {
        if (err === null) {
            res.attachment('file.ext'); // or whatever your logic needs
            res.send(data.Body);
        } else {
            res.status(500).send(err);
        }
    });
}


/*thumb({
  source: newpath, // could be a filename: dest/path/image.jpg
  destination:'C:/Users/Coder Boy/pigeon/uploads/thumbs' ,
  concurrency: 4,
  width: 70,
}, function(files, err, stdout, stderr) {
  console.log('All done!');
  upload(res,newpath)

});*/