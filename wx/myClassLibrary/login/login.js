/**
 * login 和 getUserInfo 设置
 */

const app = getApp()

Page({
  data: {
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },

  // getUserInfo
	getUserInfo(e) {
		wx.getSetting({
      success: res => {
        if(res.authSetting['scope.userInfo']) {
	        wx.setStorageSync('userInfo', e.detail.userInfo);
	        this.setData({
		        userInfo: e.detail.userInfo,
		        hasUserInfo: true
	        })
        }
      }
    })
	  
  },
	
  
  
  onLoad: function () {
	  /*
		* @ wx.getUserInfo 授权处理
		* ----------------------------------------------------------------
		*   1、共要设置 app.js 和进入的第一个页面的 JS，这里以 login.js 为例：
		*   2、需要敏感信息：均存入 globalData
		*   3、不需要敏感信息：存入 localStorage
		*   4、变量说明：
		*       用户普通信息：userInfo
		*       用户敏感信息：sensitiveInfo
		* */
	  const userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      this.setData({
        userInfo: userInfo,
        hasUserInfo: true
      })
    } else {
	    wx.getSetting({
		    success: res => {
			    if(res.authSetting['scope.userInfo']) {  // 已授权
				    app.userInfoReadyCallback = res => {
					    this.setData({
						    userInfo: res.userInfo,
						    hasUserInfo: true
					    })
				    }
			    }
		    }
      })
    };
  },

})