import * as dat from 'dat.gui'
import { AxesHelper } from 'three'
/**
 * 监听窗口变化
 */
export const listenResize = (sizes, camera, renderer) => {
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
export const setFullScreen = (canvas) => {
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
export const dbClkFullScreen = (canvas) => {
  window.addEventListener('dblclick', () => {
    setFullScreen(canvas)
  })
}

// 初始化调试面板
export const initGui = () => {
  const gui = new dat.GUI()
  const guiEl = gui.domElement.parentNode // 获取其容器父节点的目的是为了在beforeDestroy周期调用gui.destroy()
  guiEl.classList.add('guiBox')
  guiEl.firstChild.style.marginRight = 0
  const el = document.querySelector('.three-box')
  el.appendChild(guiEl) // 将面板位置移到页面组件元素中
  return gui
}

// 初始化坐标轴助手
export const initAxes = (scene, length = 5) => {
  const axes = new AxesHelper(length)
  if (scene) {
    scene.add(axes)
  }
  return axes
}