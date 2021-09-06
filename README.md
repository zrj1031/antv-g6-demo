# antv-g6-demo

[页面地址](https://zrj1031.github.io/antv-g6-demo/#/)

TODO 总结

svg性能比canvas差很多，如果有大量节点的时候要选用canvas画，虽然domShape可以比较自由的操作html css

addShape rect的x,y是左上角坐标，text是文本中心

g6的坐标系和初中学的坐标y轴方向不一致

addShape的x y偏移量是以group为准，但需要最终return一个keyShape（案例中是rectShape），会导致text 0 0应该是居中的，表现出来在rect上面

可通过getBBox获取包围圈，即可获取对应文本的长度

dom事件无法监听node:click等事件 原生事件暴露一个nodeId 通过graph.findById(nodeId)找到这个id
具体可参考https://g6.antv.vision/zh/examples/item/customNode#svgDom


domShape不能相应默认的展开收起行为，增加一个rectShape, rectShape盖在domShape上面, fill transparent
https://github.com/antvis/G6/issues/3153
纯改上又有问题，我们的domShape hover效果就没了，因为keyShape元素后绘制优先级更高
