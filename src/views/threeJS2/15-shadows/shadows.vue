<template>
  <div ref="three-box" class="three-box">
    <canvas ref="canvas" class="webgl" />
  </div>
</template>

<script>
import * as THREE from 'three'
import { initStats } from '../utils/stats'
import baseSetting from '../utils/utils'

export default {
  data() {
    return {
      stats: null, // 帧率监视器
      canvas: null, // 画布
      scene: null, // 场景
      camera: null, // 相机
      controls: null, // 控制器
      sizes: {
        width: 0,
        height: 0
      },
      debugObj: {
        // 调试面板参数对象
        useBakedShadow: true // 使用烘焙贴图
      }
    }
  },
  beforeMount() {},
  mounted() {
    this.scene = new THREE.Scene()
    this.stats = initStats()
    this.canvas = this.$refs.canvas
    this.sizes = baseSetting.initSizes(this)
    // Camera
    this.camera = baseSetting.initCamera(this.sizes)
    // Controls
    this.controls = baseSetting.initControls({
      camera: this.camera,
      canvas: this.canvas
    })
    // Renderer
    this.renderer = baseSetting.initRenderer({
      canvas: this.canvas,
      sizes: this.sizes
    })
    baseSetting.listenResize(this.sizes, this.camera, this.renderer)
    this.gui = baseSetting.initLilGui()
    // Animate
    this.tick()
  },
  beforeDestroy() {
    this.scene.traverse((child) => {
      if (child.isMesh) {
        child.geometry.dispose()
        child.material.dispose()
      }
    })
    this.gui.destroy()
  },
  methods: {

    tick() {
      this.stats.begin()
      // Update controls
      this.controls.update()

      // Render
      this.renderer.render(this.scene, this.camera)

      this.stats.end()
      // Call tick again on the next frame
      window.requestAnimationFrame(this.tick)
    }
  }
}
</script>
