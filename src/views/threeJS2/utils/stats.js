import Stats from 'stats.js'
// 帧数面板
const stats = new Stats()
stats.dom.style.position = 'absolute'
stats.dom.style.top = '10px'
stats.dom.style.left = '10px'

export const initStats = () => {
  const el = document.querySelector('.three-box')
  el.appendChild(stats.dom)
  return stats
}
