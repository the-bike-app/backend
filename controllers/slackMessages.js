const request = require("request");

const slackSender = (webHook, payload) => {
  const theRequest = {
    url: webHook,
    method: "POST",
    json: payload
  };

  request(theRequest, (error, res) => {
    if (!error && (res.statusCode == 200)) {
      console.log("Slack Message Sent");
    }
    else {
      console.log("Slack Message Failed" + res.statusCode + ", " + res.body + ".\n");
    }
  });
}

module.exports = slackSender;