import Vue from 'vue'
import Router from 'vue-router'
import HelloBraveGirls from '@/components/HelloBraveGirls'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'HelloBraveGirls',
      component: HelloBraveGirls
    }
  ]
})
