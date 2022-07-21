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
      sizes: {
        width: 0,
        height: 0
      },
      lights: {},
      helpers: {},
      mesh: {},
      debugObj: {
        // 调试面板参数对象
        useBakedShadow: true // 使用烘焙贴图
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
    this.createMesh()
    this.initLights()
    this.camera = this.initCamera(this.sizes)
    this.controls = this.initControls(this.camera, this.canvas)
    this.renderer = this.initRenderer(this.canvas, this.sizes)
    this.setDebug(this.gui, this.lights, this.helpers, this.renderer)
    listenResize(this.sizes, this.camera, this.renderer)
    this.tick()
  },
  beforeDestroy() {
    this.gui.destroy()
  },
  methods: {
    initSize(sizes) {
      sizes.width = this.$refs['three-box'].offsetWidth
      sizes.height = this.$refs['three-box'].offsetHeight
      return sizes
    },
    createMesh() {
      const textureLoader = new THREE.TextureLoader()
      // const bakedShadow = textureLoader.load(
      //   '/static/11-textures/bakedShadow.jpg'
      // )
      const simpleShadow = textureLoader.load(
        '/static/11-textures/simpleShadow.jpg'
      )
      const material = new THREE.MeshStandardMaterial()
      material.metalness = 0
      material.roughness = 0.4

      const sphere = new THREE.Mesh(
        new THREE.SphereBufferGeometry(0.5, 32, 32),
        material
      )
      sphere.castShadow = true // 投射阴影
      sphere.name = '动球'

      const staticSphere = new THREE.Mesh(
        new THREE.SphereBufferGeometry(0.5, 32, 32),
        material
      )
      staticSphere.castShadow = true // 投射阴影
      staticSphere.name = '静球'

      const plane = new THREE.Mesh(
        new THREE.PlaneBufferGeometry(5, 5),
        material
      )
      plane.rotation.x = -Math.PI * 0.5
      plane.position.y = -0.5
      plane.receiveShadow = true // 接收阴影
      plane.name = '平面'

      const shadowPlane = new THREE.Mesh(
        new THREE.PlaneGeometry(1.5, 1.5),
        new THREE.MeshBasicMaterial({
          color: '#000000',
          transparent: true,
          alphaMap: simpleShadow
        })
      )
      shadowPlane.rotateX(-Math.PI / 2)
      shadowPlane.position.y = plane.position.y + 0.01

      this.scene.add(sphere, plane, shadowPlane)
      this.mesh = {
        staticSphere,
        sphere,
        plane,
        shadowPlane
      }
    },
    initLights() {
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.3)
      this.scene.add(ambientLight)

      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.3)
      directionalLight.position.set(2, 2, -1)

      this.scene.add(directionalLight)
      directionalLight.castShadow = true // 投射阴影
      directionalLight.shadow.mapSize.width = 1024
      directionalLight.shadow.mapSize.height = 1024
      directionalLight.shadow.camera.near = 2
      directionalLight.shadow.camera.far = 6
      directionalLight.shadow.camera.top = 2
      directionalLight.shadow.camera.right = 2
      directionalLight.shadow.camera.left = -2
      directionalLight.shadow.camera.bottom = -2
      directionalLight.shadow.radius = 10

      const directionalLightCameraHelper = new THREE.CameraHelper(
        directionalLight.shadow.camera
      )
      directionalLightCameraHelper.visible = false
      this.scene.add(directionalLightCameraHelper)

      const spotLight = new THREE.SpotLight(0xffffff, 0.3, 10, Math.PI * 0.3)
      spotLight.castShadow = true
      spotLight.position.set(0, 2, 2)
      this.scene.add(spotLight)
      this.scene.add(spotLight.target)
      spotLight.shadow.mapSize.width = 1024
      spotLight.shadow.mapSize.height = 1024
      spotLight.shadow.camera.fov = 30
      spotLight.shadow.camera.near = 1
      spotLight.shadow.camera.far = 6

      const spotLightCameraHelper = new THREE.CameraHelper(
        spotLight.shadow.camera
      )
      spotLightCameraHelper.visible = false
      this.scene.add(spotLightCameraHelper)

      const pointLight = new THREE.PointLight(0xffffff, 0.3)
      pointLight.castShadow = true
      pointLight.position.set(-1, 1, 0)
      pointLight.shadow.mapSize.width = 1024
      pointLight.shadow.mapSize.height = 1024
      pointLight.shadow.camera.near = 0.1
      pointLight.shadow.camera.far = 5
      this.scene.add(pointLight)

      const pointLightCameraHelper = new THREE.CameraHelper(
        pointLight.shadow.camera
      )
      pointLightCameraHelper.visible = false
      this.scene.add(pointLightCameraHelper)

      this.lights = {
        ambientLight,
        directionalLight,
        spotLight,
        pointLight
      }
      this.helpers = {
        directionalLightCameraHelper,
        spotLightCameraHelper,
        pointLightCameraHelper
      }
    },
    setDebug(
      gui,
      { ambientLight, directionalLight, spotLight, pointLight },
      {
        directionalLightCameraHelper,
        spotLightCameraHelper,
        pointLightCameraHelper
      },
      renderer
    ) {
      const useBakedShadow = gui.addFolder('阴影')
      const useBakedShadowController = useBakedShadow
        .add(renderer.shadowMap, 'enabled')
        .name('渲染器激活阴影')
      useBakedShadow
        .add(this.debugObj, 'useBakedShadow')
        .name('使用烘焙贴图')
        .onChange((e) => {
          if (!e) {
            // 不使用烘焙贴图，开启渲染器阴影
            renderer.shadowMap.enabled = true
            useBakedShadowController.setValue(true)
            this.turnOnShadowMap(this.mesh)
          } else {
            renderer.shadowMap.enabled = false
            useBakedShadowController.setValue(false)
            this.turnOffShadowMap(this.mesh)
          }
        })

      const ambientLightFolder = gui.addFolder('环境光')
      ambientLightFolder
        .add(ambientLight, 'intensity')
        .min(0)
        .max(1)
        .step(0.001)
        .name('光强')
      ambientLightFolder.add(ambientLight, 'visible')

      const directionalLightFolder = gui.addFolder('平行光')
      directionalLightFolder
        .add(directionalLight, 'intensity')
        .min(0)
        .max(1)
        .step(0.001)
        .name('光强')
      directionalLightFolder.add(directionalLight, 'visible')
      directionalLightFolder.add(directionalLight, 'castShadow')
      directionalLightFolder
        .add(directionalLight.position, 'x')
        .min(-5)
        .max(5)
        .step(0.001)
      directionalLightFolder
        .add(directionalLight.position, 'y')
        .min(-5)
        .max(5)
        .step(0.001)
      directionalLightFolder
        .add(directionalLight.position, 'z')
        .min(-5)
        .max(5)
        .step(0.001)
      directionalLightFolder
        .add(directionalLightCameraHelper, 'visible')
        .name('平行光相机助手')

      const spotLightFolder = gui.addFolder('聚光灯')
      spotLightFolder
        .add(spotLight, 'intensity')
        .min(0)
        .max(1)
        .step(0.001)
        .name('聚光灯')
      spotLightFolder.add(spotLight, 'visible')
      spotLightFolder.add(spotLight, 'castShadow')
      spotLightFolder
        .add(spotLightCameraHelper, 'visible')
        .name('聚光灯相机助手')

      const pointLightFolder = gui.addFolder('点光源')
      pointLightFolder
        .add(pointLight, 'intensity')
        .min(0)
        .max(1)
        .step(0.001)
        .name('点光源')
      pointLightFolder.add(pointLight.position, 'x').min(-5).max(5).step(0.001)
      pointLightFolder.add(pointLight.position, 'y').min(-5).max(5).step(0.001)
      pointLightFolder.add(pointLight.position, 'z').min(-5).max(5).step(0.001)
      pointLightFolder.add(pointLight, 'visible')
      pointLightFolder.add(pointLight, 'castShadow')
      pointLightFolder
        .add(pointLightCameraHelper, 'visible')
        .name('点光源相机助手')

      const controls = gui.addFolder('控制器')
      controls.add(this.controls, 'autoRotate')
      controls.add(this.controls, 'autoRotateSpeed').min(0).max(10).step(0.1)

      const guiObj = {
        turnOffAllLights() {
          ambientLight.visible = false
          directionalLight.visible = false
          directionalLightCameraHelper.visible = false
          pointLight.visible = false
          pointLightCameraHelper.visible = false
          spotLight.visible = false
          spotLightCameraHelper.visible = false
        },
        turnOnAllLights() {
          ambientLight.visible = true
          directionalLight.visible = true
          // directionalLightCameraHelper.visible = true
          pointLight.visible = true
          // pointLightCameraHelper.visible = true
          spotLight.visible = true
          // spotLightCameraHelper.visible = true
        }
      }

      gui.add(guiObj, 'turnOffAllLights')
      gui.add(guiObj, 'turnOnAllLights')
    },
    initCamera(sizes) {
      const camera = new THREE.PerspectiveCamera(
        75,
        sizes.width / sizes.height,
        0.1,
        100
      )
      camera.position.set(1, 1, 2)
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
      const elapsedTime = this.clock.getElapsedTime()
      const { sphere, shadowPlane } = this.mesh
      sphere.position.x = Math.sin(elapsedTime) * 1.5
      sphere.position.z = Math.cos(elapsedTime) * 1.5
      sphere.position.y = Math.abs(Math.sin(elapsedTime * 2.5))

      shadowPlane.position.x = sphere.position.x
      shadowPlane.position.z = sphere.position.z
      shadowPlane.material.opacity = (1 - sphere.position.y) * 0.6
      this.controls.update()

      this.renderer.render(this.scene, this.camera)

      stats.end()

      requestAnimationFrame(this.tick)
    },
    turnOnShadowMap({ staticSphere, sphere, plane, shadowPlane }) {
      this.scene.add(staticSphere)
      this.scene.remove(sphere, shadowPlane)
    },
    turnOffShadowMap({ staticSphere, sphere, plane, shadowPlane }) {
      this.scene.add(sphere, shadowPlane)
      this.scene.remove(staticSphere)
    }
  }
}
</script>
