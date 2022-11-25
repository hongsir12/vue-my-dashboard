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
      textures: {}, // 纹理集合
      mesh: {}, // 全部网格对象
      lights: {}, // 全部灯光对象
      ghosts: {},
      debugObj: {
        // 调试面板参数对象
        doorLightColor: '#ff7d46', // 门灯颜色
        fog: true, // 雾
        graveY: 0,
        graveZ: 0,
        ghost1Color: '#ff00ff',
        ghost2Color: '#00ffff',
        ghost3Color: '#ffff00'
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
    this.lights = this.initAllLights()
    this.textures = this.loadTextures()
    this.mesh = this.initAllMesh(this.textures)
    this.createGravesGroup()
    this.ghosts = this.createGhosts()
    this.fog = this.createFog()
    this.camera = this.initCamera(this.sizes)
    this.controls = this.initControls(this.camera, this.canvas)
    this.renderer = this.initRenderer(this.canvas, this.sizes)
    this.setDebug(this.gui, this.lights, this.mesh, this.ghosts)
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
    initAllMesh({ grass, door, brick }) {
      const floor = this.createFloor(grass)
      const house = this.createHouseGroup(door, brick)
      const graves = this.createGravesGroup()
      this.scene.add(floor, house, graves)
      return { floor, house, graves }
    },
    initAllLights() {
      const ambientLight = this.createAmbientLight()
      const moonLight = this.createMoonLight()
      this.scene.add(ambientLight, moonLight)
      return { ambientLight, moonLight }
    },
    // 创建环境光
    createAmbientLight() {
      const ambientLight = new THREE.AmbientLight('#b9d5ff', 0.12)
      return ambientLight
    },
    // 创建平行光--月光
    createMoonLight() {
      const moonLight = new THREE.DirectionalLight('#b9d5ff', 0.12)
      moonLight.position.set(4, 5, -2)
      return moonLight
    },
    // 加载纹理
    loadTextures() {
      const textureLoader = new THREE.TextureLoader()
      const doorColorTexture = textureLoader.load(
        '/static/11-textures/door/color.jpg'
      )
      const doorAlphaTexture = textureLoader.load(
        '/static/11-textures/door/alpha.jpg'
      )
      const doorHeightTexture = textureLoader.load(
        '/static/11-textures/door/height.jpg'
      )
      const doorAmbientOcclusionTexture = textureLoader.load(
        '/static/11-textures/door/ambientOcclusion.jpg'
      )
      const doorNormalTexture = textureLoader.load(
        '/static/11-textures/door/normal.jpg'
      )
      const doorMetalnessTexture = textureLoader.load(
        '/static/11-textures/door/metalness.jpg'
      )
      const doorRoughnessTexture = textureLoader.load(
        '/static/11-textures/door/roughness.jpg'
      )
      const door = {
        doorColorTexture,
        doorAlphaTexture,
        doorHeightTexture,
        doorAmbientOcclusionTexture,
        doorNormalTexture,
        doorMetalnessTexture,
        doorRoughnessTexture
      }

      const brickColorTexture = textureLoader.load(
        '/static/11-textures/bricks/color.jpg'
      )
      const brickAmbientOcclusionTexture = textureLoader.load(
        '/static/11-textures/bricks/ambientOcclusion.jpg'
      )
      const brickNormalTexture = textureLoader.load(
        '/static/11-textures/bricks/normal.jpg'
      )
      const brickRoughnessTexture = textureLoader.load(
        '/static/11-textures/bricks/roughness.jpg'
      )
      const brick = {
        brickColorTexture,
        brickAmbientOcclusionTexture,
        brickNormalTexture,
        brickRoughnessTexture
      }

      const grassColorTexture = textureLoader.load(
        '/static/11-textures/grass/color.jpg'
      )
      const grassAmbientOcclusionTexture = textureLoader.load(
        '/static/11-textures/grass/ambientOcclusion.jpg'
      )
      const grassNormalTexture = textureLoader.load(
        '/static/11-textures/grass/normal.jpg'
      )
      const grassRoughnessTexture = textureLoader.load(
        '/static/11-textures/grass/roughness.jpg'
      )

      grassColorTexture.repeat.set(8, 8)
      grassAmbientOcclusionTexture.repeat.set(8, 8)
      grassNormalTexture.repeat.set(8, 8)
      grassRoughnessTexture.repeat.set(8, 8)

      grassColorTexture.wrapS = THREE.RepeatWrapping
      grassAmbientOcclusionTexture.wrapS = THREE.RepeatWrapping
      grassNormalTexture.wrapS = THREE.RepeatWrapping
      grassRoughnessTexture.wrapS = THREE.RepeatWrapping

      grassColorTexture.wrapT = THREE.RepeatWrapping
      grassAmbientOcclusionTexture.wrapT = THREE.RepeatWrapping
      grassNormalTexture.wrapT = THREE.RepeatWrapping
      grassRoughnessTexture.wrapT = THREE.RepeatWrapping

      const grass = {
        grassColorTexture,
        grassAmbientOcclusionTexture,
        grassNormalTexture,
        grassRoughnessTexture
      }

      return { brick, door, grass }
    },
    // 创建地面
    createFloor(grassTextures) {
      const floor = new THREE.Mesh(
        new THREE.PlaneBufferGeometry(20, 20),
        new THREE.MeshStandardMaterial({
          map: grassTextures.grassColorTexture,
          aoMap: grassTextures.grassAmbientOcclusionTexture,
          normalMap: grassTextures.grassNormalTexture,
          roughnessMap: grassTextures.grassRoughnessTexture
        })
      )
      floor.geometry.setAttribute(
        'uv2',
        new THREE.Float16BufferAttribute(floor.geometry.attributes.uv.array, 2)
      )
      floor.rotation.x = -Math.PI / 2
      floor.rotation.y = 0
      floor.receiveShadow = true
      return floor
    },

    // 创建房屋组
    createHouseGroup(doorTextures, brickTextures) {
      // 创建house组
      const house = new THREE.Group()

      // 创建墙体
      const walls = new THREE.Mesh(
        new THREE.BoxBufferGeometry(4, 2.5, 4),
        new THREE.MeshStandardMaterial({
          map: brickTextures.brickColorTexture,
          aoMap: brickTextures.brickAmbientOcclusionTexture,
          normalMap: brickTextures.brickNormalTexture,
          roughnessMap: brickTextures.brickRoughnessTexture
        })
      )
      walls.position.y = 2.5 / 2
      walls.name = '墙体'
      house.add(walls)

      // 创建屋顶
      const roof = new THREE.Mesh(
        new THREE.ConeBufferGeometry(3.5, 1, 4),
        new THREE.MeshStandardMaterial({ color: '#b35f45' })
      )
      roof.rotation.y = Math.PI * 0.25 // 旋转45度以适配立方体
      roof.position.y = 2.5 + 1 / 2
      roof.name = '屋顶'
      house.add(roof)

      // 创建门
      const door = new THREE.Mesh(
        new THREE.PlaneBufferGeometry(2, 2),
        new THREE.MeshStandardMaterial({
          map: doorTextures.doorColorTexture,
          // 设置alphaMap记得开启透明度属性
          transparent: true,
          alphaMap: doorTextures.doorAlphaTexture,
          aoMap: doorTextures.doorAmbientOcclusionTexture,
          // 设置displacementMap记得提供更多顶点给几何体
          displacementMap: doorTextures.doorHeightTexture,
          displacementScale: 0.1,
          normalMap: doorTextures.doorNormalTexture,
          metalnessMap: doorTextures.doorMetalnessTexture,
          roughnessMap: doorTextures.doorRoughnessTexture
        })
      )
      door.position.z = 2 + 0.01
      door.position.y = 2 / 2
      door.name = '门'
      house.add(door)

      // 创建灌木丛
      const bushGeometry = new THREE.SphereGeometry(1, 16, 16)
      const bushMaterial = new THREE.MeshStandardMaterial({ color: '#89c854' })
      const bush1 = new THREE.Mesh(bushGeometry, bushMaterial)
      bush1.scale.set(0.5, 0.5, 0.5)
      bush1.position.set(0.8, 0.2, 2.2)
      const bush2 = new THREE.Mesh(bushGeometry, bushMaterial)
      bush2.scale.set(0.25, 0.25, 0.25)
      bush2.position.set(1.4, 0.1, 2.1)
      const bush3 = new THREE.Mesh(bushGeometry, bushMaterial)
      bush3.scale.set(0.4, 0.4, 0.4)
      bush3.position.set(-0.8, 0.1, 2.1)
      const bush4 = new THREE.Mesh(bushGeometry, bushMaterial)
      bush4.scale.set(0.15, 0.15, 0.15)
      bush4.position.set(-1, 0.05, 2.6)
      house.add(bush1, bush2, bush3, bush4)

      // 创建门灯
      const doorLight = new THREE.PointLight(this.debugObj.doorLightColor, 1, 7)
      doorLight.position.set(0, 2.2, 2.7)
      doorLight.name = '门灯'
      house.add(doorLight)

      return house
    },
    // 创建墓碑组别
    createGravesGroup() {
      const graves = new THREE.Group()
      const graveGeometry = new THREE.BoxBufferGeometry(0.6, 0.8, 0.2)
      const graveMaterial = new THREE.MeshStandardMaterial({ color: '#b2b6b1' })
      for (let i = 0; i < 50; i++) {
        const angle = Math.random() * Math.PI * 2 // 角度
        const radius = 3 + Math.random() * 6 // 半径位于房屋和地面边缘之间
        const x = Math.cos(angle) * radius
        const z = Math.sin(angle) * radius
        const grave = new THREE.Mesh(graveGeometry, graveMaterial)
        grave.position.set(x, 0.3, z)
        // 改变墓碑朝向以及倾斜度
        grave.rotation.y = (Math.random() - 0.5) * 0.5
        grave.rotation.z = (Math.random() - 0.5) * 0.5
        graves.add(grave)
      }

      return graves
    },
    // 往场景添加烟雾
    createFog() {
      // 创建烟雾
      const fog = new THREE.Fog('#262837', 1, 15)
      // 设置场景的fog属性
      this.scene.fog = fog
      return fog
    },
    // 创建幽灵
    createGhosts() {
      const ghost1 = new THREE.PointLight(this.debugObj.ghost1Color, 2, 3)
      const ghost2 = new THREE.PointLight(this.debugObj.ghost2Color, 2, 3)
      const ghost3 = new THREE.PointLight(this.debugObj.ghost3Color, 2, 3)
      this.scene.add(ghost1, ghost2, ghost3)
      return { ghost1, ghost2, ghost3 }
    },
    setDebug(
      gui,
      { ambientLight, moonLight },
      { floor, graves, house },
      { ghost1, ghost2, ghost3 }
    ) {
      const lightFolder = gui.addFolder('灯光')
      const ambientLightFolder = lightFolder.addFolder('环境光')
      ambientLightFolder
        .add(ambientLight, 'intensity')
        .min(0)
        .max(1)
        .step(0.001)
        .name('环境光强度')
      const moonLightFolder = lightFolder.addFolder('月光')
      moonLightFolder
        .add(moonLight, 'intensity')
        .min(0)
        .max(1)
        .step(0.001)
        .name('月光强度')
      moonLightFolder.add(moonLight.position, 'x').min(-5).max(5).step(0.001)
      moonLightFolder.add(moonLight.position, 'y').min(-5).max(5).step(0.001)
      moonLightFolder.add(moonLight.position, 'z').min(-5).max(5).step(0.001)

      const houseFolder = gui.addFolder('房屋')
      houseFolder
        .add(house.position, 'x')
        .min(-5)
        .max(5)
        .step(0.001)
        .name('屋子x')
      houseFolder
        .add(house.position, 'z')
        .min(-5)
        .max(5)
        .step(0.001)
        .name('屋子z')

      houseFolder
        .addColor(this.debugObj, 'doorLightColor')
        .name('门灯颜色')
        .onChange(() => {
          house.children
            .filter((child) => child.name === '门灯')[0]
            .color.set(this.debugObj.doorLightColor)
        })

      const gravesFolder = gui.addFolder('墓碑')
      gravesFolder
        .add(this.debugObj, 'graveY')
        .min(-1)
        .max(1)
        .step(0.01)
        .onChange(() => {
          graves.children.forEach((child) => {
            child.rotation.y += this.debugObj.graveY * 0.5
          })
        })

      const ghostsFolder = gui.addFolder('幽灵')
      ghostsFolder
        .addColor(this.debugObj, 'ghost1Color')
        .name('幽灵1颜色')
        .onChange(() => {
          ghost1.color.set(this.debugObj.ghost1Color)
        })
      ghostsFolder
        .addColor(this.debugObj, 'ghost2Color')
        .name('幽灵2颜色')
        .onChange(() => {
          ghost2.color.set(this.debugObj.ghost2Color)
        })
      ghostsFolder
        .addColor(this.debugObj, 'ghost3Color')
        .name('幽灵3颜色')
        .onChange(() => {
          ghost3.color.set(this.debugObj.ghost3Color)
        })

      gui
        .add(this.debugObj, 'fog')
        .name('开启烟雾')
        .onChange((val) => {
          if (val) {
            this.fog = this.createFog()
          } else {
            this.scene.fog = ''
          }
        })
    },
    initCamera(sizes) {
      const camera = new THREE.PerspectiveCamera(
        75,
        sizes.width / sizes.height,
        0.1,
        100
      )
      camera.position.set(4, 2, 5)
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
        canvas
      })
      renderer.setSize(sizes.width, sizes.height)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      renderer.setClearColor('#262837')
      // shadow
      renderer.shadowMap.enabled = true
      // PCF柔软阴影贴图
      renderer.shadowMap.type = THREE.PCFSoftShadowMap
      return renderer
    },
    tick() {
      stats.begin()
      const elapsedTime = this.clock.getElapsedTime()

      this.controls.update()

      // update ghost
      const ghostAngle = elapsedTime * 0.5
      this.setGhostAnimate(ghostAngle, 'ghost1', elapsedTime)
      const ghost2Angle = elapsedTime * 0.32
      this.setGhostAnimate(ghost2Angle, 'ghost2', elapsedTime)
      const ghost3Angle = elapsedTime * 0.27
      this.setGhostAnimate(ghost3Angle, 'ghost3', elapsedTime)

      this.renderer.render(this.scene, this.camera)

      stats.end()

      requestAnimationFrame(this.tick)
    },
    setGhostAnimate(ghostAngle, ghost, elapsedTime) {
      if (ghost === 'ghost1') {
        // x和z设置点光源圆周运动
        this.ghosts[ghost].position.x = Math.cos(ghostAngle) * 4
        this.ghosts[ghost].position.z = Math.sin(ghostAngle) * 4
        // 设置点光源高度上下变化
        this.ghosts[ghost].position.y = Math.sin(ghostAngle * 3)
      }
      if (ghost === 'ghost2') {
        this.ghosts[ghost].position.x = Math.cos(ghostAngle) * 5
        this.ghosts[ghost].position.z = Math.sin(ghostAngle) * 4
        this.ghosts[ghost].position.y =
          Math.sin(ghostAngle * 3) + Math.sin(elapsedTime * 2.5)
      }
      if (ghost === 'ghost3') {
        this.ghosts[ghost].position.x =
          Math.cos(ghostAngle) * (7 + Math.sin(elapsedTime * 0.32))
        this.ghosts[ghost].position.z =
          Math.sin(ghostAngle) * (7 + Math.sin(elapsedTime * 0.5))
        this.ghosts[ghost].position.y =
          Math.sin(ghostAngle * 3) + Math.sin(elapsedTime * 2.5)
      }
    }
  }
}
</script>
