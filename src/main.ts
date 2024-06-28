import './assets/main.css'

import { library } from '@fortawesome/fontawesome-svg-core'
import { faVolumeUp } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

import { createApp } from 'vue'

import App from './App.vue'
import router from './router/router'

library.add(faVolumeUp)

createApp(App).use(router).component('font-awesome-icon', FontAwesomeIcon).mount('#app')
