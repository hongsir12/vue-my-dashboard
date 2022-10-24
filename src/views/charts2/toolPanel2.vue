<template>
  <div class="toolPanel" :style="{ display: show ? 'flex' : 'none' }">
    <el-tabs v-model="activeName" stretch style="flex: 1">
      <el-tab-pane label="数据" name="first">
        <div class="data-box el-row">
          <div class="data-left">
            <div class="top">
              <span>维度</span>
              <draggable
                animation="300"
                class="list-group"
                :list="dimensionsCopy"
                :options="{
                  group: { name: 'all', pull: 'clone' },
                  sort: true
                }"
                :move="onMove"
                @end="endL2R('dimens')"
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
            <div class="bottom">
              <span>指标</span>
              <draggable
                animation="300"
                class="list-group"
                :list="quotasCopy"
                :options="{
                  group: { name: 'all', pull: 'clone' },
                  sort: true
                }"
                :move="onMove"
                @end="endL2R('quotas')"
              >
                <el-tag
                  v-for="quota in quotasCopy"
                  :key="quota.id"
                  type="success"
                  class="list-group-item"
                >
                  {{ quota.name }}</el-tag
                >
              </draggable>
            </div>
          </div>
          <div class="data-right">
            <div class="dimensionStyle">
              <span>类别轴/维度</span>
              <div class="drag-block-style">
                <draggable
                  v-model="selectedDimens"
                  group="all"
                  animation="300"
                  class="list-group"
                  :move="onMove"
                  @end="endR2L('dimens')"
                >
                  <div
                    v-for="item in selectedDimens"
                    :key="item.id"
                    class="list-group-item"
                  >
                    <el-dropdown
                      trigger="click"
                      @command="handleDimensCommand($event, item.name)"
                    >
                      <span class="el-dropdown-link el-dropdown-span">
                        <el-tag
                          >{{ item.name
                          }}<i class="el-icon-arrow-down el-icon--right"
                        /></el-tag>
                      </span>
                      <el-dropdown-menu slot="dropdown">
                        <el-dropdown-item command="ascDimens"
                          ><i
                            v-show="item.sort == 1 ? true : false"
                            class="el-icon-check"
                          />升序</el-dropdown-item
                        >
                        <el-dropdown-item command="descDimens"
                          ><i
                            v-show="item.sort == -1 ? true : false"
                            class="el-icon-check"
                          />降序</el-dropdown-item
                        >
                      </el-dropdown-menu>
                    </el-dropdown>
                  </div>
                </draggable>
              </div>
            </div>
            <div class="quotaStyle">
              <span>值轴/指标</span>
              <div class="drag-block-style">
                <draggable
                  v-model="selectedQuotas"
                  animation="300"
                  group="all"
                  class="list-group"
                  :move="onMove"
                  @end="endR2L('quotas')"
                >
                  <div
                    v-for="item in selectedQuotas"
                    :key="item.id"
                    class="list-group-item"
                  >
                    <el-dropdown>
                      <span class="el-dropdown-link el-dropdown-span">
                        <el-tag type="success"
                          >{{ item.name
                          }}<i class="el-icon-arrow-down el-icon--right"
                        /></el-tag>
                      </span>
                      <el-dropdown-menu slot="dropdown">
                        <el-dropdown-item command="ascDimens"
                          ><i
                            v-show="item.sort == 1 ? true : false"
                            class="el-icon-check"
                          />升序</el-dropdown-item
                        >
                        <el-dropdown-item command="descDimens"
                          ><i
                            v-show="item.sort == -1 ? true : false"
                            class="el-icon-check"
                          />降序</el-dropdown-item
                        >
                      </el-dropdown-menu>
                    </el-dropdown>
                  </div>
                </draggable>
              </div>
            </div>
            <div class="filterStyle">
              <span>过滤器</span>
              <div class="drag-block-style">
                <draggable
                  v-model="filterFields"
                  animation="300"
                  group="all"
                  class="list-group"
                  :move="onMove"
                  @end="endR2L('filter')"
                >
                  <div
                    v-for="item in filterFields"
                    :key="item.id"
                    class="list-group-item"
                  >
                    <el-dropdown
                      trigger="click"
                      @command="handleFilterCommand($event, item.name)"
                    >
                      <span class="el-dropdown-link el-dropdown-span">
                        <el-tag
                          :type="
                            dimensions.filter((e) => e.id === item.id).length >
                            0
                              ? ''
                              : 'success'
                          "
                          >{{ item.name
                          }}<i class="el-icon-arrow-down el-icon--right"
                        /></el-tag>
                      </span>
                      <el-dropdown-menu slot="dropdown">
                        <el-dropdown-item command="setFilterDialog"
                          >过滤</el-dropdown-item
                        >
                      </el-dropdown-menu>
                    </el-dropdown>
                  </div>
                </draggable>
              </div>
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
      moveId: '', // 移动的维度指标id
      dimensionsCopy: [], // 可选维度
      selectedDimens: [], // 选择的维度
      quotasCopy: [], // 可选指标
      selectedQuotas: [], // 选择的指标
      filterFields: [] // 过滤的字段
    }
  },
  created() {
    this.dimensionsCopy = this.dimensions.map((e) => {
      e.sort = 0
      return e
    })
    this.quotasCopy = this.quotas.map((e) => {
      e.sort = 0
      return e
    })
  },

  methods: {
    // 获取正在拖动的维度指标
    onMove(e, type) {
      this.moveId = e.draggedContext.element.id
    },
    // 左到右拖拽结束事件
    endL2R(type) {
      this.filterFields = this.$utils.unique(this.filterFields, 'id')
      switch (type) {
        case 'dimens':
          this.selectedDimens = this.$utils.unique(this.selectedDimens, 'id')
          this.selectedQuotas = this.selectedQuotas.filter(
            (quota) => quota.id !== this.moveId
          )
          break
        case 'quotas':
          this.selectedQuotas = this.$utils.unique(this.selectedQuotas, 'id')
          this.selectedDimens = this.selectedDimens.filter(
            (dimen) => dimen.id !== this.moveId
          )
          break
        default:
          break
      }
      this.moveId = ''
      this.dimensionsCopy = [...this.dimensions]
      this.quotasCopy = [...this.quotas]
      const obj = {
        dimensions: this.selectedDimens,
        quotas: this.selectedQuotas
      }
      this.changeDimensionsAndQuotas(obj)
    },
    endR2L(type) {
      switch (type) {
        case 'dimens':
          this.dimensionsCopy = this.$utils.unique(this.dimensionsCopy, 'id')
          this.quotasCopy = this.quotasCopy.filter(
            (quota) => quota.id !== this.moveId
          )
          break
        case 'quotas':
          this.quotasCopy = this.$utils.unique(this.quotasCopy, 'id')
          this.dimensionsCopy = this.dimensionsCopy.filter(
            (dimen) => dimen.id !== this.moveId
          )
          break
        case 'filter':
          this.dimensionsCopy = [...this.dimensions]
          this.quotasCopy = [...this.quotas]
          this.$emit('getRemoveFilterId', this.moveId)
          break
        default:
          break
      }
      const obj = {
        dimensions: this.selectedDimens,
        quotas: this.selectedQuotas
      }
      this.changeDimensionsAndQuotas(obj)
    },
    // 下拉菜单排序选项事件
    handleDimensCommand(command, name) {
      switch (command) {
        case 'ascDimens':
          this.$set(
            this.selectedDimens.filter((e) => e.name === name)[0],
            'sort',
            1
          )
          this.$emit('sortDimens', name, 'asc')
          break
        case 'descDimens':
          this.$set(
            this.selectedDimens.filter((e) => e.name === name)[0],
            'sort',
            -1
          )
          this.$emit('sortDimens', name, 'desc')
          break
        default:
          break
      }
      this.$forceUpdate()
    },
    // 过滤器事件
    handleFilterCommand(command, name) {
      switch (command) {
        case 'setFilterDialog':
          this.$emit('getCurrentFilterName', name)
          this.$parent.showDialog('setFilter')
          break
        default:
          break
      }
    },
    // 传值父组件选中的维度跟指标
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
    padding: 2px;
    .list-group-item {
      width: 100%;
      margin: 2px 0;
      .el-dropdown {
        width: 100%;
        .el-dropdown-span {
          display: inline-block;
          width: 100%;
          .el-tag {
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
        }
      }
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
