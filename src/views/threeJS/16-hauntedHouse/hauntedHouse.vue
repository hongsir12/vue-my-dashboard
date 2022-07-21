<template>
  <div ref="three-box" class="three-box">
    <canvas ref="canvas" class="webgl" />
  </div>
</template>
<script>
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import stats from '../utils/stats'
import { listenResize, initGui } from '../utils/utils'
export default {
  data() {
    return {}
  }
}
</script>
