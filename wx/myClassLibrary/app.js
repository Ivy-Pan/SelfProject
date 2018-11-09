//app.js
App({
	globalData: {
		encryptedData: null
	},
  
  onLaunch: function () {
	  /*
	  * @ wx.getUserInfo 授权处理
	  * -------------------------------------------------------------*/
   
	  // login
    wx.checkSession({
      fail() {
        wx.login({
          success: res => {
            // 发送 res.code(临时登录凭证) 到后台以便得到该用户登录态信息（包括openId和sessionKey）
          }
        })
      }
    });
    
    // getUserInfo(不需要敏感信息)
    if(!wx.getStorageSync('userInfo')) {
      wx.getSetting({
        success: res => {
          if(res.authSetting['scope.userInfo']) {  // 已授权
            wx.getUserInfo({
                success:res => {
                  wx.setStorageSync('userInfo', res.userInfo);
                  
	                if (this.userInfoReadyCallback) {
		                this.userInfoReadyCallback(res)
	                }
                }
            })
          }
        }
      })
    }
    
    /*wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) { // 已授权
          wx.getUserInfo({
            widthCredential: true,
            success: res => {
              this.globalData.userInfo = res.userInfo;
              
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        }
      }
    })*/
  },
  
  
})