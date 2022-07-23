<template>
  <div
    ref="three-box"
    class="three-box"
    style="background-color: #263238"
    @mousemove="mousemove"
  >
    <div ref="canvas-box" class="canvas-box">
      <canvas ref="canvas" class="webgl" />
    </div>
    <div class="section-box">
      <section class="section">
        <h1>Hello</h1>
      </section>
      <section class="section">
        <h1>My projects</h1>
      </section>
      <section class="section">
        <h1>Contact me</h1>
      </section>
    </div>
  </div>
</template>
<script>
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import stats from '../utils/stats'
import gsap from 'gsap'
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
      mesh: null,
      scrollY: null, // 页面y轴滚动
      currentSection: 0, // 当前区域
      cameraGroup: null, // 相机组 用来控制视差位移效果
      previousTime: 0, // 用于计算时间变化值
      mouse: {
        x: null,
        y: null
      },
      sizes: {
        width: 0,
        height: 0
      },
      debugObj: {
        materialColor: '#bfa',
        objectDistance: 7
      }
    }
  },
  mounted() {
    const canvasEl = document.querySelector('.canvas-box')
    canvasEl.appendChild(stats.dom)
    this.clock = new THREE.Clock()
    this.scene = new THREE.Scene()
    this.canvas = this.$refs.canvas
    this.sizes = this.initSize(this.sizes)
    this.gui = initGui()
    const sectionEl = document.querySelector('.section-box')
    const guiEl = this.gui.domElement.parentNode
    guiEl.firstChild.style.position = 'fixed'
    guiEl.firstChild.style.right = '0'
    sectionEl.appendChild(guiEl)
    this.initLights()
    this.mesh = this.createMesh()
    this.createParticles()
    this.listenScrollY()
    this.camera = this.initCamera(this.sizes)
    this.controls = this.initControls(this.camera, this.canvas)
    this.renderer = this.initRenderer(this.canvas, this.sizes)
    this.setDebug(this.gui)
    listenResize(this.sizes, this.camera, this.renderer)
    this.tick()
  },
  beforeDestroy() {
    this.gui.destroy()
  },
  methods: {
    initLights() {
      const directionLight = new THREE.DirectionalLight()
      directionLight.position.set(1, 1, 0)
      const ambientLight = new THREE.AmbientLight(
        new THREE.Color('#ffffff'),
        0.28
      )
      this.scene.add(ambientLight, directionLight)
    },
    createMesh() {
      const textureLoader = new THREE.TextureLoader()
      const gradientTexture = textureLoader.load(
        'https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/5a9dbb4287414cf99f3c5ecae9864914~tplv-k3u1fbpfcp-zoom-1.image'
      )
      gradientTexture.magFilter = THREE.NearestFilter

      const material = new THREE.MeshToonMaterial({
        color: this.debugObj.materialColor,
        gradientMap: gradientTexture
      })
      const mesh1 = new THREE.Mesh(
        new THREE.TorusGeometry(1, 0.4, 16, 60),
        material
      )
      const mesh2 = new THREE.Mesh(new THREE.ConeGeometry(1, 2, 32), material)
      const mesh3 = new THREE.Mesh(
        new THREE.TorusKnotGeometry(0.8, 0.35, 100, 16),
        material
      )
      const objectDistance = this.debugObj.objectDistance
      const meshsArr = [mesh1, mesh2, mesh3]
      meshsArr.forEach((item, index) => {
        item.position.setY(-objectDistance * index)
        item.position.setX(index % 2 === 0 ? -2 : 2)
      })

      this.material = material
      this.scene.add(mesh1, mesh2, mesh3)
      return { mesh1, mesh2, mesh3 }
    },
    createParticles() {
      const particlesCount = 200
      const positions = new Float32Array(particlesCount * 3)
      for (let i = 0; i < particlesCount; i++) {
        positions[i * 3 + 0] = (Math.random() - 0.5) * 10
        positions[i * 3 + 1] =
          this.debugObj.objectDistance * 0.5 -
          Math.random() * this.debugObj.objectDistance * 3 // 对象数组长度
        positions[i * 3 + 2] = (Math.random() - 0.5) * 10
      }
      const particlesGeometry = new THREE.BufferGeometry()
      particlesGeometry.setAttribute(
        'position',
        new THREE.BufferAttribute(positions, 3)
      )
      const particlesMaterial = new THREE.PointsMaterial({
        color: this.debugObj.materialColor,
        sizeAttenuation: true,
        size: 0.03
      })
      const particles = new THREE.Points(particlesGeometry, particlesMaterial)
      this.scene.add(particles)
    },
    listenScrollY() {
      const { mesh1, mesh2, mesh3 } = this.mesh
      const sectionMeshes = [mesh1, mesh2, mesh3]
      this.scrollY = window.scrollY
      window.addEventListener('scroll', () => {
        this.scrollY = window.scrollY
        // 当滑动到该区域时物体旋转一圈
        const newSection = Math.round(this.scrollY / this.sizes.height)
        if (newSection !== this.currentSection) {
          this.currentSection = newSection
          // 借助gsap创建旋转动画
          gsap.to(sectionMeshes[this.currentSection].rotation, {
            duration: 1.5,
            ease: 'power2.inOut',
            x: '+=6',
            y: '+=3'
          })
        }
      })
    },
    mousemove(e) {
      this.mouse.x = (e.clientX / this.sizes.width) * 2 - 1
      this.mouse.y = -(e.clientY / this.sizes.height) * 2 + 1
    },
    setDebug(gui) {
      gui.addColor(this.debugObj, 'materialColor').onChange(() => {
        this.material.color.set(this.debugObj.materialColor)
      })
    },
    initSize(sizes) {
      sizes.width = this.$refs['canvas-box'].offsetWidth
      sizes.height = this.$refs['canvas-box'].offsetHeight
      return sizes
    },
    initCamera(sizes) {
      const cameraGroup = new THREE.Group()
      this.scene.add(cameraGroup)
      const camera = new THREE.PerspectiveCamera(
        75,
        sizes.width / sizes.height,
        0.1,
        100
      )
      camera.position.set(0, 0, 4)
      cameraGroup.add(camera)
      this.cameraGroup = cameraGroup
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
        canvas,
        antialias: true,
        alpha: true
      })
      renderer.setSize(sizes.width, sizes.height)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      return renderer
    },
    tick() {
      stats.begin()
      const elapsedTime = this.clock.getElapsedTime()
      const deltaTime = elapsedTime - this.previousTime
      this.previousTime = elapsedTime
      for (const k in this.mesh) {
        this.mesh[k].rotation.set(
          deltaTime * 0.1 + this.mesh[k].rotation.x,
          deltaTime * 0.1 + this.mesh[k].rotation.y,
          0
        )
      }

      // 相机动画
      this.camera.position.setY(
        (-this.scrollY / this.sizes.height) * this.debugObj.objectDistance
      )

      if (this.mouse.x && this.mouse.y) {
        // this.cameraGroup.position.setX(this.mouse.x)
        // this.cameraGroup.position.setY(this.mouse.y)

        // 增加阻尼效果
        const parallaxX = this.mouse.x * 0.5
        const parallaxY = this.mouse.y * 0.5
        this.cameraGroup.position.x +=
          (parallaxX - this.cameraGroup.position.x) * 5 * deltaTime
        this.cameraGroup.position.y +=
          (parallaxY - this.cameraGroup.position.y) * 5 * deltaTime
      }

      // this.controls.update() // 不更新控制器，否则不会在y轴进行平移

      this.renderer.render(this.scene, this.camera)

      stats.end()

      requestAnimationFrame(this.tick)
    }
  }
}
</script>
<style lang="scss" scoped>
.three-box {
  position: relative;
  height: auto;
}
.canvas-box {
  position: fixed;
  top: 50px;
  right: 0;
  left: 210px;
  height: calc(100vh - 50px);
}
.section-box {
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  .section {
    padding-left: 10%;
    padding-right: 10%;
    display: flex;
    align-items: center;
    height: 100vh;
    font-size: 7vmin;
    position: relative;
    color: #fff;
    &:nth-child(odd) {
      justify-content: flex-end;
    }
  }
}
</style>
