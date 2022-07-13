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
      texturesMap: {}, // 纹理贴图集合
      material: null, // 当前网格材质
      materialsMap: {}, // 材质集合
      lights: {}, // 灯光集合
      obj: {}, // 对象集合
      params: {
        // 调试面板参数对象
        color: '#ffffff',
        material: 'meshBasicMaterial',
        loadEnvMap: false
      }
    }
  },
  watch: {
    'params.material': {
      handler(newVal, oldVal) {
        this.gui.removeFolder(this.gui.__folders[oldVal])
      },
      deep: true
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
    this.initMaterials()
    this.settingMaterial('meshBasicMaterial')
    this.createObject(this.texturesMap.environmentMapTexture)
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
    initMaterials() {
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
    // 设置网格材质
    settingMaterial(material) {
      if (this.params.loadEnvMap) {
        this.params.loadEnvMap = false
      }
      this.material = this.materialsMap[material]
      const folder = this.gui.addFolder(material)
      if (material === 'meshBasicMaterial') {
        this.material.map = this.texturesMap.doorColorTexture
        this.material.color.set(this.params.color)
        folder
          .addColor(this.params, 'color')
          .name('颜色')
          .onChange(() => {
            this.material.color.set(this.params.color)
          })
      }
      if (material === 'meshNormalMaterial') {
        this.material.flatShading = true
        folder.add(this.material, 'flatShading')
      }
      if (material === 'meshMatcapMaterial') {
        this.material.matcap = this.texturesMap.matcapsTexture
      }
      if (material === 'meshDepthMaterial') {
        console.log(
          'meshDepthMaterial:如果几何体接近摄影机的“near”值，它将简单地将几何体着色为白色，如果几何体越接近摄影机的“far”值，则将几何体着色为黑色。'
        )
      }
      if (material === 'meshLambertMaterial') {
        console.log('meshLambertMaterial该材质对光线有反应')
        this.removeLight(this.scene)
        // Light
        this.initLight()
        this.addLightFolder(folder)
      }
      if (material === 'meshPhongMaterial') {
        this.removeLight(this.scene)
        this.initLight()
        this.addLightFolder(folder)
        // 通过shininess属性控制光线反射高亮程度，数值越高越闪亮
        // 并通过specular属性控制反射的颜色
        this.material.shininess = 100
        folder.add(this.material, 'shininess').min(50).max(500).step(1)
        this.material.specular = new THREE.Color(0xff0000)
        this.params.color = '#ff0000'
        folder
          .addColor(this.params, 'color')
          .name('颜色')
          .onChange(() => {
            this.material.specular.set(this.params.color)
          })
      }
      if (material === 'meshToonMaterial') {
        this.removeLight(this.scene)
        this.initLight()
        this.addLightFolder(folder)
        this.material.gradientMap = this.texturesMap.gradientTexture
        this.texturesMap.gradientTexture.minFilter = THREE.NearestFilter
        this.texturesMap.gradientTexture.magFilter = THREE.NearestFilter
        // 因为我们的渐变纹理贴图的缩小滤镜minFilter属性使用了NearestFilter
        // 所以我们可以为该纹理停用mipmapping，使得GPU不再处理其mip映射
        this.texturesMap.gradientTexture.generateMipmaps = false
      }
      if (material === 'meshStandardMaterial') {
        this.removeLight(this.scene)
        this.initLight()
        this.addLightFolder(folder)
        this.material.map = this.texturesMap.doorColorTexture
        this.material.aoMap = this.texturesMap.doorAmbientOcclusionTexture
        this.material.aoMapIntensity = 1
        this.material.displacementMap = this.texturesMap.doorHeightTexture
        this.material.displacementScale = 0.05
        this.material.metalnessMap = this.texturesMap.doorMetalnessTexture
        this.material.roughnessMap = this.texturesMap.doorRoughnessTexture
        this.material.normalMap = this.texturesMap.doorNormalTexture
        this.material.normalScale.set(0.5, 0.5)
        this.material.alphaMap = this.texturesMap.doorAlphaTexture
        this.material.transparent = true
        // this.material.wireframe = true
        const material = folder.addFolder('材质设置')
        material.add(this.material, 'metalness').min(0).max(1).step(0.01)
        material.add(this.material, 'roughness').min(0).max(1).step(0.01)
        material.add(this.material, 'aoMapIntensity').min(0).step(0.1)
        folder
          .add(this.params, 'loadEnvMap')
          .name('加载环境贴图')
          .onChange(() => {
            if (this.params.loadEnvMap) {
              this.gui.__folders['meshStandardMaterial'].removeFolder(material)
              const envMaterial = new THREE.MeshStandardMaterial()
              envMaterial.metalness = 0.7
              envMaterial.roughness = 0.2
              envMaterial.envMap = this.texturesMap.environmentMapTexture
              this.obj.sphere.material = envMaterial
              this.obj.plane.material = envMaterial
              this.obj.torus.material = envMaterial
              const cfolder =
                this.gui.__folders['meshStandardMaterial'].addFolder('材质设置')
              cfolder.add(envMaterial, 'metalness').min(0).max(1).step(0.01)
              cfolder.add(envMaterial, 'roughness').min(0).max(1).step(0.01)
            } else {
              this.gui.removeFolder(this.gui.__folders['meshStandardMaterial'])
              this.settingMaterial('meshStandardMaterial')
              this.obj.sphere.material = this.material
              this.obj.plane.material = this.material
              this.obj.torus.material = this.material
            }
          })
      }
    },
    createObject(texture) {
      // 环境贴图environment map
      // const material = new THREE.MeshStandardMaterial()
      // material.metalness = 0.7
      // material.roughness = 0.2
      // material.envMap = texture
      // this.gui.add(material, 'metalness').min(0).max(1).step(0.0001)
      // this.gui.add(material, 'roughness').min(0).max(1).step(0.0001)

      const sphere = new THREE.Mesh(
        new THREE.SphereBufferGeometry(0.5, 64, 64),
        this.material
      )
      const plane = new THREE.Mesh(
        new THREE.PlaneBufferGeometry(1, 1, 100, 100),
        this.material
      )
      const torus = new THREE.Mesh(
        new THREE.TorusBufferGeometry(0.3, 0.2, 64, 128),
        this.material
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
      this.obj = {
        sphere,
        plane,
        torus
      }
      this.gui
        .add(this.params, 'material', {
          meshBasicMaterial: 'meshBasicMaterial',
          meshNormalMaterial: 'meshNormalMaterial',
          meshMatcapMaterial: 'meshMatcapMaterial',
          meshDepthMaterial: 'meshDepthMaterial',
          meshLambertMaterial: 'meshLambertMaterial',
          meshPhongMaterial: 'meshPhongMaterial',
          meshToonMaterial: 'meshToonMaterial',
          meshStandardMaterial: 'meshStandardMaterial'
        })
        .name('材质')
        .onFinishChange(() => {
          const materialName = this.params.material
          this.material = this.materialsMap[this.params.material]
          this.settingMaterial(materialName)
          sphere.material = this.material
          plane.material = this.material
          torus.material = this.material
        })
    },
    // 添加光源
    initLight() {
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
      this.scene.add(ambientLight)
      const pointLight = new THREE.PointLight(0xffffff, 0.5)
      pointLight.position.set(2, 3, 4)
      this.scene.add(pointLight)
      this.lights = {
        ambientLight,
        pointLight
      }
    },
    // 移除光源
    removeLight(scene) {
      scene.remove(this.lights.pointLight)
      scene.remove(this.lights.ambientLight)
    },
    // 添加光源调试
    addLightFolder(folder) {
      const lightFolder = folder.addFolder('点光源')
      lightFolder
        .add(this.lights.pointLight.position, 'x')
        .min(-3)
        .max(10)
        .step(0.01)
      lightFolder
        .add(this.lights.pointLight.position, 'y')
        .min(-3)
        .max(10)
        .step(0.01)
      lightFolder
        .add(this.lights.pointLight.position, 'z')
        .min(-3)
        .max(10)
        .step(0.01)
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
