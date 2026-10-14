import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/HomeView.vue'),
    meta: { title: 'Ojitos — ¡Activa tu modo Googly! 👀' },
  },
  {
    path: '/create',
    name: 'create',
    component: () => import('@/views/CreateView.vue'),
    meta: { title: 'Crea tus Ojitos' },
  },
  {
    path: '/edit',
    name: 'edit',
    component: () => import('@/views/EditView.vue'),
    meta: { title: 'Edita tus Ojitos' },
  },
  {
    path: '/g/:publicId',
    name: 'photo',
    component: () => import('@/views/PhotoView.vue'),
    meta: { title: 'Ojitos compartidos' },
  },
  {
    path: '/gallery',
    name: 'gallery',
    component: () => import('@/views/GalleryView.vue'),
    meta: { title: 'Galería de Ojitos' },
  },
  {
    path: '/404',
    name: 'not-found',
    component: () => import('@/views/NotFoundView.vue'),
    meta: { title: 'Ojitos — No encontrado' },
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/404',
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0, behavior: 'smooth' }
  },
})

router.afterEach((to) => {
  if (typeof document !== 'undefined') {
    document.title = to.meta.title || 'Ojitos'
  }
})

export default router
