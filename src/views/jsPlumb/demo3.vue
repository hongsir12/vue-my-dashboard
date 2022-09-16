<template>
  <div class="demo3">
    <div id="container3">
      <div class="table1">
        <el-table ref="table1" :data="table1Data" style="width: 100%">
          <el-table-column prop="date" label="日期" width="180" />
          <el-table-column prop="name" label="姓名" width="180" />
          <el-table-column prop="address" label="地址" />
        </el-table>
      </div>
      <div class="table2">
        <el-table ref="table2" :data="table2Data" style="width: 100%">
          <el-table-column prop="describe" label="描述" />
        </el-table>
      </div>
    </div>
  </div>
</template>

<script>
import { jsPlumb } from 'jsplumb'
export default {
  name: 'VueAdminTemplateDemo3',

  data() {
    return {
      jsPlumb: null,
      table1Data: [
        {
          date: '2016-05-02',
          name: '王小虎',
          address: '上海市普陀区金沙江路 1518 弄'
        },
        {
          date: '2016-05-04',
          name: '王小虎',
          address: '上海市普陀区金沙江路 1517 弄'
        },
        {
          date: '2016-05-01',
          name: '王小虎',
          address: '上海市普陀区金沙江路 1519 弄'
        },
        {
          date: '2016-05-03',
          name: '王小虎',
          address: '上海市普陀区金沙江路 1516 弄'
        }
      ],
      table2Data: [
        { describe: 'a1' },
        { describe: 'a2' },
        { describe: 'a3' },
        { describe: 'a4' }
      ],
      relationship: []
    }
  },

  mounted() {
    this.jsPlumb = jsPlumb.getInstance()
    this.jsPlumb.setContainer('container3')
    this.$nextTick(() => {
      const table1List = this.getTable1RowEl()
      const table2List = this.getTable2RowEl()
      table2List.forEach((e, i) => {
        this.relationship.push({ source: e, target: table1List[i] })
      })

      jsPlumb.ready(() => {
        const common = {
          endpoint: 'Blank',
          connector: ['Bezier'],
          // 鼠标不能拖动删除线
          ConnectionsDetachable: true,
          // 删除线的时候节点不删除
          DeleteEndpointsOnDetach: true,
          anchor: ['Left', 'Right'],
          // 绘制线
          PaintStyle: {
            stroke: '#409eff',
            strokeWidth: 5
          },
          overlays: [['Arrow', { width: 12, length: 12, location: 1 }]],
          RenderMode: 'svg'
        }
        this.relationship.forEach((el) => {
          // source是连线起点元素id target是连线终点元素id
          this.jsPlumb.connect({ source: el.source, target: el.target }, common)
        })
      })
    })
  },

  methods: {
    getTable1RowEl() {
      const rowList = Array.from(
        this.$refs['table1'].$el.getElementsByClassName('el-table__row')
      )
      return rowList
    },
    getTable2RowEl() {
      const rowList = Array.from(
        this.$refs['table2'].$el.getElementsByClassName('el-table__row')
      )
      return rowList
    }
  }
}
</script>
<style lang="scss">
.demo3 {
  #container3 {
    position: relative;
    .table1 {
      position: absolute;
      right: 0;
      width: 500px;
    }
    .table2 {
      position: absolute;
      left: 0;
      width: 100px;
    }
    .item {
      position: absolute;
      width: 100px;
      height: 100px;
      top: 100px;
      border: 1px solid #ccc;
    }
  }
}
</style>
