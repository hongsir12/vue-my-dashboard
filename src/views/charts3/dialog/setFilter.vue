<template>
  <el-dialog
    :visible="visible"
    width="50%"
    title="添加过滤"
    :before-close="handleClose"
    :close-on-click-modal="false"
  >
    <div v-if="fieldType == 'quota'">
      <el-row :gutter="10" style="margin-bottom: 10px">
        <el-col :span="2">
          <el-button
            icon="el-icon-plus"
            size="small"
            circle
            @click="addCriteria"
          />
        </el-col>
        <el-col :span="6">
          <el-radio-group
            v-show="criteriaArr.length > 1"
            v-model="assert"
            size="small"
          >
            <el-radio-button label="与" />
            <el-radio-button label="或" />
          </el-radio-group>
        </el-col>
      </el-row>
      <div class="criteria-box">
        <el-row
          v-for="(item, index) in criteriaArr"
          :key="index"
          :gutter="10"
          class="filter-item"
        >
          <el-col :span="4">
            <span>{{ item.name }}</span>
          </el-col>
          <el-col :span="8">
            <el-select v-model="item.compare" placeholder="请选择">
              <el-option-group
                v-for="(group, gIdx) in options"
                :key="gIdx"
                :label="group.label"
              >
                <el-option
                  v-for="compare in group.options"
                  :key="compare.value"
                  :label="compare.label"
                  :value="compare.value"
                />
              </el-option-group>
            </el-select>
          </el-col>
          <el-col :span="6">
            <el-input v-model="item.value" clearable placeholder="过滤值" />
          </el-col>
          <el-col :span="6">
            <el-button
              icon="el-icon-delete"
              style="float: right"
              @click="deleteCriteria(index)"
            />
          </el-col>
        </el-row>
      </div>
    </div>
    <div v-else-if="fieldType == 'dimension'">
      <el-row :gutter="10" style="margin-bottom: 10px">
        <el-radio-group v-model="radio">
          <!-- <el-radio :label="2">逻辑条件</el-radio> -->
          <el-radio :label="1">字段枚举值</el-radio>
        </el-radio-group>
      </el-row>
      <div v-show="radio == 2">
        <el-row :gutter="10" style="margin-bottom: 10px">
          <el-col :span="2">
            <el-button
              icon="el-icon-plus"
              size="small"
              circle
              @click="addCriteria"
            />
          </el-col>
          <el-col :span="6">
            <el-radio-group
              v-show="criteriaArr.length > 1"
              v-model="assert"
              size="small"
            >
              <el-radio-button label="与" />
              <el-radio-button label="或" />
            </el-radio-group>
          </el-col>
        </el-row>
        <div class="criteria-box">
          <el-row
            v-for="(item, index) in criteriaArr"
            :key="index"
            :gutter="10"
            class="filter-item"
          >
            <el-col :span="4">
              <span>{{ item.name }}</span>
            </el-col>
            <el-col :span="8">
              <el-select v-model="item.compare" placeholder="请选择">
                <el-option-group
                  v-for="(group, gIdx) in options"
                  :key="gIdx"
                  :label="group.label"
                >
                  <el-option
                    v-for="compare in group.options"
                    :key="compare.value"
                    :label="compare.label"
                    :value="compare.value"
                  />
                </el-option-group>
              </el-select>
            </el-col>
            <el-col :span="6">
              <el-input v-model="item.value" clearable placeholder="过滤值" />
            </el-col>
            <el-col :span="6">
              <el-button
                icon="el-icon-delete"
                style="float: right"
                @click="deleteCriteria(index)"
              />
            </el-col>
          </el-row>
        </div>
      </div>
      <div v-show="radio == 1">
        <el-row :gutter="10" style="margin-bottom: 10px">
          <el-col :span="2">
            <p>过滤值</p>
          </el-col>
          <el-col :span="6">
            <el-select
              v-model="dimensionFilterValue"
              multiple
              collapse-tags
              clearable
              placeholder="请选择"
            >
              <el-option
                v-for="item in dimensionOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-col>
        </el-row>
      </div>
    </div>

    <span slot="footer">
      <el-button @click="handleClose">取 消</el-button>
      <el-button type="primary" @click="submit">确 定</el-button>
    </span>
  </el-dialog>
