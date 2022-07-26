<template>
  <div ref="three-box" class="three-box">
    <canvas ref="canvas" class="webgl" />
  </div>
</template>
<script>
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import stats from '../utils/stats'
import * as CANNON from 'cannon-es'
import CannonDebugger from 'cannon-es-debugger'
import { listenResize, initLilGui } from '../utils/utils'
export default {
  data() {
    return {
      gui: null, // 调试面板
      canvas: null, // 画布
      scene: null, // 场景
      camera: null, // 相机
      controls: null, // 控制器
      renderer: null, // 渲染器
      oldElapsedTime: 0,
      lights: {},
      threeJS: {
        material: null,
        sphereGeometry: null,
        boxGeometry: null
      },
      cannon: {
        world: null,
        material: null,
        floorBody: null
      },
      objectsToUpdate: [], // 要更新的mesh和body
      hitSound: null, // 撞击声音
      cannonDebugger: null,
      cannonDebuggerVisible: false,
      sizes: {
        width: 0,
        height: 0
      },
      debugObj: {
        CannonDebugger: false,
        createSphere() {},
        createBox() {},
        reset() {}
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
    this.lights = this.initLights()
    this.gui = initLilGui()
    this.initThreeWorld() // 初始化threejs世界，一个平面
    this.cannon.world = this.createPhysicsWorld() // 创建物理世界
    this.cannon.floorBody = this.createFloorBody() // 添加平面刚体
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
      directionLight.castShadow = true
      directionLight.shadow.camera.near = 1
      directionLight.shadow.camera.far = 20
      directionLight.shadow.camera.top = 10
      directionLight.shadow.camera.right = 10
      directionLight.shadow.camera.bottom = -10
      directionLight.shadow.camera.left = -10
      directionLight.position.set(5, 5, 6)
      const ambientLight = new THREE.AmbientLight(
        new THREE.Color('#ffffff'),
        0.3
      )
      this.scene.add(ambientLight, directionLight)

      const directionLightHelper = new THREE.DirectionalLightHelper(
        directionLight,
        2
      )
      directionLightHelper.visible = false
      this.scene.add(directionLightHelper)

      const directionalLightCameraHelper = new THREE.CameraHelper(
        directionLight.shadow.camera
      )
      directionalLightCameraHelper.visible = false
      this.scene.add(directionalLightCameraHelper)

      return {
        ambientLight,
        directionLight,
        directionLightHelper,
        directionalLightCameraHelper
      }
    },
    initThreeWorld() {
      const material = new THREE.MeshStandardMaterial()
      this.threeJS.material = material
      const sphereGeometry = new THREE.SphereGeometry(1, 32, 32)
      this.threeJS.sphereGeometry = sphereGeometry
      const boxGeometry = new THREE.BoxGeometry()
      this.threeJS.boxGeometry = boxGeometry
      const plane = new THREE.Mesh(
        new THREE.PlaneGeometry(15, 15),
        new THREE.MeshStandardMaterial({ color: '#607d88' })
      )
      plane.rotateX(-Math.PI / 2)
      plane.receiveShadow = true
      this.scene.add(plane)

      this.hitSound = new Audio('/static/sounds/hit.mp3')
    },
    playHitSound(collision) {
      const impactStrength = collision.contact.getImpactVelocityAlongNormal()
      if (impactStrength > 1.5) {
        this.hitSound.volume = Math.random()
        this.hitSound.currentTime = 0
        this.hitSound.play()
      }
    },
    createPhysicsWorld() {
      const world = new CANNON.World()
      world.gravity.set(0, -9.82, 0)
      // 碰撞检测性能优化
      world.broadphase = new CANNON.SAPBroadphase(world) // 宽相替换为SAPBroadphase
      world.allowSleep = true // 开启睡眠，没在运动的物体不参与碰撞检测
      // 创建默认材质
      const defaultMaterial = new CANNON.Material('default')
      // 创建默认联系材质
      // 前两个参数是材质，第三个参数是一个包含碰撞属性的对象，如摩擦（摩擦多少）和恢复（反弹多少），两者的默认值均为0.3
      const defaultContactMaterial = new CANNON.ContactMaterial(
        defaultMaterial,
        defaultMaterial,
        {
          friction: 0.3,
          restitution: 0.6
        }
      )
      world.addContactMaterial(defaultContactMaterial)
      this.cannon.material = defaultMaterial
      // cannonDebugger
      this.cannonDebugger = CannonDebugger(this.scene, world, {
        onInit: (body, mesh) => {
          mesh.visible = this.cannonDebuggerVisible
        }
      })

      return world
    },
    // 创建平面刚体
    createFloorBody() {
      const floorShape = new CANNON.Plane()
      const floorBody = new CANNON.Body({
        type: CANNON.Body.STATIC,
        shape: floorShape,
        material: this.cannon.material
      })
      // 对 floorBody 的四元数 quaternion 设置角度，第一个入参为所延的轴向，第二个参数为旋转的角度。效果如下
      floorBody.quaternion.setFromAxisAngle(
        new CANNON.Vec3(-1, 0, 0),
        Math.PI / 2
      )
      this.cannon.world.addBody(floorBody)
      return floorBody
    },
    // 创建球体
    createSphere(radius, position) {
      const { sphereGeometry, material } = this.threeJS
      // threeJS网格对象
      const mesh = new THREE.Mesh(sphereGeometry, material)
      mesh.castShadow = true
      mesh.scale.set(radius, radius, radius)
      mesh.position.copy(position)
      this.scene.add(mesh)

      const { world, material: defaultMaterial } = this.cannon
      // 物理世界刚体对象
      const shape = new CANNON.Sphere(radius)
      const body = new CANNON.Body({
        mass: 1,
        shape,
        material: defaultMaterial
      })
      body.position.copy(position)
      world.addBody(body)
      this.objectsToUpdate.push({ mesh, body })
      body.addEventListener('collide', this.playHitSound)
    },
    // 创建盒子
    createBoxes(width, height, depth, position) {
      const { boxGeometry, material } = this.threeJS
      // threeJS网格对象
      const mesh = new THREE.Mesh(boxGeometry, material)
      mesh.castShadow = true
      mesh.scale.set(width, height, depth)
      mesh.position.copy(position)
      this.scene.add(mesh)

      const { world, material: defaultMaterial } = this.cannon
      // 物理世界刚体对象
      const shape = new CANNON.Box(
        new CANNON.Vec3(width * 0.5, height * 0.5, depth * 0.5)
      )
      const body = new CANNON.Body({
        mass: 1,
        shape,
        material: defaultMaterial
      })
      body.position.copy(position)
      world.addBody(body)
      this.objectsToUpdate.push({ mesh, body })
      body.addEventListener('collide', this.playHitSound)
    },
    setDebug(gui) {
      gui.add(this.controls, 'autoRotate')
      gui.add(this.controls, 'autoRotateSpeed', 0.1, 10, 0.01)
      gui.add(this.threeJS.material, 'wireframe')
      gui
        .add(this.lights.directionLightHelper, 'visible')
        .name('directionLightHelper visible')
      gui
        .add(this.lights.directionalLightCameraHelper, 'visible')
        .name('directionalLightCameraHelper visible')
      gui
        .add(this.debugObj, 'CannonDebugger')
        .name('CannonDebugger mesh visible')
        .onChange((value) => {
          this.cannonDebuggerVisible = value
        })
      this.debugObj.createSphere = () => {
        this.createSphere(
          Math.random(),
          new THREE.Vector3(
            (Math.random() - 0.5) * 8,
            5,
            (Math.random() - 0.5) * 8
          )
        )
      }
      gui.add(this.debugObj, 'createSphere')
      this.debugObj.createBox = () => {
        this.createBoxes(
          Math.random(),
          Math.random(),
          Math.random(),
          new THREE.Vector3(
            (Math.random() - 0.5) * 8,
            5,
            (Math.random() - 0.5) * 8
          )
        )
      }
      gui.add(this.debugObj, 'createBox')
      this.debugObj.reset = () => {
        this.objectsToUpdate.forEach((object) => {
          object.body.removeEventListener('collide', this.playHitSound)
          this.cannon.world.removeBody(object.body)
          this.scene.remove(object.mesh)
        })
        this.objectsToUpdate.splice(0, this.objectsToUpdate.length)
      }
      gui.add(this.debugObj, 'reset')
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
      camera.position.set(4, 4, 15)
      return camera
    },
    initControls(camera, canvas) {
      const controls = new OrbitControls(camera, canvas)
      controls.enableDamping = true // 开启阻尼
      // controls.autoRotate = true // 开启自动旋转
      // controls.autoRotateSpeed = 0.4 // 自动旋转速度
      controls.zoomSpeed = 0.3
      return controls
    },
    initRenderer(canvas, sizes) {
      const renderer = new THREE.WebGLRenderer({
        canvas
      })
      renderer.setSize(sizes.width, sizes.height)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      renderer.shadowMap.enabled = true
      return renderer
    },
    tick() {
      stats.begin()
      // const elapsedTime = this.clock.getElapsedTime()

      this.controls.update()

      // const deltaTime = elapsedTime - this.oldElapsedTime
      // this.oldElapsedTime = elapsedTime
      // this.world.step(1 / 60, deltaTime, 3)
      this.cannon.world.fixedStep() // 使用cannon-es可用world.fixedStep()替换world.step()
      this.cannonDebugger.update()

      this.objectsToUpdate.forEach((object) => {
        object.mesh.position.copy(object.body.position)
        object.mesh.quaternion.copy(object.body.quaternion)
      })

      this.renderer.render(this.scene, this.camera)
      stats.end()

      requestAnimationFrame(this.tick)
    }
  }
}
</script>
