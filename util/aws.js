const AWS = require('aws-sdk');
const s3 = new AWS.S3();

AWS.config.update({
    accessKeyId: "AKIAI7PZANJNHHKMEZCA",
    secretAccessKey: "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"
});

const BUCKET_NAME = "pigeondata";


module.exports.download = function (avatarKey) {
    const s3Params = { Bucket: BUCKET_NAME, Key: avatarKey };
    return s3.getObject(s3Params).promise()
};

module.exports.uploadToS3= (avatar, key)=> {
    console.log("Uploading file to s3");
    const objectParams = { Bucket: BUCKET_NAME, Key: key, Body: avatar };
    return new AWS.S3({ apiVersion: '2006-03-01' }).putObject(objectParams).promise();
};


