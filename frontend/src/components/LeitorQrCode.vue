<script setup>
import { onMounted, onBeforeUnmount } from 'vue'
import { Html5QrcodeScanner } from 'html5-qrcode'

const emit = defineEmits(['codigoLido'])

let scanner = null

onMounted(() => {
    scanner = new Html5QrcodeScanner(
        'qr-reader',
        {
            fps: 10,
            qrbox: 250,
            videoConstraints: {
                facingMode: { exact: 'environment' }
            }
        },
    false)
    scanner.render(onScanSuccess)
})

function onScanSuccess(decodedText) {
    emit('codigoLido', decodedText)
}

onBeforeUnmount(() => {
    if (scanner) {
        scanner.clear().catch(() => {})
    }
})
</script>

<template>
    <div id="qr-reader" style="width: 100%; max-width: 500px;"></div>
</template>