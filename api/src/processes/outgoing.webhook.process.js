const axios = require('axios')

process.on('message', async ({ outgoing, token, payload }) => {
  try {
    await axios.post(`${outgoing}?channelToken=${token}`, { body: payload }, {
      headers: { 'Content-Type': 'application/json' },
    })
    process.exit()
  } catch (e) {
    console.log('Webhook did not resolve')
    process.exit()
  }
});
