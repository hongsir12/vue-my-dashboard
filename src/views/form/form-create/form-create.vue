<template>
  <div style="padding: 30px">
    <el-button type="primary" @click="showDialog('add')">新增</el-button>
    <el-button type="warning" @click="showDialog('edit')">编辑</el-button>
    <el-dialog
      :title="dialog.title"
      width="50%"
      :visible="dialog.visible"
      :before-close="closeDialog"
    >
      <form-create v-model="fApi" :rule="rule" :option="option" />
      <span slot="footer" class="dialog-footer">
        <el-button @click="closeDialog">取 消</el-button>
        <el-button type="primary" @click="submit">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'VueAdminTemplateFormCreate',

  data() {
    return {
      fApi: {},
      dialog: {
        title: '新增',
        visible: false
      },
      option: {
        form: {
          labelWidth: '100px'
        },
        // 显示重置表单按钮
        // resetBtn: true,
        submitBtn: false
      },
      rule: [
        {
          type: 'row',
          children: [
            {
              col: { span: 12 },
              type: 'radio',
              field: 'feature',
              title: ' ',
              value: 1,
              options: [
                { label: '特征', value: 1 },
                { label: '指标', value: 2 }
              ]
            },
            {
              col: { span: 6 },
              type: 'switch',
              field: 'col',
              title: '列显示',
              props: {
                trueValue: 1,
                falseValue: 0
              }
            },
            {
              col: { span: 6 },
              type: 'switch',
              field: 'row',
              title: '查询控件',
              props: {
                trueValue: 1,
                falseValue: 0
              }
            }
          ]
        },
        {
          type: 'row',
          children: [
            {
              type: 'select',
              field: 'code',
              title: '字段编码',
              style: 'width:100%',
              options: [
                { value: 1, label: '选项1' },
                { value: 2, label: '选项2' }
              ],
              validate: [
                { required: true, message: '请选择字段编码', trigger: 'change' }
              ],
              col: { span: 12 }
            },
            {
              type: 'input',
              field: 'name',
              title: '显示名称',
              props: { clearable: true },
              validate: [
                {
                  required: 'true',
                  message: '请填写显示名称',
                  trigger: 'blur'
                }
              ],
              col: { span: 12 }
            }
          ]
        },
        {
          type: 'row',
          children: [
            {
              col: { span: 12 },
              type: 'input',
              field: 'muti',
              title: '多表头',
              props: { clearable: true },
              display: true,
              $required: '请填写多表头'
            },
            {
              col: { span: 12 },
              type: 'input',
              field: 'no',
              title: '序号',
              props: { type: 'number', clearable: true },
              display: true,
              validate: [
                {
                  required: 'true',
                  message: '请填写序号',
                  trigger: 'blur'
                },
                {
                  pattern: /^[0-9]*[1-9][0-9]*$/g,
                  message: '只能输入正整数',
                  trigger: 'blur'
                }
              ]
            }
          ]
        }
      ]
    }
  },

  mounted() {},

  methods: {
    showDialog(model) {
      if (model === 'edit') {
        this.dialog.title = '编辑'
        this.fApi.coverValue({
          feature: 1,
          name: '张三',
          row: true,
          col: false,
          no: 90
        })
      }
      if (model === 'add') {
        this.dialog.title = '新增'
      }
      this.dialog.visible = true
    },
    closeDialog() {
      this.dialog.visible = false
      this.fApi.resetFields()
      this.fApi.clearValidateState()
    },
    submit() {
      console.log(this.fApi)
      this.fApi.submit((formData) => {
        console.log(formData)
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.el-select .test {
  width: 100%;
}
</style>
