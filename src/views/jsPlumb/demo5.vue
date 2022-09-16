<!-- Use preprocessors via the lang attribute! e.g. <template lang="pug"> -->
<template>
  <div id="app">
    <div class="main">
      <ul class="main-left">
        <li
          v-for="item in menuList"
          :key="item.id"
          :draggable="true"
          @dragend="handleDragend($event, item)"
        >
          {{ item.label }}
        </li>
      </ul>
      <div
        id="efContainer"
        ref="efContainerRef"
        class="main-right"
        @dragover.prevent
      >
        <div
          v-for="(item, index) in nodeList"
          :id="item.nodeId"
          :key="item.nodeId"
          :ref="(el) => (nodeRef[index] = el)"
          class="node-info flow-node-drag"
          :style="item.nodeContainerStyle"
          @mouseup="handleMouseup($event, item)"
        >
          <div class="node-info-label">
            {{ item.label }}
          </div>
          <span class="node-drag" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
const deff = {
  jsplumbSetting: {
    // 动态锚点、位置自适应
    Anchors: ['Right', 'Left'],
    anchor: ['Right', 'Left'],
    // 容器ID
    Container: 'efContainer',
    // 连线的样式，直线或者曲线等，可选值:  StateMachine、Flowchart，Bezier、Straight
    // Connector: ['Bezier', {curviness: 100}],
    // Connector: ['Straight', { stub: 20, gap: 1 }],
    Connector: [
      'Flowchart',
      {
        stub: 30,
        gap: 1,
        alwaysRespectStubs: false,
        midpoint: 0.5,
        cornerRadius: 10
      }
    ],
    // Connector: ['StateMachine', {margin: 5, curviness: 10, proximityLimit: 80}],
    // 鼠标不能拖动删除线
    ConnectionsDetachable: false,
    // 删除线的时候节点不删除
    DeleteEndpointsOnDetach: false,
    /**
     * 连线的两端端点类型：圆形
     * radius: 圆的半径，越大圆越大
     */
    // Endpoint: ['Dot', { radius: 5, cssClass: 'ef-dot', hoverClass: 'ef-dot-hover' }],
    /**
     * 连线的两端端点类型：矩形
     * height: 矩形的高
     * width: 矩形的宽
     */
    // Endpoint: ['Rectangle', {height: 20, width: 20, cssClass: 'ef-rectangle', hoverClass: 'ef-rectangle-hover'}],
    /**
     * 图像端点
     */
    // Endpoint: ['Image', {src: 'https://www.easyicon.net/api/resizeApi.php?id=1181776&size=32', cssClass: 'ef-img', hoverClass: 'ef-img-hover'}],
    /**
     * 空白端点
     */
    Endpoint: ['Blank', { Overlays: '' }],
    // Endpoints: [['Dot', {radius: 5, cssClass: 'ef-dot', hoverClass: 'ef-dot-hover'}], ['Rectangle', {height: 20, width: 20, cssClass: 'ef-rectangle', hoverClass: 'ef-rectangle-hover'}]],
    /**
     * 连线的两端端点样式
     * fill: 颜色值，如：#12aabb，为空不显示
     * outlineWidth: 外边线宽度
     */
    EndpointStyle: { fill: '#1879ffa1', outlineWidth: 1 },
    // 是否打开jsPlumb的内部日志记录
    LogEnabled: true,
    /**
     * 连线的样式
     */
    PaintStyle: {
      // 线的颜色
      stroke: '#E0E3E7',
      // 线的粗细，值越大线越粗
      strokeWidth: 1,
      // 设置外边线的颜色，默认设置透明，这样别人就看不见了，点击线的时候可以不用精确点击，参考 https://blog.csdn.net/roymno2/article/details/72717101
      outlineStroke: 'transparent',
      // 线外边的宽，值越大，线的点击范围越大
      outlineWidth: 10
    },
    DragOptions: { cursor: 'pointer', zIndex: 2000 },
    ConnectionOverlays: [
      [
        'Custom',
        {
          create() {
            const el = document.createElement('div')
            // el.innerHTML = '<select id=\'myDropDown\'><option value=\'foo\'>foo</option><option value=\'bar\'>bar</option></select>'
            return el
          },
          location: 0.7,
          id: 'customOverlay'
        }
      ]
    ],
    /**
     *  叠加 参考： https://www.jianshu.com/p/d9e9918fd928
     */
    Overlays: [
      // 箭头叠加
      [
        'Arrow',
        {
          width: 10, // 箭头尾部的宽度
          length: 8, // 从箭头的尾部到头部的距离
          location: 1, // 位置，建议使用0～1之间
          direction: 1, // 方向，默认值为1（表示向前），可选-1（表示向后）
          foldback: 0.623 // 折回，也就是尾翼的角度，默认0.623，当为1时，为正三角
        }
      ],
      // ['Diamond', {        //     events: {        //         dblclick: function (diamondOverlay, originalEvent) {        //             console.log('double click on diamond overlay for : ' + diamondOverlay.component)        //         }        //     }        // }],
      ['Label', { label: '', location: 0.1, cssClass: 'aLabel' }]
    ],
    // 绘制图的模式 svg、canvas
    RenderMode: 'canvas',
    // 鼠标滑过线的样式
    HoverPaintStyle: { stroke: '#b0b2b5', strokeWidth: 1 },
    // 滑过锚点效果
    // EndpointHoverStyle: {fill: 'red'}
    Scope: 'jsPlumb_DefaultScope' // 范围，具有相同scope的点才可连接
  },
  /**
   * 连线参数
   */
  jsplumbConnectOptions: {
    isSource: true,
    isTarget: true,
    // 动态锚点、提供了4个方向 Continuous、AutoDefault
    // anchor: 'Continuous',
    // anchor: ['Continuous', { faces: ['left', 'right'] }],
    // 设置连线上面的label样式
    labelStyle: {
      cssClass: 'flowLabel'
    }
    // overlays: [
    //   ['Custom', {
    //     create(component) {
    //       const el = document.createElement('div')
    //       el.innerHTML = '<select id=\'myDropDown\'><option value=\'foo\'>foo</option><option value=\'bar\'>bar</option></select>'
    //       return el
    //     },
    //     location: 0.7,
    //     id: 'customOverlay',
    //   }],
    // ],
  },
  /**
   * 源点配置参数
   */
  jsplumbSourceOptions: {
    // 设置可以拖拽的类名，只要鼠标移动到该类名上的DOM，就可以拖拽连线
    filter: '.node-drag',
    filterExclude: false,
    anchor: ['Continuous', { faces: ['right'] }],
    // 是否允许自己连接自己
    allowLoopback: false,
    maxConnections: -1
  },
  // 参考 https://www.cnblogs.com/mq0036/p/7942139.html
  jsplumbSourceOptions2: {
    // 设置可以拖拽的类名，只要鼠标移动到该类名上的DOM，就可以拖拽连线
    filter: '.node-drag',
    filterExclude: false,
    // anchor: 'Continuous',
    // 是否允许自己连接自己
    allowLoopback: true,
    connector: ['Flowchart', { curviness: 50 }],
    connectorStyle: {
      // 线的颜色
      stroke: 'red',
      // 线的粗细，值越大线越粗
      strokeWidth: 1,
      // 设置外边线的颜色，默认设置透明，这样别人就看不见了，点击线的时候可以不用精确点击，参考 https://blog.csdn.net/roymno2/article/details/72717101
      outlineStroke: 'transparent',
      // 线外边的宽，值越大，线的点击范围越大
      outlineWidth: 10
    },
    connectorHoverStyle: { stroke: 'red', strokeWidth: 2 }
  },
  jsplumbTargetOptions: {
    // 设置可以拖拽的类名，只要鼠标移动到该类名上的DOM，就可以拖拽连线
    filter: '.node-drag',
    filterExclude: false,
    // 是否允许自己连接自己
    anchor: ['Continuous', { faces: ['left'] }],
    allowLoopback: false,
    dropOptions: { hoverClass: 'ef-drop-hover' }
  }
}
import { jsPlumb } from 'jsplumb'
export default {
  data() {
    return {
      menuList: [
        { label: 'abc', id: '1' },
        { label: 'bcd', id: '2' },
        { label: 'cde', id: '3' },
        { label: 'def', id: '4' }
      ],
      nodeList: [],
      nodeRef: [],
      plumbIns: null
    }
  },
  mounted() {
    this.plumbIns = jsPlumb.getInstance()
    this.jsPlumbInit()
  },
  methods: {
    jsPlumbInit() {
      this.plumbIns.importDefaults(deff.jsplumbSetting)
    },
    handleDragend(ev, node) {
      // 拖拽进来相对于地址栏偏移量
      console.log(ev)
      const evClientX = ev.offsetX
      const evClientY = ev.clientY
      const efContainer = this.$refs.efContainerRef
      // const containerRect = efContainer.getBoundingClientRect()
      let left = evClientX - efContainer.offsetLeft
      let top = evClientY - efContainer.offsetTop
      // 居中
      left -= 51
      top -= 19
      const nodeId = `${node.id}_${Date.now()}`
      const nodeInfo = {
        label: node.label,
        id: nodeId,
        nodeId,
        nodeContainerStyle: {
          left: left + 'px',
          top: top + 'px'
        }
      }
      this.nodeList.push(nodeInfo)
      this.$nextTick(() => {
        this.plumbIns.makeSource(nodeId, deff.jsplumbSourceOptions)
        this.plumbIns.makeTarget(nodeId, deff.jsplumbTargetOptions)
        this.plumbIns.draggable(nodeId)
      })
    },
    // 在图中拖拽节点时设置新位置
    handleMouseup(ev, data) {
      this.nodeRef.forEach((node) => {
        if (node.id === data.nodeId) {
          data.nodeContainerStyle.left = node.style.left
          data.nodeContainerStyle.top = node.style.top
        }
      })
    }
  }
}
</script>

