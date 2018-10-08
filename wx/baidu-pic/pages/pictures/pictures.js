// pages/pictures/pictures.js

// 引入
const regeneratorRuntime = require('../../utils/regenerator-runtime/runtime-module');

// 全局变量
const basisUrl = 'https://image.baidu.com/search/acjson?tn=resultjson_com&ipn=rj'; // 图片搜索地址

Page({

  /**
   * 页面的初始数据
   */
  data: {
    word: '猫',  // 搜索关键字
    pageNum: 0,  // 页码
    perNum: 50,  // 每页显示数量
    listNum: 2,  // 列表列数
    pic: [],  // 图片数据列表，二维数组
    picHeight: [],  // 图片列表高度
	  picUrl: []
  },
  
	onLoad: function(res) {
		wx.setNavigationBarTitle({
			title: res.word
		})
  	this.setData({
		  word: res.word
	  })
    this.createPicContainer();
		this.showImg();
	},
 
	// 请求图片资源
  getPicResource() {
    let url = basisUrl + '&word=' + this.data.word + '&pn=' + this.data.pageNum * this.data.perNum + '&rn=' + this.data.perNum;
    
	  wx.showNavigationBarLoading();
    
    return new Promise((resolve, reject) => {
	    wx.request({
		    url: url,
		    success: resolve,
        fail: reject
	    })
    })
	  
  },
  
	// 选取有用图片信息
  getPicInfo(picResource) {
    let pic = [];
	  picResource.forEach(item => {
	    if(item.thumbURL) {
	      pic.push({
		      thumbUrl: item.thumbURL,
          middleUrl: item.middleURL,
          objUrl: item.objURL,
          width: item.width,
          height: item.height
        });
		    this.data.picUrl.push(item.middleURL)
      }
    })
    return pic
  },
  
	// 根据列数listNum动态创建列表数据容器： listNum、picHeight、pic
  createPicContainer() {
    this.data.picHeight = new Array(this.data.listNum).fill(0);
    this.data.pic = new Array(this.data.listNum).fill(0).map(() => []);
  },
  
	// waterfall 瀑布流实现
  waterfall(picInfo) {
    picInfo.forEach(item => {
      let minIndex = this.data.picHeight.indexOf(Math.min(...this.data.picHeight));
      this.data.pic[minIndex].push(item);
      this.data.picHeight[minIndex] += item.height * 1000 / item.width;
      
      this.setData({
        pic: this.data.pic
      })
	    
	    wx.hideNavigationBarLoading();
    })
  },
  
	// 渲染图片
  showImg() {
	  // 请求图片资源并处理
	  this.getPicResource()
		  .then(res => {
			  this.waterfall(this.getPicInfo(res.data.data))
		  })
		  .catch(err => {
			  console.log(err)
		  });
  },
  
	// 滚动加载更多
	scrollMore() {
    this.data.pageNum++;
    this.showImg();
  },
	
	// 图片操作：图片预览和下载
	imgHandle(res) {
    let handle = res.target.dataset.handle,
        url = res.target.dataset.url;
    
    if(handle === 'previewImg') {
      wx.previewImage({
        urls: this.data.picUrl,
        current: url
      })
    } else if(handle === 'download') {
	    wx.downloadFile({
		    url: url,
		    success(res) {
			    if (res.statusCode === 200) {
				    wx.saveImageToPhotosAlbum({
					    filePath: res.tempFilePath,
				    })
			    }
		    }
	    })
    }
  },

});