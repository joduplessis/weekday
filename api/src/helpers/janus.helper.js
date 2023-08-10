const crypto = require('crypto')

export const getJanusToken = (realm, data = [], timeout = 24 * 60 * 60) => {
  const expiry = Math.floor(Date.now() / 1000) + timeout;
  const strdata = [expiry.toString(), realm, ...data].join(',');
  const hmac = crypto.createHmac('sha1', process.env.SECRET);
  hmac.setEncoding('base64');
  hmac.write(strdata);
  hmac.end();

  return [strdata, hmac.read()].join(':');
}
