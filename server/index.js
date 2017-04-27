var express     = require('express');
var bodyParser  = require('body-parser');
var compression = require('compression');
var path        = require('path');
var cors        = require('cors');
var shell       = require('shelljs');
var moment      = require('moment');
var wallsClient = require('./walls-client');

const LOADING_IMAGE     = 'balls.svg';
const PREVIEW_IMAGE     = 'preview.jpg';
const RECORDING_PATH    = '~/recording';
const RECORDED_PATH     = '~/recorded';
const BASE_URL          = process.env.BASE_URL;
const BUILD_PATH        = path.join(__dirname, './../build');

if (!BASE_URL){
    console.log('Missing environment variable BASE_URL');
    exit(1);
}
    
var recording;

var app = express();
app.enable('trust proxy');

app.use(compression());
app.use(bodyParser.json())

app.options('/api/status', cors());
app.get('/api/status', cors(), function(req, res) {
    recording = shell.ls(RECORDING_PATH).length > 0;
    var recordCount = shell.exec(`ls -l ${RECORDED_PATH}/*.h264 2>/dev/null | wc -l`, {silent: true}).stdout;
    res.send({
        recording,
        recordCount
    });
});

app.options('/api/stoprecording', cors());
app.post('/api/stoprecording', cors(), function(req, res) {
    shell.exec(`pkill -c raspivid & pkill -c raspistill`, function(code, stdout, stderr){
        shell.rm(`${RECORDING_PATH}/*`);
        res.send({recording: false});
    });
});

app.options('/api/startrecording', cors());
app.post('/api/startrecording', cors(), function(req, res) {
    recording = true;
    shell.exec(`pkill -c raspivid & pkill -c raspistill`, function(code, stdout, stderr){
        setTimeout(function(){
            var cmd = `~/record.sh -d ${req.body.recordDuration} -c ${BASE_URL}/api/recordings/email?email=${req.body.email}`;
            console.log(cmd);
            shell.exec(cmd, {async: true});
            res.send({recording: true});
        }, 2000);
    });
});

app.options('/api/image', cors());
app.get('/api/image', cors(), function(req, res) {
    if (recording){
        res.send({ path: `/${LOADING_IMAGE}` });
    } else {
        var previewImagePath = `${BUILD_PATH}/${PREVIEW_IMAGE}`;
        shell.exec(`raspistill -o ${previewImagePath} -w 480 -h 320`, function(code, stdout, stderr){
            if (shell.test('-f', `${previewImagePath}`)){
                res.send({ path: `/${PREVIEW_IMAGE}?timestamp=${moment().valueOf()}` });
            } else {
                res.send({ path: `/${LOADING_IMAGE}` });
            }
        });
    }
});

app.route('/').get(function(req, res) {
    res.header('Cache-Control', "max-age=60, must-revalidate, private");
    res.sendFile('index.html', {
        root: BUILD_PATH
    });
});

function nocache(req, res, next) {
  res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  res.header('Expires', '-1');
  res.header('Pragma', 'no-cache');
  next();
}

app.use('/', express.static(BUILD_PATH, {
    maxage: 31557600
}));

var server = app.listen(process.env.PORT || 5000, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('server listening at http://%s:%s', host, port);
    wallsClient.init();
});