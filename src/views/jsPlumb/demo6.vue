<template>
  <div class="demo6">
    <el-row>
      <el-col :span="24">
        <div class="ef-tooltar">
          <el-link type="primary" :underline="false">1234</el-link>
          <el-divider direction="vertical" />
          <el-button type="text" icon="el-icon-delete" size="large" />
        </div>
      </el-col>
    </el-row>
    <div style="display: flex; height: calc(100% - 47px)">
      <div style="width: 230px; border-right: 1px solid #dce3e8">
        <node-menu ref="nodeMenu" @addNode="addNode" />
      </div>
      <div id="efContainer" ref="efContainer" v-flowDrag class="container">
        <template v-for="node in data.nodeList">
          <flow-node
            :id="node.id"
            :key="node.id"
            :node="node"
            :active-element="activeElement"
            @changeNodeSite="changeNodeSite"
            @nodeRightMenu="nodeRightMenu"
            @clickNode="clickNode"
          />
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import draggable from 'vuedraggable'
import { jsPlumb } from 'jsplumb'
import { easyFlowMixin } from './ef/mixins'
import nodeMenu from './ef/node_menu.vue'
export default {
  name: 'VueAdminTemplateDemo6',
  components: {
    nodeMenu
  },
  directives: {
    flowDrag: {
      bind(el, binding, vnode, oldNode) {
        if (!binding) {
          return
        }
        el.onmousedown = (e) => {
          if (e.button == 2) {
            // 右键不管
            return
          }
          //  鼠标按下，计算当前原始距离可视区的高度
          let disX = e.clientX
          let disY = e.clientY
          el.style.cursor = 'move'

          document.onmousemove = function (e) {
            // 移动时禁止默认事件
            e.preventDefault()
            const left = e.clientX - disX
            disX = e.clientX
            el.scrollLeft += -left

            const top = e.clientY - disY
            disY = e.clientY
            el.scrollTop += -top
          }

          document.onmouseup = function (e) {
            el.style.cursor = 'auto'
            document.onmousemove = null
            document.onmouseup = null
          }
        }
      }
    }
  },
  // 一些基础配置移动该文件中
  mixins: [easyFlowMixin],
  data() {
    return {}
  },
  mounted() {
    this.jsPlumb = jsPlumb.getInstance()
    this.$nextTick(() => {})
  },

  methods: {
    // 返回唯一标识
    getUUID() {
      return Math.random().toString(36).substr(3, 10)
    },
    /**
     * 拖拽结束后添加新的节点
     * @param evt
     * @param nodeMenu 被添加的节点对象
     * @param mousePosition 鼠标拖拽结束的坐标
     */
    addNode(evt, nodeMenu, mousePosition) {
      var screenX = evt.originalEvent.clientX
      var screenY = evt.originalEvent.clientY
      const efContainer = this.$refs.efContainer
      var containerRect = efContainer.getBoundingClientRect()
      var left = screenX
      var top = screenY
      // 计算是否拖入到容器中
      if (
        left < containerRect.x ||
        left > containerRect.width + containerRect.x ||
        top < containerRect.y ||
        containerRect.y > containerRect.y + containerRect.height
      ) {
        this.$message.error('请把节点拖入到画布中')
        return
      }
      left = left - containerRect.x + efContainer.scrollLeft
      top = top - containerRect.y + efContainer.scrollTop
      // 居中
      left -= 85
      top -= 16
      var nodeId = this.getUUID()
      // 动态生成名字
      var origName = nodeMenu.name
      var nodeName = origName
      var index = 1
      while (index < 10000) {
        var repeat = false
        for (var i = 0; i < this.data.nodeList.length; i++) {
          const node = this.data.nodeList[i]
          if (node.name === nodeName) {
            nodeName = origName + index
            repeat = true
          }
        }
        if (repeat) {
          index++
          continue
        }
        break
      }
      var node = {
        id: nodeId,
        name: nodeName,
        type: nodeMenu.type,
        left: left + 'px',
        top: top + 'px',
        ico: nodeMenu.ico,
        state: 'success'
      }
      /**
       * 这里可以进行业务判断、是否能够添加该节点
       */
      this.data.nodeList.push(node)
      this.$nextTick(() => {
        this.jsPlumb.makeSource(nodeId, this.jsplumbSourceOptions)
        this.jsPlumb.makeTarget(nodeId, this.jsplumbTargetOptions)
        this.jsPlumb.draggable(nodeId, {
          containment: 'parent',
          stop: (el) => {
            // 拖拽节点结束后的对调
            console.log('拖拽结束: ', el)
          }
        })
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.demo6 {
  /*顶部工具栏*/
  .ef-tooltar {
    padding-left: 10px;
    box-sizing: border-box;
    height: 42px;
    line-height: 42px;
    z-index: 3;
    border-bottom: 1px solid #dadce0;
  }
}
</style>
