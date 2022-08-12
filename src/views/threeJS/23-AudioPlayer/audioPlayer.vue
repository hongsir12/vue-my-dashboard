<template>
  <div ref="three-box" class="three-box">
    <canvas ref="canvas" class="webgl" />
    <div class="btn" @click="$refs.fileId.click()">
      选择音乐
      <input ref="fileId" type="file" class="file-input" @change="getAudio" />
    </div>
  </div>
</template>
<script>
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import stats from '../utils/stats'
import { listenResize, initLilGui } from '../utils/utils'
import { EffectComposer } from './lib/EffectComposer.js'
import { RenderPass } from './lib/RenderPass.js'
import { UnrealBloomPass } from './lib/UnrealBloomPass.js'
import { ShaderPass } from './lib/ShaderPass.js'
import { CopyShader } from './lib/CopyShader.js'
import { range } from './components/range'
import { Node } from './components/node'
import { TestLine } from './components/test'
import { randomRange } from './components/randomRange'
import { Triangle } from './components/Triangle'

let composer
let audio, analyser, analyser2 // 音频
let linesGroup
let outLine
let inLine
let barLine = []
let barNodes // 线
let barGroup // 柱子
let Triangles = []
let TriangleGroup
let testLineGroup
const testLineNodes = []
const testLine = []
export default {
  data() {
    return {
      sizes: { width: 0, height: 0 },
      renderer: null,
      camera: null,
      clock: new THREE.Clock(),
      debugObj: {
        R: 20,
        G: 90,
        B: 225,
        TrianglesBgColor: 0x03a9f4,
        TrianglesLineColor: 0x03a9f4,
        lineColor: 0x00ffff, // 音频线颜色
        outLineColor: 0xff0000, // 音频线外圈颜色
        inLineColor: 0x00ff00, // 音频线内圈颜色
        barColor: 0x00ffff, // 柱子颜色
        textColor: 0x00ffff,
        rotate: false,
        wireframe: false
      },
      N: 256,
      scale: 1
    }
  },
  mounted() {
    // const el = document.querySelector('.three-box')
    // el.appendChild(stats.dom)
    this.scene = new THREE.Scene()
    this.canvas = this.$refs.canvas
    this.sizes = this.initSize(this.sizes)
    this.gui = initLilGui()
    this.camera = this.initCamera(this.sizes)
    this.renderer = this.initRenderer(this.canvas, this.sizes)
    this.createText()
    this.initLight()
    this.init()
    this.controls = this.initControls(this.camera, this.canvas)
    this.setDebug(this.gui)
    listenResize(this.sizes, this.camera, this.renderer)
    this.tick()
  },
  methods: {
    init() {
      this.loadCubeTexture()

      this.audioLines(30, this.N)
      this.audioBars(35, this.N / 2) // 添加音频柱子

      TriangleGroup = new THREE.Group()
      setInterval(this.addTriangle.bind(this), 500)
      this.scene.add(TriangleGroup)

      // 加载音频 start
      const listener = new THREE.AudioListener() // 监听者
      audio = new THREE.Audio(listener)

      this.initBloomPass()
    },
    loadCubeTexture() {
      this.scene.background = new THREE.CubeTextureLoader().load([
        '/static/11-textures/Standard-Cube-Map/px.png',
        '/static/11-textures/Standard-Cube-Map/nx.png',
        '/static/11-textures/Standard-Cube-Map/py.png',
        '/static/11-textures/Standard-Cube-Map/ny.png',
        '/static/11-textures/Standard-Cube-Map/pz.png',
        '/static/11-textures/Standard-Cube-Map/nz.png'
      ])
    },
    createText() {
      const material = new THREE.LineBasicMaterial({
        color: this.debugObj.textColor
      })
      testLineGroup = new THREE.Group()
      this.createH(material)
      this.createO(material)
      this.createN(material)
      this.createG(material)
      this.createS(material)
      this.createI(material)
      this.createR(material)
      this.scene.add(testLineGroup)
    },
    createH(material) {
      const horizontalArr = [-30, -25]
      const numH = 50
      horizontalArr.forEach((x) => {
        for (let i = 0; i < numH; i++) {
          this.addHorizontalLine(x, (-25 + i) * 0.2, material)
        }
      })
      const numV = 25
      for (let i = 0; i < numV; i++) {
        this.addVerticalLine((-25 + i) * 0.15 - 25.5, 0, material)
      }
    },
    createO(material) {
      const horizontalArr = [-20, -15]
      const numH = 50
      horizontalArr.forEach((x) => {
        for (let i = 0; i < numH; i++) {
          this.addHorizontalLine(x, (-25 + i) * 0.2, material)
        }
      })
      const numV = 25
      for (let i = 0; i < numV; i++) {
        this.addVerticalLine((-25 + i) * 0.15 - 15.5, 4.3, material)
        this.addVerticalLine((-25 + i) * 0.15 - 15.5, -4.5, material)
      }
    },
    createN(material) {
      const horizontalArr = [-10, -5]
      const numH = 50
      horizontalArr.forEach((x) => {
        for (let i = 0; i < numH; i++) {
          this.addHorizontalLine(x, (-25 + i) * 0.2, material)
        }
      })
      const numV = 25
      for (let i = 0; i < numV; i++) {
        this.addVerticalLine((-25 + i) * 0.15 - 5.5, (12 - i) * 0.35, material)
      }
    },
    createG(material) {
      const horizontalArr = [0, 5]
      const numH = 50
      horizontalArr.forEach((x) => {
        if (x === 0) {
          for (let i = 0; i < numH; i++) {
            this.addHorizontalLine(x, (-25 + i) * 0.2, material)
          }
        }
        if (x === 5) {
          for (let i = 0; i < numH / 2; i++) {
            this.addHorizontalLine(x, (-25 + i) * 0.2, material)
          }
        }
      })
      const numV = [32, 20, 25]
      numV.forEach((num) => {
        if (num === 32) {
          for (let i = 0; i < num; i++) {
            this.addVerticalLine((-25 + i) * 0.15 + 4.5, 4.3, material)
          }
        }
        if (num === 20) {
          for (let i = 0; i < num; i++) {
            this.addVerticalLine((-25 + i) * 0.15 + 6.25, 0.5, material)
          }
        }
        if (num === 25) {
          for (let i = 0; i < num; i++) {
            this.addVerticalLine((-25 + i) * 0.15 + 4.5, -4.5, material)
          }
        }
      })
    },
    createS(material) {
      const horizontalArr = [10, 15]
      const numH = 50
      horizontalArr.forEach((x) => {
        if (x === 10) {
          for (let i = 0; i < numH / 2; i++) {
            this.addHorizontalLine(x, (-25 + i) * 0.2 + 5, material)
          }
        }
        if (x === 15) {
          for (let i = 0; i < numH / 2; i++) {
            this.addHorizontalLine(x, (-25 + i) * 0.2, material)
          }
        }
      })
      const numV = 35
      for (let i = 0; i < numV; i++) {
        this.addVerticalLine((-25 + i) * 0.15 + 14.2, 4.3, material)
        this.addVerticalLine((-25 + i) * 0.15 + 14.2, 0.5, material)
        this.addVerticalLine((-25 + i) * 0.15 + 13.2, -4.5, material)
      }
    },
    createI(material) {
      const horizontalArr = [20]
      const numH = 50
      horizontalArr.forEach((x) => {
        for (let i = 0; i < numH; i++) {
          this.addHorizontalLine(x, (-25 + i) * 0.2, material)
        }
      })
    },
    createR(material) {
      const horizontalArr = [25, 30]
      const numH = 50
      horizontalArr.forEach((x) => {
        if (x === 25) {
          for (let i = 0; i < numH; i++) {
            this.addHorizontalLine(x, (-25 + i) * 0.2, material)
          }
        }
        if (x === 30) {
          for (let i = 0; i < numH / 2; i++) {
            this.addHorizontalLine(x, (-25 + i) * 0.2 + 5, material)
          }
        }
      })
      const numV = [25, 35]
      numV.forEach((num) => {
        if (num === 25) {
          for (let i = 0; i < num; i++) {
            this.addVerticalLine((-25 + i) * 0.15 + 29.5, 4.3, material)
            this.addVerticalLine((-25 + i) * 0.15 + 29.5, 0.5, material)
          }
        }
        if (num === 35) {
          for (let i = 0; i < num; i++) {
            this.addVerticalLine(
              (-25 + i) * 0.15 + 29.5,
              (12 - i) * 0.138 - 2,
              material
            )
          }
        }
      })
    },
    // 添加水平线
    addHorizontalLine(x, y, material) {
      testLineNodes.push(new TestLine(0, x, y))
      const lineH = new THREE.Line(
        new THREE.BufferGeometry().setAttribute(
          'position',
          this.renderGeometries([
            testLineNodes[testLineNodes.length - 1].positionLeft(),
            testLineNodes[testLineNodes.length - 1].positionRight()
          ])
        ),
        material
      )
      lineH.name = 'horizontal'
      testLine.push(lineH)
      testLineGroup.add(lineH)
    },
    // 添加垂直线
    addVerticalLine(x, y, material) {
      testLineNodes.push(new TestLine(0, x, y))
      const lineV = new THREE.Line(
        new THREE.BufferGeometry().setAttribute(
          'position',
          this.renderGeometries([
            testLineNodes[testLineNodes.length - 1].positionTop(),
            testLineNodes[testLineNodes.length - 1].positionBottom()
          ])
        ),
        material
      )
      lineV.name = 'vertical'
      testLine.push(lineV)
      testLineGroup.add(lineV)
    },
    // 音频线圈--线圈半径，线段数
    audioLines(radius, countData) {
      // 生成step=1的相邻不间断的数量为countData个的线段节点
      barNodes = range(0, countData, 1).map((index) => {
        return new Node(
          radius,
          ((index / countData) * 360 + 45) % 360,
          new THREE.Vector2(0, 0)
        )
      })

      // 音频线圈竖线
      const lineMaterial = new THREE.LineBasicMaterial({
        color: this.debugObj.lineColor
      })
      // countData条竖线
      barLine = range(0, countData, 1).map((item, index) => {
        return new THREE.Line(
          new THREE.BufferGeometry().setAttribute(
            'position',
            this.renderGeometries([
              barNodes[index].positionA(),
              barNodes[index].positionB()
            ])
          ),
          lineMaterial
        )
      })

      // 音频线圈外圈
      const outLineMaterial = new THREE.LineBasicMaterial({
        color: this.debugObj.outLineColor
      })
      // 一条外圈线
      outLine = new THREE.Line(
        new THREE.BufferGeometry().setAttribute(
          'position',
          // 生成由节点的外凸点组成的几何体
          this.renderGeometries(barNodes.map((node) => node.positionA()))
        ),
        outLineMaterial
      )
      outLine.name = 'outLine'

      // 音频线圈内圈
      const inLineMaterial = new THREE.LineBasicMaterial({
        color: this.debugObj.inLineColor
      })
      // 一条内圈线
      inLine = new THREE.Line(
        new THREE.BufferGeometry().setAttribute(
          'position',
          // 生成由节点的内陷点组成的几何体
          this.renderGeometries(barNodes.map((node) => node.positionB()))
        ),
        inLineMaterial
      )
      inLine.name = 'inLine'
      linesGroup = new THREE.Group()
      linesGroup.add(outLine) // 添加外圈线
      linesGroup.add(inLine) // 添加内圈线
      barLine.forEach((line) => linesGroup.add(line)) // 添加竖状线
      this.scene.add(linesGroup)
    },
    // 音频外柱
    audioBars(radius, countData) {
      barGroup = new THREE.Group()
      const R = radius
      const N = countData
      for (let i = 0; i < N; i++) {
        const minGroup = new THREE.Group()
        const box = new THREE.BoxGeometry(1, 1, 1)
        const material = new THREE.MeshPhongMaterial({
          color: this.debugObj.barColor
        })
        const mesh = new THREE.Mesh(box, material)
        mesh.position.y = 0.5
        minGroup.add(mesh)
        minGroup.position.set(
          Math.sin(((i * Math.PI) / N) * 2) * R,
          Math.cos(((i * Math.PI) / N) * 2) * R,
          0
        )
        minGroup.rotation.z = ((-i * Math.PI) / N) * 2
        barGroup.add(minGroup)
      }
      this.scene.add(barGroup)
    },
    // 生成几何体
    renderGeometries(vertices) {
      const res = []
      vertices = vertices.concat(vertices[0])
      vertices.forEach((value) => res.push(value.x, value.y, 0))
      return new THREE.BufferAttribute(new Float32Array(res), 3)
    },
    addTriangle() {
      const material = new THREE.MeshBasicMaterial({
        color: this.debugObj.TrianglesBgColor
      })
      const lineMaterial = new THREE.LineBasicMaterial({
        color: this.debugObj.TrianglesLineColor
      })
      // const point = this.Triangles.length;
      const triangle = this.makeTriangle(material, lineMaterial, (t) => {
        Triangles = Triangles.filter((triangle) => {
          return triangle !== t
        })
        TriangleGroup.remove(t.group)
      })
      TriangleGroup.add(triangle.group)

      Triangles.push(triangle)
    },
    // 创建三角形
    makeTriangle(material, lineMaterial, t) {
      const triangle = new Triangle(
        2,
        new THREE.Vector3(0, 0, 0),
        Math.random() * 360,
        randomRange(5, 1),
        randomRange(0.1, 0.05),
        material,
        lineMaterial,
        {
          startShow: 15,
          endShow: 30,
          startHide: 60,
          endHide: 70
        },
        t
      )
      return triangle
    },
    // 音频加载播放
    audioLoad(url) {
      // 初始化音频加载器
      const audioLoader = new THREE.AudioLoader()
      // 加载资源
      audioLoader.load(
        // 资源url
        url,
        // onLoad回调
        (AudioBuffer) => {
          if (audio.isPlaying) {
            audio.stop()
            audio.setBuffer()
          }
          audio.setBuffer(AudioBuffer) // 音频缓冲区对象关联到音频对象audio
          audio.setLoop(true) // 是否循环
          audio.setVolume(1)
          audio.play() // 播放
          // 音频分析器和音频绑定，可以实时采集音频时域数据进行快速傅里叶变换
          // 第二个参数fftSize：2的幂次方最高为2048, 用来表示确定频域的FFT (傅立叶变换)大小
          analyser = new THREE.AudioAnalyser(audio, this.N * 2)
          analyser2 = new THREE.AudioAnalyser(audio, 4096)
        }
      )
    },
    // 选择音乐文件
    getAudio() {
      const objFile = this.$refs.fileId
      if (objFile.value === '') {
        return
      }
      if (window.FileReader) {
        const reader = new FileReader()
        reader.readAsDataURL(objFile.files[0]) // result属性中将包含一个data: URL 格式的 Base64 字符串以表示所读取文件的内容
        // 读取操作结束时（要么成功，要么失败）触发
        reader.onloadend = (e) => {
          this.audioLoad(e.target.result)
        }
      }
    },
    updateCircle() {
      if (barNodes) {
        linesGroup.scale.set(this.scale, this.scale, this.scale)
        // 外线圈几何体位置
        const geometryA = outLine.geometry
        const AttributeA = geometryA.getAttribute('position')
        // 内线圈几何体位置
        const geometryB = inLine.geometry
        const AttributeB = geometryB.getAttribute('position')
        // 获取每个节点的内外顶点数组集合
        const positions = barNodes.map((value) => {
          return [value.positionA(), value.positionB()]
        })
        // 遍历更新每个节点位置
        positions.forEach((position, index) => {
          AttributeA.set([position[0].x, position[0].y], index * 3)
          AttributeB.set([position[1].x, position[1].y], index * 3)
          const geometry = barLine[index].geometry
          const Attribute = geometry.getAttribute('position')
          Attribute.set(
            [position[0].x, position[0].y, 0, position[1].x, position[1].y, 0],
            0
          )
          Attribute.needsUpdate = true
        })
        AttributeA.set(
          [AttributeA.array[0], AttributeA.array[1]],
          positions.length * 3
        )
        AttributeB.set(
          [AttributeB.array[0], AttributeB.array[1]],
          positions.length * 3
        )
        AttributeA.needsUpdate = true
        AttributeB.needsUpdate = true
      }

      const testLinePositions = testLineNodes.map((value) => {
        return [
          value.positionLeft(),
          value.positionRight(),
          value.positionTop(),
          value.positionBottom()
        ]
      })
      testLinePositions.forEach((position, index) => {
        if (testLine[index].name === 'horizontal') {
          const testLineGeometry = testLine[index].geometry
          const lineAttributes = testLineGeometry.getAttribute('position')
          lineAttributes.set(
            [position[0].x, position[0].y, 0, position[1].x, position[1].y, 0],
            0
          )
          lineAttributes.needsUpdate = true
        } else {
          const testLineGeometry = testLine[index].geometry
          const lineAttributes = testLineGeometry.getAttribute('position')
          lineAttributes.set(
            [position[2].x, position[2].y, 0, position[3].x, position[3].y, 0],
            0
          )
          lineAttributes.needsUpdate = true
        }
      })
    },
    // 添加后期处理效果——辉光
    initBloomPass() {
      // 辉光
      const params = {
        exposure: 0.5,
        bloomStrength: 1,
        bloomThreshold: 0,
        bloomRadius: 0.8
      }
      const renderScene = new RenderPass(this.scene, this.camera)
      const bloomPass = new UnrealBloomPass(
        new THREE.Vector2(
          this.$refs['three-box'].offsetWidth,
          this.$refs['three-box'].offsetHeight
        ),
        1.5,
        0.2,
        0
      )
      bloomPass.threshold = params.bloomThreshold
      bloomPass.strength = params.bloomStrength
      bloomPass.radius = params.bloomRadius
      composer = new EffectComposer(this.renderer)
      const copyShader = new ShaderPass(CopyShader)
      copyShader.renderToScreen = true
      composer.addPass(renderScene)
      composer.addPass(bloomPass)
      composer.addPass(copyShader)
    },
    setDebug(gui) {
      gui
        .addColor(this.debugObj, 'outLineColor')
        .name('音频线外圈颜色')
        .onChange(() => {
          linesGroup.traverse((child) => {
            if (child.name === 'outLine') {
              child.material.color.set(this.debugObj.outLineColor)
            }
          })
        })
      gui
        .addColor(this.debugObj, 'inLineColor')
        .name('音频线内圈颜色')
        .onChange(() => {
          linesGroup.traverse((child) => {
            if (child.name === 'inLine') {
              child.material.color.set(this.debugObj.inLineColor)
            }
          })
        })
      gui
        .addColor(this.debugObj, 'lineColor')
        .name('音频竖线颜色')
        .onChange(() => {
          linesGroup.traverse((child) => {
            if (!child.name && child.material) {
              child.material.color.set(this.debugObj.lineColor)
            }
          })
        })
      gui
        .addColor(this.debugObj, 'textColor')
        .name('文字颜色')
        .onChange(() => {
          testLineGroup.traverse((child) => {
            if (child.isLine) {
              child.material.color.set(this.debugObj.textColor)
            }
          })
        })
      gui.add(this.debugObj, 'R', 0, 255).name('光柱R通道')
      gui.add(this.debugObj, 'G', 0, 255).name('光柱G通道')
      gui.add(this.debugObj, 'B', 0, 255).name('光柱B通道')

      gui
        .add(this.debugObj, 'wireframe')
        .name('线框')
        .onChange((value) => {
          linesGroup.traverse((child) => {
            if (child.isLine) {
              child.material.wireframe = value
            }
          })
          barGroup.traverse((child) => {
            if (child.type === 'Mesh') {
              child.material.wireframe = value
            }
          })
        })
    },
    initSize(sizes) {
      sizes.width = this.$refs['three-box'].offsetWidth
      sizes.height = this.$refs['three-box'].offsetHeight
      return sizes
    },
    // 环境光和平行光
    initLight() {
      this.scene.add(new THREE.AmbientLight(0x444444))
      const light = new THREE.PointLight(0xffffff)
      light.position.set(80, 100, 50)
      // 告诉平行光需要开启阴影投射
      light.castShadow = true
      this.scene.add(light)
    },
    initRenderer(canvas, sizes) {
      const renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true
      })
      renderer.setSize(sizes.width, sizes.height)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      return renderer
    },
    initControls(camera, canvas) {
      const controls = new OrbitControls(camera, canvas)
      controls.enableDamping = true // 开启阻尼
      // controls.autoRotate = true // 开启自动旋转
      // controls.autoRotateSpeed = 0.4 // 自动旋转速度
      return controls
    },
    initCamera(sizes) {
      const camera = new THREE.PerspectiveCamera(
        75,
        sizes.width / sizes.height,
        1,
        10000
      )
      camera.position.setZ(80)
      return camera
    },
    tick() {
      stats.begin()
      // const elapsedTime = this.clock.getElapsedTime()

      this.controls.update()
      if (analyser) {
        // 获得频率数据N个
        const arr = analyser.getFrequencyData()
        const arr2 = analyser2.getFrequencyData()

        // 处理光柱
        if (barGroup) {
          barGroup.rotation.z += 0.002
          barGroup.scale.set(this.scale, this.scale, this.scale)
          barGroup.children.forEach((elem, index) => {
            if (this.debugObj.R) {
              elem.children[0].material.color.r =
                arr[index] / (this.debugObj.R * 3)
            }
            if (this.debugObj.G) {
              elem.children[0].material.color.g =
                arr[index] / (this.debugObj.G * 3)
            }
            if (this.debugObj.B) {
              elem.children[0].material.color.b =
                arr[index] / (this.debugObj.B * 3)
            }
            if (arr[index] === 0) {
              elem.scale.set(0, 0, 0)
            } else {
              let m = arr[index] / 20
              const targetRange = Math.max(
                arr[index] / 20 - arr[index - 1] / 20,
                0
              )
              if (m < targetRange) {
                m = targetRange
              }
              // 对光柱高度进行缩放
              elem.scale.set(1, m, 1)
            }
          })
        }
        const Delta = this.clock.getDelta()
        // 修改每个节点强度范围值
        barNodes.forEach((node, index, array) => {
          node.strength(arr[index % array.length] * 0.1)
          node.transition(Delta)
        })
        testLineNodes.forEach((node, index, array) => {
          node.strength(arr2[index % array.length] * 0.05)
          node.transition(Delta)
        })

        // 调整线圈缩放程度
        this.scale = 1 + arr[Math.ceil(arr.length * 0.05)] / 500
        // 更新线圈
        this.updateCircle(arr)

        Triangles.forEach((triangle) => triangle.transition(Delta))
      }
      // this.renderer.render(this.scene, this.camera)
      composer.render()

      stats.end()

      requestAnimationFrame(this.tick)
    }
  }
}
</script>
<style lang="scss" scoped>
.btn,
.btn::after {
  position: absolute;
  bottom: 20px;
  left: 20px;
  width: 100px;
  height: 30px;
  text-align: center;
  font-size: 12px;
  line-height: 30px;
  color: rgb(255, 251, 251);
  background: linear-gradient(
    30deg,
    transparent 10%,
    rgb(255, 136, 0) 10% 95%,
    rgb(0, 255, 149) 95%
  );
  box-shadow: 5px 0 0 rgb(0, 204, 255);
  cursor: pointer;
}
.file-input {
  display: none;
}

