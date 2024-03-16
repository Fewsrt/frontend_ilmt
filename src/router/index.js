import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import CreateLicenseMapping from '../views/CreateLicenseMapping.vue'
import Calculator from '../views/Calculator.vue'
import uploadpdfVue from '../views/UploadPdf.vue'
import uploadCsv from '../views/UploadCsv.vue'
import FindTableData from '../views/FindTableData.vue'
import ReportData from '../views/ReportData.vue'
import testocr from '../views/testocr.vue'

const routes = [
  {
    path: '/',
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
  {
    path: '/reportdata',
    name: 'reportdata',
    component: ReportData
  },
  {
    path: '/test',
    name: 'test',
    component: testocr
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
