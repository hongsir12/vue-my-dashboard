<template>
  <div>
    <el-button @click="showDialog('addView')">添加视图</el-button>
    <el-select v-model="view" placeholder="请选择视图" @change="changeShowView">
      <el-option
        v-for="item in viewsOptions"
        :key="item.value"
        :label="item.label"
        :value="item.value"
      />
    </el-select>
    <div class="ms-container">
      <div class="chart-container">
        <component
          :is="currentShowViewType"
          v-if="currentShowViewType"
          :v-type="viewsDetailMap.concreteVType"
          :v-data="viewsDetailMap.chartData"
          :selected-dimensions="viewsDetailMap.selectedDimensions"
          :selected-quotas="viewsDetailMap.selectedQuotas"
          :sort-dimens="viewsDetailMap.sortDimens"
          :filter-criteria="viewsDetailMap.filterCriteria"
        />
      </div>
      <div class="tools-window-main">
        <toolPanel
          v-if="currentShowViewType"
          :show="currentShowViewType"
          :dimensions="viewsDetailMap.dimensions"
          :quotas="viewsDetailMap.quotas"
          @getDimensionsAndQuotas="getSelectedDimensionsAndQuotas"
          @sortDimens="sortDimens"
          @getCurrentFilterName="getCurrentFilterName"
          @getRemoveFilterId="getRemoveFilterId"
        />
      </div>
    </div>

    <addView
      v-if="addView.visible"
      :visible="addView.visible"
      @getView="getView"
    />
    <setFilter
      v-if="setFilter.visible"
      :visible="setFilter.visible"
      :name="setFilter.name"
      @getFilterCriteria="getFilterCriteria"
    />
  </div>
</template>

