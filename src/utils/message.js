import { Message, MessageBox } from 'element-ui'
const alertMsg = (type, msg, callback) => {
  let alert = null
  switch (type) {
    case 1:
      alert = Message({
        message: msg,
        type: 'success'
      })
      break
    case 2:
      alert = MessageBox.alert(msg, {
        showClose: false,
        confirmButtonText: '确定',
        customClass: 'alertPrompt'
      })
      break
    case 3:
      alert = MessageBox.confirm(msg, {
        showClose: false,
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        customClass: 'boxAsk'
      })
        .then(() => {
          callback()
        })
        .catch(() => {})
      break
    case 4:
      MessageBox.alert(msg, {
        showClose: false,
        confirmButtonText: '确定',
        customClass: 'alertFailure'
      })
      break
  }
  return alert
}
export default alertMsg
