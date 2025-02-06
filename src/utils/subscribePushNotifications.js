
export function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)))
}

export async function subToPushNotifs() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.log('Push notifications are not supported by your browser.')
    return
  }

  const registration = await navigator.serviceWorker.ready

  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(import.meta.env.VITE_PUBLIC_VAPID_KEY)
  })

  // console.log('Push Subscription:', subscription);

  const response = await fetch(`${import.meta.env.VITE_PUSH_SERVER_URL}/api/subscribe`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(subscription)
  })

  // console.log('Response from server:', response);

  if (!response.ok) {
    console.error(`HTTP error! status: ${response.status}`)
    console.log(response)
    return null
  }

  const data = await response.json()
  // console.log('Subscription successful:', data);
  localStorage.setItem('push_subscription', JSON.stringify(data.subscription))
  return data
}

export async function checkSubToPushNotif() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.log('Push notifications are not supported by your browser.')
    return false
  }

  const registration = await navigator.serviceWorker.ready

  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(import.meta.env.VITE_PUBLIC_VAPID_KEY)
  })

  const response = await fetch(`${import.meta.env.VITE_PUSH_SERVER_URL}/api/check-subscription`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(subscription)
  })

  if (!response.ok) {
    console.log(`subscription not found`)
    return false
  }

  const data = await response.json()
  localStorage.setItem('push_subscription', JSON.stringify(data.subscription))

  return true
}


export async function unsubOfPushNotif() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.log('Push notifications are not supported by your browser.')
    return
  }
  const registration = await navigator.serviceWorker.getRegistration()

  if (!registration) {
    console.log('Service worker not registered.')
    return
  }

  const subscription = await registration.pushManager.getSubscription()

  if (subscription) {
    console.log('Existing subscription found, deleting...')
    await subscription.unsubscribe()

    // console.log('Push Subscription:', subscription);

    const response = await fetch(`${import.meta.env.VITE_PUSH_SERVER_URL}/api/unsubscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(subscription)
    })

    if (!response.ok) {
      console.error(`HTTP error! status: ${response.status}`)
      console.log(response)
      return null
    }

    // console.log('Response from server:', response);

    const data = await response.json()
    // console.log('Subscription successful:', data);
    return data
  }
}
