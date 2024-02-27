<template>
  <div class="buffer">
    oi
    <BucketComponent></BucketComponent>
    <InputText></InputText>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import InputText from 'primevue/inputtext';
import BucketComponent from './BucketComponent.vue';

export default defineComponent({
  name: 'BufferComponent',
  components: {
    InputText,
    BucketComponent
  },
  data() {
    return {
      list: [
        'Fulano',
        'Cicrano',
        'Beltrano',
        'Zezinho',
        'Galvão',
        'Sr. Bola',
        'Maria do Carmo'
      ] as string[],
      nrRegisters: 0 as number
    }
  },
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
