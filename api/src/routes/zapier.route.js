require('dotenv').config()

import { ChannelModel } from '../models/channel.model'

export const ZapierRoute = app => {
  // This is for the in-app panel
  app.get('/v1/zapier', function (req, res) {
    const { token } = req.query;
    res.render('zapier', { token });
  })

  // This is for the Zapier app v.1.1.0
  app.post('/v1/zapier', async (req, res) => {
    try {
      const { token } = req.body
      const channel = await ChannelModel.findOne({ 'apps.token': token }).exec()

      if (!channel) return res.status(500).send({ message: 'Invalid token' })
      if (channel) return res.status(200).send({ token })
    } catch (e) {
      console.log(e)
      return res.status(500).send({ message: 'Error' })
    }
  })
}
