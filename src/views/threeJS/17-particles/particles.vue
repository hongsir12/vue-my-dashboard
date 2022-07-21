<template>
  <div ref="three-box" class="three-box">
    <canvas ref="canvas" class="webgl" />
  </div>
</template>
<script>
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import stats from '../utils/stats'
import { listenResize, initGui } from '../utils/utils'
export default {
  data() {
    return {
      gui: null, // 调试面板
      canvas: null, // 画布
      scene: null, // 场景
      camera: null, // 相机
      controls: null, // 控制器
      renderer: null, // 渲染器
      particles: null, // 粒子
      texture: null, // 粒子纹理
      sizes: {
        width: 0,
        height: 0
      },
      debugObj: {
        particlesColor: '#bbffaa',
        texture: '1'
      }
    }
  },
  mounted() {
    const el = document.querySelector('.three-box')
    el.appendChild(stats.dom)
    this.clock = new THREE.Clock()
    this.scene = new THREE.Scene()
    this.canvas = this.$refs.canvas
    this.sizes = this.initSize(this.sizes)
    this.gui = initGui()
    this.textureLoader = new THREE.TextureLoader()
    this.texture = this.loadTextures(this.debugObj.texture, this.textureLoader)
    this.particles = this.createParticles()
    this.camera = this.initCamera(this.sizes)
    this.controls = this.initControls(this.camera, this.canvas)
    this.renderer = this.initRenderer(this.canvas, this.sizes)
    this.setDebug(this.gui, this.particles)
    listenResize(this.sizes, this.camera, this.renderer)
    this.tick()
  },
  beforeDestroy() {
    this.gui.destroy()
  },
  methods: {
    // 加载纹理
    loadTextures(num, textureLoader) {
      const particleTexture = textureLoader.load(
        `/static/11-textures/particles/${num}.png`
      )
      return particleTexture
    },
    // 创建粒子
    createParticles() {
      const particlesGeometry = new THREE.BufferGeometry()
      const particlesMaterial = new THREE.PointsMaterial({
        size: 0.02, // 粒子大小
        sizeAttenuation: true, // 开启尺寸衰减
        color: this.debugObj.particlesColor
      })
      particlesMaterial.transparent = true
      particlesMaterial.alphaMap = this.texture
      const count = 500000
      const positions = new Float32Array(count * 3)
      const colors = new Float32Array(count * 3)
      for (let i = 0; i < count * 3; i++) {
        positions[i] = (Math.random() - 0.5) * 10
        colors[i] = Math.random()
      }
      particlesGeometry.setAttribute(
        'position',
        new THREE.BufferAttribute(positions, 3)
      )
      particlesGeometry.setAttribute(
        'color',
        new THREE.BufferAttribute(colors, 3)
      )
      const particles = new THREE.Points(particlesGeometry, particlesMaterial)

      particlesMaterial.depthWrite = false
      particlesMaterial.blending = THREE.AdditiveBlending
      particlesMaterial.vertexColors = true
      this.scene.add(particles)
      return particles
    },
    setDebug(gui, particles) {
      gui
        .addColor(this.debugObj, 'particlesColor')
        .name('粒子颜色')
        .onChange(() => {
          particles.material.color.set(this.debugObj.particlesColor)
        })
      gui
        .add(this.debugObj, 'texture', {
          圆点: '1',
          圆环: '2',
          雾团: '3',
          凝光: '4',
          辉光: '5',
          月牙: '6',
          靶心: '7',
          十字: '8',
          星星: '9',
          爱心: '10',
          五角: '11',
          竖状: '12',
          条状: '13'
        })
        .name('粒子纹理')
        .onChange(() => {
          this.particles.material.alphaMap = this.loadTextures(
            this.debugObj.texture,
            this.textureLoader
          )
        })
    },
    initSize(sizes) {
      sizes.width = this.$refs['three-box'].offsetWidth
      sizes.height = this.$refs['three-box'].offsetHeight
      return sizes
    },
    initCamera(sizes) {
      const camera = new THREE.PerspectiveCamera(
        75,
        sizes.width / sizes.height,
        0.1,
        100
      )
      camera.position.z = 3
      return camera
    },
    initControls(camera, canvas) {
      const controls = new OrbitControls(camera, canvas)
      controls.enableDamping = true // 开启阻尼
      // controls.autoRotate = true // 开启自动旋转
      // controls.autoRotateSpeed = 0.4 // 自动旋转速度
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

      this.controls.update()

      this.renderer.render(this.scene, this.camera)

      stats.end()

      requestAnimationFrame(this.tick)
    }
  }
}
</script>
