// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import 'leaflet/dist/leaflet.css'

import Vue from 'vue'
import { mapGetters, mapActions } from 'vuex'

import axios from 'axios'
import VueAxios from 'vue-axios'
import BootstrapVue from 'bootstrap-vue'
import * as uiv from 'uiv'

import App from './App'
import router from './router'
import store from './store'
import util from './services/util'

Vue.use(VueAxios, axios)
Vue.use(BootstrapVue)
Vue.use(uiv, {prefix: 'uiv'})
Vue.config.productionTip = false

/* eslint-disable no-new */
let vueApp = new Vue({
  el: '#app',
  router,
  store,
  components: {
    App
  },
  template: '<App/>',
  computed: {
    ...mapGetters([
      'text'
    ])
  },
  methods: {
    ...mapActions({
      setText: 'setText'
    }),
    async init () {
      const url = 'https://jsonplaceholder.typicode.com/posts/1'
      let data = await util.readData(url)
      this.setText(data.title)
    }
  }
})

vueApp.init()
