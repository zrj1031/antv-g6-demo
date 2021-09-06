<template>
  <div
    :class="['abilityMap-wrapper', { fullScreen }]"
    ref="abilityMapMountNode"
  >
    <div id="abilityMapMountNode" />
    <ToolBar
      :zoomRadio="zoomRadio"
      :isFullScreen="fullScreen"
      @full-screen="handleFullScreen"
      @zoom-minus="handleZoom(-0.05)"
      @zoom-plus="handleZoom(0.05)"
    />
  </div>
</template>

<script>
import mockData from "./mockData";
import G6 from "@antv/g6";
import ToolBar from "./ToolBar.vue";
const COLLAPSE_ICON = (x, y, r) => [
  ["M", x, y],
  ["a", r, r, 0, 1, 0, r * 2, 0],
  ["a", r, r, 0, 1, 0, -r * 2, 0],
  ["M", x + 2, y],
  ["L", x + 2 * r - 2, y],
];
const EXPAND_ICON = (x, y, r) => [
  ["M", x, y],
  ["a", r, r, 0, 1, 0, r * 2, 0],
  ["a", r, r, 0, 1, 0, -r * 2, 0],
  ["M", x + 2, y],
  ["L", x + 2 * r - 2, y],
  ["M", x + r, y - r + 2],
  ["L", x + r, y + r - 2],
];

const treeNodeAttrStyle = {
  0: {
    rectBgColor: "#1251FF",
    textColor: "#fff",
  },
  1: {
    rectBgColor: "#fff",
    textColor: "#1251FF",
    circleBgColor: "#6B93FF",
  },
  2: {
    circleBgColor: "#C6C6CC",
  },
  3: {
    circleBgColor: "#C6C6CC",
  },
  default: {
    rectBgColor: "#fff",
    textColor: "#646475",
  },
};

const MAX_TEXT_WIDTH = 152;

// 注册tag-label-node 节点
G6.registerNode(
  "tag-canvas-label-node",
  {
    draw(cfg, group) {
      const { depth, children } = cfg;
      const treeNodeStyle = Object.assign(
        {},
        treeNodeAttrStyle.default,
        treeNodeAttrStyle[depth] || {}
      );
      const textShape = group.addShape("text", {
        attrs: {
          textAlign: "center",
          textBaseline: "middle",
          text: cfg.nodeName,
          fontSize: 14,
          fontFamily: "PingFang SC",
          fontWeight: 500,
          ...treeNodeStyle.text,
        },
        name: "text-shape",
      });
      const textWidth = textShape.getBBox().width;
      const showCount = [1, 2, 3].includes(depth);
      const showCollapse = depth !== 0 && children?.length > 0;

      const domShape = group.addShape("dom", {
        attrs: {
          width:
            // text
            Math.min(textWidth, MAX_TEXT_WIDTH) +
            // padding
            36 +
            // collapse
            (showCollapse ? 26 : 0) +
            // count
            (showCount ? 34 : 0),
          height: 36,
          html: `
            <div class="node-wrapper">
              <div
                style="background-color: ${treeNodeStyle.rectBgColor};"
                class="rect-wrapper"
              >
                <div
                  tooltip=${cfg.nodeName}
                  style="
                    color: ${treeNodeStyle.textColor};
                    max-width: ${MAX_TEXT_WIDTH}px
                  "
                  class="text ${
                    textWidth > MAX_TEXT_WIDTH ? "showTooltip" : ""
                  }"
                >
                  ${cfg.nodeName}
                </div>
                ${
                  showCount
                    ? `
                  <div
                      style="background-color: ${treeNodeStyle.circleBgColor};"
                      class="count"
                    >
                    ${cfg.childCount}
                    </div>
                  `
                    : ""
                }
              </div>
              ${showCollapse ? `<div class="collapse-line"></div>` : ""}
            </div>
          `,
        },
        name: "dom-shape",
      });
      if (showCollapse) {
        group.addShape("marker", {
          attrs: {
            x: domShape.getBBox().width - 18,
            y: domShape.getBBox().height / 2,
            stroke: "#C6C6CC",
            fill: "#fff",
            lineWidth: 2,
            r: 8,
            symbol: COLLAPSE_ICON,
            cursor: "pointer",
          },
          name: "marker-shape",
          className: "marker-collapse-icon",
        });
      }
      return domShape;
    },
    getAnchorPoints() {
      return [
        [0, 0.5],
        [1, 0.5],
      ];
    },
  },
  "single-node"
);

