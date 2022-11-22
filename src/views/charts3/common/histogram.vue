<template>
  <div style="width: 100%">
    <ve-histogram
      height="700px"
      :data="finalData"
      :title="titleSetting"
      :settings="settings"
    />
  </div>
</template>

<script>
export default {
  props: {
    title: {
      type: String,
      default: ''
    },
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
      type: Array,
      default: () => {
        return []
      }
    }
  },
  data() {
    return {
      titleSetting: {
        text: '标题',
        left: 'auto'
      },
      chartSettings: {},
      finalData: {},
      compareMap: {
        '>': (name, value) => {
          return `e['${name}'] > ${value}`
        },
        '<': (name, value) => {
          return `e['${name}'] <  ${value}`
        },
        '==': (name, value) => {
          return `e['${name}'] ===  ${value}`
        },
        '!=': (name, value) => {
          return `e['${name}'] !==  ${value}`
        },
        '<=': (name, value) => {
          return `e['${name}'] <=  ${value}`
        },
        '>=': (name, value) => {
          return `e['${name}'] >=  ${value}`
        }
      }
    }
  },
  computed: {
    settings() {
      return this.chartSettings
    },
    selectedDimensionsCopy() {
      return this.selectedDimensions
    },
    selectedQuotasCopy() {
      return this.selectedQuotas
    }
  },
  watch: {
    title: {
      handler(newVal) {
        this.titleSetting.text = newVal
      },
      immediate: true
    },
    vType: {
      handler(newVal) {
        console.log(newVal)
        switch (newVal) {
          case 'stackHistogram':
            this.chartSettings = {
              stack: { 堆叠: [...this.selectedQuotasCopy.map((e) => e.name)] }
            }
            break
          default:
            this.chartSettings = {}
            break
        }
      },
      immediate: true
    },
    vData: {
      handler(newVal) {},
      deep: true
    },
    selectedDimensionsCopy: {
      handler(newVal) {
        if (this.vType === 'stackHistogram') {
          this.chartSettings = {
            stack: { 堆叠: [...this.selectedQuotasCopy.map((e) => e.name)] }
          }
        }
        this.finalData = this.generateFinalData(
          this.vData,
          this.sortDimens,
          this.filterCriteria
        )
      },
      deep: true
    },
    selectedQuotasCopy: {
      handler(newVal) {
        if (this.vType === 'stackHistogram') {
          this.chartSettings = {
            stack: { 堆叠: [...this.selectedQuotasCopy.map((e) => e.name)] }
          }
        }

        this.finalData = this.generateFinalData(
          this.vData,
          this.sortDimens,
          this.filterCriteria
        )
      },
      deep: true
    },
    sortDimens: {
      handler(newVal) {
        this.finalData = this.generateFinalData(
          this.vData,
          this.sortDimens,
          newVal
        )
      },
      deep: true
    },
    filterCriteria: {
      handler(newVal) {
        this.finalData = this.generateFinalData(
          this.vData,
          this.sortDimens,
          newVal
        )
      },
      deep: true
    }
  },

  mounted() {
    this.finalData = this.generateFinalData(
      this.vData,
      this.sortDimens,
      this.filterCriteria
    )
  },

  methods: {
    handleDimensSort(vData, sortDimens, selectedDimensions) {
      console.log('排序map', sortDimens)
      const orders = []
      const iteratees = []
      for (const dimen of selectedDimensions) {
        if (sortDimens[dimen.name]) {
          iteratees.push(dimen.name)
          sortDimens[dimen.name] === 1
            ? orders.push('asc')
            : orders.push('desc')
        }
      }
      console.log({ iteratees, orders })
      const data = this._.orderBy(vData, iteratees, orders)
      return data
    },
    handleColumns(dimensions, quotas) {
      // 只选了一个维度
      if (dimensions.length) {
        return ['维度', ...quotas]
      }
      // // 选了多个维度
      // if (dimensions.length > 1) {
      //   return ['维度', ...quotas]
      // }
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
          obj['维度'] = k
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
    filterCriteriaData(data, filterCriteria) {
      let filterData = [...data]
      const that = this
      console.log(filterCriteria)
      if (!filterCriteria.length) {
        return filterData
      }
      const map = {}
      filterCriteria.forEach((e) => {
        map[e.fieldType] = map[e.fieldType] || {}
        map[e.fieldType][e.assert] = map[e.fieldType][e.assert] || []
        map[e.fieldType][e.assert].push(e)
      })
      console.log(map)
      const evalStr = this.generateEvalStr(map)
      filterData = filterData.filter((e) => {
        return Function(evalStr)(e)
      })
      return filterData
    },
    // 生成数据数组过滤条件
    generateEvalStr(criteria) {
      const typeArr = []
      let res = ''
      for (const k in criteria) {
        if (k === 'dimension') {
          for (const ck in criteria[k]) {
            let str = ''
            if (ck === '或') {
              let ckArr = []
              criteria[k][ck].forEach((dimen) => {
                const arr = dimen.criteriaArr.map((item) => {
                  return `e['维度'].includes('${item.value}')`
                })
                const arrStr = arr.join('||')
                ckArr.push(arrStr)
              })
              ckArr = ckArr.map((e) => {
                return `(${e})`
              })
              str += ckArr.join('&&')
              typeArr.push(str)
            }
          }
        }
        if (k === 'quota') {
          for (const ck in criteria[k]) {
            let str = ''
            if (ck === '或') {
              let ckArr = []
              criteria[k][ck].forEach((quota) => {
                const arr = quota.criteriaArr.map((item) => {
                  return this.compareMap[item.compare](item.name, item.value)
                })
                const arrStr = arr.join('||')
                ckArr.push(arrStr)
              })
              ckArr = ckArr.map((e) => {
                return `(${e})`
              })
              str += ckArr.join('&&')
              typeArr.push(str)
            }
            if (ck === '与') {
              let ckArr = []
              criteria[k][ck].forEach((quota) => {
                const arr = quota.criteriaArr.map((item) => {
                  return this.compareMap[item.compare](item.name, item.value)
                })
                const arrStr = arr.join('&&')
                ckArr.push(arrStr)
              })
              ckArr = ckArr.map((e) => {
                return `(${e})`
              })
              str += ckArr.join('&&')
              typeArr.push(str)
            }
          }
        }
      }
      res = typeArr.join('&&')
      return res
    },
    generateFinalData(vData, sortDimens, filter = {}) {
      console.log('触发生成最终数据')
      const sortedData = this.handleDimensSort(
        vData,
        sortDimens,
        this.selectedDimensions
      )
      const columns = this.handleColumns(
        this.selectedDimensionsCopy.map((e) => e.name),
        this.selectedQuotasCopy.map((e) => e.name)
      )
      const data = this.handleRows(
        sortedData,
        this.selectedDimensionsCopy.map((e) => e.name),
        this.selectedQuotasCopy.map((e) => e.name)
      )
      const filteredData = this.filterCriteriaData(data, filter)
      return {
        columns,
        rows: filteredData
      }
    }
  }
}
</script>
