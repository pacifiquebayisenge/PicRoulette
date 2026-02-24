function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)))
}

async function getRegistrationReady() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.log('Push notifications are not supported by your browser.')
    return null
  }
  return await navigator.serviceWorker.ready
}

async function getOrCreateSubscription(registration) {
  const existing = await registration.pushManager.getSubscription()
  if (existing) return existing

  return await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(import.meta.env.VITE_PUBLIC_VAPID_KEY)
  })
}

export async function subToPushNotifs() {
  const registration = await getRegistrationReady()
  if (!registration) return null

  try {
    const subscription = await getOrCreateSubscription(registration)

    const response = await fetch(`${import.meta.env.VITE_PUSH_SERVER_URL}/api/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(subscription)
    })

    if (!response.ok) {
      console.error(`HTTP error! status: ${response.status}`)
      return null
    }

    const data = await response.json()

    localStorage.setItem('push_subscription', JSON.stringify(data.subscription))
    return data
  } catch (e) {
    // Common: user blocks notifications / not allowed in insecure context / etc.
    console.error('Failed to subscribe to push notifications:', e)
    return null
  }
}

export async function checkSubToPushNotif() {
  const registration = await getRegistrationReady()
  if (!registration) return false

  const subscription = await registration.pushManager.getSubscription()
  if (!subscription) return false

  const response = await fetch(`${import.meta.env.VITE_PUSH_SERVER_URL}/api/check-subscription`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(subscription)
  })

  if (!response.ok) return false

  const data = await response.json()
  localStorage.setItem('push_subscription', JSON.stringify(data.subscription))
  return true
}

export async function unsubOfPushNotif() {
  const registration = await getRegistrationReady()
  if (!registration) return null

  const subscription = await registration.pushManager.getSubscription()
  if (!subscription) return null

  // Tell server first (safer), then unsubscribe locally
  const response = await fetch(`${import.meta.env.VITE_PUSH_SERVER_URL}/api/unsubscribe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(subscription)
  })

  if (!response.ok) {
    console.error(`HTTP error! status: ${response.status}`)
    return null
  }

  await subscription.unsubscribe()
  localStorage.removeItem('push_subscription')

  return await response.json()
}
