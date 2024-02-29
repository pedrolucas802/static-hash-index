<template>
  <BufferComponent></BufferComponent>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import BufferComponent from './components/BufferComponent.vue'

export default defineComponent({
  name: 'App',
  components: {
    BufferComponent
  }
});
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
