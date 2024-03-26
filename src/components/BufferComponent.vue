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
      <Button label="Submit" :disabled="!fgFileChoosen" :loading="submitLoad" @click="submit" class="input"/>
    </div>
    <div class="stats" v-if="showPages">
      <div class="result">
        <label>Nr. buckets</label>
        <span id="buckets">{{buckets.length}}</span>
      </div>
      <div class="result">
        <label>Colisions</label>
        <span id="colisions">{{ (nrCollisions/list.length * 100).toFixed(2) }}%</span>
      </div>
      <div class="result">
        <label for="overflows">Overflows</label>
        <span id="overflows">{{ (nrOverflows/list.length * 100).toFixed(2) }}%</span>
      </div>
    </div>
  </div>
  <div v-if="submitLoad">
    <span>Carregando...</span>
  </div>
  <TabView  v-if="showPages">
    <TabPanel header="Pages">
      <div class="table">
        <DataTable lazy :value="pages[currentPage]"  :rows="nrSizePage" sztyle="min-width: 50rem">
          <Column field="index" header="Index" style="width: 25%"></Column>
          <Column field="key" header="Name" style="width: 40%"></Column>
          <Column field="page" header="Page" style="width: 5%"></Column>
        </DataTable>
        <Paginator  :template="{ default: 'FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink JumpToPageDropdown', }"
                    :rows="nrSizePage" :totalRecords="list.length" @page="onPage($event)"></Paginator>
      </div>
    </TabPanel>

<!--    <TabPanel header="Buckets">-->
<!--      <div class="table">-->
<!--        <DataTable lazy :value="pages[currentPage]"  :rows="nrSizePage" sztyle="min-width: 50rem">-->
<!--          <Column field="index" header="Index" style="width: 25%"></Column>-->
<!--          <Column field="key" header="Name" style="width: 40%"></Column>-->
<!--          <Column field="page" header="Page" style="width: 5%"></Column>-->
<!--        </DataTable>-->
<!--        <Paginator  :template="{ default: 'FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink JumpToPageDropdown', }"-->
<!--                    :rows="nrSizePage" :totalRecords="list.length" @page="onPage($event)"></Paginator>-->
<!--      </div>-->
<!--    </TabPanel>-->

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
          <label>Page: {{foundLine ? foundLine.page + 1: 'Registro não encontrado'}}</label>
        </div>
      </Dialog>
    </TabPanel>

  </TabView>

</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { Bucket } from '@/interfaces/Bucket';
import { Line } from '@/interfaces/Line';
import DataTable from "primevue/datatable";

export default defineComponent({
  name: 'BufferComponent',
  components: {
    DataTable,
  },
  data() {
    return {
      show: false,
      showPages: false,
      fgModal: false,
      fgModalScan: false,
      fgFileChoosen: false,
      submitLoad: false,
      nmFile: '',
      list: [] as string[],
      nrToHash: 23 as number,
      nrSizeBucket: 3 as number,
      nrSizePage: 5 as number,
      nrBuckets: 0 as number,
      buckets: [] as Bucket[],
      book: [] as Line[],
      pages: [] as Line[][],
      searchKey: "",
      foundLine: {} as Line,
      nrCollisions: 0  as number,
      nrOverflows: 0  as number,
      fgResult: false,
      fileContent: null as any,
      scanAmount: 0,
      pagesAccessed: 0,
      scanLines: [] as Line[],
      pagesTableKey: 0,
      currentPage: 0
    }
  },
  methods: {
     submit(){
      this.nrOverflows = 0
      this.nrCollisions = 0
      this.paginate()
      this.generateBuckets()
       console.log("completed")
       // this.showBuckets = true
    },

    openFile(event: { target: any; }) {
      var input = event.target;

      const reader = new FileReader();
      reader.onload = () => {
        const text = reader.result;
        const node = document.getElementById('output');
        node?.innerText ? text : null;
        if(typeof text === 'string') {
          this.list = text.split('\n');
          this.fgFileChoosen = true;
        }
      };
      this.nmFile = input.files[0].name;
      reader.readAsText(input.files[0]);
    },

    paginate(){
      let pageCnt = 0;
      let currentPage = 0;
      this.pages[0] = []
      this.list.forEach((register, index) => {
        this.book.push({key: register, index: index, page: currentPage})
        if(pageCnt >= this.nrSizePage) {
          currentPage ++
          pageCnt = 0
          this.pages[currentPage] = []
        }
        this.pages[currentPage].push({key: register, index: index, page: currentPage});
        pageCnt ++
      })
    },

    async generateBuckets() {
      this.nrBuckets = Math.ceil(this.list.length / this.nrSizeBucket);
      for (let i = 0; i < this.nrBuckets; i++) {
        this.buckets[i] = new Bucket();
        this.buckets[i].lines = [] as Line[];
        this.buckets[i].index = i;
      }
      await this.bucketDistribution();
    },

    async bucketDistribution(){
      this.pages.forEach((page) => {
        page.forEach(line =>{
          let bucket = this.buckets[this.getBucketIndexByKey(line.key)]
          if (bucket) {
            if(bucket.lines.length == this.nrSizeBucket) this.bucketOverflow(bucket, line)
            else bucket.lines.push(line)
          }
          else console.error("Bucket not found for key:",line.key);
        })
      })
      this.showPages = true
      console.log(this.buckets)
    },

    bucketOverflow(bucket: Bucket, line: Line){
      if(bucket.overflow != undefined){
        if(bucket.overflow.lines.length < this.nrSizeBucket){
          this.nrCollisions++
          bucket.overflow.lines.push(line)
        }else{
          this.bucketOverflow(bucket.overflow,line)
        }
      }else{
        bucket.overflow = new Bucket()
        this.nrOverflows++
        bucket.overflow.lines = [] as Line[];
        bucket.overflow.lines.push(line)
        this.nrCollisions++
      }
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
      let hashValue = 0;
      for (const char of value) {
        hashValue ^= char.charCodeAt(0);
        hashValue *= this.nrToHash;
      }
      return hashValue ;
    },

    getBucketIndexByKey(value: string): number {
      let hash = this.generateHash(value);
      return  Math.abs(hash % this.nrBuckets);
    },

    tableScan(scanAmount: number) {
      this.pagesAccessed = Math.ceil(scanAmount / this.nrSizePage)
      this.scanLines = [];
      for (let i = 0; i < scanAmount; i++) {
        this.scanLines.push({key: this.list[i],index: i, page: 0, })
      }
      this.fgModalScan = true;
    },
    onPage(event: any){
      this.currentPage = event.page
    },
    async getNumberOfOverflows(bucket: Bucket) : Promise<number | undefined> {
      let n = 0;
      let aux = bucket;
      while (aux.overflow) {
        aux = aux.overflow;
        n++;
      }
      return n;
    },
    async getBuckets(bucket: Bucket) : Promise<Bucket[]>{
      let buckets: Bucket[] = [];
      buckets.push(bucket);
      while (bucket.overflow) {
        bucket = bucket.overflow;
        buckets.push(bucket);
      }
      return buckets;
    },
    toggleRowExpansion(row: { overflow: boolean; }) {
      row.overflow = !row.overflow;
    },
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
