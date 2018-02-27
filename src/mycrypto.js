var crypto;
var isGas = false;

try {
  //try to eval process to detect gas.
  if(process){
    isGas = false;
    crypto = require('crypto');
  }
} catch (err){
  isGas = true;
}
module.exports = {
  base64Sha256: function(data) {
    if (isGas) {
      return Utilities.base64Encode(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, data, Utilities.Charset.UTF_8));
    }else{
      var shasum = crypto.createHash('sha256').update(data);
      return shasum.digest('base64');
    }
  },

  base64HmacSha256: function(data, key) {
    if (isGas) {
      return Utilities.base64Encode(Utilities.computeHmacSignature(Utilities.MacAlgorithm.HMAC_SHA_256,
                                                                   data,
                                                                   key,
                                                                   Utilities.Charset.UTF_8));
    } else {
      var encrypt = crypto.createHmac('sha256', key);
      encrypt.update(data);
      return encrypt.digest('base64');
    }
  }
};
