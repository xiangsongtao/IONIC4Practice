微信分享模块
===============


微信分享，一般是和获取微信config绑定到一起的，而且一旦获取就设置分享内容，因为无法预期用户何时点击了分享按钮，so，还是设置一个默认的分享比较好。我这里设置的默认分享配置在config中，内容是邀请用户注册，并进入后跳转到注册页面。因为还要考虑到不同的设备环境（微信和app），需要进行区分对待。

## 模块描述

- 如果传入参数为空，则微信设置默认内容，而app则不作为。
- 如果分享的时候用户登录过，微信会获取用户id，分享的连接加上分享人的id信息和webapp进入的跳转位置。
- 发送分享请求之前会进行地址签名，因为此应用是单页面页应用，故只需签名一次，签名好的信息保存到sessionStorage中，并且之后前面获取sessionStorage中的信息。
- 默认的分享内容建议放在config中。


## 模块代码：

流程很简单，不画了。以下是代码！

```
/**
 * Created by xiangsongtao on 16/5/26.
 */
(function () {
    /**
     * app and 微信分享相关 $setShareContent
     * @params: shareContent,directToState,stateParams
     * shareContent:title,desc,imgUrl,type,dataUrl,success,cancel
     * directToState: 进入home后跳转地址
     * stateParams: 跳转读写的参数 
     * */
    angular.module('smartac.page')
        .factory("$setShareContent", ['$wxGetConfig', '$sessionStorage', 'baseInfo', '$log', function ($wxGetConfig, $sessionStorage, baseInfo, $log) {

            /**
             * 获取分享的URL,默认加上分享人id
             * @params:
             * directToState 跳转地址(state,ui-router),默认为注册页
             * stateParams 跳转会读取的参数 string
             * */
            function getShareUrl(directToState, stateParams) {

                if (!directToState) {
                    directToState = baseInfo.defalutShareContent.directToState;
                }
                var uri = baseInfo.shareInfo.url;
                uri = uri + "?directToState=" + directToState;

                //如果分享人未登录,何来分享送积分? 获取分享人信息
                var userInfo = $sessionStorage.userInfo;
                if (!!userInfo && !!userInfo.customerid) {
                    uri = uri + "&sharedcustid=" + userInfo.customerid;
                }


                if (!!stateParams) {
                    uri = uri + "&stateParams=" + stateParams;
                }

                //编码
                var redirect_uri = encodeURIComponent(uri);

                var response_type = "code";
                var scope = "snsapi_base";
                var state = "index#wechat";
                return "https://open.weixin.qq.com/connect/oauth2/authorize?" +
                    "appid=" + baseInfo.wxAppID +
                    "&redirect_uri=" + redirect_uri +
                    "&response_type=" + response_type +
                    "&scope=" + scope +
                    "&state=" + state;
            }

            /**
             * 进行分享
             * */
            function launchShare(shareContent) {
                //当前地址签名,签名一次就好
                if (Internal.isInWeiXin) {
                    $wxGetConfig().then(function () {
                        nativePlugin.onMenuShareTimeline(shareContent);
                        nativePlugin.onMenuShareAppMessage(shareContent);
                        nativePlugin.onMenuShareQQ(shareContent);
                        nativePlugin.onMenuShareWeibo(shareContent);
                        nativePlugin.onMenuShareQZone(shareContent);
                    });
                } else if(Internal.isInApp){
                    nativePlugin.shareWithPanel(shareContent)
                }
            }

            /**
             * 默认设置(注册)
             * */
            function setDefaultContent(){
                var _content = baseInfo.defalutShareContent.content;
                var _shareRegisterPage = {
                    title: _content.title,
                    desc: _content.desc,
                    link: getShareUrl(),
                    imgUrl: _content.imgUrl,
                    type: _content.type,
                    dataUrl: _content.dataUrl
                };
                launchShare(_shareRegisterPage);
                // $log.debug("设置默认分享内容,分享注册页");
            }


            /**
             * 设置分享的内容
             * */
            function setGivenContent(shareContent,directToState,stateParams){
                //将传入值设置为分享内容
                var _shareRightPage = {
                    title: shareContent.title,
                    desc: shareContent.desc,
                    link: getShareUrl(directToState, stateParams),
                    imgUrl: shareContent.imgUrl,
                    type: shareContent.type,
                    dataUrl: shareContent.dataUrl,
                    success: function (res) {
                        shareContent.success && shareContent.success();
                    },
                    cancel: function (res) {
                        shareContent.cancel && shareContent.cancel();
                    }
                };
                launchShare(_shareRightPage);
                // $log.debug("设置定制化的注册页,跳转地址:" + directToState + ",参数:" + stateParams);
            }




            /**
             * 在微信模式下,第一屏需要设置默认分享内容,此时传入空的shareContent,会设置weixinConfig,
             * 我认为这个是有必要的。但是在app模式下,如果传入空的shareContent,会不作处理,因为其没有右上角的
             * 菜单,必须是点击分享后才能弹出分享选择, 此时再做设置,这样对两种模式都有兼容。
             *
             * shareContent为空:微信获取配置并设置默认分享,app不处理
             * shareContent有值:微信和app都设置。
             * */
            return function (shareContent, directToState, stateParams) {
                if(Internal.isInWeiXin){
                    if(!!shareContent){
                        setGivenContent(shareContent, directToState, stateParams);
                        $log.debug("微信分享,有内容:" + directToState + ",参数:" + stateParams);
                    }else{
                        //没有分享内容、跳转位置、跳转携带参数,则设置默认分享内容为注册页面分享
                        setDefaultContent();
                        $log.debug("微信分享,无内容,默认值");
                    }
                }else if(Internal.isInApp){
                    //有值才设置分享内容
                    if(!!shareContent){
                        setGivenContent(shareContent, directToState, stateParams);
                        $log.debug("APP分享,有内容:" + directToState + ",参数:" + stateParams);
                    }else{
                        $log.debug("APP分享,无内容");
                        //没有分享内容、跳转位置、跳转携带参数,则设置默认分享内容为注册页面分享
                    }
                }
            }
        }])
})();

```




