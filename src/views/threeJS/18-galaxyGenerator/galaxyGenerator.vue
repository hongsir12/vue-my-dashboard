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
      galaxy: {
        geometry: null,
        material: null,
        points: null
      },
      sizes: {
        width: 0,
        height: 0
      },
      debugObj: {
        count: 100000,
        size: 0.01,
        radius: 5,
        branches: 3,
        spin: 1,
        randomness: 0.2,
        randomnessPower: 3,
        insideColor: '#ff6030',
        outsideColor: '#1b3984'
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
    this.galaxy = this.generateGalaxy(this.galaxy)
    this.camera = this.initCamera(this.sizes)
    this.controls = this.initControls(this.camera, this.canvas)
    this.renderer = this.initRenderer(this.canvas, this.sizes)
    this.setDebug(this.gui, this.debugObj)
    listenResize(this.sizes, this.camera, this.renderer)
    this.tick()
  },
  beforeDestroy() {
    this.gui.destroy()
  },
  methods: {
    generateGalaxy({ geometry, material, points }) {
      // 移除旧星系
      if (points !== null) {
        geometry.dispose()
        material.dispose()
        this.scene.remove(points)
      }
      /**
       * Geometry
       */
      geometry = new THREE.BufferGeometry()

      const positions = new Float32Array(this.debugObj.count * 3)
      const colors = new Float32Array(this.debugObj.count * 3)

      const colorInside = new THREE.Color(this.debugObj.insideColor)
      const colorOutside = new THREE.Color(this.debugObj.outsideColor)
      for (let i = 0; i < this.debugObj.count; i++) {
        const i3 = i * 3
        // 粒子半径
        const radius = Math.random() * this.debugObj.radius
        // 分支角度
        const branchAngle =
          ((i % this.debugObj.branches) / this.debugObj.branches) * Math.PI * 2
        // 螺旋角度
        const spinAngle = radius * this.debugObj.spin

        const randomX =
          Math.pow(Math.random(), this.debugObj.randomnessPower) *
          (Math.random() < 0.5 ? 1 : -1)
        const randomY =
          Math.pow(Math.random(), this.debugObj.randomnessPower) *
          (Math.random() < 0.5 ? 1 : -1)
        const randomZ =
          Math.pow(Math.random(), this.debugObj.randomnessPower) *
          (Math.random() < 0.5 ? 1 : -1)

        // 顶点位置
        positions[i3] = Math.cos(branchAngle + spinAngle) * radius + randomX // x
        positions[i3 + 1] = 0 + randomY // y
        positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ // z

        // 复制内颜色作为混合色的基色调
        const mixedColor = colorInside.clone()
        mixedColor.lerp(colorOutside, radius / this.debugObj.radius)

        // 顶点颜色
        colors[i3] = mixedColor.r
        colors[i3 + 1] = mixedColor.g
        colors[i3 + 2] = mixedColor.b
      }
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

      /** *
       * Material
       */
      material = new THREE.PointsMaterial({
        // 粒子大小
        size: this.debugObj.size,
        // 开启尺寸衰减
        sizeAttenuation: true,
        // 停用depthWrite
        depthWrite: false,
        // 激活混合
        blending: THREE.AdditiveBlending,
        // 激活顶点着色
        vertexColors: true
      })

      /**
       * Points
       */
      points = new THREE.Points(geometry, material)
      this.scene.add(points)

      return { geometry, material, points }
    },
    setDebug(gui, debugObj) {
      gui
        .add(debugObj, 'count')
        .min(1000)
        .max(100000)
        .step(100)
        .name('粒子总数')
        .onFinishChange(() => {
          this.galaxy = this.generateGalaxy(this.galaxy)
        })
      gui
        .add(debugObj, 'size')
        .min(0.001)
        .max(0.1)
        .step(0.001)
        .name('粒子大小')
        .onFinishChange(() => {
          this.galaxy = this.generateGalaxy(this.galaxy)
        })
      gui
        .add(debugObj, 'radius')
        .min(0.01)
        .max(20)
        .step(0.01)
        .name('星系半径')
        .onFinishChange(() => {
          this.galaxy = this.generateGalaxy(this.galaxy)
        })
      gui
        .add(debugObj, 'branches')
        .min(2)
        .max(20)
        .step(1)
        .name('星系分支')
        .onFinishChange(() => {
          this.galaxy = this.generateGalaxy(this.galaxy)
        })
      gui
        .add(debugObj, 'spin')
        .min(-5)
        .max(5)
        .step(0.001)
        .name('螺旋角度')
        .onFinishChange(() => {
          this.galaxy = this.generateGalaxy(this.galaxy)
        })
      gui
        .add(debugObj, 'randomness')
        .min(0)
        .max(2)
        .step(0.001)
        .name('随机性')
        .onFinishChange(() => {
          this.galaxy = this.generateGalaxy(this.galaxy)
        })
      gui
        .add(debugObj, 'randomnessPower')
        .min(1)
        .max(10)
        .step(0.001)
        .name('随机性幂')
        .onFinishChange(() => {
          this.galaxy = this.generateGalaxy(this.galaxy)
        })
      gui
        .addColor(debugObj, 'insideColor')
        .name('内颜色')
        .onFinishChange(() => {
          this.galaxy = this.generateGalaxy(this.galaxy)
        })
      gui
        .addColor(debugObj, 'outsideColor')
        .name('外颜色')
        .onFinishChange(() => {
          this.galaxy = this.generateGalaxy(this.galaxy)
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
      camera.position.set(3, 3, 3)
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
