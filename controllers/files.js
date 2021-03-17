const db = require("../models");
const File = db.files;
const AWS = require('aws-sdk');
const UUID = require('uuid').v4;
const Busboy = require('busboy')
const S3 = new AWS.S3();

module.exports.addImage = async (req, res) => {

    const { id } = req.params;

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
            Bucket: process.env.BUCKET_NAME, // your s3 bucket name
            Key: `${userId}/${fname}`,
            Body: Buffer.concat(chunks), // concatinating all chunks
            ContentType: ftype // required
        }
        // we are sending buffer data to s3.
        S3.upload(params, async (err, s3res) => {
            if (err) {
                res.send({ err, status: 'error' });
            } else {

                image.file_name = fname;
                image.s3_object_name = params.Key;
                image.file_id = userId;
                image.user_id = req.user.id;
                image.book_id = id;

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
        )
    }
    )
    req.pipe(busboy);
}

module.exports.deleteImage = async (req, res) => {
    const { id, image_id } = req.params;

    let image = await File.findOne(
        {
            where: {
                file_id: image_id,
            }
        })

    if (!image) {
        res.status(404).send({
            message: `Cannot find the image with id: ${id}`
        })
        return;
    }

    if (image.user_id !== req.user.id) {
        res.status(401).send({
            message: `Unauthorized Action.`
        })
        return;
    }

    var params = {
        Bucket: 'webapp.xin.qu',
        Key: ''
    };

    if (image.book_id !== id) {
        res.status(404).send({
            message: `This image doesn't belong to this book.`
        })
        return;
    }

    params.Key = image.s3_object_name;

    await File.destroy(
        {
            where: {
                file_id: image_id,
            }
        }
    )

    image = await File.findOne(
        {
            where: {
                file_id: image_id,
            }
        })

    if (!image) {

        S3.deleteObject(params, function (err, data) {
            if (err) console.log(err, err.stack); // an error occurred
            else {
                console.log(`File deleted successfully.`);
            }
        });

        res.status(204).send({
            message: `Deleted.`
        });
    }
    return;

}
