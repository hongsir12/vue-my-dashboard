<template>
  <div ref="three-box" class="three-box">
    <canvas ref="canvas" class="webgl" />
  </div>
</template>

<script>
import * as THREE from 'three'
import { initStats } from '../utils/stats'
import baseSetting from '../utils/utils'

let scene
let canvas
let camera
let sizes
let controls
let renderer
let gui
let textures
export default {
  data() {
    return {
      stats: null, // 帧率监视器
      debugObj: {
        bevelSize: 0
      },
      doorStatus: 'close'
    }
  },

  mounted() {
    this.init()
    textures = this.loadTextures()
    this.createObjects()
    // 画布添加点击事件
    canvas.addEventListener('click', this.onMouseDown)
    console.log(textures)
    this.tick()
  },

  methods: {
    init() {
      scene = new THREE.Scene()
      scene.fog = new THREE.Fog(0xcce0ff, 1, 1000)
      this.stats = initStats()
      canvas = this.$refs.canvas
      sizes = baseSetting.initSizes(this)
      camera = baseSetting.initCamera(sizes, { fov: 75, near: 0.1, far: 10000 })
      camera.position.set(0, 0, 700)
      controls = baseSetting.initControls({
        camera,
        canvas
      })
      renderer = baseSetting.initRenderer({
        canvas,
        sizes
      })
      renderer.setClearColor(new THREE.Color(0xcce0ff))
      baseSetting.listenResize(sizes, camera, renderer)
      baseSetting.initAxes(scene, 700)
      gui = baseSetting.initLilGui()
    },
    loadTextures() {
      const textureLoader = new THREE.TextureLoader()
      let glassTextureArr = ['color', 'ambientOcclusion', 'normal', 'roughness']
      glassTextureArr = glassTextureArr.map((item) => {
        return [
          item,
          textureLoader.load(`/static/11-textures/grass/${item}.jpg`)
        ]
      })
      const glassTextureMap = new Map(glassTextureArr)
      glassTextureMap.get('color').repeat.set(80, 80)
      glassTextureMap.get('color').wrapS = THREE.RepeatWrapping
      glassTextureMap.get('color').wrapT = THREE.RepeatWrapping

      glassTextureMap.get('ambientOcclusion').repeat.set(80, 80)
      glassTextureMap.get('ambientOcclusion').wrapS = THREE.RepeatWrapping
      glassTextureMap.get('ambientOcclusion').wrapT = THREE.RepeatWrapping

      glassTextureMap.get('normal').repeat.set(80, 80)
      glassTextureMap.get('normal').wrapS = THREE.RepeatWrapping
      glassTextureMap.get('normal').wrapT = THREE.RepeatWrapping

      glassTextureMap.get('roughness').repeat.set(80, 80)
      glassTextureMap.get('roughness').wrapS = THREE.RepeatWrapping
      glassTextureMap.get('roughness').wrapT = THREE.RepeatWrapping

      // let doorTextureArr = [
      //   'color',
      //   'alpha',
      //   'height',
      //   'ambientOcclusion',
      //   'normal',
      //   'metalness',
      //   'roughness'
      // ]
      // doorTextureArr = doorTextureArr.map((item) => {
      //   return [
      //     item,
      //     textureLoader.load(`/static/11-textures/door/${item}.jpg`)
      //   ]
      // })
      // const doorTextureMap = new Map(doorTextureArr)
      const doorTexture = textureLoader.load(`/static/theRoom/wood.jpg`)

      const floorTexture = textureLoader.load(`/static/theRoom/floor.png`)
      floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping
      floorTexture.repeat.set(25, 25)
      floorTexture.anisotropy = 16

      const roofTexture = textureLoader.load(`/static/theRoom/roof.png`)
      roofTexture.wrapS = roofTexture.wrapT = THREE.RepeatWrapping
      roofTexture.repeat.set(2, 2)
      return { glassTextureMap, floorTexture, roofTexture, doorTexture }
    },
    createObjects() {
      this.initLights()
      this.createGround()
      this.createHouse()
    },
    initLights() {
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.4)
      const moonLight = new THREE.DirectionalLight(0x00fffc, 0.4)
      moonLight.position.set(4, 5, -2)
      gui
        .add(ambientLight, 'intensity')
        .min(0)
        .max(1)
        .step(0.001)
        .name('环境光强度')
      scene.add(ambientLight, moonLight)
    },
    createGround() {
      const groundGeometry = new THREE.PlaneBufferGeometry(2000, 2000)
      const groundMaterial = new THREE.MeshStandardMaterial({
        map: textures.glassTextureMap.get('color'),
        aoMap: textures.glassTextureMap.get('ambientOcclusion'),
        normalMap: textures.glassTextureMap.get('normal'),
        roughnessMap: textures.glassTextureMap.get('roughness')
      })
      const ground = new THREE.Mesh(groundGeometry, groundMaterial)
      ground.geometry.setAttribute(
        'uv2',
        new THREE.Float16BufferAttribute(ground.geometry.attributes.uv.array, 2)
      )
      ground.rotation.x = -Math.PI / 2
      ground.rotation.y = 0
      ground.receiveShadow = true
      scene.add(ground)
    },
    createHouse() {
      const house = new THREE.Group()
      // 地板
      const floorGeometry = new THREE.PlaneBufferGeometry(100, 80)
      const floor = new THREE.Mesh(
        floorGeometry,
        new THREE.MeshLambertMaterial({ map: textures.floorTexture })
      )
      floor.rotation.x = -Math.PI / 2
      floor.position.y = 0.1
      house.add(floor)
      // 后墙
      const wallMaterial = new THREE.MeshLambertMaterial({ color: 0xe5d890 })
      const boxGeometry = new THREE.BoxGeometry(100, 40, 1)
      const backWall = new THREE.Mesh(boxGeometry, wallMaterial)
      backWall.position.set(0, 20, -40)
      // 侧墙
      function drawShape() {
        const shape = new THREE.Shape()
        shape.moveTo(-40, 0)
        shape.lineTo(40, 0)
        shape.lineTo(40, 40)
        shape.lineTo(0, 50)
        shape.lineTo(-40, 40)
        const extrudeSettings = {
          curveSegments: 5,
          bevelSize: 0,
          bevelThickness: 0,
          depth: 1
        }
        const geometry = new THREE.ExtrudeBufferGeometry(shape, extrudeSettings)
        return geometry
      }
      const sideWallGeometry = drawShape()
      const rSideWall = new THREE.Mesh(sideWallGeometry, wallMaterial)
      const lSideWall = new THREE.Mesh(sideWallGeometry, wallMaterial)
      rSideWall.rotation.y = -Math.PI / 2
      rSideWall.position.set(50, 0, 0)
      lSideWall.rotation.y = -Math.PI / 2
      lSideWall.position.set(-50, 0, 0)
      const frontWallGeometry = this.createFrontWall(wallMaterial)
      const frontWall = new THREE.Mesh(frontWallGeometry, wallMaterial)
      frontWall.position.z = 40

      const roofGeometry = new THREE.BoxGeometry(50, 110, 1)
      const roofMaterialArr = []
      const roofColorMaterial = new THREE.MeshLambertMaterial({ color: 'grey' })
      const roofTextureMaterial = new THREE.MeshLambertMaterial({
        map: textures.roofTexture
      })
      for (let i = 0; i < 6; i++) {
        roofMaterialArr.push(roofColorMaterial)
      }
      roofMaterialArr[5] = roofTextureMaterial
      const frontRoof = new THREE.Mesh(roofGeometry, roofMaterialArr)
      frontRoof.rotation.x = -4.479
      frontRoof.rotation.z = -Math.PI / 2
      frontRoof.position.set(0, 44.54, 24.46)
      const backRoof = new THREE.Mesh(roofGeometry, roofMaterialArr)
      backRoof.rotation.x = 1.325
      backRoof.rotation.z = Math.PI / 2
      backRoof.position.set(0, 44.54, -24.46)

      const door = this.createDoor()
      this.door = door
      const frame = this.createFrame()
      frame.position.set(1, -3, 41)
      const window = this.createWindow()
      window.position.set(20, 17.5, 40.5)
      gui.add(window.position, 'x', -25, 25, 0.1)
      gui.add(window.position, 'y', -25, 25, 0.1)
      gui.add(window.position, 'z', -25, 60, 0.1)

      house.add(
        backWall,
        rSideWall,
        lSideWall,
        frontWall,
        frontRoof,
        backRoof,
        door,
        frame,
        window
      )
      gui.add(house.position, 'x', -100, 100, 1).name('房子x')
      gui.add(house.position, 'z', -100, 100, 1).name('房子z')

      scene.add(house)
    },
    createFrontWall() {
      const shape = new THREE.Shape()
      shape.moveTo(-50, 0)
      shape.lineTo(50, 0)
      shape.lineTo(50, 40)
      shape.lineTo(0, 40)
      shape.lineTo(-50, 40)
      const window = new THREE.Path()
      window.moveTo(10, 10)
      window.lineTo(10, 25)
      window.lineTo(30, 25)
      window.lineTo(30, 10)
      const door = new THREE.Path()
      door.moveTo(-33, 1)
      door.lineTo(-33, 25)
      door.lineTo(-21, 25)
      door.lineTo(-21, 1)
      shape.holes.push(window, door)
      const extrudeSettings = {
        bevelSize: 0,
        bevelThickness: 0,
        depth: 1
      }
      const geometry = new THREE.ExtrudeBufferGeometry(shape, extrudeSettings)
      return geometry
    },
    createDoor() {
      const doorGeometry = new THREE.BoxGeometry(12, 24, 1)
      const doorMaterial = new THREE.MeshLambertMaterial({
        map: textures.doorTexture
      })
      const door = new THREE.Mesh(doorGeometry, doorMaterial)
      door.position.set(-27, 13, 41)
      door.rotation.y = 0
      return door
    },
    createFrame() {
      const shape = new THREE.Shape()
      shape.moveTo(-36, 0)
      shape.lineTo(-36, 30)
      shape.lineTo(-22, 30)
      shape.lineTo(-22, 0)
      shape.lineTo(-24, 0)
      shape.lineTo(-24, 28)
      shape.lineTo(-34, 28)
      shape.lineTo(-34, 0)
      const extrudeSettings = {
        bevelSize: 0,
        bevelThickness: 0,
        depth: 1
      }
      const frameGeometry = new THREE.ExtrudeBufferGeometry(
        shape,
        extrudeSettings
      )
      const frameMaterial = new THREE.MeshLambertMaterial({
        // 门框材质
        color: 0x8d7159
      })
      const frame = new THREE.Mesh(frameGeometry, frameMaterial)
      return frame
    },
    createWindow() {
      const windowGeometry = new THREE.BoxGeometry(20, 15, 1)
      const windowMaterial = new THREE.MeshPhysicalMaterial({
        map: null,
        color: 0xcfcfcf,
        metalness: 0,
        roughness: 0,
        opacity: 0.45,
        transparent: true,
        envMapIntensity: 10,
        premultipliedAlpha: true
      })
      const window = new THREE.Mesh(windowGeometry, windowMaterial)
      return window
    },
    onMouseDown(e) {
      let vector = new THREE.Vector3(
        (e.offsetX / sizes.width) * 2 - 1,
        -(e.offsetY / sizes.height) * 2 + 1,
        0.5
      )
      vector = vector.unproject(camera)
      const raycaster = new THREE.Raycaster(
        camera.position,
        vector.sub(camera.position).normalize()
      )
      const intersects = raycaster.intersectObjects([this.door])
      if (intersects.length > 0) {
        this.animateDoor()
      }
    },
    animateDoor() {
      if (this.doorStatus === 'close') {
        this.door.position.x = -21
        this.door.position.z = 34
        this.door.rotation.y = -Math.PI / 2
        this.doorStatus = 'open'
      } else {
        this.door.position.x = -27
        this.door.position.z = 41
        this.door.rotation.y = 0
        this.doorStatus = 'close'
      }
    },
    setDebug() {},
    tick() {
      this.stats.begin()
      controls.update()
      renderer.render(scene, camera)
      this.stats.end()
      window.requestAnimationFrame(this.tick)
    }
  }
}
</script>
