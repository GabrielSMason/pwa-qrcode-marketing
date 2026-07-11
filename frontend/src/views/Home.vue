<script setup>
import { ref, onMounted } from 'vue'
import LeitorQrCode from '../components/LeitorQrCode.vue'
import api from '../api.js'
import { inscreverPush } from '../push.js'

const mensagem = ref('')
const mostrarLeitor = ref(false)
const qrCodes = ref([])
const notificacoesAtivadas = ref(false)
const ganhou = ref(false)
const qrCodeGanhador = ref(null)

async function verificarSorteio() {
  try {
    const resposta = await api.get('/qrcode/sorteado')
    if (resposta.data.ganhou) {
      ganhou.value = true
      qrCodeGanhador.value = resposta.data.qrCode
    }
  } catch (e) {
    console.error('Erro ao verificar sorteio:', e)
  }
}

async function ativarNotificacoes() {
  const permissao = await Notification.requestPermission()
  if (permissao === 'granted') {
    await inscreverPush()
    notificacoesAtivadas.value = true
  } else {
    mensagem.value = 'Permissão de notificação negada.'
  }
}

async function carregarQrCodes() {
  try {
    const resposta = await api.get('/qrcode')
    qrCodes.value = resposta.data.qrCodes
  } catch (e) {
    console.error('Erro ao carregar QR-Codes:', e)
  }
}

async function onCodigoLido(codigo) {
  mostrarLeitor.value = false
  mensagem.value = ''
  try {
    await api.post('/qrcode', { codigo })
    mensagem.value = `QR-Code "${codigo}" cadastrado com sucesso!`
    await carregarQrCodes()
  } catch (e) {
    mensagem.value = e.response?.data?.message || 'Erro ao cadastrar QR-Code'
  }
}

function sair() {
  localStorage.removeItem('token')
  window.location.href = '/login'
}

onMounted(() => {
  carregarQrCodes()
  verificarSorteio()
})
</script>

<template>
  <div class="container">
    <div v-if="ganhou" class="tela-vitoria">
      <h1>🎉 Parabéns! 🎉</h1>
      <p>O QR-Code "{{ qrCodeGanhador.codigo }}" foi sorteado!</p>
      <p>Entre em contato para receber seu prêmio.</p>
      <button @click="ganhou = false">Continuar</button>
    </div>

    <div v-else>
      <h1>Bem-vindo!</h1>

      <button v-if="!notificacoesAtivadas" @click="ativarNotificacoes">
        Ativar notificações
      </button>
      <p v-else>Notificações ativadas ✓</p>

      <button v-if="!mostrarLeitor" @click="mostrarLeitor = true">
        Ler QR-Code
      </button>

      <LeitorQrCode v-if="mostrarLeitor" @codigo-lido="onCodigoLido" />

      <p v-if="mensagem">{{ mensagem }}</p>

      <h2>Meus QR-Codes cadastrados ({{ qrCodes.length }})</h2>
      <ul>
        <li v-for="qr in qrCodes" :key="qr._id">
          {{ qr.codigo }} — {{ new Date(qr.createdAt).toLocaleDateString() }}
        </li>
      </ul>

      <button @click="sair">Sair</button>
    </div>
  </div>
</template>