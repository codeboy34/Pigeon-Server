
var router = require('express').Router()
var firebase_admin = require("../util/firebase-admin.js")
var AWS = require('aws-sdk');



function uploadToS3() {
    var bucketName = "pigeondata"
    var keyName = makeid() + ".jpg"

    console.log("Uploding file to s3")


    var objectParams = { Bucket: bucketName, Key: keyName, Body: "Hello world" };
    var uploadPromise = new AWS.S3({ apiVersion: '2006-03-01' }).putObject(objectParams).promise();

    uploadPromise.then(
        function (data1) {
            console.log(data1 + "Uploaded suc")
        }).catch(function (e) {

            console.log("Upload Error" + e)

        });


}
function makeid() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < 5; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}


uploadToS3()

let x = `hello 
hello `

