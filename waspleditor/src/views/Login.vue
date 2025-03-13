<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const username = ref('')
const password = ref('')
const error = ref('')

const login = async () => {
  try {
    console.log(import.meta.env.VITE_API_BASE_URL)
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}${import.meta.env.VITE_AUTH_ENDPOINT}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: username.value,
        password: password.value
      })
    })

    const data = await response.json()
    if (response.ok) {
      localStorage.setItem('token', data.token)
      router.push('/home')
    } else {
      error.value = data.error
    }
  } catch (err) {
    error.value = 'Une erreur est survenue'
  }
}
</script>

<template>
  <div class="container mt-5">
    <div class="row justify-content-center">
      <div class="col-md-6">
        <div class="card">
          <div class="card-body">
            <h2 class="card-title text-center mb-4">Connexion</h2>
            <form @submit.prevent="login">
              <div class="mb-3">
                <label for="username" class="form-label">Nom d'utilisateur</label>
                <input
                  type="text"
                  class="form-control"
                  id="username"
                  v-model="username"
                  required
                >
              </div>
              <div class="mb-3">
                <label for="password" class="form-label">Mot de passe</label>
                <input
                  type="password"
                  class="form-control"
                  id="password"
                  v-model="password"
                  required
                >
              </div>
              <div v-if="error" class="alert alert-danger">
                {{ error }}
              </div>
              <button type="submit" class="btn btn-primary w-100">
                Se connecter
              </button>
              <div class="text-center mt-3">
                <router-link to="/register">Pas encore inscrit ? Créez un compte</router-link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>