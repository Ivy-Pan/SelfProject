// pages/imgList/imgList.js
const template = require('../../template/template');
const regeneratorRuntime = require('../../utils/regenerator-runtime/runtime-module');
const basisUrl = 'https://image.baidu.com/search/acjson?tn=resultjson_com&ipn=rj';

let test = 1;
Page({
	
	
	/**
	 * 页面的初始数据
	 */
	data: {
		// 分页加载
		word: "插画",  // 关键字
		pageNum: 0,  // 加载第几页
		perNum: 50,  // 每页加载数量
		imgList: {  // 左、右列表存放图片
			left: [],
			right: []
		},
		imgHeight: {  // 左、右图片列表高度
			left: 0,
			right: 0
		}
	},
	
	
	onLoad: function (res) {
		// 设置搜索词
		this.setData({
			word: res.word
		})
		
		// 请求对应图片资源并渲染
		this.showImg()
	},
	
	// 图片请求的 url 处理
	packQueryUrl() {
		return basisUrl + '&word=' + this.data.word + '&pn=' + this.data.pageNum * this.data.perNum + '&rn=' + this.data.perNum;
	},
	
	// 请求查询图片资源
	async queryImg() {
		return new Promise((resolve, reject) => {
			wx.request({
				url: this.packQueryUrl(),
				success: resolve,
				fail: reject
			})
		})
	},
	
	// 实现瀑布流
	getWaterfall(imgData) {
		let leftHeight = this.data.imgHeight.left,
			rightHeight = this.data.imgHeight.right,
			imgListLeft = this.data.imgList.left,
			imgListRight = this.data.imgList.right;
		
		imgData.forEach(img => {
			if (leftHeight <= rightHeight) {
				imgListLeft.push(img);
				leftHeight += 1000 * img.height / img.width
				
			} else {
				imgListRight.push(img);
				rightHeight += 1000 * img.height / img.width
			}
		})
		this.data.imgHeight = {
			left: leftHeight,
			right: rightHeight
		}
		
		this.setData({
			imgList: {
				left: imgListLeft,
				right: imgListRight
			}
		})
	},
	
	// 请求并渲染图片
	showImg() {
		// 剔除无效信息和取得有用图片信息
		function getImgData(img) {
			let imgData = [];
			img.forEach(current => {
				if (current.thumbURL) {
					imgData.push({
						url: current.middleURL,
						width: current.width,
						height: current.height
					})
				}
			})
			
			return imgData
		}
		
		this.queryImg()
			.then((res) => {
				let imgData = getImgData(res.data.data)
				
				this.getWaterfall(imgData)
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
	

	// 预览图片
	previewImg (res) {
	
	let urls = [...this.data.imgList.left, ...this.data.imgList.right].map(img => img.url);
	
	wx.previewImage({
		urls: urls,
		current: res.currentTarget.dataset.url
	})
},
	// 保存网络图片到相册
	saveInternetImg: template.saveInternetImg,
	

})