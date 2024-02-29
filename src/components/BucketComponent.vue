<template>
  <div class="buffer" v-for="obj in storage" :key="obj.key">
    {{ obj?.key }} - {{ obj?.page }}
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import InputText from 'primevue/inputtext';
import { Bucket } from '@/interfaces/Bucket';

export default defineComponent({
  name: 'BucketComponent',
  components: {
    // InputText
  },
  props: {
    storage: Array<any>(),
  },
  data() {
    return {
      nrLines: 3 as number
    }
  },
  methods: {
  },
  created() {
    // console.log(this.generateHash('joao'));
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
