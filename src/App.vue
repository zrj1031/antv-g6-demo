<template>
  <div id="app">
    <div class="router-wrapper">
      <router-link to="/canvas">render canvas</router-link>
      <router-link to="/svg">render svg</router-link>
    </div>
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  name: "App",
  components: {},
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
  padding: 16px;
  height: 100vh;
  display: flex;
  flex-direction: column;
  .router-wrapper {
    margin-bottom: 16px;
    a {
      margin-right: 12px;
    }
  }
}
</style>
