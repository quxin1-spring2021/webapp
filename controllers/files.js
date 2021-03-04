const db = require("../models");
const File = db.file;
const AWS = require('aws-sdk');
const UUID = require('uuid/v4');
const Busboy = require('busboy')
const S3 = new AWS.S3();

module.exports.addImage = async (req, res) => {

    let image = {
    }

    let chunks = [], fname, ftype, fEncoding;
    let busboy = new Busboy({ headers: req.headers });
    busboy.on('file', function (fieldname, file, filename, encoding, mimetype) {
        console.log('File [' + fieldname + ']: filename: ' + filename + ', encoding: ' + encoding + ', mimetype: ' + mimetype);
        fname = filename.replace(/ /g, "_");
        ftype = mimetype;
        fEncoding = encoding;
        file.on('data', function (data) {
            // you will get chunks here will pull all chunk to an array and later concat it.
            // console.log (chunks.length);
            chunks.push(data)
        });



        file.on('end', function () {
            console.log('File [' + filename + '] Finished');
        });
    });

    busboy.on('finish', function () {
        const userId = UUID();
        const params = {
            Bucket: 'webapp.xin.qu', // your s3 bucket name
            Key: `${userId}/${fname}`,
            Body: Buffer.concat(chunks), // concatinating all chunks
            ContentType: ftype // required
        }
        // we are sending buffer data to s3.
        S3.upload(params, (err, s3res) => {
            if (err) {
                res.send({ err, status: 'error' });
            } else {

                image.file_name = fname;
                image.s3_object_name = params.Key;
                image.file_id = userId;
                image.user_id = req.user.id;

                let created = false;
                let existed = false;

                // check if this book is created
                await File.findOne(
                    {
                        where: {
                            file_name: image.file_name,
                        }
                    })
                    .then(num => {
                        if (num && num.length !== 0) {
                            existed = true;
                            res.status(400).send({
                                message: "This image has been created."
                            });
                        }
                    })
                if (!existed) {
                    // Save Book in the database
                    await File.create(image)
                        .then(data => {
                            created = true;
                        })
                        .catch(err => {
                            res.status(400).send({
                                message:
                                    err.message || "Some error occurred while uploading image."
                            });
                            return;
                        });
                }

                if (created) {
                    const newImage = await File.findOne(
                        {
                            raw: true,
                            where: {
                                file_id: image.file_id,
                            }
                        });
                    res.status(201).send(newImage);
                }
            }

            // res.send({ data: s3res, status: 'success', msg: 'Image successfully uploaded.' });
        }
        )}
    )
    req.pipe(busboy);
}


module.exports.deleteImage = async (req, res) => {

}





// const uploadFile = (file) => {
//     // Read content from the file
//     const fileContent = fs.readFileSync(file);

//     // Setting up S3 upload parameters
//     const params = {
//         Bucket: process.argv[2],
//         Key: '', // File name you want to save as in S3
//         Body: fileContent
//     };

//     params.Key = path.basename(file);

//     // Uploading files to the bucket
//     s3.upload(params, function(err, data) {
//         if (err) {
//             throw err;
//         }
//         console.log(`File uploaded successfully. ${data.Location}`);
//     });
// };

// const deleteFile =  (file) => {
//     var params = {
//         Bucket: process.argv[2],
//         Key: ''
//      };

//          params.Key = path.basename(file);

//      s3.deleteObject(params, function(err, data) {
//        if (err) console.log(err, err.stack); // an error occurred
//        else   {
//           console.log(`File deleted successfully.`);
//        }            // successful response
//        /*
//        data = {
//        }
//        */
//      });
//   }
