export default {
  unique(arr, attr) {
    if (!Array.isArray(arr)) return []
    const arr1 = []
    for (let i = 0, len = arr.length; i < len; i++) {
      const item = attr ? arr[i][attr] : arr[i]
      const arr2 = attr ? arr1.map((el) => el[attr]) : arr1
      if (!arr2.includes(item)) {
        // 检索arr1中是否包含arr中的值
        arr1.push(arr[i])
      }
    }
    return arr1
  },
  // 修改对象属性名
  changeObjKey(obj, keymapping) {
    const oldKeysArr = Object.keys(obj)
    const arr = Object.entries(obj)
    keymapping.forEach((item) => {
      if (oldKeysArr.indexOf(item.key) !== -1) {
        arr[oldKeysArr.indexOf(item.key)][0] = item.newKey
      }
    })
    return Object.fromEntries(arr)
  },
  // 对象数组按某属性排序，order为true升序，false为降序
  objectSort(arr = [], prop, order = true) {
    if (arr.length < 2) return arr
    const temp = [...arr]
    for (let i = 0; i < temp.length - 1; i++) {
      let [v, pos] = [temp[i][prop], i]
      for (let j = i + 1; j < temp.length; j++) {
        if (Number(v) > Number(temp[j][prop])) {
          v = temp[j][prop]
          pos = j
        }
      }
      [temp[i], temp[pos]] = [temp[pos], temp[i]]
    }
    return order ? temp : temp.reverse()
  }
}
