var express = require('express');
// var fs = require('fs');
// var path = require('path');
var router = express.Router();
var multer = require('multer');
var mongoose = require('mongoose');

var crudSchema = require('../schema/crudSchema')

let crud = mongoose.model('crud', crudSchema);

var AWSMock = require('mock-aws-s3');
AWSMock.config.basePath = './tmp/buckets'
// var s3 = AWSMock.S3({
//     params: { Bucket: 'poc' }
// });

var s3 = AWSMock.S3();

// Multer ships with storage engines DiskStorage and MemoryStorage
// And Multer adds a body object and a file or files object to the request object. The body object contains the values of the text fields of the form, the file or files object contains the files uploaded via the form.
var storage = multer.memoryStorage();
//var upload = multer({ storage: storage });

const multer_single_file = multer({ storage: storage }).single('file');

// var fileStream = fs.createReadStream(file);
// fileStream.on('error', function(err) {
//   console.log('File Error', err);
// });
// uploadParams.Body = fileStream;
// var path = require('path');
// uploadParams.Key = path.basename(file);

// // call S3 to retrieve upload file to specified bucket
// var uploadParams = {Bucket: 'poc', Key: '', Body: ''};
// var file = process.argv[3];


/* add crud */
router.post('/addCrud', function (req, res) {
    multer_single_file(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            // A Multer error occurred when uploading.
            console.error(err);
            res.sendStatus(500);
            return;
        } else if (err) {
            // An unknown error occurred when uploading.
            console.error(err);
            res.sendStatus(500);
            return;
        }

        // call S3 to retrieve upload file to specified bucket
        var uploadParams = {
            Bucket: 'profile_img',
            Key: '',
            Body: ''
        };

        var file = req.file;
        const crud_data = JSON.parse(req.body.crud_data);

        // Configure the file stream and obtain the upload parameters

        // var fileStream = fs.createReadStream(file);
        // fileStream.on('error', function (err) {
        //     console.log('File Error', err);
        // });
        if (file != null || file != undefined) {
            uploadParams.Body = file.buffer;
            uploadParams.Key = file.originalname;
        }
        // call S3 to retrieve upload file to specified bucket
        s3.upload(uploadParams, function (err, data) {
            if (err) {
                console.log("Error", err);
                res.status(400).json({ success: false, message: err })
            } if (data) {
                console.log(data)
                console.log("Upload Success", data.Location);

                // Save data
                crudSchemaData = new crud({
                    firstName: crud_data.firstName,
                    lastName: crud_data.lastName,
                    address: crud_data.address,
                    city: crud_data.city,
                    pincode: crud_data.pincode,
                    image: file.originalname
                })
                crudSchemaData.save((err, succ) => {
                    if (err) {
                        res.status(400).json({ success: false, message: err })
                    }
                    else {
                        res.status(200).json({ success: true, message: "Crud data Saved Successfully", data: succ })
                    }
                })
            }
        });
    })
});

/* get crud */
router.get('/getCrud', function (req, res) {
    crud.find({ "isDeleted": false }, (err, succ) => {
        if (err) {
            res.status(400).json({ success: false, message: err })
        }
        else {
            //console.log(succ);

            var succ_data = [];
            // var params = {
            //     Bucket: "profile_img",
            //     Key: item.image
            // };
            // s3.getObject(params, function (err, data) {
            //     if (err) console.log(err, err.stack);
            //     else {
            //         console.log(data);
            //     }

            // });

            succ.forEach(currentItem => {
                succ_data.push(currentItem);
            })

            console.log(succ_data);


            res.status(200).json({ success: true, message: "Crud Data Found Successfully", data: succ_data })
        }
    })
});

/* update crud */
router.post('/updateCrud', function (req, res) {
    multer_single_file(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            // A Multer error occurred when uploading.
            console.error(err);
            res.sendStatus(500);
            return;
        } else if (err) {
            // An unknown error occurred when uploading.
            console.error(err);
            res.sendStatus(500);
            return;
        }

        // call S3 to retrieve upload file to specified bucket
        var uploadParams = {
            Bucket: 'profile_img',
            Key: '',
            Body: ''
        };

        var update_file = req.file;
        const crud_data = JSON.parse(req.body.crud_data);

        // Configure the file stream and obtain the upload parameters

        // var fileStream = fs.createReadStream(file);
        // fileStream.on('error', function (err) {
        //     console.log('File Error', err);
        // });
        if (update_file != null || update_file != undefined) {
            uploadParams.Body = update_file.buffer;
            uploadParams.Key = update_file.originalname;
        }
        // call S3 to retrieve upload file to specified bucket
        s3.upload(uploadParams, function (err, data) {
            if (err) {
                console.log("Error", err);
                res.status(400).json({ success: false, message: err })
            } if (data) {
                console.log(data)
                console.log("Upload Success", data.Location);

                // update data
                let to_update = {
                    firstName: crud_data.firstName,
                    lastName: crud_data.lastName,
                    address: crud_data.address,
                    city: crud_data.city,
                    pincode: crud_data.pincode,
                    image: update_file.originalname
                }

                crud.updateOne(
                    {
                        _id: req.body.id
                    },
                    {
                        $set: to_update,
                    },
                    {
                        $upsert: true,
                        $multi: true
                    },
                    (err, updateResult) => {
                        if (err) {
                            res.status(400).json({ success: false, message: err })
                        }
                        else {
                            res.status(200).json({ success: true, message: "Crud Data updated Successfully", data: updateResult })
                        }
                    })
            }
        });
    })
});

/* delete crud */
router.post('/deleteCrud', function (req, res) {
    crud.deleteOne({ _id: req.body.id }, (err, deleteResult) => {
        if (err)
            res.status(400).json({ success: false, message: err })
        else {
            //delete image from bucket
            var params = {
                Bucket: "profile_img",
                Key: req.body.imgKey
            };
            s3.deleteObject(params, function (err, data) {
                if (err) {
                    console.log(err, err.stack); // an error occurred
                    res.status(400).json({ success: false, message: err })
                }
                else {
                    console.log(data)
                    res.status(200).json({ success: true, message: "Crud Data deleted Successfully", data: deleteResult })
                };
            });
        }
    });
});

module.exports = router;
