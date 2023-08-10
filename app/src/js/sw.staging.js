// Skip waiting
addEventListener('message', event => {
  console.log(`DEV:MESSAGE → ${event.data}`)

  if (event.data == 'SKIP_WAITING') skipWaiting()
})

addEventListener('push', event => {
  let data = {}

  if (event.data) {
    data = event.data.json()
  }

  const title = data.title || 'Weekday'
  const body = data.body || 'This is the default message'
  const icon = 'https://weekday-assets.s3-us-west-2.amazonaws.com/logo.png'
  const image = 'https://weekday-assets.s3-us-west-2.amazonaws.com/logo.png'
  const tag = 'weekday-notification'

  self.registration.showNotification(title, {
    body,
    tag,
    icon,
    image,
  })

  /*
  notification.addEventListener('click', function() {
    if (clients.openWindow) {
      clients.openWindow('https://app.weekday.work')
    }
  })
  */
})
