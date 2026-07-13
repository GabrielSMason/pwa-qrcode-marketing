<script setup>
import { ref, onMounted } from 'vue'
import LeitorQrCode from '../components/LeitorQrCode.vue'
import api from '../api.js'
import { inscreverPush } from '../push.js'

const nome = localStorage.getItem('nome') || 'Usuário'
const mensagem = ref('')
const mensagemErro = ref(false)
const mostrarLeitor = ref(false)
const qrCodes = ref([])
const notificacoesAtivadas = ref(false)
const ganhou = ref(false)
const qrCodeGanhador = ref(null)
const sorteioNaoGanhado = ref(null)

async function verificarNotificacoesAtivas() {
  if (!('serviceWorker' in navigator)) return
  const registration = await navigator.serviceWorker.ready
  const subscription = await registration.pushManager.getSubscription()
  notificacoesAtivadas.value = Notification.permission === 'granted' && !!subscription
}

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
  if (permissao !== 'granted') {
    mensagem.value = 'Permissão de notificação negada.'
    mensagemErro.value = true
    return
  }
  try {
    await inscreverPush()
    notificacoesAtivadas.value = true
    mensagem.value = ''
    mensagemErro.value = false
  } catch (e) {
    notificacoesAtivadas.value = false
    mensagem.value = 'Não foi possível ativar as notificações. Tente novamente.'
    mensagemErro.value = true
    console.error('Erro ao ativar notificações:', e)
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
  mensagemErro.value = false
  try {
    await api.post('/qrcode', { codigo })
    mensagem.value = 'QR-Code cadastrado com sucesso!'
    await carregarQrCodes()
  } catch (e) {
    mensagem.value = e.response?.data?.message || 'Erro ao cadastrar QR-Code'
    mensagemErro.value = true
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
  verificarNotificacoesAtivas()
})
</script>

<template>
  <div class="container">

    <div v-if="ganhou" class="card">
      <div class="card-header">
        <span class="card-titulo">Resultado do Sorteio</span>
      </div>
      <div class="card-body tela-vitoria">
        <p class="vitoria-emoji">🎉</p>
        <p class="vitoria-texto">Parabéns! Você foi sorteado!</p>
        <p class="vitoria-sub">O QR-Code <code>{{ qrCodeGanhador.codigo }}</code> foi o vencedor.</p>
        <p class="vitoria-sub">Entre em contato para receber seu prêmio.</p>
        <button @click="fecharTelaGanhador">Continuar</button>
      </div>
    </div>

    <div v-else>
      <div class="page-header">
        <div>
          <h1>Bem-vindo!</h1>
          <p class="subtitulo">{{ nome }}</p>
        </div>
        <button class="btn-sair" @click="sair">Sair</button>
      </div>

      <div v-if="sorteioNaoGanhado" class="feedback-aviso">
        <span>O sorteio do dia {{ sorteioNaoGanhado }} aconteceu e você não foi sorteado!</span>
        <button class="btn-ok" @click="fecharBannerNaoSorteado">OK</button>
      </div>

      <div v-if="mensagem" :class="mensagemErro ? 'feedback-erro' : 'feedback-ok'">
        {{ mensagem }}
      </div>

      <div class="card" style="margin-bottom: 0.75rem;">
        <div class="card-header">
          <span class="card-titulo">Notificações</span>
          <span v-if="notificacoesAtivadas" class="badge badge-ok">Ativadas ✓</span>
        </div>
        <div class="card-body">
          <button @click="ativarNotificacoes">
            {{ notificacoesAtivadas ? 'Sincronizar notificações novamente' : 'Ativar notificações' }}
          </button>
        </div>
      </div>

      <div class="card" style="margin-bottom: 0.75rem;">
        <div class="card-header">
          <span class="card-titulo">Leitor de QR-Code</span>
        </div>
        <div class="card-body">
          <button v-if="!mostrarLeitor" @click="mostrarLeitor = true">Ler QR-Code</button>
          <button v-else class="btn-cancelar" @click="mostrarLeitor = false">Cancelar leitura</button>
          <LeitorQrCode v-if="mostrarLeitor" @codigo-lido="onCodigoLido" />
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <span class="card-titulo">Meus QR-Codes</span>
          <span class="badge">{{ qrCodes.length }}</span>
        </div>
        <div class="qrcodes-lista">
          <div v-if="qrCodes.length === 0" class="vazio">
            Nenhum QR-Code cadastrado ainda.
          </div>
          <table v-else>
            <thead>
              <tr>
                <th>Código</th>
                <th>Cadastrado em</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="qr in qrCodes" :key="qr._id" :class="{ sorteado: qr.sorteado }">
                <td><code>{{ qr.codigo }}</code></td>
                <td>{{ new Date(qr.createdAt).toLocaleDateString('pt-BR') }}</td>
                <td>
                  <span v-if="qr.sorteado" class="status-ganhou">Sorteado</span>
                  <span v-else class="status-normal">—</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
