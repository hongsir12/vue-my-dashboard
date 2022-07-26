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
      material: null,
      meshes: {}, // three.js网格对象
      world: null, // 物理世界
      body: {}, // 物理世界刚体
      cannonDebugger: null,
      sphereWindFn: () => {},
      sizes: {
        width: 0,
        height: 0
      },
      debugObj: {
        CannonDebugger: false,
        applyLocalForce: false,
        applyForce: false
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
    this.meshes = this.createMesh()
    this.world = this.createPhysicsWorld()
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
      return { ambientLight, directionLight, directionLightHelper }
    },
    createMesh() {
      const material = new THREE.MeshStandardMaterial()
      this.material = material
      // sphere
      const sphere = new THREE.Mesh(
        new THREE.SphereGeometry(1, 16, 16),
        material
      )
      sphere.position.setY(1)
      sphere.castShadow = true
      this.scene.add(sphere)

      // plane
      const plane = new THREE.Mesh(new THREE.PlaneGeometry(15, 15), material)
      plane.rotateX(-Math.PI / 2)
      plane.receiveShadow = true
      this.scene.add(plane)
      return { sphere, plane }
    },
    createPhysicsWorld() {
      const world = new CANNON.World()
      world.gravity.set(0, -9.82, 0)
      // 创建默认材质
      const defaultMaterial = new CANNON.Material('default')
      // 创建默认联系材质
      // 前两个参数是材质，第三个参数是一个包含碰撞属性的对象，如摩擦（摩擦多少）和恢复（反弹多少），两者的默认值均为0.3
      const defaultContactMaterial = new CANNON.ContactMaterial(
        defaultMaterial,
        defaultMaterial,
        {
          friction: 0.1,
          restitution: 0.7
        }
      )
      world.addContactMaterial(defaultContactMaterial)

      // 添加球状刚体
      const sphereShape = new CANNON.Sphere(1) // 半径1的球形，与three.js世界中的球半径相同
      // 创建物理世界中的球体
      const sphereBody = new CANNON.Body({
        mass: 1, // 质量
        position: new CANNON.Vec3(0, 3, 0),
        shape: sphereShape,
        material: defaultMaterial
      })
      // 将刚体添加到world中
      world.addBody(sphereBody)

      // 添加平面刚体
      const floorShape = new CANNON.Plane()
      const floorBody = new CANNON.Body()
      floorBody.mass = 0 // 设置地面质量mass为0，表明这个body是静态的
      floorBody.addShape(floorShape)
      floorBody.material = defaultMaterial
      // 对 floorBody 的四元数 quaternion 设置角度，第一个入参为所延的轴向，第二个参数为旋转的角度。效果如下
      floorBody.quaternion.setFromAxisAngle(
        new CANNON.Vec3(-1, 0, 0),
        Math.PI / 2
      )
      world.addBody(floorBody)

      const cannonMeshes = []
      this.cannonDebugger = CannonDebugger(this.scene, world, {
        onInit(body, mesh) {
          mesh.visible = false
          cannonMeshes.push(mesh)
        }
      })
      this.gui
        .add(this.debugObj, 'CannonDebugger')
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
      this.body = { sphereBody, floorBody }
      return world
    },
    setDebug(gui) {
      gui.add(this.controls, 'autoRotate')
      gui.add(this.controls, 'autoRotateSpeed', 0.1, 10, 0.01)
      gui.add(this.material, 'wireframe')
      gui
        .add(this.lights.directionLightHelper, 'visible')
        .name('directionLightHelper visible')
      gui
        .add(this.debugObj, 'applyLocalForce')
        .name('往球体中心施加一个力')
        .onChange((value) => {
          if (value) {
            this.body.sphereBody.applyLocalForce(
              new CANNON.Vec3(100, 0, 0),
              new CANNON.Vec3(0, 0, 0)
            )
          }
        })

      gui
        .add(this.debugObj, 'applyForce')
        .name('施加风力')
        .onChange((value) => {
          if (value) {
            this.sphereWindFn = () => {
              return this.body.sphereBody.applyForce(
                new CANNON.Vec3(-1, 0, 0),
                this.body.sphereBody.position
              )
            }
          } else {
            this.sphereWindFn = () => {
              return null
            }
            this.body.sphereBody.position = new CANNON.Vec3(0, 0, 0)
          }
        })

      this.debugObj.drop = () => {
        this.body.sphereBody.position = new CANNON.Vec3(0, 4, 0)
      }
      gui.add(this.debugObj, 'drop').name('球体位置瞬回')
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

      const sphereWindFn = this.sphereWindFn
      sphereWindFn()
      // const deltaTime = elapsedTime - this.oldElapsedTime
      // this.oldElapsedTime = elapsedTime
      // this.world.step(1 / 60, deltaTime, 3)
      this.world.fixedStep() // 使用cannon-es可用world.fixedStep()替换world.step()
      this.cannonDebugger.update()

      // 用物理世界的球体坐标来更新three.js世界中球体坐标
      this.meshes.sphere.position.copy(this.body.sphereBody.position)
      this.renderer.render(this.scene, this.camera)
      stats.end()

      requestAnimationFrame(this.tick)
    }
  }
}
</script>
