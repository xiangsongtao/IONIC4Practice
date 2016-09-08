/**
 * Created by xiangsongtao on 16/4/14.
 * user 相关的services层
 */
(function () {
    angular.module('smartac.page')
    /**
     * 获取用户信息(微信和app通用), 已做缓存处理
     * */
        .factory("$getUserInfo", ['AJAX', '$q', '$sessionStorage', '$log', '$ionicToast', '$setShareContent', '$localStorage', '$rootScope', '$filter', function (AJAX, $q, $sessionStorage, $log, $ionicToast, $setShareContent, $localStorage, $rootScope, $filter) {
            return function (options) {
                !angular.isObject(options) && (options = {});
                var defer = $q.defer();
                var userInfo = $sessionStorage.userInfo;
                //设定保存0秒,30s内有效
                if ((userInfo) && (!!userInfo.customerid) && (((new Date().getTime() - parseInt(userInfo.time)) / 1000) < (30))) {
                    defer.resolve(userInfo);
                    //每次获取最新信息的时候设置头像
                    $rootScope.photo = $filter('addImgPrefix')($sessionStorage.userInfo.photo);
                    $log.debug("userInfo使用缓存数据!时间:" + ((new Date().getTime() - parseInt(userInfo.time)) / 1000) + "s");
                    return defer.promise;
                }
                $log.debug("userInfo使用最新数据!");
                var params = {
                    "method": "query",
                    "conditions": {
                        "customerid": "",//会员id	String	否
                        "mobile": "",//手机号码	String	否
                        "openid": "",//微信openid	String	否
                        "mac": "",//设备Mac	String	否
                        "custcardno": "",//会员卡号	String	否
                        "wechatcode": "",//微信code值	String	否
                        "accountid": ""//公众号	String	否
                    }
                };
                AJAX({
                    url: API.customerUrl,
                    method: "post",
                    data: angular.deepExtend(params, options),
                    success: function (data) {

                        if (data.code == "7001" && angular.isArray(data.members) && data.members.length) {
                            var userInfo = data.members[0];
                            //设置时间戳
                            userInfo.time = new Date().getTime();
                            //状态数据存储
                            $sessionStorage.userInfo = angular.copy(userInfo);
                            //每次获取最新信息的时候设置头像
                            $rootScope.photo = $filter('addImgPrefix')($sessionStorage.userInfo.photo);

                            //如果是app,那就将customerid放在localStorage中
                            //需求需要app登陆和注册成功会记住用户的登陆状态,进入用户中心时,
                            // checkAuthorize会检查localStorage中的customerid值,
                            //故在获取用户信息的时候就保存一份在localStorage中
                            if (Internal.isInApp) {
                                $localStorage.userInfo = {
                                    customerid: userInfo.customerid.toString()
                                };
                            }
                            //设置分享内容
                            $setShareContent();
                            //返回数据
                            defer.resolve(userInfo);
                            $log.debug("获取用户信息成功");
                        } else {
                            $ionicToast.show("无法获取您的信息,请稍后再试!");
                            $log.debug("获取用户信息出错," + data.code);
                            defer.reject("系统错误!");
                        }
                    },
                    error: function (errText) {
                        $ionicToast.show("无法获取您的信息,请稍后再试!");
                        $log.debug("获取用户信息出错," + JSON.stringify(errText));
                        defer.reject(errText);
                    }
                });
                return defer.promise;
            }
        }])

        /**
         * 用户信息更新
         * 执行$getUserInfo,同步更新到$sessionStorage中
         * */
        .factory("$updateUserInfo", ['AJAX', '$q', '$getUserInfo', '$sessionStorage', '$log', '$ionicToast', function (AJAX, $q, $getUserInfo, $sessionStorage, $log, $ionicToast) {
            return function (options) {
                !angular.isObject(options) && (options = {});
                var defer = $q.defer();
                var params = {
                    "method": "update",
                    "customer": {
                        "customerid": "",
                        "photo": "",
                        "fullname": "",
                        "mobile": "",
                        "provincecode": "",
                        "citycode": "",
                        "address": "",
                        "birthday": "",
                        "haschildren": ""
                    }
                };
                AJAX({
                    url: API.customerUrl,
                    method: "post",
                    data: angular.deepExtend(params, options),
                    success: function (data) {
                        if (data.code == "7001") {
                            //获取最新数据
                            $sessionStorage.userInfo.time = 0;
                            $getUserInfo({
                                "conditions": {
                                    "customerid": params.customer.customerid.toString()
                                }
                            }).finally(function () {
                                defer.resolve();
                            })
                        } else {
                            $ionicToast.show("信息更新失败,请稍后再试!");
                            $log.debug("用户信息更新失败,code:" + data.code);
                            defer.reject(data.code)
                        }
                    },
                    error: function (errText) {
                        $ionicToast.show("信息更新失败,请稍后再试!");
                        $log.debug("用户信息更新失败," + JSON.stringify(errText));
                        defer.reject(errText);
                    }
                });
                return defer.promise;
            }
        }])
})();