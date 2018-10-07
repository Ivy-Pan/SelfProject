// template.js

// 保存网络图片到相册
function saveInternetImg (res) {
	wx.downloadFile({
		url: res.currentTarget.dataset.url,
		success(res) {
			if (res.statusCode === 200) {
				wx.saveImageToPhotosAlbum({
					filePath: res.tempFilePath,
				})
			}
		}
	})
}



// 导出
module.exports = {
	saveInternetImg: saveInternetImg
}