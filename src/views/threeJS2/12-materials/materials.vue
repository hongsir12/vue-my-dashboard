<template>
  <div ref="three-box" class="three-box">
    <canvas ref="canvas" class="webgl" />
  </div>
</template>

<script>
import * as THREE from 'three'
import { initStats } from '../utils/stats'
import baseSetting from '../utils/utils'

export default {
  data() {
    return {
      stats: null, // 帧率监视器
      canvas: null, // 画布
      scene: null, // 场景
      camera: null, // 相机
      controls: null, // 控制器
      sizes: {
        width: 0,
        height: 0
      },
      texturesMap: {},
      materialsMap: {},
      lights: {},
      objects: {},
      hasLights: false, // 场景中是否有光源
      currentMaterial: null,
      debugParams: {
        color: '#fff',
        material: 'MeshBasicMaterial',
        loadEnvMap: false
      }
    }
  },
  beforeMount() {},
  mounted() {
    this.scene = new THREE.Scene()
    this.stats = initStats()
    this.canvas = this.$refs.canvas
    this.sizes = baseSetting.initSizes(this)
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
    this.texturesMap = this.loadTexture()
    this.materialsMap = this.initMaterials()
    this.settingMaterial('MeshBasicMaterial')
    this.lights = this.initLights()
    this.objects = this.createObjects()
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
    loadTexture() {
      const texturesMap = {}
      const textureLoader = new THREE.TextureLoader()
      const cubeTextureLoader = new THREE.CubeTextureLoader()
      const doorTextures = [
        'color',
        'alpha',
        'ambientOcclusion',
        'height',
        'metalness',
        'normal',
        'roughness',
        'matcaps',
        'gradients'
      ]
      doorTextures.forEach((texture) => {
        if (['matcaps', 'gradients'].indexOf(texture) > -1) {
          texturesMap[texture] = textureLoader.load(
            `/static/11-textures/${texture}/3.jpg`
          )
        } else {
          texturesMap[texture] = textureLoader.load(
            `/static/11-textures/door/${texture}.jpg`
          )
        }
        const envTextures = ['px', 'nx', 'py', 'nx', 'pz', 'nz']
        texturesMap.environmentMapTexture = cubeTextureLoader.load(
          envTextures.map((texture) => {
            return `/static/11-textures/environmentMaps/0/${texture}.jpg`
          })
        )
      })
      return texturesMap
    },
    initMaterials() {
      const materialsMap = {}
      const materials = [
        'MeshBasicMaterial',
        'MeshNormalMaterial',
        'MeshMatcapMaterial',
        'MeshDepthMaterial',
        'MeshLambertMaterial',
        'MeshPhongMaterial',
        'MeshToonMaterial',
        'MeshStandardMaterial'
      ]
      materials.forEach((material) => {
        materialsMap[material] = new THREE[material]()
      })
      this.gui
        .add(
          this.debugParams,
          'material',
          Object.fromEntries(materials.map((material) => [material, material]))
        )
        .name('材质')
        .onFinishChange(() => {
          const materialName = this.debugParams.material
          this.currentMaterial = this.materialsMap[materialName]
          this.settingMaterial(materialName)
          this.$nextTick(() => {
            for (const k in this.objects) {
              this.objects[k].material = this.currentMaterial
            }
          })
        })
      return materialsMap
    },
    settingMaterial(material) {
      if (this.debugParams.loadEnvMap) {
        this.debugParams.loadEnvMap = false
      }
      if (this.hasLights) {
        this.removeLight()
      }
      if (this.gui.children[1]) {
        this.gui.children[1].destroy()
      }
      const folder = this.gui.addFolder(material)
      this.currentMaterial = this.materialsMap[material]
      switch (material) {
        case 'MeshBasicMaterial':
          this.currentMaterial.map = this.texturesMap.color
          this.currentMaterial.color.set(this.debugParams.color)
          folder
            .addColor(this.debugParams, 'color')
            .name('颜色')
            .onChange(() => {
              this.currentMaterial.color.set(this.debugParams.color)
            })
          break
        case 'MeshNormalMaterial':
          this.currentMaterial.flatShading = true
          folder.add(this.currentMaterial, 'flatShading')
          break
        case 'MeshMatcapMaterial':
          this.currentMaterial.matcap = this.texturesMap.matcaps
          break
        case 'MeshDepthMaterial':
          alert(
            'meshDepthMaterial:如果几何体接近摄影机的“near”值，它将简单地将几何体着色为白色，如果几何体越接近摄影机的“far”值，则将几何体着色为黑色。'
          )
          break
        case 'MeshLambertMaterial':
          alert('meshLambertMaterial该材质对光线有反应')
          this.addLight()
          this.addLightFolder(folder)
          break
        case 'MeshPhongMaterial':
          this.addLight()
          this.addLightFolder(folder)
          // 通过shininess属性控制光线反射高亮程度，数值越高越闪亮
          // 并通过specular属性控制反射的颜色
          this.currentMaterial.shininess = 100
          folder.add(this.currentMaterial, 'shininess').min(50).max(500).step(1)
          this.currentMaterial.specular = new THREE.Color(0xff0000)
          this.debugParams.color = '#ff0000'
          folder
            .addColor(this.debugParams, 'color')
            .name('颜色')
            .onChange(() => {
              this.currentMaterial.specular.set(this.debugParams.color)
            })
          break
        case 'MeshToonMaterial':
          this.addLight()
          this.addLightFolder(folder)
          this.currentMaterial.gradientMap = this.texturesMap.gradients
          this.texturesMap.gradients.minFilter = THREE.NearestFilter
          this.texturesMap.gradients.magFilter = THREE.NearestFilter
          // 因为我们的渐变纹理贴图的缩小滤镜minFilter属性使用了NearestFilter
          // 所以我们可以为该纹理停用mipmapping，使得GPU不再处理其mip映射
          this.texturesMap.gradients.generateMipmaps = false
          break
        case 'MeshStandardMaterial':
          this.addLight()
          this.addLightFolder(folder)
          this.currentMaterial.map = this.texturesMap.color
          this.currentMaterial.aoMap = this.texturesMap.ambientOcclusion
          this.currentMaterial.aoMapIntensity = 1
          this.currentMaterial.displacementMap = this.texturesMap.height
          this.currentMaterial.displacementScale = 0.05
          this.currentMaterial.metalnessMap = this.texturesMap.metalness
          this.currentMaterial.roughnessMap = this.texturesMap.roughness
          this.currentMaterial.normalMap = this.texturesMap.normal
          this.currentMaterial.normalScale.set(0.5, 0.5)
          this.currentMaterial.alphaMap = this.texturesMap.alpha
          this.currentMaterial.transparent = true
          // eslint-disable-next-line no-case-declarations
          const materialSet = folder.addFolder('材质设置')
          materialSet
            .add(this.currentMaterial, 'metalness')
            .min(0)
            .max(1)
            .step(0.01)
          materialSet
            .add(this.currentMaterial, 'roughness')
            .min(0)
            .max(1)
            .step(0.01)
          materialSet
            .add(this.currentMaterial, 'aoMapIntensity')
            .min(0)
            .step(0.1)
          break
        default:
          break
      }
    },
    // 初始化光源
    initLights() {
      let lights = {}
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
      const pointLight = new THREE.PointLight(0xffffff, 0.5)
      pointLight.position.set(2, 3, 4)
      lights = {
        ambientLight,
        pointLight
      }
      return lights
    },
    // 添加光源
    addLight() {
      this.scene.add(this.lights.pointLight)
      this.scene.add(this.lights.ambientLight)
      this.hasLights = true
    },
    // 移除光源
    removeLight() {
      this.scene.remove(this.lights.pointLight)
      this.scene.remove(this.lights.ambientLight)
      this.hasLights = false
    },
    // 添加光源调试面板
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
    createObjects() {
      const sphere = new THREE.Mesh(
        new THREE.SphereBufferGeometry(0.5, 64, 64),
        this.currentMaterial
      )
      const plane = new THREE.Mesh(
        new THREE.PlaneBufferGeometry(1, 1, 100, 100),
        this.currentMaterial
      )
      const torus = new THREE.Mesh(
        new THREE.TorusBufferGeometry(0.3, 0.2, 64, 128),
        this.currentMaterial
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
      return { sphere, plane, torus }
    },
    tick() {
      this.stats.begin()
      // Update controls
      this.controls.update()

      // Render
      this.renderer.render(this.scene, this.camera)

      this.stats.end()
      // Call tick again on the next frame
      window.requestAnimationFrame(this.tick)
    }
  }
}
</script>
