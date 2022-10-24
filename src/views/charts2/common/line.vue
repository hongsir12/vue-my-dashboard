<template>
  <div style="width: 100%">
    <ve-line
      height="350px"
      :data="finalData"
      :title="title"
      :settings="chartSettings"
    />
  </div>
</template>

<script>
export default {
  props: {
    vType: {
      type: String,
      required: true
    },
    // 全部数据
    vData: {
      type: Array,
      default: () => {
        return []
      }
    },
    // 维度排序
    sortDimens: {
      type: Object,
      default: () => {
        return {}
      }
    },
    // 维度
    selectedDimensions: {
      type: Array,
      required: true
    },
    // 指标
    selectedQuotas: {
      type: Array,
      required: true
    },
    // 数据过滤条件
    filterCriteria: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  data() {
    return {
      chartSettings: {},
      title: {
        text: '第一',
        left: 'auto'
      },
      data: {},
      finalData: {},
      compareMap: {
        '>': (item, name, value) => {
          return item[name] > value
        },
        '<': (item, name, value) => {
          return item[name] < value
        },
        '==': (item, name, value) => {
          return item[name] === value
        },
        '!=': (item, name, value) => {
          return item[name] !== value
        },
        '<=': (item, name, value) => {
          return item[name] <= value
        },
        '>=': (item, name, value) => {
          return item[name] >= value
        }
      }
    }
  },
  computed: {
    // finalData() {
    //   return this.filterVData(this.vData, this.sortDimens, this.filterCriteria)
    // }
  },
  watch: {
    selectedDimensions: {
      handler(newVal) {
        this.finalData = this.filterVData(
          this.vData,
          this.sortDimens,
          this.filterCriteria
        )
      },
      deep: true
    },
    selectedQuotas: {
      handler(newVal) {
        this.finalData = this.filterVData(
          this.vData,
          this.sortDimens,
          this.filterCriteria
        )
      },
      deep: true
    },
    filterCriteria: {
      handler(newVal) {
        this.finalData = this.filterVData(this.vData, this.sortDimens, newVal)
      },
      deep: true
    }
  },

  mounted() {
    this.finalData = this.filterVData(
      this.vData,
      this.sortDimens,
      this.filterCriteria
    )
  },

  methods: {
    // 字段过滤条件筛选数据
    filterCriteriaData(vData, filterCriteria) {
      let data = [...vData]
      const that = this
      for (const k in filterCriteria) {
        filterCriteria[k].criteriaArr.forEach((criteria) => {
          console.log(criteria.name, criteria.compare, criteria.value)
          data = data.filter((item) => {
            return that.compareMap[criteria.compare](
              item,
              criteria.name,
              criteria.value
            )
          })
        })
      }
      console.log(data)
      return data
    },
    handleDimensSort(vData, sortDimens, selectedDimensions) {
      const orders = []
      const iteratees = []
      for (const dimen of selectedDimensions) {
        iteratees.push(dimen)
        for (const k in sortDimens) {
          if (sortDimens[k].includes(dimen)) {
            orders.push(k)
          }
        }
      }
      console.log(iteratees, orders)
      const data = this._.orderBy(vData, iteratees, orders)
      return data
    },
    handleColumns(dimensions, quotas) {
      // 只选了一个维度
      if (dimensions.length === 1) {
        return [...dimensions, ...quotas]
      }
      // 选了多个维度
      if (dimensions.length > 1) {
        return ['维度', ...quotas]
      }
      return []
    },
    handleRows(vData, dimensions, quotas) {
      const map = {}
      if (dimensions.length === 1) {
        const rows = []
        vData.forEach((e) => {
          map[e[dimensions[0]]] = map[e[dimensions[0]]] || {}
          quotas.forEach((quota) => {
            map[e[dimensions[0]]][quota] = map[e[dimensions[0]]][quota] || 0
            map[e[dimensions[0]]][quota] += +e[quota]
          })
        })
        for (const k in map) {
          const obj = { ...map[k] }
          obj[dimensions[0]] = k
          rows.push(obj)
        }
        return rows
      }
      if (dimensions.length > 1) {
        const rows = []
        vData.forEach((e) => {
          let str = ''
          dimensions.forEach((dimes) => {
            str += `${e[dimes]}\n`
          })
          map[str] = map[str] || {}
          quotas.forEach((quota) => {
            map[str][quota] = map[str][quota] || 0
            map[str][quota] += +e[quota]
          })
        })
        for (const k in map) {
          const obj = { ...map[k] }
          obj['维度'] = k
          rows.push(obj)
        }
        return rows
      }
      return []
    },
    filterVData(vData, sortDimens, filter = {}) {
      const sortedData = this.handleDimensSort(
        vData,
        sortDimens,
        this.selectedDimensions
      )
      const columns = this.handleColumns(
        this.selectedDimensions,
        this.selectedQuotas
      )
      const data = this.handleRows(
        sortedData,
        this.selectedDimensions,
        this.selectedQuotas
      )
      const filterData = this.filterCriteriaData(data, filter)

      return {
        columns: columns,
        rows: filterData
      }
    }
  }
}
</script>
