<template>
  <div>
    <el-dialog
      :visible.sync="visible"
      width="70%"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :before-close="handleClose"
      title="选择数据源"
    >
      <el-steps :active="active" finish-status="success" align-center>
        <el-step title="选择生成图表" />
        <el-step title="选择维度" />
        <el-step title="选择指标" />
        <el-step title="图表设置" />
      </el-steps>
      <div>
        <div v-show="active === 0" class="stepBody">
          <el-form
            ref="stepOneForm"
            :model="stepOneForm"
            label-width="80px"
            :rules="stepOneRule"
          >
            <el-form-item label="报表" prop="report">
              <el-select v-model="stepOneForm.report" placeholder="请选择报表">
                <el-option
                  v-for="item in reportOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="生成图表" prop="chart">
              <el-select v-model="stepOneForm.chart" placeholder="请选择图表">
                <el-option
                  v-for="item in chartsOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="图表名称" prop="chartName">
              <el-input v-model="stepOneForm.chartName" />
            </el-form-item>
          </el-form>
        </div>
        <div v-show="active === 1" class="stepBody">
          <el-form
            ref="stepTwoForm"
            :model="stepTwoForm"
            label-width="80px"
            :rules="stepTwoRule"
          >
            <el-form-item prop="featureValue">
              <el-transfer
                v-model="stepTwoForm.featureValue"
                :data="featureData"
                :titles="['待选特征', '已选特征']"
              />
            </el-form-item>
          </el-form>
        </div>
        <div v-show="active === 2" class="stepBody">
          <el-form
            ref="stepThreeForm"
            :model="stepThreeForm"
            label-width="80px"
            :rules="stepThreeRule"
          >
            <el-form-item prop="quotaValue">
              <el-transfer
                v-model="stepThreeForm.quotaValue"
                :data="quotaData"
                :titles="['待选指标', '已选指标']"
              />
            </el-form-item>
          </el-form>
        </div>
        <div v-show="active === 3">
          <chartsOptionsForm></chartsOptionsForm>
        </div>
      </div>

      <div class="stepBtns">
        <el-button v-show="active !== 0" @click="prev">上一步</el-button>
        <el-button v-show="active !== 3" @click="next(active)"
          >下一步</el-button
        >
        <el-button v-show="active === 3" @click="submit">提交</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import chartsOptionsForm from './chartsOptionsForm.vue'
export default {
  name: 'VueAdminTemplateSetChartGenerate',
  props: {
    visible: {
      type: Boolean,
      required: true
    }
  },
  components: {
    chartsOptionsForm
  },
  data() {
    return {
      active: 0,
      formArr: ['stepOneForm', 'stepTwoForm', 'stepThreeForm'],
      reportOptions: [
        { label: '车间产线费用', value: '214' },
        { label: '理论费用', value: '101' }
      ],
      chartsOptions: [
        { label: '折线图', value: 'vLine' },
        { label: '柱状图', value: 'vBar' },
        { label: '饼图', value: 'vPie' },
        { label: '散点图', value: 'vScatter' }
      ],
      stepOneForm: {},
      stepOneRule: {
        report: [{ required: true, message: '请选择报表', trigger: 'change' }],
        chart: [
          { required: true, message: '请选择图表类型', trigger: 'change' }
        ],
        chartName: [
          { required: true, message: '请输入图表名称', trigger: 'blur' }
        ]
      },
      stepTwoForm: {},
      stepTwoRule: {
        featureValue: [
          { required: true, message: '请选择特征', trigger: 'blur' }
        ]
      },
      featureData: [
        { key: '年度', label: '年度' },
        { key: '工厂', label: '工厂' },
        { key: '车间', label: '车间' }
      ],
      stepThreeForm: {},
      stepThreeRule: {
        quotaValue: [{ required: true, message: '请选择指标', trigger: 'blur' }]
      },
      quotaData: [
        { key: '水电', label: '水电' },
        { key: '折旧', label: '折旧' },
        { key: '直接人工', label: '直接人工' }
      ],
      stepFourForm: {},
      stepFourRule: {}
    }
  },

  mounted() {},

  methods: {
    prev() {
      --this.active
      if (this.active < 0) this.active = 0
    },
    next(active) {
      this.$refs[this.formArr[active]].validate((valid) => {
        if (!valid) {
          return
        }
        if (this.active++ > 2) this.active = 0
      })
    },
    submit() {
      this.$refs.stepThreeForm.validate((valid) => {
        if (!valid) {
          return
        }
        const obj = {
          chart: this.chartsOptions.filter(
            (e) => e.value === this.stepOneForm.chart
          )[0].value,
          report: this.reportOptions.filter(
            (e) => e.value === this.stepOneForm.report
          )[0].label,
          name: this.stepOneForm.chartName,
          dimensionOptions:
            this.stepOneForm.report === '101'
              ? []
              : this.stepTwoForm.featureValue,
          columnOptions:
            this.stepOneForm.report === '101'
              ? []
              : this.stepThreeForm.quotaValue
        }
        this.$emit('chartSetting', obj)
        this.handleClose()
      })
    },
    handleClose() {
      this.$parent.closeDialog('chartSet')
    }
  }
}
</script>
<style lang="scss" scoped>
.stepBody {
  height: 350px;
  display: flex;
  justify-content: center;
  align-items: center;
}
.stepBtns {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
