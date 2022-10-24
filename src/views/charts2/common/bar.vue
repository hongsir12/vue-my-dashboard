<template>
  <div>
    <ve-bar height="350px" :data="data" :settings="chartSettings" />
  </div>
</template>

<script>
export default {
  props: {
    vType: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      chartSettings: {},
      data: {
        columns: [],
        rows: []
      }
    }
  },

  mounted() {},

  methods: {}
}
</script>
