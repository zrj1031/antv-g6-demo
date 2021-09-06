<template>
  <div id="app">
    <div class="router-wrapper">
      <!-- FIXME 路由切换 G6会报错 暂时reload -->
      <!-- <router-link to="/canvas">render canvas</router-link>
      <router-link to="/svg">render svg</router-link> -->
      <a @click.stop="reloadPage('#canvas')">render canvas</a>
      <a @click.stop="reloadPage('#svg')">render svg</a>
    </div>
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  name: "App",
  methods: {
    reloadPage(url) {
      window.location.href = url;
      window.location.reload();
    },
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
  padding: 16px;
  height: 100vh;
  display: flex;
  flex-direction: column;
  .router-wrapper {
    margin-bottom: 16px;
    a {
      cursor: pointer;
      color: #1251ff;
      margin-right: 12px;
    }
  }
}
</style>
