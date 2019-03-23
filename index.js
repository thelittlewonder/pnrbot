'use strict'

//start by requiring the following packages 

const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')
const app = express();
const cheerio = require("cheerio");


app.set('port', (process.env.PORT || 5000))

// Process application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({
  extended: false
}))

// Process application/json
app.use(bodyParser.json())

// setup a route 
app.get('/', function (req, res) {
  res.send('Stop creeping around ._.')
});

const pageToken = process.env.TOKEN;

app.get('/webhook', function (req, res) {
  if (req.query['hub.verify_token'] === FACEBOOK_VERIFY_CODE) {
    res.send(req.query['hub.challenge'])
  }
  res.send('Error : wrong token');
})

app.post('/webhook/', async function (req, res) {
  let messaging_events = req.body.entry[0].messaging
  for (let i = 0; i < messaging_events.length; i++) {
    let event = messaging_events[i]
    let sender = event.sender.id
    if (event.message && event.message.text) {
      let text = event.message.text
      var pnrRes;
      if (!isNaN(text)) {
        let url = "https://www.railyatri.in/pnr-status/" + text;
        let chartStatus, trainName, dayOfBoarding;
        let bookingStatus = [];
        let currentStatus = [];
        let pnrResult;
        request(url, function (err, resp, body) {
          if (err) {
            throw err
          };
          var $ = cheerio.load(body);
          if ($("#status").length != 0) {
            $(".pnr-search-result-title .chart-status-txt").each(function (
              index,
              element
            ) {
              chartStatus = element.children[0].data;
            });
            $(".pnr-search-result-info .train-info .pnr-bold-txt").each(function (
              index,
              element
            ) {
              trainName = element.children[0].data;
            });
            $(".pnr-search-result-info .boarding-detls .pnr-bold-txt").each(function (
              index,
              element
            ) {
              if (index === 0) {
                dayOfBoarding = element.children[0].data;
              }
            });
            $("#status .col-xs-4 .pnr-bold-txt").each(function (index, element) {
              if (index % 2 != 0) {
                let temp = element.children[0].data;
                temp = temp.trim();
                currentStatus.push(temp);
              } else {
                let temp = element.children[0].data;
                temp = temp.trim();
                bookingStatus.push(temp);
              }
            });
            console.log(chartStatus, trainName, dayOfBoarding, currentStatus);

            pnrResult = trainName + "\n```PNR Status:*"
            for (let i = 0; i < currentStatus.length; i++) {
              pnrResult = pnrResult + "\nPassenger " + (i+1) + ": \n" + "Booking Status: " + bookingStatus[i] + " , Current Status: " + currentStatus[i];
            }
            pnrResult = pnrResult + "```\n*" + "CHART " + chartStatus + "*";
            sendText(sender, pnrResult);
          } else {
            pnrResult = "PNR Flushed/ PNR Doesn't Exists or Maybe the Railways Server is down. Who knows? ;_;";
            sendText(sender, pnrResult);
          }
        });
      } else {
        let message;
        text = text.toLowerCase();
        if (text === 'hi' || text === 'hello' || text === 'hi.' || text === 'hello.' || text === 'yo') {
          message = "Hello. Please enter a valid 10 digit pnr to get started.";
        } else if (text === 'bye' || text === 'bye.') {
          message = "Bye.";
        } else {
          message = "I am not sure I understood that. Please enter a valid 10 digit PNR to get started";
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
      console.log(error)
      console.log("response body error")
    }
  })
}

app.listen(app.get('port'), function () {
  console.log('server running at : ', app.get('port'))
});
