<template>
  <div class="buffer">
    oi
    <InputText></InputText>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import InputText from 'primevue/inputtext';

export default defineComponent({
  name: 'BucketComponent',
  components: {
    InputText
  },
  props: {
    nrRegisters: Number,
  },
  data() {
    return {
      // nrRegisters: 3 as number
    }
  },
  methods: {
    generateHash(value: string): number {
      let concat = '';
      for(let i = 0; i < value.length; i++) {
        concat += value.charCodeAt(i).toString();
      }
      return parseInt(concat);
    }
  },
  created() {
    console.log(this.generateHash('joao'));
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
