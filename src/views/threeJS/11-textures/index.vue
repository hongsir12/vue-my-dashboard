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
      sizes: {
        width: 0,
        height: 0
      },
      texturesMap: {}
    }
  },
  beforeMount() {},
  mounted() {
    this.sizes.width = this.$refs['three-box'].offsetWidth
    this.sizes.height = this.$refs['three-box'].offsetHeight
    this.scene = new THREE.Scene()
    this.canvas = this.$refs.canvas
    this.initGui()
    this.loadTexture()
    this.createObject(this.texturesMap.colorTexture)
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
      // 原理
      // const image = new Image()
      // const texture = new THREE.Texture(image)
      // image.onload = () => {
      //     // 如果在材质已使用纹理后更改了编码类型，则需要将material.needsUpdate设置为true以重新编译材质
      //     texture.needsUpdate = true
      //     // 记得将材质改为map:texture
      //     // const material = new THREE.MeshBasicMaterial({ map:texture })
      // }
      // image.src = '/textures/door/color.jpg'
      // -----------------------------
      const loadingManager = new THREE.LoadingManager()
      // loadingManager.onStart = () => {
      //   console.log('Started loading file')
      // }
      // loadingManager.onProgress = () => {
      //   console.log('onProgress')
      // }
      // loadingManager.onLoad = () => {
      //   console.log('Loading complete!')
      // }
      // loadingManager.onError = () => {
      //   console.log('onError')
      // }
      // 实例化纹理加载器,使用加载管理器loadingManager来跟踪 TextureLoader 的加载进度流程
      const textureLoader = new THREE.TextureLoader(loadingManager)
      const colorTexture = textureLoader.load(
        require('@/assets/11-textures/door/color.jpg')
        // () => {
        //   // 加载完成时将调用
        //   console.log('load')
        // },
        // () => {
        //   // 加载过程中进行调用(一般不会用到)
        //   console.log('progress')
        // },
        // () => {
        //   // 加载出错时调用
        //   console.log('error')
        // }
      )
      const checkerboard1024Texture = textureLoader.load(
        require('@/assets/11-textures/checkerboard-1024x1024.png')
      )
      const checkerboard8Texture = textureLoader.load(
        require('@/assets/11-textures/checkerboard-8x8.png')
        // () => {
        //   // 加载完成时将调用
        //   console.log('load')
        // },
        // () => {
        //   // 加载过程中进行调用(一般不会用到)
        //   console.log('progress')
        // },
        // () => {
        //   // 加载出错时调用
        //   console.log('error')
        // }
      )
      const minecraftTexture = textureLoader.load(
        require('@/assets/11-textures/minecraft.png')
      )

      // 纹理在表面上重复多少次
      // repeat属性只是一个Vector2二维向量
      // colorTexture.repeat.x = 2
      // colorTexture.repeat.y = 3
      // 如果每个方向上的repeat属性都设置大于1
      // 则相应的wrap参数也应设置包裹模式为THREE.RepeatWrapping或THREE.MirroredRepeatWrapping以实现所需的平铺影响
      // colorTexture.wrapS = THREE.RepeatWrapping
      // colorTexture.wrapT = THREE.RepeatWrapping

      // 纹理的偏移量(一样是Vector2二维向量)
      // colorTexture.offset.x = 0.5
      // colorTexture.offset.y = 0.5

      // 纹理旋转角度
      // colorTexture.rotation = Math.PI / 4  //纹理贴图旋转45度
      // 旋转后会发现贴图是绕着原点旋转的，若要设置为绕贴图中心旋转则需如下设置
      // colorTexture.center.x = 0.5
      // colorTexture.center.y = 0.5

      // NearestFilter返回与指定纹理坐标最接近的纹理元素的值
      // 如果不在乎远处物品效果如失真之类的，使用NearestFilter时可以停用mipmapping以获得更好性能
      // colorTexture.generateMipmaps = false
      // 缩小滤镜
      colorTexture.minFilter = THREE.NearestFilter
      checkerboard1024Texture.minFilter = THREE.NearestFilter
      // 放大滤镜
      checkerboard8Texture.magFilter = THREE.NearestFilter
      minecraftTexture.magFilter = THREE.NearestFilter

      this.texturesMap = {
        colorTexture,
        checkerboard1024Texture,
        checkerboard8Texture,
        minecraftTexture
      }
    },
    createObject(texture) {
      const params = {
        map: 'colorTexture'
      }
      const geometry = new THREE.BoxBufferGeometry(1, 1, 1)
      const material = new THREE.MeshBasicMaterial({
        map: texture
      })
      const mesh = new THREE.Mesh(geometry, material)
      this.scene.add(mesh)
      this.gui
        .add(params, 'map', {
          colorTexture: 'colorTexture',
          checkerboard1024Texture: 'checkerboard1024Texture',
          checkerboard8Texture: 'checkerboard8Texture',
          minecraftTexture: 'minecraftTexture'
        })
        .name('纹理贴图')
        .onFinishChange(() => {
          material.map = this.texturesMap[params.map]
        })
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
      this.camera.position.z = 1
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
