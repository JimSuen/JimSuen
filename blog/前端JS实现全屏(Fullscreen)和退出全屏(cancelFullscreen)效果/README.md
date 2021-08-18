`全屏`操作在我们日常的网上冲浪还是挺常见的，尤其是在看视频的时候。另外就是在浏览器中进行复杂图形编辑操作的时候，如果能有一个全屏操作，那用户的编辑体验将会大大提升。

这里就记录一下前端兼容各个浏览器的启动和退出全屏方法。

万能的标准 API 其实已经包含了相关的几个方法：

- 全屏是否可用：[Document.fullscreenEnabled](https://developer.mozilla.org/zh-CN/docs/Web/API/Document/fullscreenEnabled)
- 开启全屏：[Document.requestFullScreen()](https://developer.mozilla.org/en-US/docs/Web/API/Element/requestFullScreen)
- 退出全屏：[Document.exitFullscreen()](https://developer.mozilla.org/en-US/docs/Web/API/Document/exitFullscreen)
- 获取全屏元素：[document.mozFullScreenElement](https://developer.mozilla.org/en-US/docs/Web/API/Document/fullscreenElement)
- 监听全屏模式变化: [fullscreenchange](https://developer.mozilla.org/en-US/docs/Web/API/Document/fullscreenchange_event)

## 全屏是否可用： Document.fullscreenEnabled

`fullscreenEnabled`  属性提供了启用全屏模式的可能性。当它的值是  `false`  的时候，表示全屏模式不可用（可能的原因有  `"fullscreen"`  特性不被允许，或全屏模式不被支持等 ）

```js
function fullscreenEnabled() {
  return (
    document.fullscreenElement ||
    document.mozFullScreenElement ||
    document.webkitFullscreenElement
  );
}
```

## 启动全屏： Document.exitFullscreen()

` Element.requestFullscreen()`  方法用于发出`异步请求`使元素进入全屏模式。作用是请求浏览器将指定的元素设置为全屏模式， 结果会返回一个`Promise`，全屏模式被激活的时候变成 resolved 状态。

![企业微信截图_20210803113255.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/9c3a750ef7ea453788fec1c9793fce96~tplv-k3u1fbpfcp-watermark.image)

如果全屏模式被禁用或者不支持，则会返回 reject。[Document.fullscreenEnabled](https://developer.mozilla.org/zh-CN/docs/Web/API/Document/fullscreenEnabled) 可用来判断是否支持`全屏`模式。

```javascript
function fullscreen(element) {
  if (document.mozFullScreenEnabled) {
    return Promise.reject(new Error("全屏模式被禁用"));
  }
  let result = null;
  if (element.requestFullscreen) {
    result = element.requestFullscreen();
  } else if (element.mozRequestFullScreen) {
    result = element.mozRequestFullScreen();
  } else if (element.msRequestFullscreen) {
    result = element.msRequestFullscreen();
  } else if (element.webkitRequestFullscreen) {
    result = element.webkitRequestFullScreen();
  }
  return result || Promise.reject(new Error("不支持全屏"));
}
```

## 退出全屏：Document.exitFullscreen()

`Document.exitFullscreen() `  方法用于让当前文档退出全屏模式。元素恢复到之前的状态。

MDN 有这样的一个备注：

> 如果一个元素 A 在请求进去全屏模式之前，已经存在其他元素处于全屏状态，当这个元素 A 退出全屏模式之后，之前的元素仍然处于全屏状态。浏览器内部维护了一个全屏元素栈用于实现这个目的

> Document.exitFullscreen() 方法让全屏元素栈的栈顶元素退出全屏状态，并让新的栈顶的元素进入全屏状态

这就意味着可以有多个元素同时全屏。并且这些全屏的元素被存储在一个栈中。

```js
function cancelFullscreen() {
  if (document.exitFullscreen) {
    document.exitFullscreen();
  } else if (document.msExitFullscreen) {
    document.msExitFullscreen();
  } else if (document.mozCancelFullScreen) {
    document.mozCancelFullScreen();
  } else if (document.webkitExitFullscreen) {
    document.webkitExitFullscreen();
  }
}
```

## 获取全屏元素：document.mozFullScreenElement

该方法可以用来检查当前是否有元素处于全屏状态，如果有，则返回该元素，如果没有则返回 null。

```js
if (document.fullscreenElement === null) {
  console.log("当前处于全屏模式");
} else {
  console.log("当前不处于全屏模式");
}
```

## 监听全屏模式变化: fullscreenchange

实际业务中一般会存在监听全屏模式变化，例如：非全屏模式时候显示"全屏"按钮，全屏时候显示"退出全屏"按钮。这就需要我们监听全屏状态来控制操作按钮的显示与隐藏。

```js
let isFullscreen = false;

const handler = () => {
  isFullscreen = document.fullscreenElement !== null;
  if (!isFullscreen) {
    // 退出全屏时候解除监听，不然每次监听都会添加一次绑定
    document.removeEventListener("fullscreenchange", handler);
  }
};

document.addEventListener("fullscreenchange", handler);
```

<hr />

以上 欢迎指正和补充~
