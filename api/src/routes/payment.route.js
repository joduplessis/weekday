import { TeamModel } from '../models/team.model'
import { QUANTITY, STRIPE_REDIRECT_LOCAL, STRIPE_REDIRECT_LIVE, API_LIVE, API_LOCAL } from '../constants'
import * as moment from 'moment'

require('dotenv').config()

export const PaymentRoute = app => {
  const createCustomerSubscription = async (payload) => {
    const stripe = require('stripe')(process.env.STRIPE_API_KEY)
    const { id, current_period_start, current_period_end, customer, quantity } = payload
    const start = moment.unix(current_period_start).toDate()
    const end = moment.unix(current_period_end).toDate()
    const { metadata: { slug } } = await stripe.subscriptions.retrieve(id)

    if (!slug) throw(`createCustomerSubscription: NO SLUG META DATA ON SUBSCRIPTION: ${id} / CUSTOMER ${customer}`)

    await TeamModel.findOneAndUpdate(
      { slug },
      {
        current_period_start: start,
        current_period_end: end,
        quantity,
        customer,
        subscription: id,
        active: true
      }
    ).exec()
  }

  const updateCustomerSubscription = async (payload) => {
    const stripe = require('stripe')(process.env.STRIPE_API_KEY)
    const { id, current_period_start, current_period_end, customer, quantity } = payload
    const start = moment.unix(current_period_start).toDate()
    const end = moment.unix(current_period_end).toDate()
    const { metadata: { slug } } = await stripe.subscriptions.retrieve(id)

    if (!slug) throw(`updateCustomerSubscription: NO SLUG META DATA ON SUBSCRIPTION: ${id} / CUSTOMER ${customer}`)

    await TeamModel.findOneAndUpdate(
      { slug },
      {
        current_period_start: start,
        current_period_end: end,
        quantity,
        customer,
        subscription: id,
        active: true
      }
    ).exec()
  }

  const deleteCustomerSubscription = async (payload) => {
    const stripe = require('stripe')(process.env.STRIPE_API_KEY)
    const { id, customer } = payload
    const { metadata: { slug } } = await stripe.subscriptions.retrieve(id)

    if (!slug) throw(`deleteCustomerSubscription: NO SLUG META DATA ON SUBSCRIPTION: ${id} / CUSTOMER ${customer}`)

    // Reset the QUANTITY here
    await TeamModel.findOneAndUpdate(
      { slug },
      {
        current_period_start: null,
        current_period_end: null,
        quantity: QUANTITY,
        active: false,
        subscription: null,
        customer,
      }
    ).exec()
  }

  app.post('/v1/payment/webhook', async (req, res) => {
    try {
      const { type, data: { object } } = req.body

      // Debug
      console.log(type)

      switch (type) {
        case "customer.subscription.created":
          createCustomerSubscription(object)
          break;
        case "customer.subscription.updated":
          updateCustomerSubscription(object)
          break;
        case "customer.subscription.deleted":
          deleteCustomerSubscription(object)
          break;
      }

      res.send({ success: true })
    } catch(error) {
      console.log(error)
      throw(error)
    }
  })

  app.get('/v1/payment/customer_portal/:teamId', async (req, res) => {
    try {
      const { teamId } = req.params
      const stripe = require('stripe')(process.env.STRIPE_API_KEY)
      const { customer } = await TeamModel.findOne({ _id: teamId }).exec()
      const return_url = process.env.NODE_ENV == "development" ? STRIPE_REDIRECT_LOCAL : STRIPE_REDIRECT_LIVE

      // Get our custome portal session
      const session = await stripe.billingPortal.sessions.create({
        customer,
        return_url,
      })

      // Return to the user
      res.send({ session })
    } catch(error) {
      throw(error)
    }
  })

  app.get('/v1/payment/subscription/success/:sessionId', async (req, res) => {
    try {
      const { sessionId } = req.params
      const url = process.env.NODE_ENV == "development" ? STRIPE_REDIRECT_LOCAL : STRIPE_REDIRECT_LIVE
      const stripe = require('stripe')(process.env.STRIPE_API_KEY)
      const { metadata: { slug } } = await stripe.checkout.sessions.retrieve(sessionId)

      // Set this team to active
      // This will also be done via the webhook
      await TeamModel.findOneAndUpdate({ slug }, { active: true }).exec()

      // Redirect them to the right place
      return res.redirect(url);
    } catch(error) {
      throw(error)
    }
  })

  app.post('/v1/payment/subscription/create_session', async (req, res) => {
    try {
      const stripe = require('stripe')(process.env.STRIPE_API_KEY)
      const { priceId, slug, qty } = req.body
      const team = await TeamModel.findOne({ slug }).exec()
      const cancel_url = process.env.NODE_ENV == "development" ? STRIPE_REDIRECT_LOCAL : STRIPE_REDIRECT_LIVE
      const api_path = process.env.NODE_ENV == "development" ? API_LOCAL : API_LIVE

      // Construct the base session (mutable)
      let sessionObject = {
        mode: "subscription",
        payment_method_types: ["card"],
        metadata: { slug },
        subscription_data: {
          metadata: { slug }
        },
        line_items: [{ price: priceId, quantity: qty }],
        success_url: api_path + '/v1/payment/subscription/success/{CHECKOUT_SESSION_ID}',
        cancel_url
      }

      // If they are a customer, the use their customer ID
      if (team.customer) sessionObject.customer = team.customer

      // Create the session
      const session = await stripe.checkout.sessions.create(sessionObject)

      // and send it to the app
      res.send({ sessionId: session.id })
    } catch(error) {
      console.log(error)
      throw(error)
    }
  })
}
