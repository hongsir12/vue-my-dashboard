<template>
  <div ref="three-box" class="three-box">
    <canvas ref="canvas" class="webgl" />
  </div>
</template>

<script>
import * as THREE from 'three'
import { initStats } from '../utils/stats'
import baseSetting from '../utils/utils'
import { RectAreaLightHelper } from 'three/examples/jsm/helpers/RectAreaLightHelper.js'
export default {
  data() {
    return {
      stats: null, // 帧率监视器
      canvas: null, // 画布
      scene: null, // 场景
      camera: null, // 相机
      controls: null, // 控制器
      lights: {},
      helpers: {},
      objects: {},
      debugParams: {},
      sizes: {
        width: 0,
        height: 0
      }
    }
  },
  beforeMount() {},
  mounted() {
    this.scene = new THREE.Scene()
    this.stats = initStats()
    this.canvas = this.$refs.canvas
    this.sizes = baseSetting.initSizes(this)
    this.lights = this.initLights()
    this.helpers = this.setHelper()
    this.createObject()
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
    this.setLightDebug(this.gui, this.lights, this.helpers)
    this.clock = new THREE.Clock()
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
    initLights() {
      const lightsMap = {}
      const lights = [
        'ambientLight',
        'directionalLight',
        'hemisphereLight',
        'pointLight',
        'rectAreaLight',
        'spotLight'
      ]
      lights.forEach((light) => {
        lightsMap[light] = this[`${light}Add`]()
      })
      return lightsMap
    },
    ambientLightAdd() {
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
    directionalLightAdd() {
      // 平行光
      const directionalLight = new THREE.DirectionalLight(0x00fffc, 0.5)
      directionalLight.position.set(1, 0.25, 0)
      this.scene.add(directionalLight)
      return directionalLight
    },
    hemisphereLightAdd() {
      // 半球光
      const hemisphereLight = new THREE.HemisphereLight(0xff0000, 0x0000ff, 0.3)
      this.scene.add(hemisphereLight)
      return hemisphereLight
    },
    pointLightAdd() {
      // 点光源
      const pointLight = new THREE.PointLight(0xff9000, 0.5)
      // pointLight.position.x = 2
      // pointLight.position.y = 3
      // pointLight.position.z = 4
      pointLight.position.set(1, -0.5, 1)
      this.scene.add(pointLight)
      return pointLight
    },
    rectAreaLightAdd() {
      // 平面光光源
      const rectAreaLight = new THREE.RectAreaLight(0x4e00ff, 2, 1, 1)
      rectAreaLight.position.set(-1.5, 0, 1.5)
      // 设置平面光照向场景中心
      rectAreaLight.lookAt(new THREE.Vector3())
      this.scene.add(rectAreaLight)
      return rectAreaLight
    },
    spotLightAdd() {
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
      return {
        hemisphereLightHelper,
        directionalLightHelper,
        pointLightHelper,
        spotLightHelper,
        rectAreaLightHelper
      }
    },
    createObject() {
      const material = new THREE.MeshStandardMaterial()
      material.roughness = 0.4
      material.metalness = 0
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
      this.material = material
      this.objects = {
        sphere,
        cube,
        torus,
        plane
      }
    },
    setLightDebug(
      gui,
      {
        ambientLight,
        directionalLight,
        hemisphereLight,
        pointLight,
        rectAreaLight,
        spotLight
      },
      {
        hemisphereLightHelper,
        directionalLightHelper,
        pointLightHelper,
        spotLightHelper,
        rectAreaLightHelper
      }
    ) {
      const meshFolder = gui.addFolder('Mesh')
      meshFolder.add(this.material, 'metalness', 0, 1, 0.001)
      meshFolder.add(this.material, 'roughness', 0, 1, 0.001)
      meshFolder.add(this.material, 'wireframe')

      const ambientLightFolder = gui.addFolder('环境光')
      ambientLightFolder.add(ambientLight, 'visible').listen()
      ambientLightFolder
        .add(ambientLight, 'intensity', 0, 1, 0.001)
        .name('光强')

      const directionalLightFolder = gui.addFolder('平行光')
      directionalLightFolder
        .add(directionalLight, 'visible')
        .onChange((visible) => {
          directionalLightHelper.visible = visible
        })
        .listen()
      directionalLightFolder
        .add(directionalLightHelper, 'visible')
        .name('helper visible')
        .listen()
      directionalLightFolder
        .add(directionalLight, 'intensity', 0, 1, 0.001)
        .name('光强')

      const hemisphereLightFolder = gui.addFolder('半球光')
      hemisphereLightFolder
        .add(hemisphereLight, 'visible')
        .onChange((visible) => {
          hemisphereLightHelper.visible = visible
        })
        .listen()
      hemisphereLightFolder
        .add(hemisphereLightHelper, 'visible')
        .name('helper visible')
        .listen()
      hemisphereLightFolder
        .add(hemisphereLight, 'intensity', 0, 1, 0.001)
        .name('光强')

      const pointLightFolder = gui.addFolder('点光源')
      pointLightFolder
        .add(pointLight, 'visible')
        .onChange((visible) => {
          pointLightHelper.visible = visible
        })
        .listen()
      pointLightFolder
        .add(pointLightHelper, 'visible')
        .name('helper visible')
        .listen()
      pointLightFolder
        .add(pointLight, 'distance', 0, 100, 0.00001)
        .name('光线距离') // 从光源到光照强度为0的位置
      pointLightFolder.add(pointLight, 'decay', 0, 10, 0.00001).name('光线衰减') // 沿着光照距离的衰退量

      const rectAreaLightFolder = gui.addFolder('平面光光源')
      rectAreaLightFolder
        .add(rectAreaLight, 'visible')
        .onChange((visible) => {
          rectAreaLightHelper.visible = visible
        })
        .listen()
      rectAreaLightFolder
        .add(rectAreaLightHelper, 'visible')
        .name('helper visible')
        .listen()
      rectAreaLightFolder
        .add(rectAreaLight, 'intensity', 0, 80, 0.0001)
        .name('光强')
      rectAreaLightFolder
        .add(rectAreaLight, 'width', 0, 5, 0.0001)
        .name('光源宽度')
      rectAreaLightFolder
        .add(rectAreaLight, 'height', 0, 5, 0.0001)
        .name('光源高度')

      const spotLightFolder = gui.addFolder('聚光灯')
      spotLightFolder
        .add(spotLight, 'visible')
        .onChange((visible) => {
          spotLightHelper.visible = visible
        })
        .listen()
      spotLightFolder
        .add(spotLightHelper, 'visible')
        .name('helper visible')
        .listen()
      spotLightFolder.add(spotLight, 'intensity', 0, 5, 0.001).name('光强')
      spotLightFolder.add(spotLight, 'distance', 0, 20, 0.001).name('光线距离')
      spotLightFolder
        .add(spotLight, 'angle', 0, Math.PI / 2, 0.001)
        .name('光线散射角')
      spotLightFolder
        .add(spotLight, 'penumbra', 0, 1, 0.001)
        .name('聚光锥衰减百分比')
      spotLightFolder.add(spotLight, 'decay', 0, 10, 0.001).name('光线衰减')

      const guiObj = {
        turnOffAllLights() {
          ambientLight.visible = false
          directionalLight.visible = false
          directionalLightHelper.visible = false
          hemisphereLight.visible = false
          hemisphereLightHelper.visible = false
          pointLight.visible = false
          pointLightHelper.visible = false
          rectAreaLight.visible = false
          rectAreaLightHelper.visible = false
          spotLight.visible = false
          spotLightHelper.visible = false
        },
        turnOnAllLights() {
          ambientLight.visible = true
          directionalLight.visible = true
          directionalLightHelper.visible = true
          hemisphereLight.visible = true
          hemisphereLightHelper.visible = true
          pointLight.visible = true
          pointLightHelper.visible = true
          rectAreaLight.visible = true
          rectAreaLightHelper.visible = true
          spotLight.visible = true
          spotLightHelper.visible = true
        }
      }

      gui.add(guiObj, 'turnOffAllLights')
      gui.add(guiObj, 'turnOnAllLights')
    },
    tick() {
      this.stats.begin()
      const elapsedTime = this.clock.getElapsedTime()
      // Update objects
      for (const k in this.objects) {
        if (k !== 'plane') {
          this.objects[k].rotation.y = 0.1 * elapsedTime
          this.objects[k].rotation.x = 0.15 * elapsedTime
        }
      }
      // Update controls
      this.controls.update()
      this.helpers.rectAreaLightHelper.update()
      this.helpers.spotLightHelper.update()
      // Render
      this.renderer.render(this.scene, this.camera)

      this.stats.end()
      // Call tick again on the next frame
      window.requestAnimationFrame(this.tick)
    }
  }
}
</script>