.container {
  max-width: 850px;
  margin: 0 auto;
  padding: 1.5rem;
  font-family: sans-serif;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.page-header h1 { margin: 0; }
.subtitulo { margin: 0.15rem 0 0; font-size: 0.85rem; color: #6b7280; }

.btn-sair {
  background: #ef4444;
  color: white;
  border: none;
  padding: 0.4rem 1rem;
  border-radius: 6px;
  cursor: pointer;
}

.feedback-ok {
  background: #f0fdf4;
  border: 1px solid #86efac;
  color: #166534;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  margin-bottom: 0.75rem;
  font-size: 0.9rem;
}

.feedback-erro {
  background: #fef2f2;
  border: 1px solid #fca5a5;
  color: #991b1b;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  margin-bottom: 0.75rem;
  font-size: 0.9rem;
}

.feedback-aviso {
  background: #fef9c3;
  border: 1px solid #fde047;
  color: #713f12;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  margin-bottom: 0.75rem;
  font-size: 0.9rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.btn-ok {
  background: #ca8a04;
  color: white;
  border: none;
  padding: 0.3rem 0.8rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
  white-space: nowrap;
}

.card {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 0.75rem;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.9rem 1.1rem;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.card-titulo { font-weight: 600; font-size: 0.95rem; }

.card-body {
  padding: 1.1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.card-body button {
  background: #2563eb;
  color: white;
  border: none;
  padding: 0.45rem 1.1rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  font-family: sans-serif;
  align-self: flex-start;
}

.card-body button:hover { opacity: 0.88; }

.btn-cancelar { background: #6b7280 !important; }

.badge {
  background: #e5e7eb;
  color: #374151;
  font-size: 0.78rem;
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
}

.badge-ok { background: #d1fae5; color: #065f46; }

.qrcodes-lista { padding: 0.75rem 1.1rem; overflow-x: auto; }

.vazio { color: #9ca3af; font-size: 0.9rem; padding: 0.25rem 0; }

table { width: 100%; border-collapse: collapse; font-size: 0.9rem; min-width: 400px; }

th {
  text-align: left;
  padding: 0.4rem 0.6rem;
  color: #6b7280;
  font-weight: 600;
  border-bottom: 1px solid #e5e7eb;
}

td { padding: 0.5rem 0.6rem; border-bottom: 1px solid #f3f4f6; }
td:last-child { border-bottom: none; }
tr.sorteado td { background: #f0fdf4; }

.status-ganhou { color: #16a34a; font-weight: 600; }
.status-normal { color: #d1d5db; }

.tela-vitoria {
  text-align: center;
  padding: 2rem 1.1rem;
  align-items: center;
}

.vitoria-emoji { font-size: 2.5rem; margin: 0; }
.vitoria-texto { font-size: 1.2rem; font-weight: 600; margin: 0.5rem 0 0; }
.vitoria-sub   { color: #6b7280; font-size: 0.9rem; margin: 0.25rem 0; }
.tela-vitoria button { margin-top: 1rem; }
</style>