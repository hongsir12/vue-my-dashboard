import { Vector3 } from 'three'

export class TestLine {
  lastStrength = 0 // 前一次强度值
  theStrength = 0 // 当前强度值
  targetRange = 0
  _range = 0 // 线段节点强度范围值
  constructor(baseRange, x, y, z) {
    this.baseRange = baseRange // 线段基准长度
    this.x = x // 原x坐标
    this.y = y // 原y坐标
    this.z = z // 原z坐标
  }
  positionLeft() {
    const range = this._range * -1 + (this.baseRange / 2) * -1
    return new Vector3(this.x + range, this.y, this.z)
  }
  positionRight() {
    const range = this._range + this.baseRange / 2
    return new Vector3(this.x + range, this.y, this.z)
  }
  positionTop() {
    const range = this._range + this.baseRange / 2
    return new Vector3(this.x, this.y + range, this.z)
  }
  positionBottom() {
    const range = this._range * -1 + (this.baseRange / 2) * -1
    return new Vector3(this.x, this.y + range, this.z)
  }
  strength(newStrength) {
    this.lastStrength = this.theStrength
    this.theStrength = newStrength
    this.targetRange = Math.max(this.theStrength - this.lastStrength, 0)
    if (this.targetRange > this._range) this._range = this.targetRange
  }
  transition(delay) {
    this._range = Math.max(this._range - delay * this._range * 5, 0)
  }
}
