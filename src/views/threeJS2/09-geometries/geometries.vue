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
    this.mesh = this.createMesh()
    this.gui = baseSetting.initLilGui()
    // Animate
    this.tick()
  },
  beforeDestroy() {
    this.mesh.geometry.dispose()
    this.mesh.material.dispose()
    this.scene.remove(this.mesh)
    this.gui.destroy()
  },
  methods: {
    createMesh() {
      // 声明一个缓冲类几何体(性能更好)
      const geometry = new THREE.BufferGeometry()
      // 创建n个顶点数据数组
      // 创建50个三角形
      const count = 50
      // 每个三角形包含三个点，每个点包含3个值，因此需要50*3*3个数据
      const positionArray = new Float32Array(count * 3 * 3)
      for (let i = 0; i < count * 3 * 3; i++) {
        positionArray[i] = (Math.random() - 0.5) * 4
      }
      const positionAttribute = new THREE.BufferAttribute(positionArray, 3)
      geometry.setAttribute('position', positionAttribute)

      const material = new THREE.MeshBasicMaterial({
        color: 0xff0000,
        wireframe: true
      })
      const mesh = new THREE.Mesh(geometry, material)
      this.scene.add(mesh)
      return mesh
    },
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
