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
      debugParams: {
        sceneColor: 0x512da8,
        text: 'hello world!',
        fullScreen: false,
        showTextBounding: false,
        removeMesh() {},
        addMesh() {}
      }
    }
  },
  beforeMount() {},
  mounted() {
    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color(this.debugParams.sceneColor)
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
    this.loadFont()
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
    loadFont() {
      const fontLoader = new THREE.FontLoader()
      fontLoader.load('/static/fonts/FZKaTong-M19S_Regular.json', (font) => {
        const textureLoader = new THREE.TextureLoader()
        const matcapTexture = textureLoader.load(
          '/static/11-textures/matcaps/3.png'
        )
        const material = new THREE.MeshMatcapMaterial()
        material.matcap = matcapTexture

        // const material = new THREE.MeshBasicMaterial()
        let text
        const createText = (textInfo = this.debugParams.text) => {
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

        this.gui.add(this.debugParams, 'text').onChange((e) => {
          this.scene.remove(text)
          createText(e)
        })
        this.gui.addColor(this.debugParams, 'sceneColor').onChange((e) => {
          this.scene.background = new THREE.Color(e)
        })
        this.debugParams.addMesh = () => {
          createMesh()
        }
        this.gui.add(this.debugParams, 'addMesh')
        this.debugParams.removeMesh = () => {
          removeMesh()
        }
        this.gui.add(this.debugParams, 'removeMesh')
        this.gui.add(this.debugParams, 'fullScreen').onChange((e) => {
          // setFullScreen(this.$refs['three-box'])
        })
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
