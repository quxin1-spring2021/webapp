const db = require("../models");
const File = db.files;
const Book = db.books;
const AWS = require('aws-sdk');
const UUID = require('uuid').v4;
const Busboy = require('busboy')
const S3 = new AWS.S3();
const logger = require("../services/applogs/applogs");
const client = require("../services/metrics/metrics");

module.exports.addImage = async (req, res) => {
    const apiStartTime = new Date();
    const { id } = req.params;

    let image = {
    }

    let book = await Book.findOne(
        {
            logging: (sql, queryTime) => {
                client.timing('SQL_FIND_BOOK', queryTime)
            },
            where: {
                id: id,
            }
        })

    if (!book) {
        res.status(404).send({
            message: `Cannot find the book with id: ${id}`
        })

        return;
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
        const s3StartTime = new Date();

        S3.upload(params, async (err, s3res) => {
            if (err) {
                res.send({ err, status: 'error' });
            } else {

                const s3CostTime = new Date() - s3StartTime;
                client.timing('S3_UPLOAD_time', s3CostTime);

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
                        logging: (sql, queryTime) => {
                            client.timing('SQL_FIND_IMAGE', queryTime)
                        },
                        where: {
                            file_name: image.file_name,
                            book_id: id
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
                    await File.create(image, {
                        logging: (sql, queryTime) => {
                            client.timing('SQL_CREATE_BOOK_TIME', queryTime)
                        }
                    })
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
                            logging: (sql, queryTime) => {
                                client.timing('SQL_FIND_IMAGE', queryTime)
                            },
                            where: {
                                file_id: image.file_id,
                            }
                        });

                    res.status(201).send(newImage);
                    logger.log({
                        level: 'info',
                        message: `created a new image, id: ${image.file_id}`
                    });
                    client.increment('POST_IMAGE_API');
                    const apiCostTime = new Date() - apiStartTime;
                    client.timing('POST_IMAGE_API_time', apiCostTime);
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
    const apiStartTime = new Date();
    const { id, image_id } = req.params;

    let image = await File.findOne(
        {
            logging: (sql, queryTime) => {
                client.timing('SQL_FIND_IMAGE', queryTime)
            },
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
        Bucket: process.env.BUCKET_NAME,
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
            logging: (sql, queryTime) => {
                client.timing('SQL_DELETE_IMAGE', queryTime)
            },
            where: {
                file_id: image_id,
            }
        }
    )

    image = await File.findOne(
        {
            logging: (sql, queryTime) => {
                client.timing('SQL_FIND_IMAGE', queryTime)
            },
            where: {
                file_id: image_id,
            }
        })

    if (!image) {

        const s3StartTime = new Date();
        S3.deleteObject(params, function (err, data) {
            if (err) console.log(err, err.stack); // an error occurred
            else {
                console.log(`File deleted successfully.`);
                const s3CostTime = new Date() - s3StartTime;
                client.timing('S3_DELETE_time', s3CostTime);
            }
        });

        res.status(204).send({
            message: `Deleted.`
        });
        logger.log({
            level: 'info',
            message: `deleted a image`
        });
        client.increment('DELETE_IMAGE_API');
        const apiCostTime = new Date() - apiStartTime;
        client.timing('DELETE_IMAGE_API_time', apiCostTime);
    }
    return;

}
