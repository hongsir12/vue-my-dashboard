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
    <ve-pie
      :after-set-option="afterSetOption"
      height="350px"
      :data="data"
      :settings="chartSettings"
      :events="events"
    />
  </div>
</template>

<script>
export default {
  name: 'VPie',
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
      instance: null, // echart实例
      currentDimens: '', // 当前维度
      events: {},
      data: {},
      dataRowsMap: {},
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
    this.events = this.initEvents()
    this.currentDimens =
      this.dimensionOptions.length > 0 ? this.dimensionOptions[0].value : ''
    this.handleData(this.currentDimens, this.chartData)
    this.chartSettings = Object.assign({}, this.defaultSetting)
  },
  mounted() {
  },
  methods: {
    afterSetOption() {
      console.log(arguments)
      this.instance = arguments[0]
    },
    initEvents() {
      return {
        click: (v) => {
          console.log(v)
          console.log(this.dataRowsMap[v.data.name])
        }
      }
    },
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
      this.dataRowsMap = map
      for (const k in map) {
        const obj = { ...map[k] }
        obj[dimens] = k
        rows.push(obj)
      }
      const columns = [dimens, ...columnOptions]
      this.data = {
        columns,
        rows
      }
    }
  }
}
</script>
