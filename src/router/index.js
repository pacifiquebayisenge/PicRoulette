import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import GameView from '@/views/GameView.vue'
import userService from '@/services/userService'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/game',
      name: 'game',
      component: GameView
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue')
    },
    // Catch-all route for unknown paths
    {
      path: '/:pathMatch(.*)*',
      redirect: '/'
    }
  ]
})

// Add a global navigation guard
router.beforeEach((to, from, next) => {
  const isAuthenticated = userService.isAuthenticated()

  if (to.name === 'game' && !isAuthenticated) {
    // Redirect to home if trying to access /game without a valid user
    next({ name: 'home' })
  } else {
    // Allow navigation
    next()
  }
})

export default router
