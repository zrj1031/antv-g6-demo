<template>
  <div
    :class="['canvas-wrapper', { fullScreen }]"
    ref="canvasMountNode"
    id="canvasMountNode"
  >
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

export default {
  name: "G6Canvas",
  components: {
    ToolBar,
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
        subTree.id = subTree.nodeID;
        subTree.collapsed = !subTree.display;
        subTree.children = subTree.childNodeList;
      });
      return treeData;
    },
  },
  methods: {
    registerNode() {
      // https://antv-g6.gitee.io/zh/examples/item/label
      const fittingString = (str, maxWidth, fontSize) => {
        const ellipsis = "...";
        const ellipsisLength = G6.Util.getTextSize(ellipsis, fontSize)[0];
        let currentWidth = 0;
        let res = str;
        const pattern = new RegExp("[\u4E00-\u9FA5]+"); // distinguish the Chinese charactors and letters
        str.split("").forEach((letter, i) => {
          if (currentWidth > maxWidth - ellipsisLength) return;
          if (pattern.test(letter)) {
            // Chinese charactors
            currentWidth += fontSize;
          } else {
            // get the width of single letter according to the fontSize
            currentWidth += G6.Util.getLetterWidth(letter, fontSize);
          }
          if (currentWidth > maxWidth - ellipsisLength) {
            res = `${str.substr(0, i)}${ellipsis}`;
          }
        });
        return res;
      };

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
        "canvas-node",
        {
          draw(cfg, group) {
            const { depth, children } = cfg;
            const treeNodeStyle = Object.assign(
              {},
              treeNodeAttrStyle.default,
              treeNodeAttrStyle[depth] || {}
            );
            const BaseTextStyle = {
              textAlign: "center",
              textBaseline: "middle",
              fontSize: 14,
              fontFamily: "PingFang SC",
              fontWeight: 500,
            };
            const keyShape = group.addShape("rect", {
              attrs: {
                x: 0,
                y: 0,
                radius: [18],
              },
              name: "rect-shape",
            });
            const rectShape = group.addShape("rect", {
              attrs: {
                x: 0,
                y: 0,
                radius: [18],
                fill: treeNodeStyle.rectBgColor,
                stroke: treeNodeStyle.rectBgColor,
              },
              name: "rect-shape",
            });
            const fittingText = fittingString(cfg.nodeName, MAX_TEXT_WIDTH, 14);
            const textShape = group.addShape("text", {
              attrs: {
                ...BaseTextStyle,
                text: fittingText,
                fill: treeNodeStyle.textColor,
              },
              name: "text-shape",
            });
            const textWidth = textShape.getBBox().width;
            const showCount = [1, 2, 3].includes(depth);
            const showCollapse = depth !== 0 && children?.length > 0;

            rectShape.attr({
              width:
                // text
                Math.min(textWidth, MAX_TEXT_WIDTH) +
                // padding
                36 +
                // count
                (showCount ? 34 : 0),
              height: 36,
            });

            const { width: rectWidth, height: rectHeight } =
              rectShape.getBBox();
            keyShape.attr({
              width: rectWidth + (showCollapse ? 26 : 0),
              height: 36,
            });
            const showTooltip = fittingText.includes("...");
            textShape.attr({
              x: 18 + textWidth / 2,
              y: rectHeight / 2,
              showTooltip,
              cursor: showTooltip ? "pointer" : "auto",
            });
            if (showCount) {
              group.addShape("circle", {
                attrs: {
                  x: rectWidth - 20,
                  y: rectHeight / 2,
                  r: 12,
                  fill: treeNodeStyle.circleBgColor,
                },
                name: "count-circle-shape",
              });
              group.addShape("text", {
                attrs: {
                  ...BaseTextStyle,
                  x: rectWidth - 8 - 12,
                  y: rectHeight / 2,
                  text: cfg.childCount,
                  fill: "#fff",
                },
                name: "count-text-shape",
              });
            }
            if (showCollapse) {
              group.addShape("path", {
                attrs: {
                  path: [
                    ["M", rectWidth, rectHeight / 2],
                    ["L", rectWidth + 8, rectHeight / 2],
                  ],
                  stroke: "#C6C6CC",
                  lineWidth: 2,
                },
                name: "path-shape",
              });
              group.addShape("marker", {
                attrs: {
                  x: rectWidth + 8,
                  y: rectHeight / 2,
                  stroke: "#C6C6CC",
                  fill: "#fff",
                  lineWidth: 2,
                  r: 7,
                  symbol:
                    cfg.childCount > 0 && cfg.collapsed
                      ? EXPAND_ICON
                      : COLLAPSE_ICON,
                  cursor: "pointer",
                },
                name: "marker-shape",
                className: "marker-collapse-icon",
              });
            }
            return keyShape;
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
    },
    initGraph() {
      this.graph = new G6.TreeGraph({
        container: "canvasMountNode",
        renderer: "canvas",
        width: this.$el.offsetWidth,
        height: this.$el.offsetHeight,
        // 最小缩放比例， 默认0.2 https://g6.antv.vision/zh/docs/api/Graph/#graphoptionsminzoom
        // minZoom: 0.2,
        defaultNode: {
          type: "canvas-node",
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
        plugins: [
          new G6.Tooltip({
            offsetX: -80,
            offsetY: -125,
            className: "g6-tooltip-wrapper",
            shouldBegin: (event) => {
              return event.target.attrs?.showTooltip;
            },
            getContent(e) {
              const outDiv = document.createElement("div");
              outDiv.innerHTML = `
                <div class="tooltip-inner-content">${
                  e.item.getModel().nodeName
                }</div4>
              `;
              return outDiv;
            },
            itemTypes: ["node"],
          }),
        ],
      });
      // 缩放
      this.graph.on("viewportchange", () => {
        this.zoomRadio = this.graph.getZoom();
      });
      // 展开收起
      this.graph.on("itemcollapsed", ({ item, collapsed }) => {
        const icon = item.get("group").findByClassName("marker-collapse-icon");
        icon.attr("symbol", collapsed ? EXPAND_ICON : COLLAPSE_ICON);
        // 展开项视图居中
        this.graph.focusItem(item, true);
      });
      this.graph.on("wheelzoom", (e) => {
        e.stopPropagation();
        const tooltips = Array.from(
          document.getElementsByClassName("g6-tooltip-wrapper")
        );
        tooltips.forEach((tooltip) => {
          if (tooltip && tooltip.style) {
            tooltip.style.transform = `scale(${this.graph.getZoom()})`;
          }
        });
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
      const el = this.$refs.canvasMountNode;
      this.graph.changeSize(el.offsetWidth, el.offsetHeight);
      this.graph.fitView();
      this.zoomRadio = this.graph.getZoom();
    },
  },
  async mounted() {
    this.registerNode();
    await this.$nextTick();
    this.treeData = mockData;
    this.graph?.destroy();
    this.initGraph();
    this.draw();
  },
};
</script>

<style lang="less" scoped>
.canvas-wrapper {
  flex: 1;
  position: relative;
  background: #f7f7fa;
  overflow: hidden;
  &.fullScreen {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 99;
  }
}
</style>

<style lang="less">
.g6-tooltip-wrapper {
  max-width: 212px;
  height: auto;
  background: rgba(29, 29, 46, 0.95);
  border-radius: 4px;
  padding: 8px 16px;

  .tooltip-inner-content {
    word-break: break-all;
    color: #fff;
    font-size: 12px;
  }
}
</style>
