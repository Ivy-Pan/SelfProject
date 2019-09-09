// Page 页面事件改写：功能类似与二级监听事件（addEventListener('name', callback)）

export default class Event {

  constructor() {
    // events: 一个不可枚举的属性，用来存储Page页面事件函数队列
    Object.defineProperty(this, 'events', {
      value: {
        // onLoad: [fn1, fn2, ……]
      },
      enumerable: false
    })
  }

  // 事件触发器
  static trigger(eventName, event) {
    // this：指 Event 类
    // event: 一般传入的是实例 event
    
    Reflect.set(event, eventName, function (...args) {
      /**
       * 这个函数就是Page中对应函数名的处理函数
       * 因此，在这个函数中，this 指 Page 对象
       * 同时，这个函数不能用箭头函数定义
       * 因为在Page中，除了回调函数，里面所有函数中的 this 都指 Page
       * 所以要把这个 this 存起来，避免 this 不指向 Page 的情况
      */

      console.log(this);
      console.log(event)
      
      const page = this;

      let typeFns = Array.from(Reflect.get(event.events, eventName));




    })
  }

  // 获取事件的处理函数队列
  getEvent(eventName) {
    let eventFns = Reflect.get(this.events, eventName);

    if(!Array.isArray(eventFns)) {
      eventFns = [];
      Reflect.set(this.events, eventName, eventFns);
      Event.trigger(eventName, this)
    }

    return eventFns;
  }

  // 添加事件
  addEvent(eventName, callback) {
    let eventFns = this.getEvent(eventName)

    eventFns.push(callback)
  }



}