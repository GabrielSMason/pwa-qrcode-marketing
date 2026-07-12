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
    <h1>Promoção Biscoitos X</h1>

    <div v-if="!modoCadastro">
      <h2>Login</h2>
      <input v-model="email" placeholder="Email" type="email" />
      <input v-model="password" placeholder="Senha" type="password" />
      <button @click="fazerLogin">Entrar</button>
      <p>
        Não tem conta?
        <a href="#" @click.prevent="modoCadastro = true">Cadastre-se</a>
      </p>
    </div>

    <div v-else>
      <h2>Cadastro</h2>
      <input v-model="nome" placeholder="Nome" />
      <input v-model="email" placeholder="Email" type="email" />
      <input v-model="password" placeholder="Senha" type="password" />
      <button @click="fazerCadastro">Cadastrar</button>
      <p>
        Já tem conta?
        <a href="#" @click.prevent="modoCadastro = false">Fazer login</a>
      </p>
    </div>

    <p v-if="erro" style="color: red;">{{ erro }}</p>
  </div>
</template>