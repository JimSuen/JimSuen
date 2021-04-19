# nodejs+nginx+puppeteer 实现 pdf 下载

## 技术栈

服务端：[Node.js](https://nodejs.org/) / [TypeORM](https://typeorm.io/#/) / [Apollo](https://www.apollographql.com/) / [GraphQL](https://graphql.org/) / [MySQL](https://www.mysql.com/)

前端：[Vue](https://vuejs.org/) / [Nuxt.js](https://nuxtjs.org/) / [Vuetify](https://vuetifyjs.com/)

前后端都使用 [TypeScript](https://www.typescriptlang.org/)，采用 [Docker](https://www.docker.com/) 部署。

## 背景

移动端的某个 web 需要实现根据数据生成 pdf 文件并下载。

考虑到 Apollo-server + GraphQL 返回数据流不方便，最初就用前端生成。

### 前端生成 PDF

##### 生成方法

（html2canvas + jspdf）的方法生成，然后动态生成 a 标签去下载，生成的 pdf 分页时候直接截断以及画质差，除此之外，在 ios 下，默认会打开 PDF 文件的预览，只能通过浏览器的分享发给微信什么的勉强能用。

##### 遇到的问题

谁知有客户需要把这个网站引入到小程序以及不知道什么时候还引入了他们的 APP 中作为一个模块用。本来就是依靠浏览器把预览的 PDF 分享或者下载，现在被嵌套进去别的东西里，那可不就是进去到预览页面，什么操作都没有了嘛。所以前端生成的方法毙掉！

### 后端生成 PDF

那所以只能通过后端生成了。

#### 生成方案

1. 通过 server 端直接把 buffer 写入到 response.body 里面（设置 Content-Type: application/octet-stream 头，配合 Content-Disposition 头来指定下载的文件名），会自动触发浏览器文件下载。无需 base64 编码，二进制流数据可以直接写入到 HTTP 响应里面。
2. 搞个阿里云 OSS，服务端把生成的 PDF 文件上传到 OSS，然后把 OSS 提供的下载地址返回给前端。
3. nginx 可以配置好一个静态文件目录，服务端可以把生成 PDF 写入本地文件，放在指定静态文件目录，返回静态下载地址。

#### 方案选择

看起来方案 1 是最简单的啦，做出的改变基本是在生成文件后只用设置一下响应头就 OK 了，但是！！！这个后端框架用的是`apollo-server`+ `graphQL`，这种搭配不好去返回文件数据的呀(想知道为什么先去了解一下他们的机制)。如果想实现，那大概就需要改动一下框架，改成`koa + apollo-server-koa`或者`express + apollo-server-express` 这种框架和中间件组合用法，尝试着改了一下，由于我对 nodejs 框架以及 apollo 的不了解，只好暂时放弃方案 1.

那方案 2 是不是还得去向老板申请一个服务啊，这看起来又增加了实现时间，这个问题还挺急的。

那就方案 3 吧，配个 nginx 应该相对最容易了，但是这里就不讲了，因为我暂时不会。。。。(由于我不会在 docker 里面去配置，还好有组里的大佬给配了，感谢大佬，并且立誓后面会学)。

## 实现过程

##### html-pdf

最初后端生成 pdf 的方法选用`html-pdf`库，根据数据动态生成要渲染的 html 的字符串。利用库的`toFIle`方法实现生成 pdf 文件到本地。成功的路上总不是一帆风顺的，遇到了该死的`Error: write EPIPE`问题，来来回回翻了 N 便 [相关的 issue](https://github.com/marcbachmann/node-html-pdf/issues/35)， 又是装`fontconfig` 又是` rebuild phantomjs-prebuilt`的，或者会不会是有个人提到的`alpine`下`phantomjs-prebuilt `跑不起来的问题呢。基本上把上面的方法实现了一个遍，问题依然没有解决。就在我花了大把时间在排除问题时候，我索性换个别的库试试。

放一下此时的`Dockerfile`

```dockerfile
FROM node:12.20.1 AS builder
RUN sed -i 's#http://deb.debian.org#https://mirrors.aliyun.com#g' /etc/apt/sources.list && \
  apt update && \
  apt add fontconfig
WORKDIR /builder
COPY package.json .
COPY yarn.lock .
RUN yarn
COPY . .
RUN yarn run build


FROM node:12.20.1
WORKDIR /app
COPY --from=builder /builder/package.json .
COPY --from=builder /builder/yarn.lock .
COPY --from=builder /builder/node_modules ./node_modules
COPY --from=builder /builder/dist ./dist
COPY --from=builder /builder/ormconfig.js .
EXPOSE 4000
CMD ["yarn", "run", "start"]
```

##### `puppeteer`

本以为换个库会不会就不会有那种以来的程序运行失败的问题，结果还是一样，这次是`chromium`跑失败了。。。

## 遇到的问题

### chromium 启动失败

在本地运行时候没有问题，但是部署后触发导出 pdf 功能后就抛出异常：

具体报错为 “**Error: Failed to launch chrome! spawn /app/node_modules/puppeteer/.local-chromium/linux-609904/chrome-linux/chrome ENOENT**”

#### 解决方案

通过 [Github issue](https://github.com/puppeteer/puppeteer/issues/3994) 了解到，造成这个的原因是服务器上找不到这个程序来执行，那么就可以通过为`puppeteer` 指定资源地址的方法来解决，资源哪里来呢？既然没安装成功，那我们需要在`Dockerfile`里手动自行安装到系统。

##### Dockerfile

在 Dockerfile 中添加安装命令

```dockerfile
RUN apk add --nocache udev ttf-freefont chromium git
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true
ENV CHROMIUM_PATH /usr/bin/chromium-browser

// npm install, etc.
```

##### pdf.js

在实例化`puppeteer `的时候，为它指定`chromium`资源地址

```js
const puppeteer = require("puppeteer");

const pdf = puppeteer.launch({
  executablePath: process.env.CHROMIUM_PATH,
  args: ["--no-sandbox"], // This was important. Can't remember why
});
```

**但是，这里要注意`Dockerfile`中安装命令写的位置！！！！！！！！！！！**

##### 没有解决问题的 Dockerfile

```dockerfile
FROM node:12.14.1-alpine AS builder
RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.ustc.edu.cn/g' /etc/apk/repositories && \
  apk add --no-cache udev ttf-freefont chromium git
RUN yarn config set registry https://registry.npm.taobao.org/
WORKDIR /builder
COPY package.json .
COPY yarn.lock .
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true
RUN yarn
COPY . .
RUN yarn run build


FROM node:12.14.1-alpine
WORKDIR /app
COPY --from=builder /builder/package.json .
COPY --from=builder /builder/yarn.lock .
COPY --from=builder /builder/node_modules ./node_modules
COPY --from=builder /builder/dist ./dist
COPY --from=builder /builder/ormconfig.js .
RUN mkdir /usr/share/fonts/win/
COPY --from=builder /builder/src/assets/simhei.ttf /usr/share/fonts/win/simhei.ttf
RUN chmod 777 /usr/share/fonts/win/simhei.ttf && \
  fc-cache -f
EXPOSE 4000
CMD ["yarn", "run", "start"]

```

##### 解决问题的 Dockerfile

```dockerfile
FROM node:12.14.1-alpine AS builder
RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.ustc.edu.cn/g' /etc/apk/repositories && \
  apk add --no-cache udev ttf-freefont chromium git
RUN yarn config set registry https://registry.npm.taobao.org/
WORKDIR /builder
COPY package.json .
COPY yarn.lock .
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true
RUN yarn
COPY . .
RUN yarn run build


FROM node:12.14.1-alpine
RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.ustc.edu.cn/g' /etc/apk/repositories && \
  apk add --no-cache udev ttf-freefont chromium git && \
  apk add fontconfig
WORKDIR /app
COPY --from=builder /builder/package.json .
COPY --from=builder /builder/yarn.lock .
COPY --from=builder /builder/node_modules ./node_modules
COPY --from=builder /builder/dist ./dist
COPY --from=builder /builder/ormconfig.js .
RUN mkdir /usr/share/fonts/win/
COPY --from=builder /builder/src/assets/simhei.ttf /usr/share/fonts/win/simhei.ttf
RUN chmod 777 /usr/share/fonts/win/simhei.ttf && \
  fc-cache -f
EXPOSE 4000
CMD ["yarn", "run", "start"]

```

看出区别了咩，就是**执行安装代码的位置原因**，导致我花了好久好久的时间啊。原因还是因为对`Dockerfile`的语法含义不清楚的问题。。。

所以**用`html-pdf`时候`Error: write EPIPE` 问题一直没解决，也是因为安装`fontconfig`的位置不对**啊啊啊。

### 打印出来的文档中文是乱码

造成这个的原因是 在 container 中的系统里没有中文的字体，那么我们在 Dockerfile 中也加进去也就可以了。

```dockerfile
RUN mkdir /usr/share/fonts/win/
COPY --from=builder /builder/src/assets/simhei.ttf /usr/share/fonts/win/simhei.ttf
RUN chmod 777 /usr/share/fonts/win/simhei.ttf && \
  fc-cache -f
```

意思就是：

1. 在服务上创建`/usr/share/fonts/win/`目录，保证目录存在；
2. 把项目根目录下的`/src/assets/simhei.ttf`字体文件拷贝到服务上的 `/usr/share/fonts/win/simhei.ttf`位置（这需要你先下载`simhei.ttf`文件放在项目目录里，具体位置自行决定）；
3. 刷新字体；

具体参考了这位的文章： [如何给 dcoker 容器里的 alpine 系统安装中文字体](https://blog.csdn.net/zimou5581/article/details/101368129)
