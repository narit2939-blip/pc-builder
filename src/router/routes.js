const routes = [
  { path: '/login', name: 'login', component: () => import('@/pages/LoginPage.vue') },
  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    children: [
      { path: '', name: 'builder', component: () => import('@/pages/BuilderPage.vue') }, // เปิดให้ทุกคนใช้ได้
      {
        path: 'saved',
        name: 'saved',
        component: () => import('@/pages/SavedBuildsPage.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'parts',
        name: 'parts',
        component: () => import('@/pages/PartsAdminPage.vue'),
        meta: { requiresAuth: true, roles: ['admin'] },
      },
    ],
  },
  { path: '/:catchAll(.*)*', component: () => import('@/pages/ErrorNotFound.vue') },
]

export default routes
