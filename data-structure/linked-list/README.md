# JS 数据结构 - 链表(linked-list)

数组不总是最佳的数据结构，因为，在很多编程语言中，数组的长度都是固定的，如果数组已被数据填满，再要加入新的元素是非常困难的。而且，对于数组的删除和添加操作，通常需要将数组中的其他元素向前或者向后平移，这些操作也是十分繁琐的。

然而，JS 中数组却不存在上述问题，主要是因为他们被实现了成了对象，但是与其他语言相比（比如 C 或 Java），那么它的效率会低很多。

这时候，我们可以考虑使用链表(Linked-list) 来替代它，除了对数据的随机访问，链表几乎可以在任何可以使用一维数组的情况中。如果你正巧在使用 C 或者 Java 等高级语言，你会发现链表的表现要优于数组很多。

链表其实有许多的种类：单向链表、双向链表、单向循环链表和双向循环链表，接下来，我们基于对象来实现一个单向链表，因为它的使用最为广泛

## 1. 单向链表定义

链表是一组节点组成的集合，每个节点都使用一个对象的引用来指向它的后一个节点。指向另一节点的引用讲做链。

![1](./1.png)

表的尾元素指向了 null 节点，表示链接结束的位置。

### 1.1 起始节点

链表的起始点的确定比较麻烦，因此很多链表的实现都会在链表的最前面添加一个特殊的节点，称为 **头节点**，表示链表的头部。进过改造，链表就成了如下的样子：

![2](./2.png)

### 1.2 插入节点

向链表中**插入一个节点**的效率很高，需要修改它前面的节点(前驱)，使其指向新加入的节点，而将新节点指向原来前驱节点指向的节点即可。

![3](./3.png)

### 1.3 删除节点

只需将待删节点的前驱节点指向待删节点的后面节点，同时将待删节点指向 null，那么节点就删除成功了。以下删除了 data4.

![4](./4.png)

## 2. 设计单向链表

设计链表包含两个类，一个是 Node 类用来表示节点，另一个事 LinkedList 类提供插入节点、删除节点等一些操作。

### 2.1 Node 类

Node 类包含连个属性： element 用来保存节点上的数据，next 用来保存指向下一个节点的链接。

```js
//节点
function Node(element) {
  this.element = element; //当前节点的元素
  this.next = null; //下一个节点链接
}
```

### 2.2 LinkedList

LinkedList 类提供了对链表进行操作的方法，包括插入删除节点，查找给定的值等。值得注意的是，它只有一个 属性，那就是使用一个 Node 对象来保存该链表的头节点。

```javascript
//链表类
function LList() {
  this.head = new Node("head"); //头节点
  this.find = find; //查找节点
  this.insert = insert; //插入节点
  this.remove = remove; //删除节点
  this.findPrev = findPrev; //查找前一个节点
  this.log = log; //输出链表
}
```

#### 2.2.1 查找节点（find）

```javascript
//查找给定节点

function find(item) {
  var currNode = this.head;
  while (currNode.element != item) {
    currNode = currNode.next;
  }
  return currNode;
}
```

#### 2.2.2 查找上一个节点（findPrev）

```js
function findPrev(item) {
  var currNode = this.head;
  while (!(currNode.next == null) && currNode.next.element != item) {
    currNode = currNode.next;
  }
  return currNode;
}
```

#### 2.2.2 插入节点（insert）

```js
function insert(newElement, item) {
  var newNode = new Node(newElement);
  var currNode = this.find(item);
  newNode.next = currNode.next;
  currNode.next = newNode;
}
```

#### 2.2.3 打印输出节点（log）

```js
function log() {
  var currNode = this.head;
  while (!(currNode.next == null)) {
    console.log(currNode.next.element);
    currNode = currNode.next;
  }
}
```

#### 2.2.4 删除节点（remove）

从链表中删除节点时，我们先要找个待删除节点的前一个节点，找到后，我们修改它的 next 属性，使其不在指向待删除的节点，而是待删除节点的下一个节点。

```js
function remove(item) {
  var prevNode = this.findPrev(item);
  if (!(prevNode.next == null)) {
    prevNode.next = prevNode.next.next;
  }
}
```

## 3. 双向链表定义

尽管从链表的头节点遍历链表很简单，但是反过来，从后向前遍历却不容易。我们可以通过给 Node 类增加一个 previous 属性，让其指向前驱节点的链接，这样就形成了双向链表。

![5](./5.png)

此时，向链表插入一个节点就要更改节点的前驱和后继了，但是删除节点的效率提高了，不再需要寻找待删除节点的前驱节点了。

## 4. 设计双向链表

#### 4.1 Node 类

要实现双向链表，首先需要给 Node 类增加一个 previous 属性：

```js
function Node(element) {
  this.element = element; //当前节点的元素
  this.next = null; //下一个节点链接
  this.previous = null; //上一个节点链接
}
```

### 4.2 LinkedList 类

#### 4.2.1 插入节点（insert）

双向链表的 insert 方法与单链表相似，但需要设置新节点的 previous 属性，使其指向该节点的前驱

```js
function insert(newElement, item) {
  var newNode = new Node(newElement);
  var currNode = this.find(item);
  newNode.next = currNode.next;
  newNode.previous = currNode;
  currNode.next = newNode;
}
```

#### 4.2.2 删除节点（remove）

双向链表的删除 remove 方法比单链表效率高，不需要查找前驱节点，只要找出待删除节点，然后将该节点的前驱 next 属性指向待删除节点的后继，设置该节点后继 previous 属性，指向待删除节点的前驱即可

```js
function remove(item) {
  var currNode = this.find(item);
  if (!(currNode.next == null)) {
    currNode.previous.next = currNode.next;
    currNode.next.previous = currNode.previous;
    currNode.next = null;
    currNode.previous = null;
  }
}
```

#### 4.2.3 查找节点（find）

```js
function find(item) {
  var currNode = this.head;
  while (currNode.element != item) {
    currNode = currNode.next;
  }
  return currNode;
}
```

#### 4.2.4 查找最后一个节点（findLast）

```js
function findLast() {
  var currNode = this.head;
  while (!(currNode.next == null)) {
    currNode = currNode.next;
  }
  return currNode;
}
```

#### 4.2.5 反向打印链表

```js
function logReverse() {
  var currNode = this.findLast();
  while (!(currNode.previous == null)) {
    console.log(currNode.element);
    currNode = currNode.previous;
  }
}
```

## 5. 循环链表

循环链表和单链表相似，节点类型都是一样，唯一的区别是，在创建循环链表的时候，让其头节点的 next 属性执行它本身。

```js
head.next = head;
```

这种行为会导致链表中每个节点的 next 属性都指向链表的头节点，换句话说，也就是链表的尾节点指向了头节点，形成了一个循环链表。

![6](./6.png)

> **参考资料**
>
> - 作者：Chris 威
> - 链接：https://juejin.cn/post/6844903498362912775
> - 来源：掘金
> - 著作权归作者所有。商业转载请联系作者获得授权，非商业转载请注明出处。
