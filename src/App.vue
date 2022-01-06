<template>
  <div id="app">
    <TreeCanvas />
  </div>
</template>

<script>
import TreeCanvas from "./components/TreeCanvas.vue";
export default {
  name: "App",
  components: {
    TreeCanvas,
  },
};
</script>

<style lang="less">
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
</style>

<style lang="less" scoped>
#app {
  height: 100vh;
  padding: 20px;
  background: #f7f7fa;
}
</style>
