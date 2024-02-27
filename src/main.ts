import "primevue/resources/themes/saga-blue/theme.css";
import "primevue/resources/primevue.min.css";

import { createApp } from 'vue'
import App from './App.vue'
import store from './store'
import PrimeVue from 'primevue/config';
import InputText from 'primevue/inputtext';

createApp(App)
.use(store)
.use(PrimeVue)
.component('InputText', InputText)

.mount('#app')
