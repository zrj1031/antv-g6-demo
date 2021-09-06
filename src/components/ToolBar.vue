<template>
  <div class="toolbar-wrapper">
    <div class="full-screen-wrapper">
      <component
        :is="isFullScreen ? 'OffScreenTwo' : 'FullScreenTwo'"
        @click="$emit('full-screen')"
      />
    </div>
    <div class="zoom-wrapper">
      <Minus @click="$emit('zoom-minus')" />
      <span class="radio"> {{ formatRadio }}%</span>
      <Plus @click="$emit('zoom-plus')" />
    </div>
  </div>
</template>

<script>
import { OffScreenTwo, FullScreenTwo, Minus, Plus } from "@icon-park/vue";
export default {
  name: "ToolBar",
  props: {
    zoomRadio: {
      type: Number,
    },
    isFullScreen: {
      type: Boolean,
      default: false,
    },
  },
  components: {
    OffScreenTwo,
    FullScreenTwo,
    Minus,
    Plus,
  },
  computed: {
    formatRadio() {
      return Math.floor(this.zoomRadio * 100);
    },
  },
};
</script>

<style lang="less" scoped>
.toolbar-wrapper {
  position: absolute;
  bottom: 32px;
  left: 32px;
  color: #1d1d2e;
  z-index: 99;
  display: flex;

  .full-screen-wrapper {
    width: 34px;
    height: 34px;
    border-radius: 4px;
    background: #fff;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .zoom-wrapper {
    display: flex;
    align-items: center;
    margin-left: 12px;
    background: #fff;
    justify-content: space-between;
    align-items: center;
    padding: 8px;
    border-radius: 4px;
    width: 112px;
    height: 34px;

    .radio {
      color: #646475;
      font-size: 12px;
    }

    .i-icon {
      cursor: pointer;
    }
  }
}
</style>
