var fetch = require("cross-fetch");

const fetchNow = (nTitle, nBod, ids) => {
    var noti = {
        'title': nTitle,
        'body': nBod
    };
    var fcmToken = ids;
    var nBody = {
        'notification': noti,
        'registration_ids': fcmToken
    };
    fetch('https://fcm.googleapis.com/fcm/send',{
        'method': 'POST',
        'headers':{
            'Authorization': 'key='+'AAAA7GcZPiI:APA91bHB7tmCojsPvg6Kxx-1r-zydHnVst9LKx7bTMEPzhswtwNJvf0kFM-IZ-Zp8l7fmxBWlETtvkk64ecd2X8iEe_bROM3aBA8TF4FKoE-I20b-uNNAbZv47U5AE1sYPEbvo5ujG8-',
            'Content-Type': 'application/json'
        },
        'body': JSON.stringify(nBody)
    })
    .then((res) => {
        console.log("This is response");
        console.log(res);
    })
    .catch((err) => {
        console.log("This is error");
        console.log(err);
    })
}

module.exports = {
    fetchNow
}