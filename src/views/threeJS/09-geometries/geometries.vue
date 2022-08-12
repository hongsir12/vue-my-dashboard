<template>
  <div ref="three-box" class="three-box">
    <canvas ref="canvas" class="webgl" />
  </div>
</template>

<script>
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

export default {
  data() {
    return {
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
    this.sizes.width = this.$refs['three-box'].offsetWidth
    this.sizes.height = this.$refs['three-box'].offsetHeight
    this.scene = new THREE.Scene()
    this.canvas = this.$refs.canvas
    this.createMesh()
    // Camera
    this.initCamera()
    // Controls
    this.initControls()
    // Renderer
    this.initRenderer()
    // Sizes
    window.addEventListener('resize', () => {
      // Update sizes
      this.sizes.width = window.innerWidth
      this.sizes.height = window.innerHeight

      // Update camera
      this.camera.aspect = this.sizes.width / this.sizes.height
      this.camera.updateProjectionMatrix()

      // Update renderer
      this.renderer.setSize(this.sizes.width, this.sizes.height)
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    })
    // Animate
    this.tick()
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
    },

    initCamera() {
      this.camera = new THREE.PerspectiveCamera(
        75,
        this.sizes.width / this.sizes.height,
        0.1,
        100
      )
      this.camera.position.z = 3
      this.scene.add(this.camera)
    },
    initControls() {
      this.controls = new OrbitControls(this.camera, this.canvas)
      this.controls.enableDamping = true
    },
    initRenderer() {
      this.renderer = new THREE.WebGLRenderer({
        canvas: this.canvas
      })
      this.renderer.setSize(this.sizes.width, this.sizes.height)
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    },
    tick() {
      // Update controls
      this.controls.update()

      // Render
      this.renderer.render(this.scene, this.camera)

      // Call tick again on the next frame
      window.requestAnimationFrame(this.tick)
    }
  }
}
</script>
<style lang="scss" scoped>
</style>
