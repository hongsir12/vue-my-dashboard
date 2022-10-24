<template>
  <div>
    <el-button id="btn">获取连线</el-button>
    <textarea cols="50" rows="5" class="textarea" />
    <div id="container1">
      <ul v-for="(item, index) in data" :key="index" class="ul-list">
        <li
          v-for="children in item"
          :id="children.id"
          :key="children.id"
          :index="index"
        >
          {{ children.title }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import { jsPlumb } from 'jsplumb'
export default {
  name: 'VueAdminTemplateDemo1',

  data() {
    return {
      instance: '',
      data: [
        [
          {
            title: '我是a1啦啦',
            id: 'a1',
            data: 'a1的数据'
          },
          {
            title: '我是a2啦啦',
            id: 'a2',
            data: 'a2的数据'
          },
          {
            title: '我是a3啦啦',
            id: 'a3',
            data: 'a3的数据'
          }
        ],
        [
          {
            title: '我是b1啦啦',
            id: 'b1',
            data: 'b1的数据'
          },
          {
            title: '我是b2啦啦',
            id: 'b2',
            data: 'b2的数据'
          },
          {
            title: '我是b3啦啦',
            id: 'b3',
            data: 'b3的数据'
          }
        ],
        [
          {
            title: '我是c1啦啦',
            id: 'c1',
            data: 'c1的数据'
          },
          {
            title: '我是c2啦啦',
            id: 'c2',
            data: 'c2的数据'
          },
          {
            title: '我是c3啦啦',
            id: 'c3',
            data: 'c3的数据'
          }
        ]
      ],
      relationship: [
        { source: 'a1', target: 'b1' },
        { source: 'a1', target: 'b2' },
        { source: 'b1', target: 'c3' }
      ]
    }
  },

  mounted() {
    // this.data.forEach((v1, i1) => {
    //   const ul = document.createElement('ul')
    //   // 添加一个类名 方便后期获取
    //   ul.classList.add('ul-list')
    //   let lis = ''
    //   v1.forEach((v2) => {
    //     // id必须设置为数据的id 再添加自定义属性index值为当前列表索引 后期需要用到
    //     lis += `<li id=${v2.id} index=${i1}>${v2.title}</li>`
    //   })
    //   ul.innerHTML = lis
    //   document.getElementById('container').appendChild(ul)
    // })
    const dataArr = this.data.flat()

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
        jsPlumb.fire('jsPlumbDemoLoaded', this.instance)
      })
      this.instance.bind('dblclick', (conn, originEvent) => {
        let slabel, elabel
        dataArr.forEach((data) => {
          if (conn.sourceId === data.id) {
            slabel = data.data
          }
          if (conn.targetId === data.id) {
            elabel = data.data
          }
        })
        conn.setLabel({
          label: `${slabel}->${elabel}`
        })
      })
    })

    // 给button注册点击事件获取连线关系
    document.getElementById('btn').addEventListener('click', () => {
      let newRelationship = ''
      this.instance.getAllConnections().forEach((el) => {
        newRelationship += ` ${el.sourceId}连接了${el.targetId}`
      })
      document.querySelector('.textarea').value = newRelationship
      //  jsplumb常用方法
      // jsplumb.getConnections({souce: 'sourceID', target: 'targetID'});  //获取指定连线
      // 1. jsPlumb.getAllConnections() 获取所有连接线
      // 2. jsPlumb.deleteEveryConnection(); 清空所有连接线
      // 3. jsPlumb.deleteConnection(connInfo.connection); //删除连接线
      // 4. jsPlumb.setContainer(document.getElementById("main"));//初始化实例化组件
    })
  },

  methods: {
    init() {
      this.instance = jsPlumb.getInstance({
        Connector: 'Straight', // 连接线形状 Bezier: 贝塞尔曲线Flowchart: 具有90度转折点的流程线 StateMachine: 状态机 Straight: 直线
        // PaintStyle: { strokeWidth: 3, stroke: "#ffa500", "dashstyle": "2 4" }, //连接线样式
        Endpoint: ['Dot', { radius: 5 }], // 端点
        EndpointStyle: { fill: '#ffa500' }, // 端点样式
        Container: 'container', // 目标容器id
        ListStyle: {
          endpoint: ['Rectangle', { width: 30, height: 30 }]
        },
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
        // 鼠标滑过线的样式
        HoverPaintStyle: { stroke: '#b0b2b5', strokeWidth: 1 },
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
          [
            'Label',
            { label: '', location: 0.5, cssClass: 'endpointTargetLabel' }
          ]
        ]
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
      var conn = this.instance.getConnections()
      console.log(conn)
      const dataArr = this.data.flat()
      conn.forEach((e) => {
        let slabel, elabel
        dataArr.forEach((data) => {
          if (e.sourceId === data.id) {
            slabel = data.data
          }
          if (e.targetId === data.id) {
            elabel = data.data
          }
        })
        e.setLabel({
          label: `${slabel}->${elabel}`
        })
        console.log(e.sourceId, e.targetId)
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
    }
  }
}
</script>
<style lang="scss" scoped>
#container1 {
  position: relative;
  .ul-list {
    padding-left: 300px;
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
