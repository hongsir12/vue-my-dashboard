<template>
  <div ref="three-box" class="three-box">
    <canvas ref="canvas" class="webgl" />
  </div>
</template>
<script>
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import stats from '../utils/stats'
import { listenResize, setFullScreen, initGui, initAxes } from '../utils/utils'
export default {
  data() {
    return {
      canvas: null, // 画布
      gui: null, // 调试面板
      scene: null, // 场景
      camera: null, // 相机
      controls: null, // 控制器
      renderer: null, // 渲染器
      axes: null, // 坐标轴
      clock: null,
      sizes: {
        width: 0,
        height: 0
      },
      material: null, // 当前网格材质
      texture: null,
      debugObj: {
        // 调试面板参数对象
        sceneColor: 0x512da8,
        text: 'hello world!',
        fullScreen: false,
        showTextBounding: false,
        removeMesh() {},
        addMesh() {}
      }
    }
  },
  watch: {},
  beforeMount() {},
  mounted() {
    const el = document.querySelector('.three-box')
    el.appendChild(stats.dom)
    this.canvas = this.$refs.canvas
    this.sizes = this.initSize(this.sizes)
    this.gui = initGui()
    this.scene = this.initScene(this.scene)
    this.loadFont()
    this.camera = this.initCamera(this.sizes)
    this.controls = this.initControls(this.camera, this.canvas)
    this.renderer = this.initRenderer(this.canvas, this.sizes)
    this.axes = initAxes(this.scene)
    listenResize(this.sizes, this.camera, this.renderer)
    this.tick()
  },
  beforeDestroy() {
    this.gui.destroy()
  },
  methods: {
    initScene(scene) {
      scene = new THREE.Scene()
      scene.background = new THREE.Color(this.debugObj.sceneColor)
      return scene
    },
    loadFont() {
      const fontLoader = new THREE.FontLoader()
      fontLoader.load(
        '/static/fonts/FZKaTong-M19S_Regular.json',
        // onLoad回调
        (font) => {
          const textureLoader = new THREE.TextureLoader()
          const matcapTexture = textureLoader.load(
            '/static/11-textures/matcaps/3.png'
          )
          // const material = new THREE.MeshMatcapMaterial()
          // material.matcap = matcapTexture

          const material = new THREE.MeshBasicMaterial()
          let text
          const createText = (textInfo = this.debugObj.text) => {
            const textGeometry = new THREE.TextBufferGeometry(textInfo, {
              font,
              size: 0.5,
              height: 0.2,
              curveSegments: 1,
              bevelEnabled: false,
              bevelThickness: 0.03,
              bevelSize: 0.02,
              bevelOffset: 0,
              bevelSegments: 5
            })
            textGeometry.center()
            console.log(textGeometry)
            text = new THREE.Mesh(textGeometry, material)
            this.gui.add(material, 'wireframe')
            this.scene.add(text)
          }
          createText()

          const donutGeometry = new THREE.TorusGeometry(0.3, 0.2, 20, 45)
          const boxGeometry = new THREE.BoxGeometry(0.6, 0.6, 0.6)

          let meshArr = []
          const createMesh = () => {
            let mesh
            for (let i = 0; i < 100; i++) {
              if (i % 10 <= 1) {
                mesh = new THREE.Mesh(boxGeometry, material)
              } else {
                mesh = new THREE.Mesh(donutGeometry, material)
              }
              mesh.position.set(
                (Math.random() - 0.5) * 10,
                (Math.random() - 0.5) * 10,
                (Math.random() - 0.5) * 10
              )
              mesh.setRotationFromEuler(
                new THREE.Euler(
                  Math.PI * Math.random(),
                  Math.PI * Math.random(),
                  Math.PI * Math.random()
                )
              )
              const radomScale = Math.random() * 0.5 + 0.5
              mesh.scale.set(radomScale, radomScale, radomScale)
              meshArr.push(mesh)
            }
            this.scene.add(...meshArr)
          }

          const removeMesh = () => {
            this.scene.remove(...meshArr)
            meshArr = []
          }

          createMesh()

          this.gui.add(this.debugObj, 'text').onChange((e) => {
            this.scene.remove(text)
            createText(e)
          })
          this.gui.addColor(this.debugObj, 'sceneColor').onChange((e) => {
            this.scene.background = new THREE.Color(e)
          })
          this.debugObj.addMesh = () => {
            createMesh()
          }
          this.gui.add(this.debugObj, 'addMesh')
          this.debugObj.removeMesh = () => {
            removeMesh()
          }
          this.gui.add(this.debugObj, 'removeMesh')
          this.gui.add(this.debugObj, 'fullScreen').onChange((e) => {
            setFullScreen(this.$refs['three-box'])
          })
        }
      )
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
      camera.position.set(2, 2, 3)
      return camera
    },
    initControls(camera, canvas) {
      const controls = new OrbitControls(camera, canvas)
      controls.enableDamping = true // 开启阻尼
      controls.autoRotate = true // 开启自动旋转
      controls.autoRotateSpeed = 0.4 // 自动旋转速度
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
      this.controls.update()

      this.renderer.render(this.scene, this.camera)

      stats.end()

      requestAnimationFrame(this.tick)
    }
  }
}
</script>
<style lang="scss" scoped></style>
