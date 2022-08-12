// import {Vector2} from '../lib/three.module.js';
import { Vector2 } from 'three'

export class Node {
  lastStrength = 0 // 前一次强度值
  theStrength = 0 // 当前强度值
  targetRange = 0
  _range = 0 // 线段节点强度范围值
  constructor(baseRange, angle, center) {
    this.baseRange = baseRange // 距离中心点的基准距离
    this.angle = angle // 角度位置
    this.center = center // 中心点
  }
  // 外凸点位置
  positionA() {
    const range = this._range + this.baseRange
    const x = Math.cos((this.angle * Math.PI) / 180) * range
    const y = Math.sin((this.angle * Math.PI) / 180) * range
    return new Vector2(this.center.x + x, this.center.y + y)
  }
  // 内陷点位置
  positionB() {
    const range = this._range * -1 + this.baseRange
    const x = Math.cos((this.angle * Math.PI) / 180) * range
    const y = Math.sin((this.angle * Math.PI) / 180) * range
    return new Vector2(this.center.x + x, this.center.y + y)
  }
  // 接收音频强度值
  strength(newStrength) {
    this.lastStrength = this.theStrength
    this.theStrength = newStrength
    this.targetRange = Math.max(this.theStrength - this.lastStrength, 0)
    if (this.targetRange > this._range) this._range = this.targetRange
  }
  // 节点强度范围值根据时间戳而变化
  transition(delay) {
    this._range = Math.max(this._range - delay * this._range * 5, 0)
  }
}
