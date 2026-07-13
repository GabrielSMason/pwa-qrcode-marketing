<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '../api.js'

const router = useRouter()

const modoCadastro = ref(false)
const nome = ref('')
const email = ref('')
const password = ref('')
const erro = ref('')

async function fazerLogin() {
  erro.value = ''
  try {
    const resposta = await api.post('/login', {
      email: email.value,
      password: password.value
    })
    localStorage.setItem('token', resposta.data.token)
    localStorage.setItem('role', resposta.data.role)
    localStorage.setItem('nome', resposta.data.nome)
    router.push(resposta.data.role === 'admin' ? '/admin' : '/')
  } catch (e) {
    erro.value = e.response?.data?.message || 'Erro ao fazer login'
  }
}

async function fazerCadastro() {
  erro.value = ''
  try {
    await api.post('/registrar', {
      nome: nome.value,
      email: email.value,
      password: password.value
    })
    modoCadastro.value = false
  } catch (e) {
    erro.value = e.response?.data?.message || 'Erro ao cadastrar'
  }
}
</script>

<template>
  <div class="container">
    <div class="header">
      <h1>Promoção Biscoitos</h1>
    </div>

    <div v-if="erro" class="feedback-erro">{{ erro }}</div>

    <div class="card">
      <div class="card-header">
        <span class="card-titulo">{{ modoCadastro ? 'Cadastro' : 'Login' }}</span>
      </div>
      <div class="card-body">
        <input v-if="modoCadastro" v-model="nome" placeholder="Nome" />
        <input v-model="email" placeholder="Email" type="email" />
        <input v-model="password" placeholder="Senha" type="password" />
        <button v-if="!modoCadastro" @click="fazerLogin">Entrar</button>
        <button v-else @click="fazerCadastro">Cadastrar</button>
        <p class="link">
          <span v-if="!modoCadastro">
            Não tem conta?
            <a href="#" @click.prevent="modoCadastro = true">Cadastre-se</a>
          </span>
          <span v-else>
            Já tem conta?
            <a href="#" @click.prevent="modoCadastro = false">Fazer login</a>
          </span>
        </p>
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

.header {
  margin-bottom: 1rem;
}

.header h1 { margin: 0 0 1rem; }

.feedback-erro {
  background: #fef2f2;
  border: 1px solid #fca5a5;
  color: #991b1b;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

.card {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
}

.card-header {
  display: flex;
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

.card-body input {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.9rem;
  outline: none;
  font-family: sans-serif;
}

.card-body input:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37,99,235,0.12);
}

.card-body button {
  width: 100%;
  background: #2563eb;
  color: white;
  border: none;
  padding: 0.5rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  font-family: sans-serif;
}

.card-body button:hover { opacity: 0.88; }

.link {
  text-align: center;
  font-size: 0.85rem;
  color: #6b7280;
  margin: 0;
}

.link a { color: #2563eb; text-decoration: none; }
.link a:hover { text-decoration: underline; }
</style>
