import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

import PrimeVue from 'primevue/config'
import Aura from '@primeuix/themes/aura'
import 'primeicons/primeicons.css'
import ToastService from 'primevue/toastservice';
import Toast from 'primevue/toast'
import Tooltip from 'primevue/tooltip'

const app = createApp(App)
const pinia = createPinia();

app.use(pinia);
app.use(router)
app.use(PrimeVue, {
    theme: {
        preset: Aura
    }
})

app.use(ToastService)
app.component('Toast', Toast)
app.directive('tooltip', Tooltip)

app.mount('#app')
