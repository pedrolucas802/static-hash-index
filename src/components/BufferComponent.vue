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
    <Button label="Submit" @click="submit" class="input"/>
  </div>

<!--  <TabView v-if="show">-->
  <TabView >

    <TabPanel header="Buckets">
      <div class="table">
        <Accordion style="width: 100%">
          <AccordionTab v-for="bucket in buckets"  :key="bucket.index" :header="'Bucket - '+ bucket.index" >
            <DataTable v-for="storage in bucket.storages" :value="storage.lines"  :key="storage.index" size="small"  paginator :rows="nrSizeBucket" :tableStyle="{minWidth: '50rem'}" paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink JumpToPageDropdown">
              <template #header>Storage - {{storage.index}}</template>
              <Column field="index" header="Index" style="width: 25%"></Column>
              <Column field="key" header="Name" style="width: 70%"></Column>
              <Column field="page" header="Page" style="width: 5%"></Column>
            </DataTable>
          </AccordionTab>
        </Accordion>

      </div>
    </TabPanel>

    <TabPanel header="Pages">
      <div class="table">
        <DataTable :value="indexedList" paginator :rows="nrSizePage" sztyle="min-width: 50rem"
                   paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink JumpToPageDropdown">
          <Column field="index" header="Index" style="width: 25%"></Column>
          <Column field="key" header="Name" style="width: 70%"></Column>
          <Column field="page" header="Page" style="width: 5%"></Column>
        </DataTable>
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
import {Storage} from "@/interfaces/Storage";

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
      nrPages: 0 as number,
      buckets: [] as Bucket[],
      indexedList: [] as Line[]
    }
  },
  methods: {
    submit(){
      this.paginate()
      this.generateBuckets()
      this.show=true
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

    paginate(): Line[]{
      let pageCnt = 0
      let currentPage = 1
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

    bucketDistribution(){
      let currentBucket = 0
      let currentStorage = 0
      let currentLine = 0

      // for (let i = 0; i < this.indexedList.length; i++) {
      //   if(this.buckets[currentBucket].storages[currentStorage].lines.length == this.nrSizeBucket) currentStorage++

      //   this.buckets[currentBucket].storages[currentStorage].lines.push(this.indexedList[i])
      //   this.buckets[currentBucket].storages[currentStorage].index = currentStorage

      //   currentBucket++
      //   if (currentBucket == this.buckets.length) currentBucket = 0

      // }
      this.indexedList.forEach((register) => {
        // debugger;
        const index = this.getBucketIndexByKey(register.key);
        if (this.buckets[index].storages[0].lines.length == this.buckets[index].storageSize){
          console.log('overflow');
          this.buckets[index].storages[0].lines.push(register);
        } else {
          this.buckets[index].storages[0].lines.push(register);
        }
      })
    },

    generateBuckets() {
      this.nrBuckets = Math.ceil(this.list.length / this.nrSizeBucket);
      for (let i = 0; i < this.nrBuckets; i++) {
        this.buckets[i] = new Bucket();
        this.buckets[i].storageSize = this.nrSizeBucket;
        const storage = [];
        storage.push(new Storage());
        this.buckets[i].storages = storage;
        this.buckets[i].storages[0].lines = [];
        this.buckets[i].index = i;
      }
      this.bucketDistribution();
    }

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
