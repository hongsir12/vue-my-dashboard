<template>
  <el-dialog
    :visible="visible"
    width="50%"
    title="添加过滤"
    :before-close="handleClose"
    :close-on-click-modal="false"
  >
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
          <el-input v-model="item.value" placeholder="过滤值" />
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
      criteriaArr: []
    }
  },

  mounted() {},

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
      for (const rec of this.criteriaArr) {
        if (!rec.value) {
          this.$message.error('过滤值不能为空')
          return
        }
      }
      const obj = {
        name: this.name,
        assert: this.assert,
        criteriaArr: this.criteriaArr
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
