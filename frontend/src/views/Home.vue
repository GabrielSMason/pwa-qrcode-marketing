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
const sorteioNaoGanhado = ref(null)

async function verificarSorteio() {
  try {
    const resposta = await api.get('/qrcode/sorteado')
    if (resposta.data.ganhou) {
      ganhou.value = true
      qrCodeGanhador.value = resposta.data.qrCode
      return
    }
  } catch (e) {
    console.error('Erro ao verificar sorteio:', e)
  }

  try {
    const resposta = await api.get('/qrcode/nao-sorteado')
    if (resposta.data.temSorteio) {
      sorteioNaoGanhado.value = resposta.data.data
    }
  } catch (e) {
    console.error('Erro ao verificar não sorteado:', e)
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

async function fecharTelaGanhador() {
  try {
    await api.patch('/qrcode/viu-ganhador')
  } catch (e) {
    console.error('Erro ao marcar como visto:', e)
  }
  ganhou.value = false
}

async function fecharBannerNaoSorteado() {
  try {
    await api.patch('/qrcode/viu-nao-sorteado')
  } catch (e) {
    console.error('Erro ao marcar como visto:', e)
  }
  sorteioNaoGanhado.value = null
}

function sair() {
  localStorage.removeItem('token')
  localStorage.removeItem('role')
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
      <button @click="fecharTelaGanhador">Continuar</button>
    </div>

    <div v-else>
      <h1>Bem-vindo!</h1>

      <div v-if="sorteioNaoGanhado" class="banner-nao-sorteado">
        <p>O sorteio do dia {{ sorteioNaoGanhado }} aconteceu e você não foi sorteado!</p>
        <button @click="fecharBannerNaoSorteado">OK</button>
      </div>

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

<style scoped>
.banner-nao-sorteado {
  background: #fef9c3;
  border: 1px solid #fde047;
  color: #713f12;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.banner-nao-sorteado p {
  margin: 0;
  font-size: 0.9rem;
}

.banner-nao-sorteado button {
  background: #ca8a04;
  color: white;
  border: none;
  padding: 0.3rem 0.8rem;
  border-radius: 6px;
  cursor: pointer;
  white-space: nowrap;
}
</style>
