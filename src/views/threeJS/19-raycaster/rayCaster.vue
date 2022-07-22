<template>
  <div ref="three-box" class="three-box">
    <canvas
      ref="canvas"
      class="webgl"
      width="100%"
      @click="mouseClickObject(currentIntersect)"
    />
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
      objects: null, // 对象集合
      raycaster: null, // 光线投射实例
      currentIntersect: null, // 当前被光线射中对象
      mouse: null, // 鼠标对象
      modelFn: null,
      sizes: {
        width: 0,
        height: 0
      },
      debugObj: {
        model: 1
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
    this.objects = this.createObject()
    this.raycaster = new THREE.Raycaster()
    this.createMouse()
    this.modelFn = () => {
      return this.intersectRayWithObjects(this.raycaster, this.objects)
    }
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
    createObject() {
      const object1 = new THREE.Mesh(
        new THREE.SphereBufferGeometry(0.5, 16, 16),
        new THREE.MeshBasicMaterial({ color: '#ff0000' })
      )
      object1.position.x = -2
      object1.name = '球1'

      const object2 = new THREE.Mesh(
        new THREE.SphereBufferGeometry(0.5, 16, 16),
        new THREE.MeshBasicMaterial({ color: '#ff0000' })
      )
      object2.name = '球2'

      const object3 = new THREE.Mesh(
        new THREE.SphereBufferGeometry(0.5, 16, 16),
        new THREE.MeshBasicMaterial({ color: '#ff0000' })
      )
      object3.position.x = 2
      object3.name = '球3'

      this.scene.add(object1, object2, object3)
      return { object1, object2, object3 }
    },
    createMouse() {
      this.mouse = new THREE.Vector2()
      this.canvas.addEventListener('mousemove', (e) => {
        this.mouse.x = (e.offsetX / this.sizes.width) * 2 - 1
        this.mouse.y = -(e.offsetY / this.sizes.height) * 2 + 1
      })
    },
    // 测试射线与物体相交
    intersectRayWithObjects(raycaster, { object1, object2, object3 }) {
      // 设置射线原点
      const rayOrigin = new THREE.Vector3(-3, 0, 0)
      // 射线方向
      const rayDirection = new THREE.Vector3(1, 0, 0)
      // 必须将射线方向三维向量转化为单位向量
      // 也就是说将该向量的方向设置为原向量相同，但是其长度length为1
      rayDirection.normalize()
      raycaster.set(rayOrigin, rayDirection)

      const arrowHelper = new THREE.ArrowHelper(
        raycaster.ray.direction,
        raycaster.ray.origin,
        7,
        0xff0000,
        1,
        0.5
      )
      this.scene.add(arrowHelper)

      // 物体对象数组
      const objectsToTest = [object1, object2, object3]
      // 被射线照射到的一组数组
      const intersects = raycaster.intersectObjects(objectsToTest)
      // 物体平时为红色
      for (const object of objectsToTest) {
        object.material.color.set('#ff0000')
      }
      // 被射线照射到的物体变为蓝色
      for (const intersect of intersects) {
        intersect.object.material.color.set('#0000ff')
      }
    },
    // 通过鼠标使用光线投射
    intersectRayByMouse(
      raycaster,
      mouse,
      camera,
      { object1, object2, object3 },
      turnOnEnterLeave = false
    ) {
      raycaster.setFromCamera(mouse, camera)
      // 物体对象数组
      const objectsToTest = [object1, object2, object3]
      // 被射线照射到的一组数组
      const intersects = raycaster.intersectObjects(objectsToTest)
      // 物体平时为红色
      for (const object of objectsToTest) {
        object.material.color.set('#ff0000')
      }
      // 被射线照射到的物体变为蓝色
      for (const intersect of intersects) {
        intersect.object.material.color.set('#0000ff')
      }
      if (turnOnEnterLeave) {
        this.judgeMouseEnterLeave(intersects, this.currentIntersect)
      }
    },
    // 鼠标移入移出
    judgeMouseEnterLeave(intersects, currentIntersect) {
      if (intersects.length) {
        if (this.currentIntersect == null) {
          console.log('鼠标移入' + intersects[0].object.name)
        }
        this.currentIntersect = intersects[0]
      } else {
        if (currentIntersect) {
          console.log('鼠标移出')
        }
        this.currentIntersect = null
      }
    },
    // 鼠标点击事件
    mouseClickObject(currentIntersect) {
      /* eslint-disable */
      if (currentIntersect) {
        switch (currentIntersect.object.name) {
          case '球1':
            console.log('点击了球1')
            break
          case '球2':
            console.log('点击了球2')
            break
          case '球3':
            console.log('点击了球3')
            break
        }
      }
    },
    setDebug(gui) {
      gui
        .add(this.debugObj, 'model', {
          测试射线与物体相交: 1,
          通过鼠标使用射线投射: 2,
          鼠标事件: 3
        })
        .name('模式')
        .onChange(() => {
          this.modelFn = () => {
            if (this.debugObj.model === '1') {
              return this.intersectRayWithObjects(this.raycaster, this.objects)
            }
            if (this.debugObj.model === '2') {
              return this.intersectRayByMouse(
                this.raycaster,
                this.mouse,
                this.camera,
                this.objects
              )
            }
            if (this.debugObj.model === '3') {
              return this.intersectRayByMouse(
                this.raycaster,
                this.mouse,
                this.camera,
                this.objects,
                true
              )
            }
          }
        })
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
      camera.position.z = 3
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
      return renderer
    },
    tick() {
      stats.begin()
      const elapsedTime = this.clock.getElapsedTime()

      // 物体动画:上下移动
      const { object1, object2, object3 } = this.objects
      object1.position.y = Math.sin(elapsedTime * 0.3) * 1.5
      object2.position.y = Math.sin(elapsedTime * 0.8) * 1.5
      object3.position.y = Math.sin(elapsedTime * 1.4) * 1.5

      const modelFn = this.modelFn
      modelFn()

      this.controls.update()

      this.renderer.render(this.scene, this.camera)

      stats.end()

      requestAnimationFrame(this.tick)
    }
  }
}
</script>
