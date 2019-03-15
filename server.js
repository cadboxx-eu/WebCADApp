var express = require('express'),
    bodyParser = require('body-parser'),
    compression = require('compression'),
    multer = require('multer'),
    busboy = require('connect-busboy'),
    fs = require('fs-extra'),
    mime = require('mime'),
    path = require('path'),
    app = express();
const fileUpload = require('express-fileupload');
var formidable = require('formidable');

app.set('port', process.env.PORT || 5000);

app.use(bodyParser.json());
app.use(compression());
app.use(busboy());

app.use('/', express.static(__dirname + '/'));

app.route('/upload')
.post(function (req, res, next) {
    var fstream;
    
    // req.pipe(req.busboy);
    // req.busboy.on('file', function (fieldname, file, filename) {
    //     console.log("Uploading: " + filename);

    //     //Path where image will be uploaded
    //     fstream = fs.createWriteStream(__dirname + '/www/upload/' + filename);
    //     file.pipe(fstream);
    //     fstream.on('close', function () {    
    //         console.log("Upload Finished of " + filename);              
    //         res.json({success: true, filePath:filename});           //where to go next
    //     });
    // });
    var form = new formidable.IncomingForm();
    form.parse(req, function(err, fields, files) {
        // `file` is the name of the <input> field of type `file`
        var old_path = files.file.path,
            file_size = files.file.size,
            file_ext = files.file.name.split('.').pop(),
            index = old_path.lastIndexOf('/') + 1,
            file_name = old_path.substr(index),
            new_path = path.join(process.env.PWD, '/upload/', file_name + '.' + file_ext);
        
        fs.readFile(old_path, function(err, data) {
            fs.writeFile(new_path, data, function(err) {
                fs.unlink(old_path, function(err) {
                    if (err) {
                        res.status(500);
                        res.json({'success': false});
                    } else {
                        res.status(200);
                        res.json({'success': true, 'filepath': old_path});
                    }
                });
            });
        });
    });
    // if (!req.files)
    //     return res.status(400).send('No files were uploaded.');
    
    // // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
    // let sampleFile = req.files.sampleFile;
    
    // // Use the mv() method to place the file somewhere on your server
    // sampleFile.mv('/somewhere/on/your/server/filename.jpg', function(err) {
    //     if (err)
    //     return res.status(500).send(err);
    
    //     res.send('File uploaded!');
    // });
});

app.route('/downview')
.post(function(req, res, next){
    var file = __dirname + '/www/upload/'+ req.body.filename;

    res.setHeader('Content-disposition', 'attachment; filename=' + file);
    res.setHeader('Content-type', 'text/plain');

    fs.exists(file, (exists) => {
        console.log(exists ? 'sending data' : 'no file to send!');
        if(exists)
        {
            var filestream = fs.createReadStream(file);
            filestream.pipe(res);
        }
        else
            res.send("no file");
    });
});

app.route('/download')
.post(function(req, res, next){
    var file = __dirname + '/www/upload/'+ req.body.filename;
    var filename = path.basename(file);
    var mimetype = mime.lookup(file);
  
    res.setHeader('Content-disposition', 'attachment; filename=' + filename);
    res.setHeader('Content-type', mimetype);
  
    var filestream = fs.createReadStream(file);
    filestream.pipe(res);
});
app.route('/deletefile')
.post(function(req, res, next){
    var file = __dirname + '/www/upload/'+ req.body.filename;

    fs.exists(file, (exists) => {
        console.log(exists ? 'deleting code file' : 'no file to delete!');
        if(exists)
            fs.unlinkSync(file);
      });
    res.send('success');
});

app.use(function(err, req, res, next) {
    console.error(err.stack);
    res.status(500).send(err);
});

app.listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});