var isGas = false;

try {
  //try to eval process to detect gas.
  if(process){
    isGas = false;
  }
} catch (err){
  isGas = true;
}
if (isGas) {
  module.exports = function(req,func) {
    var params = {
      "method":req.method.toLowerCase(),
      "headers":req.headers,
      "muteHttpExceptions": true
    };
    var response = UrlFetchApp.fetch(req.url, params);
    var status = {
      statusCode: response.getResponseCode()
    };
    var statusCode = response.getResponseCode() == 200 ? null : response.getResponseCode();

    func(statusCode,
         status,
         response.getContentText());
  }
} else {
  module.exports = require('request');
}
