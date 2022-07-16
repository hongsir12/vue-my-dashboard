<template>
  <div ref="three-box" class="three-box">
    <canvas ref="canvas" class="webgl" />
  </div>
</template>
<script>
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'
import { RectAreaLightHelper } from 'three/examples/jsm/helpers/RectAreaLightHelper.js'

export default {
  data() {
    return {
      gui: null, // 调试面板
      canvas: null, // 画布
      scene: null, // 场景
      camera: null, // 相机
      controls: null, // 控制器
      axes: null, // 坐标轴
      clock: null,
      sizes: {
        width: 0,
        height: 0
      },
      material: null, // 当前网格材质
      texture: null,
      lights: {},
      obj: {}, // 对象集合
      params: {
        // 调试面板参数对象
      }
    }
  },
  watch: {},
  beforeMount() {},
  mounted() {
    this.sizes.width = this.$refs['three-box'].offsetWidth
    this.sizes.height = this.$refs['three-box'].offsetHeight
    this.scene = new THREE.Scene()
    this.canvas = this.$refs.canvas
    this.clock = new THREE.Clock()
    this.initGui()
    // this.initAxes()
    this.initLights()
    this.setHelper()
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

      // Update camera
      this.camera.aspect = this.sizes.width / this.sizes.height
      this.camera.updateProjectionMatrix()

      // Update renderer
      this.renderer.setSize(this.sizes.width, this.sizes.height)
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    })
    // Animate
    this.tick()
  },
  beforeDestroy() {
    this.gui.destroy()
  },
  methods: {
    initGui() {
      // 实例化可视化GUI工具   可以通过按 H 键隐藏GUI面板
      this.gui = new dat.GUI() // 可传递对象参数{ closed:true ,width:400}
      this.gui.domElement.style.marginTop = '50px'
      // gui.hide()  //隐藏GUI面板，可通过按两次 H键开启显示
    },
    initAxes() {
      this.axes = new THREE.AxesHelper(5)
      this.scene.add(this.axes)
    },
    initLights() {
      const ambientLight = this.addAmbientLight()
      const directionalLight = this.addDirectionalLight()
      const hemisphereLight = this.addHemisphereLight()
      const pointLight = this.addPointLight()
      const rectAreaLight = this.addRectAreaLight()
      const spotLight = this.addSpotLight()
      this.lights = {
        ambientLight,
        directionalLight,
        hemisphereLight,
        pointLight,
        rectAreaLight,
        spotLight
      }
    },
    addAmbientLight() {
      // 环境光
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
      // 等价于
      // const ambientLight = new THREE.AmbientLight()
      // ambientLight.color = new THREE.Color(0xffffff)
      // 光强
      // ambientLight.intensity = 0.5
      this.scene.add(ambientLight)
      return ambientLight
    },
    addDirectionalLight() {
      // 平行光
      const directionalLight = new THREE.DirectionalLight(0x00fffc, 0.5)
      directionalLight.position.set(1, 0.25, 0)
      this.scene.add(directionalLight)
      return directionalLight
    },
    addHemisphereLight() {
      // 半球光
      const hemisphereLight = new THREE.HemisphereLight(0xff0000, 0x0000ff, 0.3)
      this.scene.add(hemisphereLight)
      return hemisphereLight
    },
    addPointLight() {
      // 点光源
      const pointLight = new THREE.PointLight(0xff9000, 0.5)
      // pointLight.position.x = 2
      // pointLight.position.y = 3
      // pointLight.position.z = 4
      pointLight.position.set(1, -0.5, 1)
      this.scene.add(pointLight)
      return pointLight
    },
    addRectAreaLight() {
      // 平面光光源
      const rectAreaLight = new THREE.RectAreaLight(0x4e00ff, 2, 1, 1)
      rectAreaLight.position.set(-1.5, 0, 1.5)
      // 设置平面光照向场景中心
      rectAreaLight.lookAt(new THREE.Vector3())
      this.scene.add(rectAreaLight)
      return rectAreaLight
    },
    addSpotLight() {
      // 聚光灯
      const spotLight = new THREE.SpotLight(
        0x78ff00,
        0.5,
        10,
        Math.PI * 0.1,
        0.25,
        1
      )
      spotLight.position.set(0, 2, 3)
      this.scene.add(spotLight)
      spotLight.target.position.x = -0.75
      this.scene.add(spotLight.target)
      return spotLight
    },
    setHelper() {
      // 半球光辅助
      const hemisphereLightHelper = new THREE.HemisphereLightHelper(
        this.lights.hemisphereLight,
        0.2
      )
      // 平行光辅助
      const directionalLightHelper = new THREE.DirectionalLightHelper(
        this.lights.directionalLight,
        0.2
      )
      // 点光源辅助
      const pointLightHelper = new THREE.PointLightHelper(
        this.lights.pointLight,
        0.2
      )
      this.scene.add(
        hemisphereLightHelper,
        directionalLightHelper,
        pointLightHelper
      )
      // 聚光灯辅助对象没有size属性。
      // 如果我们移动了聚光灯朝向，那么聚光灯辅助对象也需要更新。
      const spotLightHelper = new THREE.SpotLightHelper(this.lights.spotLight)
      this.scene.add(spotLightHelper)
      window.requestAnimationFrame(() => {
        spotLightHelper.update()
      })
      const rectAreaLightHelper = new RectAreaLightHelper(
        this.lights.rectAreaLight
      )
      this.scene.add(rectAreaLightHelper)
      window.requestAnimationFrame(() => {
        rectAreaLightHelper.position.copy(this.lights.rectAreaLight.position)
        rectAreaLightHelper.quaternion.copy(
          this.lights.rectAreaLight.quaternion
        )
        rectAreaLightHelper.update()
      })
    },
    createObject() {
      const material = new THREE.MeshStandardMaterial()
      material.roughness = 0.4

      // Objects
      const sphere = new THREE.Mesh(
        new THREE.SphereBufferGeometry(0.5, 32, 32),
        material
      )
      sphere.position.x = -1.5

      const cube = new THREE.Mesh(
        new THREE.BoxBufferGeometry(0.75, 0.75, 0.75),
        material
      )

      const torus = new THREE.Mesh(
        new THREE.TorusBufferGeometry(0.3, 0.2, 32, 64),
        material
      )
      torus.position.x = 1.5

      const plane = new THREE.Mesh(
        new THREE.PlaneBufferGeometry(5, 5),
        material
      )
      plane.rotation.x = -Math.PI * 0.5
      plane.position.y = -0.65

      this.scene.add(sphere, cube, torus, plane)

      this.obj = {
        sphere,
        cube,
        torus,
        plane
      }
    },
    initCamera() {
      this.camera = new THREE.PerspectiveCamera(
        75,
        this.sizes.width / this.sizes.height,
        0.1,
        100
      )
      this.camera.position.x = 1
      this.camera.position.y = 1
      this.camera.position.z = 2
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
    tick() {
      const elapsedTime = this.clock.getElapsedTime()
      // Update objects
      this.obj.sphere.rotation.y = 0.1 * elapsedTime
      this.obj.cube.rotation.y = 0.1 * elapsedTime
      this.obj.torus.rotation.y = 0.1 * elapsedTime

      this.obj.sphere.rotation.x = 0.15 * elapsedTime
      this.obj.cube.rotation.x = 0.15 * elapsedTime
      this.obj.torus.rotation.x = 0.15 * elapsedTime
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
