import * as dat from 'dat.gui'
import * as lildat from 'lil-gui'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { AxesHelper } from 'three'

const initSizes = (ins) => {
  const sizes = {}
  sizes.width = ins.$refs['three-box'].offsetWidth
  sizes.height = ins.$refs['three-box'].offsetHeight
  return sizes
}
const initCamera = (sizes, obj = { fov: 75, near: 0.1, far: 100 }) => {
  const camera = new THREE.PerspectiveCamera(
    obj.fov,
    sizes.width / sizes.height,
    obj.near,
    obj.far
  )
  camera.position.z = 3
  return camera
}
const initControls = ({ camera, canvas }) => {
  const controls = new OrbitControls(camera, canvas)
  controls.enableDamping = true
  return controls
}
const initRenderer = ({ canvas, sizes }) => {
  const renderer = new THREE.WebGLRenderer({
    canvas
  })
  renderer.setSize(sizes.width, sizes.height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  return renderer
}
/**
 * 监听窗口变化
 */
const listenResize = (sizes, camera, renderer) => {
  window.addEventListener('resize', () => {
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  })
}
/**
 * 全屏
 */
const setFullScreen = (canvas) => {
  const fullscreenElement =
    document.fullscreenElement || document.webkitFullscreenElement
  if (fullscreenElement) {
    if (document.exitFullscreen) {
      document.exitFullscreen()
    } else {
      document.webkitExitFullScreen()
    }
  } else {
    if (canvas.requestFullscreen) {
      canvas.requestFullscreen()
    } else {
      canvas.webkitRequestFullscreen()
    }
  }
}
/**
 * 双击全屏
 */
const dbClkFullScreen = (canvas) => {
  window.addEventListener('dblclick', () => {
    setFullScreen(canvas)
  })
}

// 初始化datgui调试面板
const initGui = () => {
  const gui = new dat.GUI()
  const guiEl = gui.domElement.parentNode // 获取其容器父节点的目的是为了在beforeDestroy周期调用gui.destroy()
  guiEl.classList.add('guiBox')
  guiEl.firstChild.style.marginRight = 0
  const el = document.querySelector('.three-box')
  el.appendChild(guiEl) // 将面板位置移到页面组件元素中
  return gui
}

// 初始化lilgui调试面板
const initLilGui = () => {
  const gui = new lildat.GUI()
  const guiEl = gui.domElement
  guiEl.classList.add('guiBox')
  const el = document.querySelector('.three-box')
  el.appendChild(guiEl) // 将面板位置移到页面组件元素中
  return gui
}

// 初始化坐标轴助手
const initAxes = (scene, length = 5) => {
  const axes = new AxesHelper(length)
  if (scene) {
    scene.add(axes)
  }
  return axes
}

export default {
  initSizes,
  initCamera,
  initControls,
  initRenderer,
  listenResize,
  setFullScreen,
  dbClkFullScreen,
  initGui,
  initLilGui,
  initAxes
}
