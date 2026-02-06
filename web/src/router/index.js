import { createRouter, createWebHistory } from 'vue-router';
import QuotationPage from '../pages/QuotationPage.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'quotation',
      component: QuotationPage,
    },
  ],
});

export default router;
