<template>
  <div ref="three-box" class="three-box">
    <canvas ref="canvas" class="webgl" />
    <canvas id="picCanvas" class="picCanvas" />
  </div>
</template>

<script>
import * as THREE from 'three'
import * as CANNON from 'cannon-es'
import CannonDebugger from 'cannon-es-debugger'
import { initStats } from '../utils/stats'
import baseSetting from '../utils/utils'

let scene = null
let world = null
const objectsToUpdate = []
export default {
  name: 'VueAdminTemplateDominoes',

  data() {
    return {
      stats: null, // 帧率监视器
      canvas: null, // 画布
      camera: null, // 相机
      controls: null, // 控制器
      renderer: null,
      mesh: null,
      sizes: {
        width: 0,
        height: 0
      },
      world: null,
      materials: {},
      dominoeGeometry: new THREE.BoxGeometry(0.2, 3, 1.5),
      dominoeMaterial: new THREE.MeshStandardMaterial({
        metalness: 0.3,
        roughness: 0.8,
        color: new THREE.Color('red')
      }),
      dominoeDepth: 0.2,
      dominoeHeight: 3,
      dominoeWidth: 1.5,
      guiObj: {
        start: () => {},
        CannonDebugger: false
      },
      cannonDebugger: null
    }
  },

  mounted() {
    scene = new THREE.Scene()
    this.stats = initStats()
    this.canvas = this.$refs.canvas
    this.sizes = baseSetting.initSizes(this)
    // Camera
    this.camera = baseSetting.initCamera(this.sizes, {
      fov: 20,
      near: 0.1,
      far: 10000
    })
    this.camera.position.set(5, 50, 150)
    // Controls
    this.controls = baseSetting.initControls({
      camera: this.camera,
      canvas: this.canvas
    })
    this.controls.zoomSpeed = 0.3
    this.controls.target.set(5, 10, 0)
    this.handleObjects()
    // Renderer
    this.renderer = baseSetting.initRenderer({
      canvas: this.canvas,
      sizes: this.sizes
    })
    this.renderer.physicallyCorrectLights = true
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
    world = this.handlePhysics()
    this.getMinifyPicColor().then((arr) => {
      arr.forEach((item, index) => {
        item.forEach((color, i) => {
          this.addOneDominoe(
            (i * this.dominoeHeight) / 2,
            this.dominoeHeight / 2,
            1.5 * this.dominoeWidth * index,
            color
          )
        })
      })
      this.addTriangle()
    })
    baseSetting.listenResize(this.sizes, this.camera, this.renderer)
    this.gui = baseSetting.initLilGui()
    this.guiObj.start = () => {
      world.bodies[world.bodies.length - 1].applyForce(
        new CANNON.Vec3(30, 0, 0),
        new CANNON.Vec3(0, 0, 0)
      )
    }
    const cannonMeshes = []
    this.cannonDebugger = CannonDebugger(scene, world, {
      onInit(body, mesh) {
        mesh.visible = false
        cannonMeshes.push(mesh)
      }
    })
    this.gui
      .add(this.guiObj, 'CannonDebugger')
      .name('CannonDebugger mesh visible')
      .onChange((value) => {
        if (value) {
          cannonMeshes.forEach((item) => {
            item.visible = true
          })
        } else {
          cannonMeshes.forEach((item) => {
            item.visible = false
          })
        }
      })
    this.gui.add(this.guiObj, 'start')
    // Animate
    this.tick()
  },
  beforeDestroy() {
    this.gui.destroy()
    // console.log(this.renderer.info)
  },

  methods: {
    handleObjects() {
      // 地板材质
      const materialPlane = new THREE.MeshStandardMaterial({
        metalness: 0.4,
        roughness: 0.5,
        color: '#e8f5e9'
      })

      const plane = new THREE.Mesh(
        new THREE.PlaneGeometry(150, 150),
        materialPlane
      )
      plane.rotateX(-Math.PI / 2)
      plane.receiveShadow = true
      scene.add(plane)

      const directionLight = new THREE.DirectionalLight(0xffffff, 1)
      directionLight.castShadow = true
      directionLight.shadow.camera.top = 50
      directionLight.shadow.camera.right = 50
      directionLight.shadow.camera.bottom = -50
      directionLight.shadow.camera.left = -50
      directionLight.shadow.camera.near = 1
      directionLight.shadow.camera.far = 200
      directionLight.shadow.mapSize.set(2048, 2048)
      const directionalLightCameraHelper = new THREE.CameraHelper(
        directionLight.shadow.camera
      )
      directionalLightCameraHelper.visible = false
      scene.add(directionalLightCameraHelper)

      directionLight.position.set(-50, 80, 60)
      scene.add(directionLight)

      const ambientLight = new THREE.AmbientLight(new THREE.Color('#ffffff'), 3)
      scene.add(ambientLight)
    },
    handlePhysics() {
      const world = new CANNON.World()
      world.gravity.set(0, -10, 0)
      world.allowSleep = true

      const floorMaterial = new CANNON.Material('floorMaterial')
      const defaultMaterial = new CANNON.Material('default')
      const defaultContactMaterial = new CANNON.ContactMaterial(
        defaultMaterial,
        defaultMaterial,
        { friction: 0.01, restitution: 0.3 }
      )
      const floorContactMaterial = new CANNON.ContactMaterial(
        floorMaterial,
        defaultMaterial,
        { friction: 0.9, restitution: 0.6 }
      )
      world.addContactMaterial(defaultContactMaterial)
      world.addContactMaterial(floorContactMaterial)
      this.materials.floorMaterial = floorMaterial
      this.materials.defaultMaterial = defaultMaterial
      this.materials.floorContactMaterial = floorContactMaterial
      const floorShape = new CANNON.Plane()
      const floorBody = new CANNON.Body({
        type: CANNON.Body.STATIC,
        shape: floorShape,
        material: floorMaterial
      })
      floorBody.quaternion.setFromAxisAngle(
        new CANNON.Vec3(1, 0, 0),
        -Math.PI / 2
      )
      world.addBody(floorBody)
      return world
    },
    addOneDominoe(x, y, z, color = { r: 255, g: 255, b: 255 }) {
      const material = new THREE.MeshStandardMaterial({
        metalness: 0.3,
        roughness: 0.8,
        color: new THREE.Color(`rgb(${color.r},${color.g},${color.b})`)
      })
      const dominoe = new THREE.Mesh(this.dominoeGeometry, material)
      dominoe.position.set(x, y, z)
      dominoe.castShadow = true
      dominoe.receiveShadow = true
      scene.add(dominoe)

      const shape = new CANNON.Box(
        new CANNON.Vec3(
          this.dominoeDepth * 0.5,
          this.dominoeHeight * 0.5,
          this.dominoeWidth * 0.5
        )
      )
      const body = new CANNON.Body({
        mass: 0.2,
        shape,
        material: this.materials.defaultMaterial
      })
      body.position.copy(dominoe.position)
      body.sleepSpeedLimit = 1
      world.addBody(body)
      objectsToUpdate.push({
        mesh: dominoe,
        body
      })
    },
    addTriangle() {
      for (let row = 0; row < 9; row += 1) {
        for (let i = 0; i <= row; i += 1) {
          this.addOneDominoe(
            (-this.dominoeHeight / 2) * (9 - row),
            this.dominoeHeight / 2,
            1.5 * this.dominoeWidth * i + this.dominoeWidth * 0.8 * (9 - row)
          )
        }
      }
      for (let i = 0; i < 10; i += 1) {
        this.addOneDominoe(
          (-this.dominoeHeight / 2) * 10 - (i * this.dominoeHeight) / 2,
          this.dominoeHeight / 2,
          this.dominoeWidth * 0.8 * 9
        )
      }
    },
    getMinifyPicColor() {
      return new Promise((res) => {
        const canvas = document.querySelector('#picCanvas')
        const minify2DArr = []
        if (canvas) {
          const ctx = canvas.getContext('2d')
          if (ctx) {
            const img = new Image()
            img.src =
              'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAKCAIAAAA7N+mxAAAAAXNSR0IArs4c6QAAAERlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAAFKADAAQAAAABAAAACgAAAABtDdkeAAAAb0lEQVQoFWOsmDCHgVzAxOHnB9eLzIYL4mEw4ZGDSEFMxGouYc14TGcBymGaChH5sWkTpk64YqAsSDMaAEpDtMEZcAXIIkA2SDPcBiAfog7OgGvDysBiM7JxWPXABbFoBjoEbjPcURANaFKMlCQSAETxJvV/OkBjAAAAAElFTkSuQmCC'
            console.log(img)
            img.addEventListener('load', () => {
              ctx.drawImage(img, 0, 0, 20, 10, 0, 0, 20, 10)
              const imageData = ctx.getImageData(0, 0, 20, 10)
              const pixels = imageData.data
              console.log(pixels)
              for (let i = 0; i < pixels.length; i += 4) {
                minify2DArr.push({
                  r: pixels[i],
                  g: pixels[i + 1],
                  b: pixels[i + 2]
                })
              }
              ctx.putImageData(imageData, 0, 0)
              console.log(minify2DArr)
              const newArr = []
              while (minify2DArr.length) newArr.push(minify2DArr.splice(0, 20))
              console.log(newArr)
              res(newArr)
            })
          }
        }
      })
    },
    tick() {
      this.stats.begin()
      // Update controls
      this.controls.update()
      world.fixedStep()
      this.cannonDebugger.update()
      objectsToUpdate.forEach((object) => {
        object.mesh.position.copy(object.body.position)
        object.mesh.quaternion.copy(object.body.quaternion)
      })

      // Render
      this.renderer.render(scene, this.camera)

      this.stats.end()
      // Call tick again on the next frame
      window.requestAnimationFrame(this.tick)
    }
  }
}
</script>
