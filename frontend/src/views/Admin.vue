<script setup>
import { ref, onMounted } from 'vue'
import api from '../api.js'

const usuarios = ref([])
const carregando = ref(true)
const expandido = ref(null)
const sorteando = ref(null)
const feedback = ref('')

async function carregarUsuarios() {
  carregando.value = true
  try {
    const resposta = await api.get('/admin/usuarios')
    usuarios.value = resposta.data.usuarios
  } catch (e) {
    console.error('Erro ao carregar usuários:', e)
  } finally {
    carregando.value = false
  }
}

function toggleExpand(id) {
  expandido.value = expandido.value === id ? null : id
}

async function sortear(codigo) {
  sorteando.value = codigo
  feedback.value = ''
  try {
    const resposta = await api.post('/admin/sortear', { codigo })
    const { dono, notificado } = resposta.data
    feedback.value = notificado
      ? `✅ "${codigo}" sorteado! Notificação enviada para ${dono}.`
      : `✅ "${codigo}" sorteado! ${dono} não tem notificações ativas — verá ao abrir o app.`
    await carregarUsuarios()
  } catch (e) {
    feedback.value = e.response?.data?.message || 'Erro ao sortear.'
  } finally {
    sorteando.value = null
  }
}

function sair() {
  localStorage.removeItem('token')
  localStorage.removeItem('role')
  window.location.href = '/login'
}

onMounted(carregarUsuarios)
</script>

<template>
  <div class="container">
    <div class="admin-header">
      <h1>Painel Admin</h1>
      <button class="btn-sair" @click="sair">Sair</button>
    </div>

    <div v-if="feedback" class="feedback" @click="feedback = ''">{{ feedback }}</div>

    <p v-if="carregando">Carregando...</p>

    <div v-else>
      <p class="subtitulo">{{ usuarios.length }} usuário(s) cadastrado(s)</p>

      <div v-if="usuarios.length === 0" class="vazio">
        Nenhum usuário cadastrado ainda.
      </div>

      <div v-for="u in usuarios" :key="u._id" class="card-usuario">
        <div class="card-header" @click="toggleExpand(u._id)">
          <div class="info-usuario">
            <span class="nome">{{ u.nome }}</span>
            <span class="email">{{ u.email }}</span>
          </div>
          <div class="badges">
            <span class="badge">{{ u.qrCodes.length }} QR-Code(s)</span>
            <span v-if="u.qrCodes.some(q => q.sorteado)" class="badge badge-ganhou">Ganhou</span>
            <span class="seta">{{ expandido === u._id ? '▲' : '▼' }}</span>
          </div>
        </div>

        <div v-if="expandido === u._id" class="qrcodes-lista">
          <div v-if="u.qrCodes.length === 0" class="vazio-inner">
            Nenhum QR-Code cadastrado.
          </div>
          <table v-else>
            <thead>
              <tr>
                <th>Código</th>
                <th>Cadastrado em</th>
                <th>Status</th>
                <th>Viu a tela</th>
                <th>Ação</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="q in u.qrCodes" :key="q._id" :class="{ sorteado: q.sorteado }">
                <td><code>{{ q.codigo }}</code></td>
                <td>{{ new Date(q.createdAt).toLocaleDateString('pt-BR') }}</td>
                <td>
                  <span v-if="q.sorteado" class="status-ganhou">🏆 Sorteado</span>
                  <span v-else class="status-normal">—</span>
                </td>
                <td>
                  <span v-if="!q.sorteado" class="status-normal">—</span>
                  <span v-else-if="q.viuTelaGanhador" class="viu-sim">✔ Viu</span>
                  <span v-else class="viu-nao">Ainda não</span>
                </td>
                <td>
                  <button
                    v-if="!q.sorteado"
                    class="btn-sortear"
                    :disabled="sorteando === q.codigo"
                    @click.stop="sortear(q.codigo)"
                  >
                    {{ sorteando === q.codigo ? '...' : 'Sortear' }}
                  </button>
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

.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.admin-header h1 { margin: 0; }

.btn-sair {
  background: #ef4444;
  color: white;
  border: none;
  padding: 0.4rem 1rem;
  border-radius: 6px;
  cursor: pointer;
}

.feedback {
  background: #f0fdf4;
  border: 1px solid #86efac;
  color: #166534;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  cursor: pointer;
  font-size: 0.9rem;
}

.subtitulo {
  color: #6b7280;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

.card-usuario {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  margin-bottom: 0.75rem;
  overflow: hidden;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.9rem 1.1rem;
  background: #f9fafb;
  cursor: pointer;
  user-select: none;
}

.card-header:hover { background: #f3f4f6; }

.info-usuario {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.nome { font-weight: 600; }
.email { font-size: 0.82rem; color: #6b7280; }

.badges {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.badge {
  background: #e5e7eb;
  color: #374151;
  font-size: 0.78rem;
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
}

.badge-ganhou {
  background: #d1fae5;
  color: #065f46;
}

.seta { font-size: 0.75rem; color: #9ca3af; margin-left: 0.25rem; }

.qrcodes-lista {
  padding: 0.75rem 1.1rem;
  border-top: 1px solid #e5e7eb;
}

.vazio, .vazio-inner {
  color: #9ca3af;
  font-size: 0.9rem;
  padding: 0.5rem 0;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

th {
  text-align: left;
  padding: 0.4rem 0.6rem;
  color: #6b7280;
  font-weight: 600;
  border-bottom: 1px solid #e5e7eb;
}

td {
  padding: 0.5rem 0.6rem;
  border-bottom: 1px solid #f3f4f6;
}

tr.sorteado td { background: #f0fdf4; }

.status-ganhou { color: #16a34a; font-weight: 600; }
.status-normal { color: #d1d5db; }
.viu-sim { color: #16a34a; font-size: 0.85rem; }
.viu-nao { color: #f59e0b; font-size: 0.85rem; }

.btn-sortear {
  background: #2563eb;
  color: white;
  border: none;
  padding: 0.3rem 0.8rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
}

.btn-sortear:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