<script>
import addView from './dialog/addView.vue'
import setFilter from './dialog/setFilter.vue'
import toolPanel from './toolPanel2.vue'
import vLine from './common/line.vue'
import vBar from './common/bar.vue'
export default {
  name: 'VueAdminTemplateIndex',
  components: { addView, setFilter, toolPanel, vLine, vBar },
  data() {
    return {
      addView: {
        visible: false
      },
      setFilter: {
        visible: false,
        name: ''
      },
      currentShowViewType: '', // 当前显示的视图大类
      view: '', // 当前选择视图
      viewsOptions: [], // 已有视图选项
      // 已有视图具体配置
      viewsDetailMap: {
        concreteVType: '', // 当前显示的视图的具体图表类型
        dimensions: [], // 图表所有维度
        quotas: [], // 图表所有指标
        selectedDimensions: [], // 显示的维度
        selectedQuotas: [], // 显示的指标
        chartData: [], // 图表数据
        // 维度排序
        sortDimens: {
          asc: [],
          desc: []
        },
        // 过滤条件
        filterCriteria: {}
      }
    }
  },

  mounted() {},

  methods: {
    getView(val) {
      console.log(val)
      this.viewsOptions.push({
        label: val.title,
        value: val.id,
        vType: val.vType
      })
      this.viewsDetailMap[val.id] = this.viewsDetailMap[val.id] || {}
    },
    // 更改显示视图
    changeShowView(viewId) {
      const allVTypes = ['Line', 'Bar']
      const currentType = this.viewsOptions.filter(
        (view) => view.value === viewId
      )[0].vType
      setTimeout(() => {
        this.viewsDetailMap.chartData = [
          {
            直接人工: '604',
            车间: '配件车间',
            年度: '2021',
            工厂: '贵阳联塑',
            水电: '226',
            折旧费: '11',
            id: '815'
          },
          {
            直接人工: '733',
            车间: '管材车间',
            年度: '2021',
            工厂: '贵阳联塑',
            水电: '5',
            折旧费: '115',
            id: '814'
          },
          {
            直接人工: '378',
            车间: '配件车间',
            年度: '2021',
            工厂: '武汉联塑',
            水电: '501',
            折旧费: '71',
            id: '813'
          },
          {
            直接人工: '864',
            车间: '管材车间',
            年度: '2021',
            工厂: '武汉联塑',
            水电: '345',
            折旧费: '92',
            id: '812'
          },
          {
            直接人工: '958',
            车间: '配件车间',
            年度: '2021',
            工厂: '广东科技',
            水电: '169',
            折旧费: '59',
            id: '811'
          },
          {
            直接人工: '404',
            车间: '管材车间',
            年度: '2021',
            工厂: '广东科技',
            水电: '775',
            折旧费: '73',
            id: '810'
          },
          {
            直接人工: '210',
            车间: '配件车间',
            年度: '2020',
            工厂: '贵阳联塑',
            水电: '62',
            折旧费: '125',
            id: '809'
          },
          {
            直接人工: '831',
            车间: '管材车间',
            年度: '2020',
            工厂: '贵阳联塑',
            水电: '127',
            折旧费: '57',
            id: '808'
          },
          {
            直接人工: '22',
            车间: '配件车间',
            年度: '2020',
            工厂: '武汉联塑',
            水电: '480',
            折旧费: '8',
            id: '807'
          },
          {
            直接人工: '411',
            车间: '管材车间',
            年度: '2020',
            工厂: '武汉联塑',
            水电: '754',
            折旧费: '67',
            id: '806'
          },
          {
            直接人工: '927',
            车间: '配件车间',
            年度: '2020',
            工厂: '广东科技',
            水电: '238',
            折旧费: '193',
            id: '805'
          },
          {
            直接人工: '571',
            车间: '管材车间',
            年度: '2020',
            工厂: '广东科技',
            水电: '509',
            折旧费: '200',
            id: '804'
          },
          {
            直接人工: '617',
            车间: '配件车间',
            年度: '2022',
            工厂: '贵阳联塑',
            水电: '230',
            折旧费: '32',
            id: '803'
          },
          {
            直接人工: '639',
            车间: '管材车间',
            年度: '2022',
            工厂: '贵阳联塑',
            水电: '795',
            折旧费: '152',
            id: '802'
          },
          {
            直接人工: '373',
            车间: '配件车间',
            年度: '2022',
            工厂: '武汉联塑',
            水电: '371',
            折旧费: '104',
            id: '801'
          },
          {
            直接人工: '324',
            车间: '管材车间',
            年度: '2022',
            工厂: '武汉联塑',
            水电: '509',
            折旧费: '2',
            id: '800'
          },
          {
            直接人工: '938',
            车间: '配件车间',
            年度: '2022',
            工厂: '广东科技',
            水电: '331',
            折旧费: '46',
            id: '799'
          },
          {
            直接人工: '218',
            车间: '管材车间',
            年度: '2022',
            工厂: '广东科技',
            水电: '20',
            折旧费: '157',
            id: '798'
          },
          {
            直接人工: '48',
            车间: '配件车间',
            年度: '2024',
            工厂: '贵阳联塑',
            水电: '2',
            折旧费: '110',
            id: '797'
          },
          {
            直接人工: '372',
            车间: '管材车间',
            年度: '2024',
            工厂: '贵阳联塑',
            水电: '310',
            折旧费: '4',
            id: '796'
          },
          {
            直接人工: '894',
            车间: '配件车间',
            年度: '2024',
            工厂: '武汉联塑',
            水电: '592',
            折旧费: '84',
            id: '795'
          },
          {
            直接人工: '358',
            车间: '管材车间',
            年度: '2024',
            工厂: '武汉联塑',
            水电: '710',
            折旧费: '90',
            id: '794'
          },
          {
            直接人工: '74',
            车间: '配件车间',
            年度: '2024',
            工厂: '广东科技',
            水电: '53',
            折旧费: '133',
            id: '793'
          },
          {
            直接人工: '620',
            车间: '管材车间',
            年度: '2024',
            工厂: '广东科技',
            水电: '455',
            折旧费: '60',
            id: '792'
          }
        ]
        this.viewsDetailMap.dimensions = [
          { id: 'zyear', name: '年度' },
          { id: 'werks', name: '工厂' },
          { id: 'workshop', name: '车间' }
        ]
        this.viewsDetailMap.quotas = [
          { id: 'money', name: '直接人工' },
          { id: 'water', name: '水电' },
          { id: 'zhejiu', name: '折旧费' }
        ]
        this.viewsDetailMap.concreteVType = currentType
        this.currentShowViewType =
          'v' +
          allVTypes.filter((type) => {
            return currentType.includes(type)
          })[0]
      }, 200)
    },
    getSelectedDimensionsAndQuotas(obj) {
      this.viewsDetailMap.selectedDimensions = obj.dimensions.map((e) => e.name)
      this.viewsDetailMap.selectedQuotas = obj.quotas.map((e) => e.name)
      for (const k in this.viewsDetailMap.sortDimens) {
        this.viewsDetailMap.sortDimens[k] = this.viewsDetailMap.sortDimens[
          k
        ].filter((dimen) =>
          this.viewsDetailMap.selectedDimensions.includes(dimen)
        )
      }
    },
    // 维度排序
    sortDimens(name, sortType) {
      for (const k in this.viewsDetailMap.sortDimens) {
        if (k === sortType) {
          if (this.viewsDetailMap.sortDimens[k].indexOf(name) === -1) {
            this.viewsDetailMap.sortDimens[k].push(name)
          }
        } else {
          const idx = this.viewsDetailMap.sortDimens[k].indexOf(name)
          if (idx > -1) {
            this.viewsDetailMap.sortDimens[k].splice(idx, 1)
          }
        }
      }
    },
    // 获取过滤条件弹框字段值
    getCurrentFilterName(name) {
      this.setFilter.name = name
    },
    // 获取字段过滤条件
    getFilterCriteria(obj) {
      this.$set(this.viewsDetailMap.filterCriteria, obj.name, obj)
    },
    // 获得移除的过滤器字段id
    getRemoveFilterId(id) {
      const allFields = [
        ...this.viewsOptions.dimensions,
        ...this.viewsDetailMap.quotas
      ]
      const removedName = allFields.filter((field) => field.id === id)[0].name
      console.log('removeName', removedName)
    },
    showDialog(dialog) {
      this[dialog].visible = true
    },
    closeDialog(dialog) {
      this[dialog].visible = false
    }
  }
}
</script>
<style lang="scss" scoped>
.ms-container {
  display: flex;
  .chart-container {
    flex: 1;
  }
  .tools-window-main {
    width: 350px;
    height: calc(100vh - 91px);
  }
}
</style>
