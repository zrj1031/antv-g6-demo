<template>
  <div id="app">
    <router-link to="/canvas">render canvas</router-link>
    <router-link to="/svg">render svg</router-link>
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  name: "App",
  components: {},
};
</script>

<style></style>
