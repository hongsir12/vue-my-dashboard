<template>
  <div>
    <el-select
      v-model="currentDimens"
      placeholder="请选择维度"
      @change="handleData($event, chartData)"
    >
      <el-option
        v-for="item in dimensionOptions"
        :key="item.value"
        :label="item.label"
        :value="item.value"
      />
    </el-select>
    <ve-bar height="350px" :data="data" :settings="chartSettings" />
  </div>
</template>

<script>
export default {
  name: 'VBar',
  props: {
    chartData: {
      type: Array,
      default: () => {
        return {
          columns: [],
          rows: []
        }
      }
    },
    settings: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  data() {
    return {
      currentDimens: '', // 当前维度
      data: {},
      defaultSetting: {
        title: {
          text: '第一'
        }
      }
    }
  },
  computed: {
    dimensionOptions() {
      if (this.settings.dimensionOptions) {
        return this.settings.dimensionOptions.map((e) => {
          return { label: e, value: e }
        })
      }
      return []
    }
  },
  beforeMount() {
    this.currentDimens =
      this.dimensionOptions.length > 0 ? this.dimensionOptions[0].value : ''
    this.handleData(this.currentDimens, this.chartData)
    this.chartSettings = Object.assign({}, this.defaultSetting)
  },

  methods: {
    handleData(dimens, data) {
      const rows = []
      const map = {}
      const { columnOptions } = this.settings
      data.forEach((e) => {
        map[e[dimens]] = map[e[dimens]] || {}
        columnOptions.forEach((quota) => {
          map[e[dimens]][quota] = map[e[dimens]][quota] || 0
          map[e[dimens]][quota] += +e[quota]
        })
      })
      for (const k in map) {
        const obj = { ...map[k] }
        obj[dimens] = k
        rows.push(obj)
      }
      console.log(rows)
      const columns = [dimens, ...columnOptions]
      this.data = {
        columns,
        rows
      }
    }
  }
}
</script>
