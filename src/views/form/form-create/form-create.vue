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
                },
                {
                  validator: (rule, value, callback) => {
                    if (value[0] === '=') {
                      let formula = value.split('').slice(1).join('')
                      console.log('formula', formula)
                      const regExp = /[a-zA-Z]\d+/g
                      const res = formula.match(regExp)
                      console.log('res', res)
                      const regExp2 = /\([a-zA-Z]\d+\)/g
                      const res2 = formula.match(regExp2) || []
                      console.log('res2', res2)
                      res.forEach((item, index) => {
                        formula = formula.replace(res2[index], res[index])
                      })
                      if (!this.fn(formula, res)) {
                        callback(new Error('请输入正确的数学公式'))
                      }
                    } else {
                      const regExp = /^[0-9]{0,9}.[0-9]{1,2}$/g
                      if (!regExp.test(value)) {
                        callback(new Error('不超过13位'))
                      }
                    }
                  },
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
                }
              ]
            }
          ]
        },
        {
          type: 'row',
          children: [
            {
              type: 'col',
              props: { span: 2 },
              children: [
                {
                  type: 'el-dropdown',
                  props: { trigger: 'click' },
                  on: {
                    command: (type) => {
                      switch (type) {
                        case '1':
                          this.importExcel()
                          break
                        case '2':
                          console.log(2)
                          break
                      }
                    }
                  },
                  children: [
                    {
                      type: 'button',
                      children: [
                        '导入导出',
                        {
                          type: 'i',
                          class: 'el-icon-arrow-down el-icon--right'
                        }
                      ],
                      props: { type: 'primary' }
                    },
                    {
                      type: 'el-dropdown-menu',
                      props: { slot: 'dropdown' },
                      children: [
                        {
                          type: 'el-dropdown-item',
                          props: { command: '1' },
                          children: [
                            '导入Excel',
                            {
                              type: 'input',
                              style: 'display:none',
                              props: {
                                type: 'file',
                                accept: '.xls,.xlsx',
                                id: 'importFile'
                              }
                            }
                          ]
                        },
                        {
                          type: 'el-dropdown-item',
                          children: ['模板下载'],
                          props: { command: '2' }
                        }
                      ]
                    }
                  ]
                }
              ]
            },
            {
              type: 'col',
              props: { span: 2 },
              children: [
                {
                  type: 'el-date-picker',
                  field: 'section_day2',
                  value: '2022-07-13',
                  props: {
                    type: 'date',
                    format: 'yyyy-MM-dd',
                    placeholder: '选择日期'
                  }
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
    fn(string, arr) {
      // 剔除空白符
      string = string.replace(/\s/g, '')

      // 错误情况，空字符串
      if (string === '') {
        return false
      }

      // 错误情况，运算符连续
      if (/[\+\-\*\/]{2,}/.test(string)) {
        return false
      }
      // 错误情况，乘号除号开头
      if (/^[\*\/]/.test(string)) {
        return false
      }
      // 错误情况，运算符结尾
      if (/[\+\-\*\/]$/.test(string)) {
        return false
      }

      // 空括号
      if (/\(\)/.test(string)) {
        return false
      }

      // 错误情况，括号不配对
      var stack = []
      for (var i = 0, item; i < string.length; i++) {
        item = string.charAt(i)
        if (item === '(') {
          stack.push('(')
        } else if (item === ')') {
          if (stack.length > 0) {
            stack.pop()
          } else {
            return false
          }
        }
      }
      if (stack.length !== 0) {
        return false
      }

      // 错误情况，(后面是运算符
      if (/\([\+\-\*\/]/.test(string)) {
        return false
      }

      // 错误情况，)前面是运算符
      if (/[\+\-\*\/]\)/.test(string)) {
        return false
      }

      // 错误情况，(前面不是运算符
      if (/[^\+\-\*\/]\(/.test(string)) {
        return false
      }

      // 错误情况，)后面不是运算符
      if (/\)[^\+\-\*\/]/.test(string)) {
        return false
      }

      // 错误情况，变量没有来自“待选公式变量”
      var tmpStr = string.replace(/[\(\)\+\-\*\/]{1,}/g, '`')
      var array = tmpStr.split('`')
      for (var i = 0, item; i < array.length; i++) {
        item = array[i]
        if (/[A-Z]/i.test(item) && arr.indexOf(item) == -1) {
          return false
        }
      }

      return true
    },
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
    importExcel() {
      const inp = document.getElementById('importFile')
      console.log(inp)
      inp.click()
    },
    inpChange(e) {
      console.log(e)
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