<!-- Use preprocessors via the lang attribute! e.g. <style lang="scss"> -->
<style>
body {
  margin: 0;
}
.item {
  width: 150px;
  height: 50px;
}
#source {
  border: 2px solid red;
}
#target {
  border: 2px solid blue;
}
.main {
  display: flex;
}
ul {
  list-style: none;
  padding-left: 0;
  width: 120px;
  background: #eee;
  text-align: center;
}
ul > li {
  height: 40px;
  line-height: 40px;
}
.main-right {
  border: 1px solid #ccc;
  flex: 1;
  margin-left: 15px;
  position: relative;
  background: #f4f4f4;
}
.node-info {
  position: absolute;
}
.node-info-label {
  width: 100px;
  height: 36px;
  line-height: 36px;
  text-align: center;
  border: 1px solid #e5e7eb;
  background: #fff;
  border-radius: 4px;
}
.node-info-label:hover {
  cursor: pointer;
  background: #f4eded;
}
.node-info-label:hover + .node-drag {
  /* background: red; */
  display: inline-block;
}
.node-drag {
  display: block;
  width: 6px;
  height: 6px;
  border-radius: 6px;
  border: 1px solid #ccc;
  position: absolute;
  right: -7px;
  top: 14px;
}
/* .node-drag:hover {
  display: inline-block;
} */
</style>
