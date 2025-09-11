import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import { router } from './helpers'

import { library } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { far } from '@fortawesome/free-regular-svg-icons'
import { fab } from '@fortawesome/free-brands-svg-icons'

import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import Multiselect from 'vue-multiselect'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'vue-multiselect/dist/vue-multiselect.min.css'
import './assets/main.css'
import * as bootstrap from 'bootstrap'
import CountryFlag from 'vue-country-flag-next'

library.add(fas, far, fab)
window.bootstrap = bootstrap

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.component('font-awesome-icon', FontAwesomeIcon)
app.component('multi-select', Multiselect)
app.component('country-flag', CountryFlag)

app.mount('#app')
