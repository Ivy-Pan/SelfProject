//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    // 候选词
    candidate: [ '插画', '风景', '猫',  '手机壁纸', '动漫', '小清新'
    ]
  },

  // 搜索图片
  searchImg(res) {
    wx.navigateTo({
      url: '../imgList/imgList?word=' + res.detail.value.keyword,
    })
  }
  
})
