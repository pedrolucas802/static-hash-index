<template>
  <!-- <div v-for="bucket in indexedList" :key="bucket.key"> -->
    <BucketComponent :storage="indexedList"></BucketComponent>
  <!-- </div> -->
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import BucketComponent from './BucketComponent.vue';
import { Bucket } from '@/interfaces/Bucket';
import { Line } from '@/interfaces/Line';

export default defineComponent({
  name: 'BufferComponent',
  components: {
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
      indexedList: [] as Line[]
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
    },

    paginate(): Line[]{
      let pageCnt = 0
      let currentPage = 0
      this.list.forEach((register, index) => {
        if(pageCnt >= this.nrSizePage) {
          currentPage ++
          pageCnt = 0
        }
        this.indexedList.push({key: register, index: index, page: currentPage});
        pageCnt ++
      })
      return this.indexedList
    },

    bucketDistribution(list: Line[]){
      console.log(list)
      let lineCnt = 0
      let lines: Line[] = []
      list.forEach(line => {
        // if (lineCnt >= this.nrSizeBucket){
        //
        // }
        const index = this.getBucketIndexByKey(line.key);
        let bucket = {index, lines}
        // this.buckets.push()
        lineCnt++
      })
    },
    generateBuckets() {
      this.nrBuckets = Math.ceil(this.list.length / this.nrSizeBucket);
      for (let i = 0; i < this.nrBuckets; i++) {
        this.buckets[i] = new Bucket();
        this.buckets[i].lines = []
        for (let j = 0; j < this.nrSizeBucket; j++) {
            this.buckets[i].lines[j]= new Line()
          }
      }
      console.log(this.buckets);
    }

  },
  mounted() {
    let list = this.paginate()
    // this.bucketDistribution(list)
    this.generateBuckets()

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
