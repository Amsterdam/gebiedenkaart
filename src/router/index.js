import Vue from 'vue'
import Router from 'vue-router'
import HelloWorld from '@/components/HelloWorld'
import HelloAgain from '@/components/HelloAgain'
import Demo from '@/components/Demo'

Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      redirect: '/demo'
    },
    {
      path: '/helloworld',
      name: 'HelloWorld',
      component: HelloWorld
    },
    {
      path: '/helloagain/:text',
      name: 'HelloAgain',
      component: HelloAgain
    },
    {
      path: '/demo',
      name: 'Demo',
      component: Demo
    }
  ]
})
