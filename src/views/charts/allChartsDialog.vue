<template>
  <div>
    <el-dialog
      :visible.sync="visible"
      width="70%"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :before-close="handleClose"
      title="图表"
    >
      <el-form ref="form" :model="form" :rules="rules">
        <el-row :gutter="10">
          <el-col :span="4">
            <el-form-item prop="report">
              <el-select v-model="form.report" placeholder="请选择报表">
                <el-option
                  v-for="item in reportOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="4">
            <el-form-item prop="chartType">
              <el-select v-model="form.chartType" placeholder="请选择图表类型">
                <el-option
                  v-for="item in typeOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="4">
            <el-form-item prop="chartName">
              <el-select v-model="form.chartName" placeholder="请选择具体图表">
                <el-option
                  v-for="item in nameOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="2">
            <el-button type="primary" @click="showChart">查询</el-button>
          </el-col>
        </el-row>
      </el-form>

      <component
        :is="current"
        v-if="form.chartType"
        :chart-data="chartData"
        :settings="settings"
      />
    </el-dialog>
  </div>
</template>

<script>
import vLine from './components/line.vue'
import vBar from './components/bar.vue'
import vPie from './components/pie.vue'
import vScatter from './components/scatter.vue'
export default {
  name: 'VueAdminTemplateAllChartsDialog',
  components: {
    vLine,
    vBar,
    vPie,
    vScatter
  },
  props: {
    visible: {
      type: Boolean,
      required: true
    },
    optionSetting: {
      type: Array,
      default: () => {
        return []
      }
    }
  },
  data() {
    return {
      current: '',
      form: {
        report: '', // 选中的报表
        chartType: '', // 图表类型
        chartName: '' // 图表名称
      },
      rules: {
        report: [{ required: true, message: '请选择报表', trigger: 'change' }],
        chartType: [
          { required: true, message: '请选择图表类型', trigger: 'change' }
        ],
        chartName: [
          { required: true, message: '请选择图表名称', trigger: 'change' }
        ]
      },
      typeOptions: [],
      nameOptions: [],
      chartData: null,
      settings: null
    }
  },
  computed: {
    optionsSettingMap() {
      const map = {}
      this.optionSetting.forEach((e) => {
        map[e.report] = map[e.report] || {}
        e.chartsOptions.forEach((chart) => {
          map[e.report][chart.chart] = map[e.report][chart.chart] || {}
          map[e.report][chart.chart][chart.name] = chart
        })
      })
      return map
    },
    reportOptions() {
      const arr = []
      for (const k in this.optionsSettingMap) {
        arr.push({ label: k, value: k })
      }
      return arr
    }
  },
  watch: {
    'form.report': {
      handler(newVal, oldVal) {
        this.form.chartType = ''
        const arr = []
        for (const k in this.optionsSettingMap[newVal]) {
          arr.push({ label: k, value: k })
        }
        this.typeOptions = arr
      }
    },
    'form.chartType': {
      handler(newVal, oldVal) {
        this.form.chartName = ''
        const arr = []
        if (newVal) {
          for (const k in this.optionsSettingMap[this.form.report][newVal]) {
            arr.push({ label: k, value: k })
          }
        } else {
          this.form.chartName = ''
        }
        this.nameOptions = arr
      }
    }
  },
  created() {
    // this.getReportData()
  },

  methods: {
    showChart() {
      this.$refs.form.validate((valid) => {
        if (!valid) {
          return
        }
        const { report, chartType, chartName } = this.form
        this.chartData = this.optionSetting.filter(
          (e) => e.report === report
        )[0].data
        this.settings = this.optionsSettingMap[report][chartType][chartName]
        this.changeChart(chartType)
      })
    },
    changeChart(val) {
      this.current = val
    },
    handleClose() {
      this.$parent.closeDialog('allCharts')
    }
  }
}
</script>
