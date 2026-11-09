import { createRouter, createWebHistory } from 'vue-router'

// Student-friendly routes setup for the Travel Agency Web App
import HomeView from '../views/HomeView.vue'
import PackagesView from '../views/PackagesView.vue'
import PackageDetailView from '../views/PackageDetailView.vue'
import BookingsView from '../views/BookingsView.vue'
import WishlistView from '../views/WishlistView.vue'
import AdminDashboard from '../views/admin/AdminDashboard.vue'
import AdminPackages from '../views/admin/AdminPackages.vue'
import AdminBookings from '../views/admin/AdminBookings.vue'

const routes = [
  // Public Customer Portal Routes
  {
    path: '/',
    name: 'Home',
    component: HomeView
  },
  {
    path: '/packages',
    name: 'Packages',
    component: PackagesView
  },
  {
    path: '/package/:id',
    name: 'PackageDetail',
    component: PackageDetailView,
    props: true
  },
  {
    path: '/bookings',
    name: 'Bookings',
    component: BookingsView
  },
  {
    path: '/wishlist',
    name: 'Wishlist',
    component: WishlistView
  },

  // Agency Staff / Admin Portal Routes
  {
    path: '/admin',
    name: 'AdminDashboard',
    component: AdminDashboard
  },
  {
    path: '/admin/packages',
    name: 'AdminPackages',
    component: AdminPackages
  },
  {
    path: '/admin/bookings',
    name: 'AdminBookings',
    component: AdminBookings
  },

  // Catch-all route redirects to Home
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  // Always scroll to top when navigating to a new page
  scrollBehavior() {
    return { top: 0 }
  }
})

export default router
