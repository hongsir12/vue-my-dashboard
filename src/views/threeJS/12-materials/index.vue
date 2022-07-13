<template>
  <div ref="three-box" class="three-box">
    <canvas ref="canvas" class="webgl" />
  </div>
</template>
<script>
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'

export default {
  data() {
    return {
      gui: null, // 调试面板
      canvas: null, // 画布
      scene: null, // 场景
      camera: null, // 相机
      controls: null, // 控制器
      clock: null,
      sizes: {
        width: 0,
        height: 0
      },
      texturesMap: {},
      materialsMap: {}
    }
  },
  beforeMount() {},
  mounted() {
    this.sizes.width = this.$refs['three-box'].offsetWidth
    this.sizes.height = this.$refs['three-box'].offsetHeight
    this.scene = new THREE.Scene()
    this.canvas = this.$refs.canvas
    this.clock = new THREE.Clock()
    this.initGui()
    this.loadTexture()
    this.createMaterials()
    this.createObject(this.texturesMap.environmentMapTexture)
    // Light
    this.initLight()
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
    loadTexture() {
      const textureLoader = new THREE.TextureLoader()
      const cubeTextureLoader = new THREE.CubeTextureLoader()
      const doorColorTexture = textureLoader.load(
        require('@/assets/11-textures/door/color.jpg')
      )
      const doorAlphaTexture = textureLoader.load(
        require('@/assets/11-textures/door/alpha.jpg')
      )
      const doorAmbientOcclusionTexture = textureLoader.load(
        require('@/assets/11-textures/door/ambientOcclusion.jpg')
      )
      const doorHeightTexture = textureLoader.load(
        require('@/assets/11-textures/door/height.jpg')
      )
      const doorMetalnessTexture = textureLoader.load(
        require('@/assets/11-textures/door/metalness.jpg')
      )
      const doorNormalTexture = textureLoader.load(
        require('@/assets/11-textures/door/normal.jpg')
      )
      const doorRoughnessTexture = textureLoader.load(
        require('@/assets/11-textures/door/roughness.jpg')
      )
      const matcapsTexture = textureLoader.load(
        require('@/assets/11-textures/matcaps/3.png')
      )
      const gradientTexture = textureLoader.load(
        require('@/assets/11-textures/gradients/5.jpg')
      )
      const environmentMapTexture = cubeTextureLoader.load([
        require('@/assets/11-textures/environmentMaps/0/px.jpg'),
        require('@/assets/11-textures/environmentMaps/0/nx.jpg'),
        require('@/assets/11-textures/environmentMaps/0/py.jpg'),
        require('@/assets/11-textures/environmentMaps/0/nx.jpg'),
        require('@/assets/11-textures/environmentMaps/0/pz.jpg'),
        require('@/assets/11-textures/environmentMaps/0/nz.jpg')
      ])
      this.texturesMap = {
        doorColorTexture,
        doorAlphaTexture,
        doorAmbientOcclusionTexture,
        doorHeightTexture,
        doorMetalnessTexture,
        doorNormalTexture,
        doorRoughnessTexture,
        matcapsTexture,
        gradientTexture,
        environmentMapTexture
      }
    },
    createMaterials() {
      // 基础网格材质MeshBasicMaterial
      const meshBasicMaterial = new THREE.MeshBasicMaterial()
      // 法线网格材质MeshNormalMaterial
      const meshNormalMaterial = new THREE.MeshNormalMaterial()
      // 网帽材质(MeshMatcapMaterial)
      const meshMatcapMaterial = new THREE.MeshMatcapMaterial()
      // 深度网格材质(MeshDepthMaterial)
      const meshDepthMaterial = new THREE.MeshDepthMaterial()
      // Lambert网格材质(MeshLambertMaterial)
      const meshLambertMaterial = new THREE.MeshLambertMaterial()
      // Phong网格材质(MeshPhongMaterial)
      const meshPhongMaterial = new THREE.MeshPhongMaterial()
      // Toon网格材质(MeshToonMaterial)
      const meshToonMaterial = new THREE.MeshToonMaterial()
      // 标准网格材质(MeshStandardMaterial)
      const meshStandardMaterial = new THREE.MeshStandardMaterial()
      this.materialsMap = {
        meshBasicMaterial,
        meshNormalMaterial,
        meshMatcapMaterial,
        meshDepthMaterial,
        meshLambertMaterial,
        meshPhongMaterial,
        meshToonMaterial,
        meshStandardMaterial
      }
    },
    createObject(texture) {
      // 基础网格材质MeshBasicMaterial
      // const material = new THREE.MeshBasicMaterial()
      // material.map = doorColorTexture
      // material.color.set('#ff00ff')
      // material.color = new THREE.Color('red')
      // 设置显示线框
      // material.wireframe = true
      // 设置透明
      // material.transparent = true
      // material.opacity = 0.5
      // 设置alpha贴图
      // material.alphaMap = doorAlphaTexture
      // 设置渲染哪一面
      // material.side = THREE.FrontSide
      // material.side = THREE.BackSide
      // material.side = THREE.DoubleSide
      // 法线网格材质MeshNormalMaterial
      // const material = new THREE.MeshNormalMaterial()
      // material.flatShading = true
      // 网帽材质(MeshMatcapMaterial)
      // const material = new THREE.MeshMatcapMaterial()
      // material.matcap = matcapsTexture
      // 深度网格材质(MeshDepthMaterial)
      // const material = new THREE.MeshDepthMaterial()
      // Lambert网格材质(MeshLambertMaterial)
      // const material = new THREE.MeshLambertMaterial()
      // Phong网格材质(MeshPhongMaterial)
      // const material = new THREE.MeshPhongMaterial()
      // material.shininess = 100
      // material.specular = new THREE.Color(0xff0000)
      // Toon网格材质(MeshToonMaterial)
      // const material = new THREE.MeshToonMaterial()
      // material.gradientMap = gradientTexture
      // gradientTexture.minFilter = THREE.NearestFilter
      // gradientTexture.magFilter = THREE.NearestFilter
      // gradientTexture.generateMipmaps = false
      // 标准网格材质(MeshStandardMaterial)
      // const material = new THREE.MeshStandardMaterial()
      // material.map = doorColorTexture
      // material.aoMap = doorAmbientOcclusionTexture
      // material.aoMapIntensity = 1
      // material.displacementMap = doorHeightTexture
      // material.displacementScale = 0.05
      // material.metalnessMap = doorMetalnessTexture
      // material.roughnessMap = doorRoughnessTexture
      // material.normalMap = doorNormalTexture
      // material.normalScale.set(0.5,0.5)
      // material.alphaMap = doorAlphaTexture
      // material.transparent = true
      // // material.wireframe = true
      // gui.add(material,'metalness').min(0).max(1).step(0.01)
      // gui.add(material,'roughness').min(0).max(1).step(0.01)
      // gui.add(material,'aoMapIntensity').min(0).step(0.1)

      // 环境贴图environment map
      const material = new THREE.MeshStandardMaterial()
      material.metalness = 0.7
      material.roughness = 0.2
      material.envMap = texture
      this.gui.add(material, 'metalness').min(0).max(1).step(0.0001)
      this.gui.add(material, 'roughness').min(0).max(1).step(0.0001)

      const sphere = new THREE.Mesh(
        new THREE.SphereBufferGeometry(0.5, 64, 64),
        material
      )
      const plane = new THREE.Mesh(
        new THREE.PlaneBufferGeometry(1, 1, 100, 100),
        material
      )
      const torus = new THREE.Mesh(
        new THREE.TorusBufferGeometry(0.3, 0.2, 64, 128),
        material
      )
      sphere.position.x = -1.5
      sphere.geometry.setAttribute(
        'uv2',
        new THREE.BufferAttribute(sphere.geometry.attributes.uv.array, 2)
      )

      plane.geometry.setAttribute(
        'uv2',
        new THREE.BufferAttribute(plane.geometry.attributes.uv.array, 2)
      )

      torus.position.x = 1.5
      torus.geometry.setAttribute(
        'uv2',
        new THREE.BufferAttribute(torus.geometry.attributes.uv.array, 2)
      )

      this.scene.add(sphere, plane, torus)
    },
    initLight() {
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
      this.scene.add(ambientLight)
      const pointLight = new THREE.PointLight(0xffffff, 0.5)
      pointLight.position.set(2, 3, 4)
      this.scene.add(pointLight)
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
      // const elapsedTime = this.clock.getElapsedTime()
      // update objects
      // sphere.rotation.y = 0.1*elapsedTime
      // plane.rotation.y = 0.1*elapsedTime
      // torus.rotation.y = 0.1*elapsedTime

      // sphere.rotation.x = 0.15*elapsedTime
      // plane.rotation.x = 0.15*elapsedTime
      // torus.rotation.x = 0.15*elapsedTime
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
