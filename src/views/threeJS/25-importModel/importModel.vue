<template>
  <div ref="three-box" class="three-box">
    <canvas ref="canvas" class="webgl" />
  </div>
</template>
<script>
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import stats from '../utils/stats'
import { listenResize, initGui } from '../utils/utils'
export default {
  name: 'VueAdminTemplateImportModel',

  data() {
    return {
      gui: null, // 调试面板
      canvas: null, // 画布
      scene: null, // 场景
      camera: null, // 相机
      controls: null, // 控制器
      clock: null,
      sizes: {
        width: 0,
        height: 0
      },
      debugParamters: {
        clearcoatColor: '#bfa',
        bodyColor: '#f00'
      }
    }
  },

  mounted() {
    const el = this.$refs['three-box']
    el.appendChild(stats.dom)
    this.clock = new THREE.Clock()
    this.scene = new THREE.Scene()
    this.canvas = this.$refs.canvas
    this.sizes = this.initSize(this.sizes)
    this.gui = initGui()
    this.initLights(this.scene)
    this.initFloor()
    const gltfLoader = new GLTFLoader()
    this.loadModel(gltfLoader)
    // Camera
    this.camera = this.initCamera(this.sizes)
    // Controls
    this.controls = this.initControls(this.camera, this.canvas)
    // Renderer
    this.renderer = this.initRenderer(this.canvas, this.sizes)
    // this.axes = initAxes(this.scene)

    // Sizes
    listenResize(this.sizes, this.camera, this.renderer)
    // Animate
    this.tick()
  },

  methods: {
    initSize(sizes) {
      sizes.width = this.$refs['three-box'].offsetWidth
      sizes.height = this.$refs['three-box'].offsetHeight
      return sizes
    },
    initLights(scene) {
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.8)
      scene.add(ambientLight)

      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6)
      directionalLight.castShadow = true
      directionalLight.shadow.mapSize.set(1024, 1024)
      directionalLight.shadow.camera.far = 15
      directionalLight.shadow.camera.left = -7
      directionalLight.shadow.camera.top = 7
      directionalLight.shadow.camera.right = 7
      directionalLight.shadow.camera.bottom = -7
      directionalLight.position.set(5, 5, 5)

      scene.add(directionalLight)

      const directionalLightFolder = this.gui.addFolder('平行光')
      directionalLightFolder
        .add(directionalLight, 'intensity', 0, 10, 0.001)
        .name('光强')
    },
    initFloor() {
      const floor = new THREE.Mesh(
        new THREE.PlaneBufferGeometry(10, 10),
        new THREE.MeshStandardMaterial({
          color: '#444444',
          metalness: 0,
          roughness: 0.5
        })
      )
      floor.receiveShadow = true
      floor.rotation.x = -Math.PI * 0.5
      this.scene.add(floor)
    },
    loadModel(gltfLoader) {
      gltfLoader.load(
        '/static/fictional_supercar_-_v12_goblin/scene.gltf',
        (gltf) => {
          gltf.scene.children[0].scale.set(1, 1, 1)
          gltf.scene.children[0].position.setY(0.1)
          console.log(gltf.scene)
          gltf.scene.children[0].traverse((child) => {
            if (child.isMesh) {
              console.log(child)
              if (child.name === 'clearcoat_clearcoat_0') {
                child.material.color.set(this.debugParamters.clearcoatColor)
                this.gui
                  .addColor(this.debugParamters, 'clearcoatColor')
                  .name('车罩颜色')
                  .onChange(() => {
                    child.material.color.set(this.debugParamters.clearcoatColor)
                  })
              }
              if (child.name === 'car_body_car_body_0') {
                child.material.color.set(this.debugParamters.bodyColor)
                child.material.emissive = child.material.color
                child.material.emissiveMap = child.material.map
                this.gui
                  .addColor(this.debugParamters, 'bodyColor')
                  .name('车壳颜色')
                  .onChange(() => {
                    child.material.color.set(this.debugParamters.bodyColor)
                  })
              }
              if (child.name === 'car_glass_car_glass_0') {
                child.material = new THREE.MeshPhongMaterial()
                child.material.color = new THREE.Color(0x333333)
                child.material.transparent = true
                child.material.opacity = 0.2
              }
            }
          })
          this.scene.add(gltf.scene.children[0])
          console.log(this.scene)
        },
        (xhr) => {
          console.log((xhr.loaded / xhr.total) * 100 + '%loaded')
        }
      )
    },
    initCamera(sizes) {
      const camera = new THREE.PerspectiveCamera(
        75,
        sizes.width / sizes.height,
        0.1,
        100
      )
      camera.position.set(1, 1, 2)
      return camera
    },
    initControls(camera, canvas) {
      const controls = new OrbitControls(camera, canvas)
      controls.enableDamping = true
      return controls
    },
    initRenderer(canvas, sizes) {
      const renderer = new THREE.WebGLRenderer({
        canvas
      })
      renderer.setSize(sizes.width, sizes.height)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      return renderer
    },
    tick() {
      stats.begin()
      // const elapsedTime = this.clock.getElapsedTime()
      // Update objects
      // Update controls
      this.controls.update()

      // Render
      this.renderer.render(this.scene, this.camera)
      stats.end()
      // Call tick again on the next frame
      window.requestAnimationFrame(this.tick)
    }
  }
}
</script>
