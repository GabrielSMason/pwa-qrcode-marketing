const VAPID_PUBLIC_KEY = "BK_pJNII37vxw4hongdrQDHQFFJ01d-e-57STWLjtDJv9DnS63ktwFZmKUQehcIQOxFpBFWgb-IohZm4KZTaYD4";

function urlBase64ToUint8Array(base64String) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
        .replace(/-/g, "+")
        .replace(/_/g, "/");

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
return outputArray;
}

export async function inscreverPush() {
    if (!('serviceWorker' in navigator)) {
        console.log('Service Worker não é suportado.');
        return;
    }

    const registration = await navigator.serviceWorker.ready;

    let subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
        subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
        });
    }

    const token = localStorage.getItem('token');

    await fetch('/api/subscribe', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(subscription)
    });

    console.log('Subscription enviada ao backend:', subscription);
}