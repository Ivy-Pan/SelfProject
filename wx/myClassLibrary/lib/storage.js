/*
 * 本地 Storage 类库封装
 * 1、针对 “对象数组”类型的 storage 存储：[{}, {}, {}, ……]
 * 2、仿 MongoDB
 * 3、依赖 数组方法
 * 4、链式调用
 * */

export default class Storage {
  constructor(name) {
    this.name = name;
    this.cache = { // 调用 save() 之前的操作数据存档
      add: []  // 记录新增数据
      /**
       * 记录删除数据
       * del: {
       *   whereFn: fn(){ }
       * }
       */
      /**
       * 记录更新数据
       * update: {
       *   data: {},
       *   whereFn: fn(){}
       * }
       */
    }
  }

  // 获取对应的本地缓存
  static getStorage(name) {

    return wx.getStorageSync(name) || [];
  }

  // 新增
  add(data) {
    if (data.constructor === Object) {
      this.cache.add.push(data)
    } else if (Array.isArray(data)) {
      data.forEach(item => {
        this.add(item)
      })
    } else {
      throw new Error('add()方法接受一个对象或一个对象数组为参数！')
    }

    return this;
  }

  // where 查询
  where(...args) {
    let [key, operator, compareValue] = args;

    if (compareValue === undefined) {
      [compareValue, operator] = [operator, '=']
    }

    Storage.getWhere = () => {
      switch (operator) {
        case '=':
          return item => {
            return item[key] == compareValue;
          }

        case '==':
          return item => {
            return item[key] === compareValue;
          }

        case '!=':
          return item => {
            return item[key] != compareValue;
          }

        case '!==':
          return item => {
            return item[key] !== compareValue;
          }

        case '>':
          return item => {
            return item[key] > compareValue;
          }

        case '<':
          return item => {
            return item[key] < compareValue;
          }

        case '>=':
          return item => {
            return item[key] >= compareValue;
          }

        case '<=':
          return item => {
            return item[key] <= compareValue;
          }

        case 'like':
          return item => {
            return item[key] == compareValue;
          }

        default: 
          throw new Error(`where()方法不支持${operator}的比较方式`);
      }
    }

    return this;
  }

  // 查询：find()、findAll()
  find() {
    const storageData = Storage.getStorage(this.name);

    return storageData.find(Storage.getWhere())
  }
  findAll() {
    const storageData = Storage.getStorage(this.name);

    return storageData.filter(Storage.getWhere())
  }

  //  删除
  del(num) {
    this.cache.del = {
      whereFn: Storage.getWhere()
    }

    return this;
  }

  // 更新
  update(updateData) {
    if(updateData.constructor === Object) {
      this.cache.update = {
        data: updateData,
        whereFn: Storage.getWhere()
      };
    } else {
      throw new Error('update()方法仅接受"{}"对象为参数!');
    }

    return this;
  }

  //  保存：将cache更新到本地storage
  save() {
    // 获取当前缓存
    let storageData = Storage.getStorage(this.name);

    // 处理删除数据
    if (this.cache.del) {
      storageData = storageData.filter(item => {

        return !this.cache.del.whereFn(item)
      })
    }

    // 处理更新数据
    if (this.cache.update) {
      storageData = storageData.map(item => {
        
        return Object.assign(item, this.cache.update.data);
      })
    }

    // 处理新增数据
    if (this.cache.add.length > 0) {
      storageData.push(...this.cache.add)
    }

    //  更新本地缓存
    wx.setStorageSync(this.name, storageData);

    // 更新操作数据缓存
    this.cache = {
      add: []
    }

  }

}