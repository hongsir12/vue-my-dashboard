<template>
  <el-dialog
    :visible="visible"
    width="70%"
    title="添加视图"
    :before-close="handleClose"
    :close-on-click-modal="false"
  >
    <div>
      <el-steps :active="active" process-status="process" align-center>
        <el-step title="选择数据集" />
        <el-step title="选择图表类型" />
      </el-steps>
    </div>
    <div v-show="active === 1">
      <el-form
        ref="dataSourceForm"
        :model="dataSourceForm"
        label-width="80px"
        :rules="dataSourceFormRules"
      >
        <el-row :gutter="10">
          <el-col :span="6">
            <el-form-item label="视图标题" prop="title">
              <el-input
                v-model="dataSourceForm.title"
                placeholder="请输入视图标题"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="10">
          <el-col :span="6">
            <el-form-item label="数据集" prop="dataSource">
              <el-select
                v-model="dataSourceForm.dataSource"
                placeholder="请选择数据集"
              >
                <el-option
                  v-for="item in dataSourceOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </div>
    <div v-show="active === 2">
      <el-form
        ref="vTypeForm"
        :model="vTypeForm"
        label-width="80px"
        :rules="vTypeFormRules"
      >
        <el-form-item label="图表类型" prop="vType">
          <el-cascader
            v-model="vTypeForm.vType"
            :show-all-levels="false"
            :options="vTypeOptions"
          />
        </el-form-item>
      </el-form>
    </div>
    <div class="stepBtns">
      <el-button v-show="active !== 1" @click="prev">上一步</el-button>
      <el-button v-show="active !== 2" @click="next">下一步</el-button>
      <el-button v-show="active === 2" @click="submit">提交</el-button>
    </div>
  </el-dialog>
</template>

<script>
export default {
  name: 'AddView',
  props: {
    visible: {
      type: Boolean,
      required: true,
      default: false
    }
  },
  data() {
    return {
      dataSourceForm: { title: '', dataSource: '' },
      dataSourceFormRules: {
        title: [{ required: true, message: '请填写视图标题', trigger: 'blur' }],
        dataSource: [
          { required: true, message: '请选择数据集', trigger: 'change' }
        ]
      },
      vTypeForm: { vType: '' },
      vTypeFormRules: {
        vType: [
          { required: true, message: '请填写图表类型', trigger: 'change' }
        ]
      },
      dataSourceOptions: [
        { label: '车间产线费用', value: '214' },
        { label: '理论费用', value: '101' }
      ],
      vTypeOptions: [
        {
          value: 'qushi',
          label: '趋势',
          children: [
            { value: 'baseLine', label: '基础折线图' },
            { value: 'stackLine', label: '堆叠折线图' },
            { value: 'composeLine', label: '组合图' }
          ]
        },
        {
          value: 'bijiao',
          label: '比较',
          children: [
            { value: 'baseBar', label: '基础柱状图' },
            { value: 'stackBar', label: '堆叠柱状图' },
            { value: 'verticalBar', label: '横向柱状图' },
            { value: 'verticalStackBar', label: '横向堆叠柱状图' }
          ]
        },
        {
          value: 'fenbu',
          label: '分布',
          children: [
            { value: 'pie', label: '饼图' },
            { value: 'rose', label: '南丁格尔玫瑰图' },
            { value: 'radar', label: '雷达图' }
          ]
        },
        {
          value: 'guanxi',
          label: '关系',
          children: [{ value: 'scatter', label: '散点图' }]
        }
      ],
      active: 1
    }
  },

  mounted() {},

  methods: {
    prev() {
      --this.active
      if (this.active < 0) this.active = 0
    },
    next() {
      this.$refs.dataSourceForm.validate((valid) => {
        if (!valid) {
          return
        }
        this.active++
      })
    },
    submit() {
      this.$refs.vTypeForm.validate((valid) => {
        if (!valid) {
          return
        }
        this.$emit('getView', {
          ...this.dataSourceForm,
          vType: this.vTypeForm.vType[1],
          id: Math.floor(Math.random() * 1000) + 1
        })
        this.handleClose()
      })
    },
    handleClose() {
      this.$parent.closeDialog('addView')
    }
  }
}
</script>