export default {
  name: "AbilityMapG6Svg",
  components: {
    ToolBar,
  },
  props: {
    searchParams: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      treeData: {},
      graph: null,
      zoomRadio: 1,
      fullScreen: false,
    };
  },
  computed: {
    filterData() {
      const treeData = this.treeData.childNodeList[0];
      G6.Util.traverseTree(treeData, (subTree) => {
        // 全量深度遍历 构造出祖先id-父id-id的唯一id(在整棵树下唯一)
        subTree.children = subTree.childNodeList;
        subTree.id = subTree.nodeID;
      });
      console.log(treeData);
      return treeData;
    },
  },
  methods: {
    initGraph() {
      this.graph = new G6.TreeGraph({
        container: "abilityMapMountNode",
        renderer: "svg",
        width: this.$el.offsetWidth,
        height: this.$el.offsetHeight,
        defaultNode: {
          type: "tag-canvas-label-node",
        },
        defaultEdge: {
          type: "cubic-horizontal",
          style: {
            stroke: "#C6C6CC",
            lineWidth: 2,
          },
        },
        layout: {
          type: "compactBox",
          direction: "LR",
          getHeight: () => 36,
          getVGap: () => 23,
          getHGap: () => 134,
        },
        modes: {
          default: [
            {
              type: "collapse-expand",
            },
            "drag-canvas",
            "zoom-canvas",
          ],
        },
      });
      // 缩放
      this.graph.on("viewportchange", () => {
        this.zoomRadio = this.graph.getZoom();
      });
      // 展开收起
      this.graph.on("itemcollapsed", ({ item, collapsed }) => {
        const icon = item.get("group").findByClassName("marker-collapse-icon");
        icon.attr("symbol", collapsed ? EXPAND_ICON : COLLAPSE_ICON);
      });
    },
    draw() {
      this.graph.data(this.filterData);
      this.graph.render();
      this.graph.fitView();
      this.zoomRadio = this.graph.getZoom();
      this.graph.layout();
    },
    handleZoom(radio) {
      const zoomRadio = Math.max(0.3, this.zoomRadio + radio);
      this.graph.zoomTo(zoomRadio);
      this.zoomRadio = zoomRadio;
    },
    async handleFullScreen() {
      this.fullScreen = !this.fullScreen;
      await this.$nextTick();
      const el = this.$refs.abilityMapMountNode;
      this.graph.changeSize(el.offsetWidth, el.offsetHeight);
      this.graph.fitView();
      this.zoomRadio = this.graph.getZoom();
    },
  },
  async mounted() {
    await this.$nextTick();
    this.treeData = mockData;
    this.graph?.destroy();
    this.initGraph();
    this.draw();
  },
};
</script>

<style lang="less" scoped>
.abilityMap-wrapper {
  flex: 1;
  position: relative;
  &.fullScreen {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 99;
  }
  #abilityMapMountNode {
    height: 100%;
    width: 100%;
    background: #f7f7fa;
    overflow: hidden;
  }
}

#abilityMapMountNode {
  ::v-deep text {
    opacity: 0;
  }

  ::v-deep foreignObject {
    overflow: visible;

    .node-wrapper {
      display: flex;
      align-items: center;
      width: 100%;
      cursor: auto;
    }

    .rect-wrapper {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 8px 18px;
      border-radius: 18px;
      height: 36px;
      position: relative;
    }

    .text {
      font-size: 14px;
      font-family: "PingFang SC";
      font-weight: 500;
      flex-shrink: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      word-break: break-all;
      white-space: nowrap;

      &.showTooltip {
        cursor: pointer;

        &:hover:before {
          content: "";
          position: absolute;
          border-width: 4px 6px 0 6px;
          border-style: solid;
          border-color: transparent;
          border-top-color: black;
          z-index: 99;
          top: -5px;
          left: 50%;
          transform: translateX(-50%);
        }

        &:hover::after {
          content: attr(tooltip);
          position: absolute;
          padding: 8px 16px;
          background: rgba(29, 29, 46, 0.95);
          border-radius: 4px;
          text-align: center;
          font-size: 12px;
          color: #fff;
          pointer-events: none;
          z-index: 99;
          left: 50%;
          top: -5px;
          transform: translateX(-50%) translateY(-100%);
          width: 212px;
          white-space: pre-wrap;
          text-align: left;
        }
      }
    }

    .count {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      margin-left: 10px;
      font-size: 12px;
      color: #fff;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .collapse-line {
      width: 8px;
      height: 2px;
      background: #c6c6cc;
    }
  }
}
</style>
