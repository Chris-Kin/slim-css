<script setup lang="ts">
import HelloWorld from './components/Main.vue'
</script>

<template>
  <div>
    <div class="bg"></div>
    <img src="./assets/logo.svg" class="logo vue" alt="Vue logo" />
    <h1>Finding dulplical rules</h1>
    <h2>then mark it && fix it.</h2>
  </div>
  <HelloWorld msg="Vite + Vue" />
</template>

<style scoped>
@import 'monaco-editor/min/vs/editor/editor.main.css';
.logo {
  height: 4em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
h1 {
  font-weight: 800;
  font-size: 4em;
}
h2 {
  color: var(--color-main);
  font-size: 3em;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
.bg {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 400px;
  background-image: url(/bg.webp);
  background-size: cover;
}
@media screen and (max-height: 1280px) {
  .logo, h2 {
    display: none;
  }
}
</style>
