// test/test.js

import Storage from '../lib/storage.js';

Page({
  
  data: {

  },
  
  onLoad: function (options) {
	  /**
	   * Storage ：本地 storage 封装测试
	   * -----------------------------------------------------------
	   */
	  // let test = new Storage('test');
	  // test.add({ id: 5 }).save();
	  // let data = test.where('id', '>', 0).findAll()
	  // test.where('id', 5).del().save();
	  // console.log(data)
	  // test.where('id', '>', 5).update({id: 6, name:'ivy'}).save()
	  // test.add({ id: 7 })
	  // test.where('id', '>=', 5).update({name: 'ivy', age: 18}).save()
	  // test.where('id', 0).del().save()
	  // let data = test.where('id', '>', 1).findAll().sort(function(a, b) {
	  //   return a.id - b.id
	  // })
	  // let data = test.where('id', '=', 1).update([1,2])
	  // console.log(data)
  },
  
  onReady: function () {

  },
  
  onShow: function () {

  },
  
  onHide: function () {

  },

  onUnload: function () {

  },
  
  onPullDownRefresh: function () {

  },
  
  onReachBottom: function () {

  },
  
  onShareAppMessage: function () {

  }
})