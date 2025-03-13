import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';
import About from '../views/About.vue';
import Login from '../views/Login.vue';
import PublicationList from '../views/PublicationList.vue';
import TestRunner from '../components/TestRunner.vue';
import TestPreviewer from '../components/TestPreviewer.vue';

const routes = [
  {
    path: '/',
    redirect: '/publications'
  },
  {
    path: '/publications',
    name: 'Publication',
    component: PublicationList,
    meta: { requiresAuth: true },
  },
 /*  {
    path: '/home',
    name: 'Home',
    component: Home,
    meta: { requiresAuth: true },
  },
  {
    path: '/about',
    name: 'About',
    component: About,
  }, */
  {
    path: '/login',
    name: 'Login',
    component: Login,
  },
  {
    path: '/test-runner',
    name: 'TestRunner',
    component: TestRunner,
    meta: { requiresAuth: true },
  },
  {
    path: '/test-preview',
    name: 'testpreview',
    component: TestPreviewer,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token');
  if (to.meta.requiresAuth && !token) {
    next('/login');
  } else {
    next();
  }
});

router.afterEach((to) => {
  // Supprime toutes les classes du body qui pourraient venir d'autres pages
  document.body.className = '';

  // Ajoute une classe spécifique pour la page de login
  if (to.name === 'Login') {
    document.body.classList.add('login-page');
  }

  if (to.name === 'Home') {
    document.body.classList.add('home-page');
  }
});

export default router;
