module.exports = {
  generate: function() {
    // http://blog.tompawlak.org/how-to-generate-random-values-nodejs-javascript

    function randomValueBase64 (len) {
        return require('crypto').randomBytes(Math.ceil(len * 3 / 4))
            .toString('base64')   // convert to base64 format
            .slice(0, len)        // return required number of characters
            .replace(/\+/g, '0')  // replace '+' with '0'
            .replace(/\//g, '0'); // replace '/' with '0'
    }

    return randomValueBase64(50);
  }
}