.btn::after {
  content: '选择音乐';
  position: absolute;
  top: 0;
  left: 0;
  text-shadow: -5px -2px 0 rgb(0, 183, 255), 5px 2px 0 rgb(0, 255, 115);
  visibility: hidden;
}
.btn:hover::after {
  animation: san 1s;
  animation-timing-function: steps(1, end);
}
@keyframes san {
  0% {
    clip-path: inset(20% -5px 60% 0);
    transform: translate(-6px, 5px);
    visibility: visible;
  }
  10% {
    clip-path: inset(50% -5px 30% 0);
    transform: translate(6px, -5px);
  }
  20% {
    clip-path: inset(20% -5px 60% 0);
    transform: translate(5px, 0px);
  }
  30% {
    clip-path: inset(80% -5px 5% 0);
    transform: translate(-8px, 5px);
  }
  40% {
    clip-path: inset(0 -5px 80% 0);
    transform: translate(-4px, -3px);
  }
  50% {
    clip-path: inset(50% -5px 30% 0);
    transform: translate(-6px, -5px);
  }
  60% {
    clip-path: inset(80% -5px 5% 0);
    transform: translate(-7px, 5px);
  }
  70% {
    clip-path: inset(0 -5px 80% 0);
    transform: translate(3px, 6px);
  }
  80% {
    clip-path: inset(50% -5px 30% 0);
    transform: translate(5px, 5px);
  }
  90% {
    clip-path: inset(20% -5px 60% 0);
    transform: translate(6px, -5px);
  }
  100% {
    clip-path: inset(0 -5px 80% 0);
    transform: translate(1px, 5px);
  }
}
</style>
