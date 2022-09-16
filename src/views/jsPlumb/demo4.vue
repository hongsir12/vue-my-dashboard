<template>
  <div>
    <div><button id="btn" @click="getLianXian()">获取连线</button></div>
    <textarea v-model="textareaVal" rows="5" cols="50" class="textarea" />
    <div id="container4">
      <ul v-for="(item, index) in data" :key="index" class="ul-list">
        <li
          v-for="(i, indexes) in item"
          :id="i.id"
          :key="indexes"
          :index="index"
        >
          {{ i.title }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import { jsPlumb } from 'jsplumb'

export default {
  name: 'App',
  components: {},
  data() {
    return {
      data: [
        [
          {
            title: '我是a1',
            id: 'a1'
          },
          {
            title: '我是a2',
            id: 'a2'
          },
          {
            title: '我是a3',
            id: 'a3'
          }
        ],
        [
          {
            title: '我是b1',
            id: 'b1'
          },
          {
            title: '我是b2',
            id: 'b2'
          },
          {
            title: '我是b3',
            id: 'b3'
          }
        ]
      ],
      relationship: [
        { source: 'a1', target: 'b2' },
        { source: 'a2', target: 'b1' }
      ],
      instance: '',
      addponit: '',
      textareaVal: ''
    }
  },
  computed: {},
  mounted() {
    this.$nextTick(() => {
      jsPlumb.ready(() => {
        // 初始化jsPlumb 创建jsPlumb实例
        this.init()
        // 设置可以为连线起点和连线终点的元素
        this.setContainer()
        // 设置默认连线
        this.setConnect()
        // 在连线事件中 只允许连接相邻的列表 不能跨列表连接
        this.setRule()
        // 点击删除连线
        this.delete()

        // 判断是否建立连接
        this.beforeDrop()

        jsPlumb.fire('jsPlumbDemoLoaded', this.instance)
      })

      //  jsplumb常用方法
      // jsplumb.getConnections({souce: 'sourceID', target: 'targetID'});  //获取指定连线
      // 1. jsPlumb.getAllConnections() 获取所有连接线
      // 2. jsPlumb.deleteEveryConnection(); 清空所有连接线
      // 3. jsPlumb.deleteConnection(connInfo.connection); //删除连接线
      // 4. jsPlumb.setContainer(document.getElementById("main"));//初始化实例化组件
    })
  },
  methods: {
    // 初始化jsPlumb 创建jsPlumb实例
    init() {
      this.instance = jsPlumb.getInstance({
        Connector: 'Straight', // 连接线形状 Bezier: 贝塞尔曲线Flowchart: 具有90度转折点的流程线 StateMachine: 状态机 Straight: 直线
        // PaintStyle: { strokeWidth: 3, stroke: "#ffa500", "dashstyle": "2 4" }, //连接线样式
        Endpoint: ['Dot', { radius: 5 }], // 端点
        EndpointStyle: { fill: '#000' }, // 端点样式
        Container: 'container4', // 目标容器id
        ListStyle: {
          endpoint: ['Rectangle', { width: 30, height: 30 }]
        }
      })
    },

    // 设置可以连线的元素
    setContainer() {
      // 相当于css选择器 也可以使用id选择等
      const uls = jsPlumb.getSelector('.ul-list')
      // 将dom元素设置为连线的起点或者终点  设置了起点的元素才能开始连线 设置为终点的元素才能为连线终点
      this.instance.batch(() => {
        uls.forEach((ul) => {
          const lis = ul.querySelectorAll('li')
          lis.forEach((li) => {
            // 将li设置为起点
            this.instance.makeSource(li, {
              allowLoopback: false,
              anchor: ['Left', 'Right'] // 设置端点位置
            })
            // 将li设置为终点
            this.instance.makeTarget(li, {
              anchor: ['Left', 'Right']
            })
          })
        })
      })
    },

    // 设置默认连线
    setConnect() {
      this.relationship.forEach((el) => {
        // source是连线起点元素id target是连线终点元素id
        this.instance.connect({ source: el.source, target: el.target })
      })
    },

    // 只允许连接相邻的列表
    setRule() {
      // // 连线事件 不不允许连接当前所在list
      this.instance.bind('connection', (connInfo, originalEvent) => {
        // connInfo是jsPlumb对象 可以打印出来康康有哪些东西

        // 根据sourceId拿到开始连接元素li 再根据li的index自定义属性 判断只允许连接相邻的ul列表
        const index = Number(
          document
            .getElementById(connInfo.connection.sourceId)
            .getAttribute('index')
        )
        let allow = []
        if (this.data[index + 1]) {
          allow = [...allow, ...this.data[index + 1].map((_) => _.id)]
        }
        if (this.data[index - 1]) {
          allow = [...allow, ...this.data[index - 1].map((_) => _.id)]
        }
        // 如果连线终点元素(targetId)不在起点元素(sourceId)的前后ul列表范围 就删除该连线
        if (allow.indexOf(connInfo.connection.targetId) === -1) {
          // 删除连线
          this.instance.deleteConnection(connInfo.connection)
        }
      })
    },
    delete() {
      this.instance.bind('click', (conn, originalEvent) => {
        if (window.prompt('确定删除所点击的链接吗？ 输入1确定') === '1') {
          this.instance.deleteConnection(conn)
        }
      })
    },
    beforeDrop() {
      // 当链接建立前
      this.instance.bind('beforeDrop', (info) => {
        const checkArrsourceId = []
        const checkArrtargetId = []
        this.instance.getAllConnections().forEach((el) => {
          checkArrsourceId.push(el.sourceId)
          checkArrtargetId.push(el.targetId)
        })
        const fenId = checkArrsourceId.concat(checkArrtargetId)
        console.log(fenId, 'fenId-----')

        console.log(fenId.indexOf(info.sourceId), 'allId.indexOf(fenId)====')
        if (
          fenId.indexOf(info.sourceId) === -1 ||
          fenId.indexOf(info.targetId) === -1
        ) {
          return true // 链接会自动建立
        } else {
          return false // 链接不会建立，注意，必须是false
        }
      })
    },
    getLianXian() {
      let newRelationship = ''
      this.instance.getAllConnections().forEach((el) => {
        newRelationship += ` ${el.sourceId}连接了${el.targetId}`
      })
      this.textareaVal = newRelationship
    }
  }
}
</script>
<style lang="scss">
* {
  padding: 1;
  margin: 1;
}
#container4 {
  position: relative;
  width: 500px;
  .ul-list {
    display: inline-block;
    li {
      list-style-type: none;
      border: 1px solid red;
      height: 30px;
      line-height: 30px;
      text-align: center;
      width: 100px;
    }
  }
}
</style>
