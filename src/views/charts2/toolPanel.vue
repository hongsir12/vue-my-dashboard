<template>
  <div class="toolPanel" :style="{ display: show ? 'flex' : 'none' }">
    <el-tabs v-model="activeName" stretch style="flex: 1">
      <el-tab-pane label="数据" name="first">
        <div class="data-box el-row">
          <div class="data-left">
            <div class="top">
              <span>维度</span>
              <div class="drag-list">
                <draggable
                  class="list-group"
                  :list="dimensionsCopy"
                  :options="{
                    group: { name: 'dimensions', pull: 'clone' },
                    sort: true
                  }"
                  :move="onMove"
                  @end="end1"
                >
                  <el-tag
                    v-for="dimens in dimensionsCopy"
                    :key="dimens.id"
                    class="list-group-item"
                  >
                    {{ dimens.name }}</el-tag
                  >
                </draggable>
              </div>
            </div>
            <div class="bottom">
              <span>指标</span>
              <div class="drag-list">
                <draggable
                  class="list-group"
                  :list="quotasCopy"
                  :options="{
                    group: { name: 'quotas', pull: 'clone' },
                    sort: true
                  }"
                  :move="onMove"
                  @end="end1"
                >
                  <el-tag
                    v-for="quota in quotasCopy"
                    :key="quota.id"
                    class="list-group-item"
                  >
                    {{ quota.name }}</el-tag
                  >
                </draggable>
              </div>
            </div>
          </div>
          <div class="data-right">
            <span>图表类型</span>
            <el-cascader
              v-model="vType"
              :show-all-levels="false"
              :options="vTypeOptions"
            />
            <span>类别轴/维度</span>
            <div class="drag-block-style">
              <draggable
                v-model="selectedDimens"
                group="dimensions"
                animation="300"
                class="list-group"
                :move="onMove"
                @end="end2"
              >
                <div
                  v-for="item in selectedDimens"
                  :key="item.id"
                  class="list-group-item"
                >
                  <el-dropdown
                    size="mini"
                    split-button
                    type="primary"
                    style="width: 100%"
                    @command="handleDimensCommand($event, item.name)"
                  >
                    {{ item.name }}
                    <el-dropdown-menu slot="dropdown">
                      <el-dropdown-item command="ascDimens"
                        >升序</el-dropdown-item
                      >
                      <el-dropdown-item command="descDimens"
                        >降序</el-dropdown-item
                      >
                    </el-dropdown-menu>
                  </el-dropdown>
                </div>
              </draggable>
            </div>
            <span>值轴/指标</span>
            <div class="drag-block-style">
              <draggable
                v-model="selectedQuotas"
                group="quotas"
                animation="300"
                class="list-group"
                :move="onMove"
                @end="end2"
              >
                <div
                  v-for="item in selectedQuotas"
                  :key="item.id"
                  class="list-group-item"
                >
                  <el-dropdown
                    size="mini"
                    split-button
                    type="primary"
                    style="width: 100%"
                  >
                    {{ item.name }}
                    <el-dropdown-menu slot="dropdown">
                      <el-dropdown-item>升序</el-dropdown-item>
                      <el-dropdown-item>降序</el-dropdown-item>
                    </el-dropdown-menu>
                  </el-dropdown>
                </div>
              </draggable>
            </div>
            <span>过滤器</span>
            <div class="drag-block-style">
              <draggable
                v-model="selectedQuotas"
                group="quotas"
                animation="300"
                class="list-group"
              />
            </div>
          </div>
        </div>
      </el-tab-pane>
      <el-tab-pane label="样式" name="second">
        <el-button>样式</el-button>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import draggable from 'vuedraggable'
export default {
  name: 'VueAdminTemplateToolPanel',
  components: { draggable },
  props: {
    show: {
      type: String,
      required: true
    },
    // 图表数据
    charData: {
      type: Array,
      default: () => {
        return []
      }
    },
    // 维度
    dimensions: {
      type: Array,
      default: () => {
        return []
      }
    },
    // 指标
    quotas: {
      type: Array,
      default: () => {
        return []
      }
    }
  },
  data() {
    return {
      activeName: 'first',
      dimensionsCopy: [], // 可选维度
      selectedDimens: [], // 选择的维度
      moveId: '', // 移动的维度id
      quotasCopy: [], // 可选指标
      selectedQuotas: [], // 选择的指标
      vType: '',
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
      ]
    }
  },
  created() {
    this.dimensionsCopy = [...this.dimensions]
    this.quotasCopy = [...this.quotas]
  },

  methods: {
    end1(e) {
      this.selectedDimens = this.$utils.unique(this.selectedDimens, 'id')
      this.selectedQuotas = this.$utils.unique(this.selectedQuotas, 'id')
      const obj = {
        dimensions: this.selectedDimens,
        quotas: this.selectedQuotas
      }
      this.changeDimensionsAndQuotas(obj)
    },
    end2(e) {
      this.dimensionsCopy = this.$utils.unique(this.dimensionsCopy, 'id')
      this.quotasCopy = this.$utils.unique(this.quotasCopy, 'id')
      const obj = {
        dimensions: this.selectedDimens,
        quotas: this.selectedQuotas
      }
      this.changeDimensionsAndQuotas(obj)
    },
    onMove(e) {
      this.moveId = e.draggedContext.element.id
    },
    handleDimensCommand(command, name) {
      switch (command) {
        case 'ascDimens':
          this.$emit('sortDimens', name, 'asc')
          break
        case 'descDimens':
          this.$emit('sortDimens', name, 'desc')
          break
        default:
          break
      }
    },
    changeDimensionsAndQuotas(val) {
      this.$emit('getDimensionsAndQuotas', val)
    }
  }
}
</script>
<style lang="scss" scoped>
.el-row {
  display: flex;
  height: 100%;
}
::v-deep .is-top {
  margin: 0 !important;
}
::v-deep .el-tabs__content {
  height: 100% !important;
  .el-tab-pane {
    height: 100% !important;
  }
}
.toolPanel {
  width: 100%;
  height: 100%;
  transition: 1s;
  border: 1px solid #ccc;
  .list-group {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-height: 20px;
    .list-group-item {
      width: 100%;
      border: 1px solid #ccc;
    }
  }
  .data-box {
    height: 100%;
    .data-left {
      flex: 1;
      display: flex;
      flex-direction: column;
      border-right: 1px solid #ccc;
      .top {
        padding: 5px;
        flex: 1;
      }
      .bottom {
        padding: 5px;
        flex: 1;
        border-top: 1px solid #ccc;
      }
    }
    .data-right {
      padding: 5px;
      width: 55%;
      .drag-block-style {
        padding: 2px 0 0 0;
        width: 100%;
        min-height: 32px;
        border-radius: 4px;
        border: 1px solid #dcdfe6;
        overflow-x: hidden;
        display: -webkit-box;
        display: -ms-flexbox;
        display: flex;
        -webkit-box-align: center;
        -ms-flex-align: center;
        align-items: center;
        background-color: #fff;
        ::v-deep .el-button-group {
          display: flex;
        }
        ::v-deep .el-button-group {
          display: flex;
          .el-button:first-child {
            flex: 1;
          }
        }
      }
    }
  }
}
</style>
