const VAPID_PUBLIC_KEY = "BOTHu2E33309cYAGyWmXwpqWXgIttLJzHwu4AsyppALpSjEbF9kPBtfymAE0i_4WJnRHjGrGoFY3-itaJjFxjVs";

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

    const resposta = await fetch('/api/subscribe', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(subscription)
    });

    if (!resposta.ok) {
        let mensagem = 'Falha ao salvar subscription no servidor';
        try {
            const erro = await resposta.json();
            mensagem = erro.message || mensagem;
        } catch (e) {
            // resposta sem corpo JSON, mantém mensagem genérica
        }
        throw new Error(mensagem);
    }

    console.log('Subscription enviada ao backend:', subscription);
}