</template>

<script>
export default {
  name: 'SetFilter',
  props: {
    visible: {
      type: Boolean,
      required: true,
      default: false
    },
    name: {
      type: String,
      required: true
    },
    id: {
      type: String,
      required: true
    },
    fieldType: {
      type: String,
      required: true
    },
    criteria: {
      type: Array,
      default: () => {
        return []
      }
    },
    tabRadio: {
      type: Number,
      default: 1
    },
    tabAssert: {
      type: String,
      default: '与'
    }
  },
  data() {
    return {
      assert: '与',
      options: [
        {
          label: '',
          options: [
            {
              value: '==',
              label: '等于'
            },
            {
              value: '!=',
              label: '不等于'
            }
          ]
        },
        {
          label: '',
          options: [
            {
              value: '<',
              label: '小于'
            },
            {
              value: '>',
              label: '大于'
            }
          ]
        },
        {
          label: '',
          options: [
            {
              value: '<=',
              label: '小于等于'
            },
            {
              value: '>=',
              label: '大于等于'
            }
          ]
        }
      ],
      value: '',
      radio: 1,
      dimensionFilterValue: '',
      dimensionOptions: [],
      // 过滤逻辑条件数组
      criteriaArr: []
    }
  },

  created() {
    this.radio = this.tabRadio
    this.assert = this.tabAssert
    if (this.radio === 1) {
      this.dimensionFilterValue = this.criteria.map((e) => e.value)
      this.criteriaArr = [...this.criteria]
    }
    if (this.name === '年度') {
      this.dimensionOptions = [
        { label: '2020', value: '2020' },
        { label: '2021', value: '2021' },
        { label: '2022', value: '2022' },
        { label: '2024', value: '2024' }
      ]
    }
    if (this.name === '工厂') {
      this.dimensionOptions = [
        { label: '广东科技', value: '广东科技' },
        { label: '武汉联塑', value: '武汉联塑' },
        { label: '贵阳联塑', value: '贵阳联塑' }
      ]
    }
    if (this.name === '车间') {
      this.dimensionOptions = [
        { label: '配件车间', value: '配件车间' },
        { label: '管材车间', value: '管材车间' }
      ]
    }
  },

  methods: {
    // 添加过滤条件
    addCriteria() {
      this.criteriaArr.push({ name: this.name, compare: '==', value: '' })
    },
    // 删除过滤条件
    deleteCriteria(index) {
      this.criteriaArr.splice(index, 1)
    },
    submit() {
      let obj = {}
      if (
        (this.fieldType === 'dimension' && this.radio === 1) ||
        this.fieldType === 'quota'
      ) {
        for (const rec of this.criteriaArr) {
          if (!rec.value) {
            this.$message.error('过滤值不能为空')
            return
          }
        }
        obj = {
          fieldType: this.fieldType,
          radio: this.radio,
          id: this.id,
          name: this.name,
          assert: this.assert,
          criteriaArr: this.criteriaArr
        }
      }
      if (this.fieldType === 'dimension' && this.radio === 1) {
        if (!this.dimensionFilterValue.length) {
          this.$message.error('过滤值不能为空')
          return
        }
        obj = {
          fieldType: this.fieldType,
          radio: this.radio,
          id: this.id,
          name: this.name,
          assert: '或',
          criteriaArr: this.dimensionFilterValue.map((e) => {
            return { name: this.name, compare: '==', value: e }
          })
        }
      }

      this.$emit('getFilterCriteria', obj)
      this.handleClose()
    },
    handleClose() {
      this.$parent.closeDialog('setFilter')
    }
  }
}
</script>
<style lang="scss" scoped>
.criteria-box {
  max-height: 50vh;
  overflow-y: auto;
  .filter-item {
    width: 100%;
    border-radius: 4px;
    border: 1px solid #dcdfe6;
    padding: 4px 14px;
    margin: 10px 0px !important;
    display: flex;
    justify-content: left;
    align-items: center;
  }
}
</style>
