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
      texturesMap: {}
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
    this.texturesMap = this.loadTexture()
    this.gui = baseSetting.initLilGui()
    this.createObject(this.texturesMap['color'])
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
    loadTexture() {
      const texturesMap = {}
      const textures = [
        'color',
        'checkerboard-1024x1024',
        'checkerboard-8x8',
        'minecraft'
      ]
      const loadingManager = new THREE.LoadingManager()
      // 实例化纹理加载器,使用加载管理器loadingManager来跟踪 TextureLoader 的加载进度流程
      const textureLoader = new THREE.TextureLoader(loadingManager)
      textures.forEach((texture) => {
        if (texture === 'color') {
          texturesMap[texture] = textureLoader.load(
            `/static/11-textures/door/${texture}.jpg`
          )
        } else {
          texturesMap[texture] = textureLoader.load(
            `/static/11-textures/${texture}.png`
          )
        }

        if (['color', 'checkerboard-1024x1024'].indexOf(texture) > -1) {
          texturesMap[texture].minFilter = THREE.NearestFilter
        } else {
          texturesMap[texture].magFilter = THREE.NearestFilter
        }
      })
      return texturesMap
    },
    createObject(texture) {
      const params = {
        map: 'colorTexture'
      }
      const geometry = new THREE.BoxBufferGeometry(1, 1, 1)
      const material = new THREE.MeshBasicMaterial({
        map: texture
      })
      const mesh = new THREE.Mesh(geometry, material)
      this.scene.add(mesh)
      this.gui
        .add(params, 'map', {
          colorTexture: 'color',
          checkerboard1024Texture: 'checkerboard-1024x1024',
          checkerboard8Texture: 'checkerboard-8x8',
          minecraftTexture: 'minecraft'
        })
        .name('纹理贴图')
        .onFinishChange(() => {
          material.map = this.texturesMap[params.map]
        })
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
