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
          :title="currentViewDetail.title"
          :v-type="currentViewDetail.concreteVType"
          :v-data="currentViewDetail.chartData"
          :selected-dimensions="currentViewDetail.selectedDimensions"
          :selected-quotas="currentViewDetail.selectedQuotas"
          :sort-dimens="currentViewDetail.sortDimens"
          :filter-criteria="currentViewDetail.filterCriteria"
          :mark-line-settings="currentViewDetail.markLine"
          :datazoom="currentViewDetail.datazoom"
        />
      </div>
      <div class="tools-window-main">
        <toolPanel
          v-if="currentShowViewType"
          :show="currentShowViewType"
          :dimensions="currentViewDetail.dimensions"
          :quotas="currentViewDetail.quotas"
          :selected-dimensions="currentViewDetail.selectedDimensions"
          :selected-quotas="currentViewDetail.selectedQuotas"
          :sort-dimens="currentViewDetail.sortDimens"
          :filter-criteria="currentViewDetail.filterCriteria"
          @ascDimens="ascDimens"
          @descDimens="descDimens"
          @getDimensionsAndQuotas="getSelectedDimensionsAndQuotas"
          @getCurrentFilterName="getCurrentFilterName"
          @checkFilterFields="checkFilterFields"
          @getDataZoom="getDataZoom"
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
      :id="setFilter.id"
      :visible="setFilter.visible"
      :name="setFilter.name"
      :tab-radio="setFilter.radio"
      :field-type="setFilter.fieldType"
      :criteria="setFilter.criteria"
      :tab-assert="setFilter.tabAssert"
      @getFilterCriteria="getFilterCriteria"
    />
    <addMarkLine
      v-if="addMarkLine.visible"
      :visible="addMarkLine.visible"
      :mark-line-settings="currentViewDetail.markLine"
      @getMarkLineArr="getMarkLineArr"
    />
  </div>
</template>

<script>
import addView from './dialog/addView.vue'
import toolPanel from './toolPanel.vue'
import setFilter from './dialog/setFilter.vue'
import addMarkLine from './dialog/addMarkLine.vue'
import vLine from './common/line.vue' // 折线图
import vBar from './common/bar.vue'
import vHistogram from './common/histogram.vue'
import vPie from './common/pie.vue'
export default {
  name: 'VueAdminTemplateIndex',
  components: {
    addView,
    toolPanel,
    setFilter,
    addMarkLine,
    vLine,
    vBar,
    vHistogram,
    vPie
  },
  data() {
    return {
      addView: {
        visible: false
      },
      // 过滤器弹框
      setFilter: {
        visible: false,
        name: '', // 字段名称
        id: '', // 字段id
        fieldType: '', // 字段类型
        criteria: [], // 过滤条件
        radio: 2
      },
      // 添加预警线弹框
      addMarkLine: {
        visible: false
      },
      currentShowViewType: '', // 当前显示的视图大类
      view: '', // 当前选择视图
      viewsOptions: [], // 已有视图选项
      // 已有视图具体配置
      viewsDetailMap: {},
      // 当前视图配置
      currentViewDetail: {}
    }
  },
  mounted() {},

  methods: {
    getView(val) {
      this.viewsOptions.push({
        label: val.title,
        value: val.id,
        vType: val.vType
      })
      this.viewsDetailMap[val.id] = this.viewsDetailMap[val.id] || {
        title: val.title, // 视图名称
        concreteVType: val.vType, // 当前显示的视图的具体图表类型
        dimensions: [
          { id: 'zyear', name: '年度' },
          { id: 'werks', name: '工厂' },
          { id: 'workshop', name: '车间' }
        ], // 图表所有维度
        quotas: [
          { id: 'money', name: '直接人工' },
          { id: 'water', name: '水电' },
          { id: 'zhejiu', name: '折旧费' }
        ], // 图表所有指标
        selectedDimensions: [], // 显示的维度
        selectedQuotas: [], // 显示的指标
        chartData: [
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
        ], // 图表数据
        // 维度排序
        sortDimens: {},
        // 指标显示数据过滤条件
        quotaFilterCriteria: [],
        // 过滤条件
        filterCriteria: [],
        markLine: [],
        datazoom: { show: false }
      }
    },
    changeShowView(viewId) {
      this.currentViewDetail = this.viewsDetailMap[viewId]
      const allVTypes = ['Line', 'Histogram', 'Bar', 'Pie']
      const currentType = this.viewsOptions.filter(
        (view) => view.value === viewId
      )[0].vType
      this.currentShowViewType =
        'v' +
        allVTypes.filter((type) => {
          return currentType.includes(type)
        })[0]
    },
    ascDimens(name) {
      this.$set(
        this.currentViewDetail.selectedDimensions.filter(
          (dimen) => dimen.name === name
        )[0],
        'sort',
        1
      )
      this.$set(this.currentViewDetail.sortDimens, name, 1)
    },
    descDimens(name) {
      this.$set(
        this.currentViewDetail.selectedDimensions.filter(
          (dimen) => dimen.name === name
        )[0],
        'sort',
        -1
      )
      this.$set(this.currentViewDetail.sortDimens, name, -1)
    },
    getSelectedDimensionsAndQuotas(obj) {
      this.currentViewDetail.selectedDimensions = obj.dimensions
      this.currentViewDetail.selectedQuotas = obj.quotas
    },
    // 设置添加过滤条件弹框的内容
    getCurrentFilterName(name, fieldType) {
      const allFields = [
        ...this.currentViewDetail.dimensions,
        ...this.currentViewDetail.quotas
      ]
      this.setFilter.name = name
      this.setFilter.id = allFields.filter((field) => field.name === name)[0].id
      this.setFilter.fieldType = fieldType
      const arr = this.currentViewDetail.filterCriteria.filter(
        (e) => e.name === name
      )
      if (arr.length) {
        this.setFilter.criteria = arr[0].criteriaArr
        this.setFilter.radio = arr[0].radio
        this.setFilter.tabAssert = arr[0].assert
      } else {
        this.setFilter.criteria = []
        this.setFilter.radio = 1
        this.setFilter.tabAssert = '与'
      }
    },
    // 检查当前过滤条件
    checkFilterFields(fields) {
      console.log('当前过滤字段', fields)
      this.currentViewDetail.filterCriteria =
        this.currentViewDetail.filterCriteria.filter((item) => {
          return fields.some((field) => field.id === item.id)
        })
      console.log(this.currentViewDetail.filterCriteria)
    },
    // 获取字段过滤条件数组
    getFilterCriteria(obj) {
      console.log(obj)
      this.currentViewDetail.filterCriteria =
        this.currentViewDetail.filterCriteria || []
      this.currentViewDetail.filterCriteria.unshift(obj)
      this.currentViewDetail.filterCriteria = this.$utils.unique(
        this.currentViewDetail.filterCriteria,
        'id'
      )
    },
    // 获取markline设置
    getMarkLineArr(val) {
      this.currentViewDetail.markLine = val
    },
    // 获取缩略条datazoom设置
    getDataZoom(val) {
      this.currentViewDetail.datazoom = { ...val }
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
