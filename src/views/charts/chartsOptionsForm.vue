<template>
  <div>
    <el-form
      ref="optionsForm"
      :model="optionsForm"
      label-width="80px"
      :rules="optionsRule"
    >
      <el-collapse v-model="activeNames">
        <el-collapse-item title="通用设置" name="1">
          <el-row :gutter="10">
            <el-col :span="4">
              <el-form-item label="y轴标签">
                <el-input />
              </el-form-item>
            </el-col>
          </el-row>
        </el-collapse-item>
        <el-collapse-item title="反馈 Feedback" name="2">
          <div>
            控制反馈：通过界面样式和交互动效让用户可以清晰的感知自己的操作；
          </div>
          <div>页面反馈：操作后，通过页面元素的变化清晰地展现当前状态。</div>
        </el-collapse-item>
      </el-collapse>
    </el-form>
  </div>
</template>

<script>
export default {
  name: 'VueAdminTemplateChartsOptionsForm',

  data() {
    return {
      optionsForm: {},
      optionsRule: {},
      activeNames: ['1']
    }
  },

  mounted() {},

  methods: {}
}
</script>
