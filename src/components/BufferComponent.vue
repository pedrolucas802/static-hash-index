<template>
  <div class="input-group">
    <FloatLabel>
      <InputNumber id="nrSizePage" v-model="nrSizePage" placeholder="Size of pages" class="input"/>
      <label for="nrSizePage">Size of pages</label>
    </FloatLabel>
    <FloatLabel>
      <InputNumber id="nrToHash" v-model="nrToHash" placeholder="Hash number" class="input"/>
      <label for="nrToHash">Hash number</label>
    </FloatLabel>
    <FloatLabel>
      <InputNumber id="nrSizeBucket" v-model="nrSizeBucket" placeholder="Bucket size" class="input"/>
      <label for="nrSizeBucket">Bucket size</label>
    </FloatLabel>
    <Button label="Submit" @click="submit" class="input"/>
  </div>

  <TabView >
    <TabPanel header="Buckets">
      <div class="table">
        <Accordion style="width: 100%">
<!--          <AccordionTab v-for="bucket in buckets"  :key="bucket.index" :header="'Bucket '+ bucket.index + ' - Overflow: '+(bucket.storages.length - 1)" >-->
<!--            <DataTable v-for="storage in bucket.storages" :value="storage.lines"  :key="storage.index" size="small" :rows="nrSizeBucket" style="min-width: 50rem" >-->
<!--              <template #header>Storage - {{storage.index}}</template>-->
<!--              <Column field="index" header="Index" style="width: 25%"></Column>-->
<!--              <Column field="key" header="Name" style="width: 70%"></Column>-->
<!--              <Column field="page" header="Page" style="width: 5%"></Column>-->
<!--            </DataTable>-->
<!--          </AccordionTab>-->
        </Accordion>

      </div>
    </TabPanel>

    <TabPanel header="Pages">
      <div class="table">
        <div v-for="(page, index) in pages"  :key="index">
          <DataTable :value="page"  :rows="nrSizePage" sztyle="min-width: 50rem">
            <Column field="index" header="Index" style="width: 25%"></Column>
            <Column field="key" header="Name" style="width: 40%"></Column>
            <Column field="page" header="Page" style="width: 5%"></Column>
          </DataTable>
        </div>

      </div>
    </TabPanel>

    <TabPanel header="Pesquisa">
      <div class="form" style="margin-top: 10px;">
      <FloatLabel >
        <InputText id="searchKey" v-model="searchKey" placeholder="Search a key value" class="input"/>
        <label for="searchKey">Key</label>
      </FloatLabel>
      <Button label="Submit" @click="searchHash(searchKey)" class="input"/>
      </div>
    </TabPanel>

  </TabView>

</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { Bucket } from '@/interfaces/Bucket';
import { Line } from '@/interfaces/Line';
import DataTable from "primevue/datatable";
import Registros from "@/store/Registros";

export default defineComponent({
  name: 'BufferComponent',
  components: {
    DataTable
  },
  data() {
    return {
      show: false,
      list: Registros.state.registros as string[],
      nrToHash: 23 as number,
      nrSizeBucket: 3 as number,
      nrSizePage: 5 as number,
      nrBuckets: 0 as number,
      buckets: [] as Bucket[],
      indexedList: [] as Line[],
      pages: [] as Line[][],
      searchKey: "",
      nrCollisions: 0,
      nrOverflows: 0
    }
  },
  methods: {
    submit(){
      this.paginate()
      this.generateBuckets()
      this.show=true
    },

    searchHash(key: string): Line{
      let bIndex = this.getBucketIndexByKey(key)
      let bucket = this.buckets[bIndex]
      let line = new Line()
      // bucket.storages.forEach( sto => {
      //   sto.lines.forEach( l =>{
      //     if(l.key == key) line = l
      //   })
      // })
      console.log(this.indexedList)
      return line
    },

    generateHash(value: string): number {
      let concat = '';
      for(let i = 0; i < value.length; i++) {
        concat += value.charCodeAt(i).toString();
      }
      return parseInt(concat);
    },

    getBucketIndexByKey(value: string): number {
      let hash = this.generateHash(value);
      return  Math.abs(hash % this.nrBuckets);
    },

    paginate(){
      let pageCnt = 0;
      let currentPage = 0;
      this.pages[0] = []
      this.list.forEach((register, index) => {
        if(pageCnt >= this.nrSizePage) {
          currentPage ++
          pageCnt = 0
          this.pages[currentPage] = []
        }
        // debugger
        this.pages[currentPage].push({key: register, index: index, page: currentPage});
        pageCnt ++
      })
    },

    bucketDistribution(){
      this.pages.forEach((page) => {
        page.forEach( line =>{
          let bucket = this.buckets[this.getBucketIndexByKey(line.key)]
          while (bucket.overflow != undefined) {
            bucket = bucket.overflow;
            if(this.nrOverflows > 0) this.nrCollisions += bucket.lines.length;
            this.nrOverflows++;
          }
          if (bucket.lines.length == this.nrSizeBucket) {
            bucket.overflow = new Bucket();
            bucket = bucket.overflow;
          }
          if(!bucket.lines) bucket.lines = []
          bucket.lines.push(line);
          }
        )
      })
    },

    generateBuckets() {
      this.nrBuckets = Math.ceil(this.list.length / this.nrSizeBucket);
      for (let i = 0; i < this.nrBuckets; i++) {
        this.buckets[i] = new Bucket();
        this.buckets[i].lines = [];
        this.buckets[i].index = i;
      }
      this.bucketDistribution();
    },



  },

});
</script>
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

.table {
  width: 50%;
  display: flex;
  align-content: flex-start;
  margin: 0 auto;
  flex-direction: column;
}

.form {
  width: 50%;
  display: flex;
  align-content: flex-start;
  margin: 0 auto;
}

.input-group {
  display: flex;
  align-content: start;
  margin-bottom: 20px;
}


.input {
  margin: 5px
}
</style>
