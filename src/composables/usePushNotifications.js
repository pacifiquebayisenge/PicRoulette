import { ref } from "vue"
import { subToPushNotifs, unsubOfPushNotif } from "@/utils/subscribePushNotifications"

export function usePushNotifications() {
    const pushPermission = ref("default")

    function isSupported() {
        return "Notification" in window
    }

    async function checkPermission() {
        if (!isSupported()) {
            console.log("This browser does not support notifications")
            return
        }

        pushPermission.value = Notification.permission

        if (pushPermission.value === "denied") {
            console.log("Notifications were previously denied")
            await deleteSubscription()
            return
        }

        if (pushPermission.value === "granted") {
            console.log("Notifications already permitted")

            await subToPushNotifs()
            return
        }

        await requestPermission()
    }

    async function requestPermission() {
        if (!isSupported()) return

        try {
            const permission = await Notification.requestPermission()

            pushPermission.value = permission

            if (permission === "granted") {
                await subToPushNotifs()
                console.log("Notification permission granted")
            } else {
                console.log("Notification permission not granted")
            }
        } catch (error) {
            console.log("Notification permission error:", error)
        }
    }

    async function deleteSubscription() {
        try {
            if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
                console.log("Service Worker or PushManager not supported")
                return
            }

            const registration = await navigator.serviceWorker.getRegistration()
            if (!registration) return

            const subscription = await registration.pushManager.getSubscription()

            if (subscription) {
                await subscription.unsubscribe()
                await unsubOfPushNotif(subscription)
                console.log("Subscription removed")
            }
        } catch (error) {
            console.log("Error deleting subscription:", error)
        }
    }

    return {
        pushPermission,
        checkPermission,
        requestPermission,
        deleteSubscription,
    }
}