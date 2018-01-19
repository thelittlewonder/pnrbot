'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')
const rp = require('request-promise')

const app = express()

app.set('port', (process.env.PORT || 5000))

app.use(bodyParser.urlencoded({
    extended: false
}))
app.use(bodyParser.json())

app.get('/', function (req, res) {
    res.send("Hi I am a chatbot")
})

let pageToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
let verifyToken = process.env.FACEBOOK_VERIFY_TOKEN;

app.get('/webhook/', function (req, res) {
    if (req.query['hub.verify_token'] === verifyToken) {
        res.send(req.query['hub.challenge'])
    }
    res.send("Wrong token")
})

app.post('/webhook/', async function (req, res) {
    let messaging_events = req.body.entry[0].messaging
    for (let i = 0; i < messaging_events.length; i++) {
        let event = messaging_events[i]
        let sender = event.sender.id
        if (event.message && event.message.text) {
            let text = event.message.text
            let pnrUrl = "https://data.tripmgt.com/Data.aspx?Action=PNR_STATUS&Data1=" + text;
            let pnrRes = await rp(pnrUrl)
            if(pnrRes === 'Error'){
                pnrRes = "";
            }
            if(pnrRes.length>=1){
                let pnrResponse = JSON.parse(((JSON.parse(pnrRes)).PnrData));
                //console.log(pnrResponse);
                let pnrResult = "PNR: "+pnrResponse.pnrNumber+"\nTrain: "+pnrResponse.trainNumber+", "+pnrResponse.trainName+"\nCurrent Status:"
                for(let i=0;i<pnrResponse.passengerList.length;i++){
                    let j = i+1;
                    pnrResult = pnrResult + "\nPassenger " + j + ": "+ pnrResponse.passengerList[i].currentStatusDetails ;
                }
                pnrResult = pnrResult + "\n*" + pnrResponse.chartStatus + "*";
                sendText(sender, pnrResult);
            } else{
                let message;
                text = text.toLowerCase();
                if(text ==='hi'|| text === 'hello'|| text === 'hi.'|| text === 'hello.'){
                    message = "Hello. Please enter a valid 10 digit pnr to get started.";
                } else if (text === 'bye'||text === 'bye.'){
                    message = "Bye.";
                } else{
                    message = "I am not sure I understood that. Please enter a valid 10 digit PNR";
                }
                sendText(sender, message);
            }
        }
    }
    res.sendStatus(200)
})

function sendText(sender, text) {
    let messageData = {
        text: text
    }
    request({
        url: "https://graph.facebook.com/v2.6/me/messages",
        qs: {
            access_token: pageToken
        },
        method: "POST",
        json: {
            recipient: {
                id: sender
            },
            message: messageData,
        }
    }, function (error, response, body) {
        if (error) {
            console.log("sending error")
        } else if (response.body.error) {
            console.log("response body error")
        }
    })
}

app.listen(app.get('port'), function () {
    console.log("running: port")
})