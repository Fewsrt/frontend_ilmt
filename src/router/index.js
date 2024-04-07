import { createRouter, createWebHashHistory } from 'vue-router'
import Login from '../views/login.vue'
import HomeView from '../views/HomeView.vue'
import CreateLicenseMapping from '../views/CreateLicenseMapping.vue'
import Calculator from '../views/Calculator.vue'
import uploadpdfVue from '../views/UploadPdf.vue'
import uploadCsv from '../views/UploadCsv.vue'
import FindTableData from '../views/FindTableData.vue'
import Dashboard from '../views/Dashboard.vue';

const routes = [
  {
    path: '/',
    name: 'Login',
    component: Login
  },
  {
    path: '/dashboard/:username',
    name: 'Dashboard',
    component: Dashboard,
  },
  {
    path: '/home',
    name: 'home',
    component: HomeView
  },
  {
    path: '/licensemapping',
    name: 'licensemapping',
    component: CreateLicenseMapping
  },
  {
    path: '/calculator',
    name: 'calculator',
    component: Calculator
  },
  {
    path: '/uploadpdf',
    name: 'uploadpdf',
    component: uploadpdfVue
  },
  {
    path: '/uploadcsv',
    name: 'uploadcsv',
    component: uploadCsv
  },
  {
    path: '/findtabledata',
    name: 'findtabledata',
    component: FindTableData
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
