<template>
  <!-- <div v-for="bucket in indexedList" :key="bucket.key"> -->
    <BucketComponent :storage="indexedList"></BucketComponent>
  <!-- </div> -->
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import InputText from 'primevue/inputtext';
import BucketComponent from './BucketComponent.vue';
import { Bucket } from '@/interfaces/Bucket';

export default defineComponent({
  name: 'BufferComponent',
  components: {
    // InputText,
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
      nrToHash: 23 as number,
      nrSizeBucket: 3 as number,
      nrSizePage: 3 as number,
      nrBuckets: 0 as number,
      nrPages: 0 as number,
      buckets: [] as Bucket[],
      indexedList: [] as Bucket[]
    }
  },
  methods: {
    generateHash(value: string): number {
      let concat = '';
      for(let i = 0; i < value.length; i++) {
        concat += value.charCodeAt(i).toString();
      }
      return parseInt(concat);
    },
    getBucketIndexByKey(value: string): number {
      let hash = this.generateHash(value);
      return  Math.abs(hash % this.nrToHash);
    }
  },
  mounted() {
    this.list.forEach(register => {
      const index = this.getBucketIndexByKey(register);
      this.indexedList.push({key: register, page: index});
    })
    console.log(this.indexedList);
  }
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
