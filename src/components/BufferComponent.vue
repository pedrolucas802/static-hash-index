<template>
  <div class="input-group justify-content-between">
    <div class="flex-direction" style="display:flex">
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
      <input type='file' id="input-file" accept='text/plain' @change='openFile($event)'><br>
      <label for="input-file" class="file-label">{{ fgFileChoosen ? nmFile : 'Choose File' }}</label>
      <Button label="Submit" :disabled="!fgFileChoosen" @click="submit" class="input"/>
    </div>
    <div class="stats" v-if="buckets.length > 0">
      <div class="result">
        <label>Nr. colisions</label>
        <span id="colisions">{{nrCollisions}}</span>
      </div>

      <div class="result">
        <label for="overflows">Nr. overflows</label>
        <span id="overflows">{{nrOverflows}}</span>
      </div>

    </div>
  </div>
  <TabView v-if="buckets.length > 0">
    <TabPanel header="Buckets">
      <div class="table">
        <Accordion style="width: 100%;">
          <AccordionTab v-for="bucket in buckets"  :key="bucket.index" :header="'Bucket '+ bucket.index + ' - Overflow: ' + getNumberOfOverflows(bucket)">
            <DataTable v-for="(b, index) in getBuckets(bucket)" :key="b.index" :value="b.lines">
             <template #header>Level - {{index}}</template>
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
        <div v-for="(page, index) in pages"  :key="index">
          <DataTable :value="page"  :rows="nrSizePage" sztyle="min-width: 50rem">
            <Column field="index" header="Index" style="width: 25%"></Column>
            <Column field="key" header="Name" style="width: 40%"></Column>
            <Column field="page" header="Page" style="width: 5%"></Column>
          </DataTable>
        </div>

      </div>
    </TabPanel>

    <TabPanel header="Table Scan">
        <div class="form">
          <FloatLabel >
            <InputNumber id="scanAmount" v-model="scanAmount" placeholder="Type a number of lines" class="input"/>
            <label for="scanAmount">Scan</label>
          </FloatLabel>
          <Button label="Submit" @click="tableScan(scanAmount)" class="input"/>
        </div>
        <Dialog v-model:visible="fgModalScan" modal header="Scan Result">
          <div class="result">
            <label>Registros: {{scanAmount ? scanAmount : 'Não encontrado'}}</label>
            <label>Paginas acessadas: {{pagesAccessed ? pagesAccessed  : 'Registro não encontrado'}}</label>
          </div>
          <DataTable :value="scanLines" :rows="nrSizePage" style="min-width: 50rem; margin-top: 15px;" paginator>
            <Column field="index" header="Index" style="width: 5%"></Column>
            <Column field="key" header="Key" style="width: 95%"></Column>
          </DataTable>
        </Dialog>
    </TabPanel>

    <TabPanel header="Pesquisa">
      <div class="form">
        <FloatLabel >
          <InputText id="searchKey" v-model="searchKey" placeholder="Search a key value" class="input"/>
          <label for="searchKey">Key</label>
        </FloatLabel>
        <Button label="Submit" @click="searchHash(searchKey)" class="input"/>
      </div>
      <Dialog v-model:visible="fgModal" modal header="Result" :style="{ width: '50rem' }">
        <div v-if="fgResult" class="result">
          <label>Index: {{foundLine ? foundLine.index : 'Registro não encontrado'}}</label>
          <label>Key: {{foundLine ? foundLine.key  : 'Registro não encontrado'}}</label>
          <label>Page: {{foundLine ? foundLine.page : 'Registro não encontrado'}}</label>
        </div>
      </Dialog>
    </TabPanel>

  </TabView>

</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { Bucket } from '@/interfaces/Bucket';
import { Line } from '@/interfaces/Line';
import { useStore } from 'vuex';
import DataTable from "primevue/datatable";

export default defineComponent({
  name: 'BufferComponent',
  components: {
    DataTable,
  },
  setup() {
    const store = useStore();
    const getBuckets = (bucket: Bucket) : Bucket[] => {
      let buckets: Bucket[] = [];
      buckets.push(bucket);
      while (bucket.overflow) {
        bucket = bucket.overflow;
        buckets.push(bucket);
      }
      return buckets;
    }
    const getNumberOfOverflows = (bucket: Bucket) : number | undefined => {
      let n = 0;
      let aux = bucket;
      while (aux.overflow) {
        aux = aux.overflow;
        n++;
      }
      return n;
    }
    return {
      getNumberOfOverflows,
      getBuckets,
      store
    }
  },
  data() {
    return {
      show: false,
      fgModal: false,
      fgModalScan: false,
      fgFileChoosen: false,
      nmFile: '',
      list: [] as string[],
      nrToHash: 23 as number,
      nrSizeBucket: 3 as number,
      nrSizePage: 5 as number,
      nrBuckets: 0 as number,
      buckets: [] as Bucket[],
      indexedList: [] as Line[],
      pages: [] as Line[][],
      searchKey: "",
      foundLine: {} as Line,
      nrCollisions: 0,
      nrOverflows: 0,
      fgResult: false,
      fileContent: null as any,
      scanAmount: 0,
      pagesAccessed: 0,
      scanLines: [] as Line[],

    }
  },
  methods: {
    submit(){
      this.paginate()
      this.generateBuckets()
      this.show=true
    },

    openFile(event: { target: any; }) {
      var input = event.target;

      const reader = new FileReader();
      reader.onload = () => {
        const text = reader.result;
        const node = document.getElementById('output');
        node?.innerText ? text : null;
        if(typeof reader.result === 'string') {
          this.list = reader.result.split('\r\n');
          this.fgFileChoosen = true;
        }
      };
      this.nmFile = input.files[0].name;
      reader.readAsText(input.files[0]);
    },

    async searchHash(key: string) {
      let bIndex = this.getBucketIndexByKey(key)
      let bucket = this.buckets[bIndex]
      let stop = false
      let page = 0
      while (!stop) {
        bucket.lines.forEach(l => {
          if (l.key === key) {
            page = l.page
            stop = true
          }
        })
        if (bucket.overflow) bucket = bucket.overflow
        else stop = true
      }
      this.foundLine = await this.findRegisterPerPage(key, page)
      this.fgResult = true;
      this.fgModal = true;
    },

    async findRegisterPerPage(key: string, page: number): Promise<Line>{
      let result = {} as Line
      this.pages[page].forEach(line =>{
        if(line.key == key) result = line
      })
      return result
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

    tableScan(scanAmount: number) {
      this.pagesAccessed = Math.ceil(scanAmount / this.nrSizePage)
      this.scanLines = [];
      for (let i = 0; i < scanAmount; i++) {
        this.scanLines.push({key: this.list[i],index: i, page: 0, })
      }
      this.fgModalScan = true;
    }
  },

});
</script>
<style scoped>
input[type=file] {
  display: none;
}
.file-label {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 3px;
  padding: 7px 16px;
  height: 40px;
  color: white;
  background-color: #2196F3;
  margin-top:5px;
}
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
  margin: 10px auto;
}

.input-group {
  display: flex;
  align-content: start;
  margin-bottom: 20px;
}


.input {
  margin: 5px
}

.result{
  display: flex;
  flex-direction: column;
  //justify-content: left;
  padding-right: 16px;
}
.stats{
  display: flex;
  justify-content: end;
  //width: 100%;
}
</style>: { target: { files: any[]; }; }: Blob
