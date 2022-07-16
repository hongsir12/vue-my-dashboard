<template>
  <div ref="three-box" class="three-box">
    <canvas ref="canvas1" class="webgl" />
  </div>
</template>

<script>
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import gsap from 'gsap'
import { initGui, initAxes } from '../utils/utils'

export default {
  data() {
    return {
      gui: null, // 调试面板
      canvas: null, // 画布
      scene: null, // 场景
      camera: null, // 相机
      controls: null, // 控制器
      axes: null, // 坐标轴
      mesh: null, // 网格
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
    this.canvas = this.$refs.canvas1
    this.gui = initGui()
    this.axes = initAxes(this.scene)
    this.createObject()
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
      this.updateCamera()
      this.updateRenderer()
    })
    // Animate
    this.tick()
  },
  beforeDestroy() {
    this.gui.destroy()
  },

  methods: {
    initAxes() {
      this.axes = new THREE.AxesHelper(5)
      this.scene.add(this.axes)
    },
    createObject() {
      const parameters = {
        color: '#bfa', // color:0xff0000
        spin: () => {
          // 网格旋转一周
          gsap.to(this.mesh.rotation, {
            duration: 3,
            y: this.mesh.rotation.y + Math.PI * 2
          })
        }
      }
      const geometry = new THREE.BoxBufferGeometry(1, 1, 1)
      const material = new THREE.MeshBasicMaterial({ color: parameters.color })
      this.mesh = new THREE.Mesh(geometry, material)
      this.scene.add(this.mesh)

      // Debug
      // 往GUI面板添加要显示的对象的参数
      // 参数一:对象;参数二:要调整的对象属性;参数三:最小值;参数四:最大值;参数五:调整精度
      // gui.add(mesh.position,'y',-3,3,0.01)
      // gui.add(mesh.position,'x',-3,3,0.01)
      // gui.add(mesh.position,'z',-3,3,0.01)
      // 另一种写法，等价于上面
      // this.gui
      //   .add(this.mesh.position, 'y')
      //   .min(-3)
      //   .max(3)
      //   .step(0.01)
      //   .name('立方体-Y')

      const folder = this.gui.addFolder('立方体')
      folder
        .add(this.mesh.position, 'x')
        .min(-3)
        .max(3)
        .step(0.01)
        .name('立方体-X')
      folder
        .add(this.mesh.position, 'y')
        .min(-3)
        .max(3)
        .step(0.01)
        .name('立方体-Y')
      folder
        .add(this.mesh.position, 'z')
        .min(-3)
        .max(3)
        .step(0.01)
        .name('立方体-Z')

      // 控制网格显示与隐藏
      this.gui.add(this.mesh, 'visible').name('立方体显示/隐藏')
      // 是否渲染为线框
      this.gui.add(material, 'wireframe').name('显示线框')
      // 若想改变颜色则必须使用 addColor()
      // 不能直接改变材质颜色，因为material.color是一个存放rgb属性的对象,而不是颜色字符串或0x进制单位
      // console.log(material.color);  //Color{r:1,g:0,b:0,isColor:true}
      // 所以要另外声明一个用以保存颜色的参数对象
      // 之后通过onChange()监听颜色变化事件，再通过material.color.set()将材质颜色设置为该颜色
      this.gui
        .addColor(parameters, 'color')
        .name('颜色')
        .onChange(() => {
          material.color.set(parameters.color)
        })
      this.gui.add(parameters, 'spin').name('旋转一周')
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
    updateCamera() {
      // Update camera
      this.camera.aspect = this.sizes.width / this.sizes.height
      this.camera.updateProjectionMatrix()
    },
    updateRenderer() {
      // Update renderer
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
<style lang="scss" scoped></style>
