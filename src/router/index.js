import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/* Layout */
import Layout from '@/layout'

/**
 * Note: sub-menu only appear when route children.length >= 1
 * Detail see: https://panjiachen.github.io/vue-element-admin-site/guide/essentials/router-and-nav.html
 *
 * hidden: true                   if set true, item will not show in the sidebar(default is false)
 * alwaysShow: true               if set true, will always show the root menu
 *                                if not set alwaysShow, when item has more than one children route,
 *                                it will becomes nested mode, otherwise not show the root menu
 * redirect: noRedirect           if set noRedirect will no redirect in the breadcrumb
 * name:'router-name'             the name is used by <keep-alive> (must set!!!)
 * meta : {
    roles: ['admin','editor']    control the page roles (you can set multiple roles)
    title: 'title'               the name show in sidebar and breadcrumb (recommend set)
    icon: 'svg-name'/'el-icon-x' the icon show in the sidebar
    breadcrumb: false            if set false, the item will hidden in breadcrumb(default is true)
    activeMenu: '/example/list'  if set path, the sidebar will highlight the path you set
  }
 */

/**
 * constantRoutes
 * a base page that does not have permission requirements
 * all roles can be accessed
 */
export const constantRoutes = [
  {
    path: '/login',
    component: () => import('@/views/login/index'),
    hidden: true
  },

  {
    path: '/404',
    component: () => import('@/views/404'),
    hidden: true
  },

  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'HONGSIR',
        component: () => import('@/views/dashboard/index'),
        meta: { title: 'HONGSIR', icon: 'dashboard' }
      }
    ]
  },

  {
    path: '/threeJS',
    component: Layout,
    redirect: '/threeJS/geometries',
    name: 'threeJS',
    meta: { title: 'threeJS', icon: 'el-icon-s-help' },
    children: [
      {
        path: 'geometries',
        name: '几何体',
        component: () => import('@/views/threeJS/09-geometries/geometries'),
        meta: { title: '几何体' }
      },
      {
        path: 'debug-ui',
        name: '调试面板',
        component: () => import('@/views/threeJS/10-debug-ui/debug-ui'),
        meta: { title: '调试面板' }
      },
      {
        path: 'textures',
        name: '纹理',
        component: () => import('@/views/threeJS/11-textures/textures'),
        meta: { title: '纹理' }
      },
      {
        path: 'material',
        name: '材质',
        component: () => import('@/views/threeJS/12-materials/materials'),
        meta: { title: '材质' }
      },
      {
        path: '3D-Text',
        name: '3D文字',
        component: () => import('@/views/threeJS/13-3D-Text/3D-Text'),
        meta: { title: '3D文字' }
      },
      {
        path: 'lights',
        name: '灯光',
        component: () => import('@/views/threeJS/14-lights/lights'),
        meta: { title: '灯光' }
      },
      {
        path: 'shadows',
        name: '阴影',
        component: () => import('@/views/threeJS/15-shadows/shadows'),
        meta: { title: '阴影' }
      },
      {
        path: 'hauntedHouse',
        name: '简单鬼屋',
        component: () => import('@/views/threeJS/16-hauntedHouse/hauntedHouse'),
        meta: { title: '简单鬼屋' }
      },
      {
        path: 'particles',
        name: '粒子',
        component: () => import('@/views/threeJS/17-particles/particles'),
        meta: { title: '粒子' }
      },
      {
        path: 'galaxyGenerator',
        name: '银河星系',
        component: () =>
          import('@/views/threeJS/18-galaxyGenerator/galaxyGenerator'),
        meta: { title: '银河星系' }
      },
      {
        path: 'rayCaster',
        name: '光线投射',
        component: () => import('@/views/threeJS/19-raycaster/rayCaster'),
        meta: { title: '光线投射' }
      },
      {
        path: 'scrollBasedAnimation',
        name: '基于页面滚动动画',
        component: () =>
          import(
            '@/views/threeJS/20-ScrollBasedAnimation/scrollBasedAnimation'
          ),
        meta: { title: '基于页面滚动动画' }
      },
      {
        path: 'physics',
        name: '物理引擎',
        component: () => import('@/views/threeJS/21-Physics/physics'),
        meta: { title: '物理引擎' }
      },
      {
        path: 'physicsMuti',
        name: '物理引擎——多物体',
        component: () => import('@/views/threeJS/22-PhysicsMuti/physicsMuti'),
        meta: { title: '物理引擎——多物体' }
      },
      {
        path: 'audioPlayer',
        name: '音频播放器',
        component: () => import('@/views/threeJS/23-AudioPlayer/audioPlayer'),
        meta: { title: '音频播放器' }
      }
    ]
  },

  {
    path: '/form',
    component: Layout,
    redirect: '/form/index',
    name: 'Form',
    meta: { title: 'Form', icon: 'form' },
    children: [
      {
        path: 'form',
        name: '表单',
        component: () => import('@/views/form/index'),
        meta: { title: '表单' }
      },
      {
        path: 'vue-create',
        name: '动态表单',
        component: () => import('@/views/form/form-create/form-create'),
        meta: { title: '动态表单' }
      }
    ]
  },

  {
    path: '/nested',
    component: Layout,
    redirect: '/nested/menu1',
    name: 'Nested',
    meta: {
      title: 'Nested',
      icon: 'nested'
    },
    children: [
      {
        path: 'menu1',
        component: () => import('@/views/nested/menu1/index'), // Parent router-view
        name: 'Menu1',
        meta: { title: 'Menu1' },
        children: [
          {
            path: 'menu1-1',
            component: () => import('@/views/nested/menu1/menu1-1'),
            name: 'Menu1-1',
            meta: { title: 'Menu1-1' }
          },
          {
            path: 'menu1-2',
            component: () => import('@/views/nested/menu1/menu1-2'),
            name: 'Menu1-2',
            meta: { title: 'Menu1-2' },
            children: [
              {
                path: 'menu1-2-1',
                component: () =>
                  import('@/views/nested/menu1/menu1-2/menu1-2-1'),
                name: 'Menu1-2-1',
                meta: { title: 'Menu1-2-1' }
              },
              {
                path: 'menu1-2-2',
                component: () =>
                  import('@/views/nested/menu1/menu1-2/menu1-2-2'),
                name: 'Menu1-2-2',
                meta: { title: 'Menu1-2-2' }
              }
            ]
          },
          {
            path: 'menu1-3',
            component: () => import('@/views/nested/menu1/menu1-3'),
            name: 'Menu1-3',
            meta: { title: 'Menu1-3' }
          }
        ]
      },
      {
        path: 'menu2',
        component: () => import('@/views/nested/menu2/index'),
        name: 'Menu2',
        meta: { title: 'menu2' }
      }
    ]
  },

  {
    path: 'external-link',
    component: Layout,
    children: [
      {
        path: 'https://panjiachen.github.io/vue-element-admin-site/#/',
        meta: { title: 'External Link', icon: 'link' }
      }
    ]
  },

  // 404 page must be placed at the end !!!
  { path: '*', redirect: '/404', hidden: true }
]

const createRouter = () =>
  new Router({
    // mode: 'history', // require service support
    scrollBehavior: () => ({ y: 0 }),
    routes: constantRoutes
  })

const router = createRouter()

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}

export default router
