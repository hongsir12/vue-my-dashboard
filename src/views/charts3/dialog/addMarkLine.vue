<template>
  <el-dialog
    :visible="visible"
    width="70%"
    title="辅助线"
    :before-close="handleClose"
    :close-on-click-modal="false"
  >
    <el-row :gutter="10" style="margin-bottom: 10px">
      <el-col :span="2">
        <el-button icon="el-icon-plus" size="small" circle @click="addLine" />
      </el-col>
    </el-row>
    <div class="criteria-box">
      <el-row
        v-for="(item, index) in markLineArr"
        :key="index"
        :gutter="10"
        class="filter-item"
      >
        <el-col :span="6">
          <el-input v-model="item.text" clearable placeholder="文本值" />
        </el-col>
        <el-col :span="6">
          <el-input v-model.number="item.value" clearable placeholder="值" />
        </el-col>
        <el-col :span="8">
          <el-select v-model="item.type" placeholder="请选择线类型">
            <el-option
              v-for="e in options"
              :key="e.value"
              :label="e.label"
              :value="e.value"
            />
          </el-select>
        </el-col>
        <el-col :span="2">
          <el-color-picker v-model="item.color" />
        </el-col>
        <el-col :span="6">
          <el-button
            icon="el-icon-delete"
            style="float: right"
            @click="deleteLine(index)"
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
  name: 'AddMarkLine',
  props: {
    visible: {
      type: Boolean,
      required: true,
      default: false
    },
    markLineSettings: {
      type: Array,
      default: () => {
        return []
      }
    }
  },
  data() {
    return {
      markLineArr: [],
      options: [
        { label: '实线', value: 1 },
        { label: '虚线', value: 2 },
        { label: '点', value: 3 }
      ]
    }
  },

  beforeMount() {
    this.markLineArr = this._.cloneDeep(this.markLineSettings)
  },

  methods: {
    addLine() {
      this.markLineArr.push({
        text: '辅助线',
        value: 0,
        type: 1,
        color: '#0000ff'
      })
    },
    deleteLine(index) {
      this.markLineArr.splice(index, 1)
    },
    submit() {
      for (const rec of this.markLineArr) {
        if (!rec.text) {
          this.$message.error('文本值不能为空')
          return
        }
        if (!rec.value) {
          this.$message.error('值不能为空')
          return
        }
      }
      this.$emit('getMarkLineArr', this.markLineArr)
      this.handleClose()
    },
    handleClose() {
      this.$parent.closeDialog('addMarkLine')
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
