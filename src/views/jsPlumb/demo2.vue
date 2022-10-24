<template>
  <div class="demo2">
    <div id="container2">
      <div id="item_left" class="item">a1</div>
      <div id="item_bottom" class="item" style="top: 200px">a2</div>
      <div id="item_right" class="item" style="left: 500px">a3</div>
    </div>
  </div>
</template>

<script>
import { jsPlumb } from 'jsplumb'

export default {
  name: 'VueAdminTemplateDemo2',

  data() {
    return {
      instance: ''
    }
  },

  mounted() {
    this.instance = this.init()
    jsPlumb.ready(() => {
      const common = {
        endpoint: 'Rectangle',
        connector: ['Bezier'],
        anchor: ['Left', 'Right'],
        paintStyle: {
          stroke: 'lightgray',
          strokeWidth: 3, // 线外边的宽，值越大，线的点击范围越大
          outlineWidth: 10
        }, // 线条样式
        // 端点样式
        endpointStyle: {
          fill: 'lightgray',
          outlineStroke: 'darkgray',
          outlineWidth: 2
        },
        overlays: [
          ['Arrow', { width: 12, length: 12, location: 0.5 }],
          [
            'Label',
            { label: '标签', location: 0.5, cssClass: 'endpointTargetLabel' }
          ]
        ]
      }
      this.instance.connect(
        {
          source: 'item_left',
          target: 'item_right'
        },
        common
      )
      this.instance.connect(
        {
          source: 'item_bottom',
          target: 'item_right'
        },
        common
      )
      // this.instance.draggable('item_left')
      // this.instance.draggable('item_bottom')
      this.instance.draggable('item_right')
      this.instance.bind('dblclick', (conn, originEvent) => {
        console.log(conn)
        console.log(conn.getLabelOverlay())
        console.log(conn.source.outerText, conn.target.outerText)
      })
    })
  },
  beforeDestroy() {
    this.instance.deleteEveryConnection()
  },
  methods: {
    init() {
      return jsPlumb.getInstance({})
    }
  }
}
</script>
<style lang="scss">
.demo2 {
  #container2 {
    position: relative;
    padding: 20px;
    width: 80%;
    height: 400px;
    border: 1px solid gray;
  }
  .item {
    position: absolute;
    width: 100px;
    height: 100px;
    top: 100px;
    border: 1px solid #ccc;
  }
}
</style>
