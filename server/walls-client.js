var shell = require('shelljs');
var fetch = require('node-fetch');
var moment = require('moment');
var cron = require('node-cron');

const BASE_URL = process.env.BASE_URL;

module.exports = {

    init(){
        /* every full and half hour */
        console.log("scheduling video booking check");
        cron.schedule('0 0,30 * * * *', this.checkForScheduledVideoRecordings);
    },

    checkForScheduledVideoRecordings(){
        const now = moment();
        const date = now.format('YYYY-MM-DD');
        const time = now.format('HH:mm');
        const url = `${BASE_URL}/api/bookings/${date}/${time}/video`;
        console.log(`GET ${url}`);
        fetch(url)
            .then(function(res) {
                return res.json();
            }).then(function(json) {
                console.log(`Found ${json.length} video bookings`);
                json.forEach((booking) => {
                    var cmd = `~/record.sh -d ${booking.duration*60} -c ${BASE_URL}/api/recordings/booking/${booking.uuid}`;
                    console.log(cmd);
                    shell.exec(cmd, {async: true});
                });
        });
    }
};