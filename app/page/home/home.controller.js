/**
 * Created by xiangsongtao on 16/3/16.
 * 首页 controller
 */
(function () {
    angular.module('smartac.page')
        .controller('homeCtrl', ['$scope', '$sessionStorage', '$rootScope', '$ionicPopup', '$state', 'api', 'AJAX', '$ionicToast', '$q', '$getCode', '$getUrlParams', '$checkAuthorize', '$filter', '$log', '$ionicLoading', '$integralInfo', '$getMessage', function ($scope, $sessionStorage, $rootScope, $ionicPopup, $state, api, AJAX, $ionicToast, $q, $getCode, $getUrlParams, $checkAuthorize, $filter, $log, $ionicLoading, $integralInfo, $getMessage) {


            /**
             *  在微信模式下
             * */
            if (Internal.isInWeiXin) {
                /**
                 *  根据进入的url调转条件,跳转到对应的页面
                 *  规定app进入的第一个页面一定是Home页.
                 *
                 * 用户需求在公众号进入app内分页的需求,
                 * 方案:将进入页的state放入directToState的url字段中.
                 * 如果directToState有值,则跳转到对应页面
                 * */
                var urlParams = $getUrlParams();
                var directToState = urlParams.directToState;
                if (directToState) {
                    if (directToState.indexOf("subNav") != -1) {
                        $state.go(directToState);
                    } else if (directToState.indexOf("members") != -1) {
                        showMember();
                    }
                }

                /**
                 * 微信用户将退出隐藏
                 * */
                $scope.isInWeiXin = Internal.isInWeiXin;
            }

            /**
             * show showMember showHome
             * 检查用户权限$checkAuthorize,这段比较特殊
             *  检查权限(需要注册,需要关注)
             * 然后查询信息,故这里不再查询用户信息
             * */
            $scope.showMember = function () {
                $checkAuthorize("wxLevel_Att&Reg").then(function () {
                    //具备授权
                    $ionicLoading.show({
                        during: 2000
                    });
                    getBasicInfo().then(function () {
                        //成功处理
                        //显示用户中心
                        angular.element(document.getElementById('member')).addClass('showMember');
                        //头像
                        $rootScope.photo = $filter('addImgPrefix')($sessionStorage.userInfo.photo);
                    }).finally(function () {
                        $ionicLoading.hide();
                    });
                });
            };
            /**
             * 收起 用户中心  显示首页
             * */
            $scope.showHome = function () {
                angular.element(document.getElementById('member')).removeClass('showMember');
            };

            /**
             * 点击退出-logout,删除$sessionStorage中存储的信息
             * 然后返回主页
             * */
            $scope.doLogout = function () {
                $ionicPopup.show({
                    title: "确认退出?",
                    cssClass: 'logoutPopup',
                    buttons: [{
                        text: '取消',
                        type: 'btnfor2',
                        onTap: function (e) {
                            return
                        }
                    }, {
                        text: '确定',
                        type: 'btnfor2',
                        onTap: function (e) {
                            delete $sessionStorage.$reset();
                            $state.go('home');
                            $scope.showHome();
                        }
                    }]
                });

            };


            /**
             * 显示vip规则
             * */
            $scope.showVIPRule = function () {
                $ionicPopup.show({
                    title: "VIP规则",
                    template: "到达vip后,在半年内积分大于" + $scope.nextIntegral + "可继续维持vip;未达到" + $scope.nextIntegral + "将会降级为普通会员.",
                    cssClass: 'noticePopup',
                    buttons: [{
                        text: '我知道了',
                        type: 'noticePopupBtn',
                        onTap: function (e) {
                            return
                        }
                    }]
                });
            };


            /**
             * 获取会员等级的升级积分界限
             * */
            function getCardUpgradeIntegral() {
                var defer = $q.defer();
                $getCode({
                    "keyname": "cardupgrade"
                }).then(function (data) {
                    //cardupgrade0: 升普卡消费金额,200
                    $scope.cardupgrade0 = data[0].keycode;
                    //cardupgrade1:升为VIP卡消费金额,5000
                    $scope.cardupgrade1 = data[1].keycode;
                    $log.debug(" 升普卡消费金额:" + $scope.cardupgrade0);
                    $log.debug(" 升为VIP卡消费金额:" + $scope.cardupgrade1);
                    defer.resolve();
                }, function (err) {
                    $log.debug("获取会员升级条件出错:" + err);
                    defer.reject();
                });
                return defer.promise;
            }


            /**
             * 获取会员等级的降级积分界限
             * */
            function getCardDegradeIntegral() {
                var defer = $q.defer();
                $getCode({
                    "keyname": "carddegrade"
                }).then(function (data) {
                    //cardupgrade0: vip降普卡消费金额,5000
                    $scope.carddegrade0 = data[0].keycode;
                    $log.debug("vip降普卡消费金额" + $scope.carddegrade0);
                    defer.resolve();
                }, function (err) {
                    $log.debug("获取会员降级条件出错," + err);
                    defer.reject();
                });
                return defer.promise;
            }

            /**
             *
             * */
            function getUserIntegral() {
                var defer = $q.defer();
                $integralInfo({
                    "custid": $sessionStorage.userInfo.customerid
                }).then(function (data) {
                    $log.debug("获取会员积分数据" + JSON.stringify(data));
                    defer.resolve();
                }, function (err) {
                    $log.debug("获取会员积分数据出错," + err);
                    defer.reject();
                });
                return defer.promise;
            }


            /**
             * 设置promise查询策略,获取登陆后的基本信息
             * 这三个信息必须都获取到才能显示用户信息界面
             * successCallback:成功回调
             * */
            function getBasicInfo() {
                var defer = $q.defer();
                $q.all([getCardUpgradeIntegral(), getCardDegradeIntegral(), getUserIntegral(), getMessageNum()])
                    .then(function () {
                        /**
                         * 因为等级判断不是实时的,故在这里进行假显示,增强用户体验
                         * */
                        var progress;
                        var userInfo = $sessionStorage.userInfo;
                        var integralInfo = $sessionStorage.integralInfo;
                        $scope.userDisplayIntegral = integralInfo.currentLevelPoint;
                        // $scope.userDisplayIntegral = 2000;
                        $scope.vipLevel = userInfo.levelid;
                        // $scope.vipLevel = 2;

                        if ($scope.vipLevel == 1) {
                            if ($scope.userDisplayIntegral > $scope.cardupgrade0) {//如果达到第2级的条件
                                progress = 50;
                            } else {
                                progress = $scope.userDisplayIntegral / 2 / $scope.cardupgrade0 * 100;
                            }
                            $scope.nextIntegral = $scope.cardupgrade0;
                        } else if ($scope.vipLevel == 2) {
                            progress = $scope.userDisplayIntegral / $scope.cardupgrade1 * 50 + 50;
                            $scope.nextIntegral = $scope.cardupgrade1;
                        } else if ($scope.vipLevel == 3) {
                            var duetime = userInfo.duetime;
                            if (duetime) {
                                $scope.vipEndTIme = $filter('yyyyMMdd_slash')(duetime);
                            } else {
                                //如果时间没有duetime则返回当前时间
                                $scope.vipEndTIme = $filter('yyyyMMdd_slash')();
                                $log.debug("VIP会员过期时间未获取到,当前使用今天的日期!")
                            }
                            $scope.nextIntegral = $scope.carddegrade0;
                            progress = $scope.userDisplayIntegral / $scope.cardupgrade1 * 100;
                        }
                        document.getElementById('vipState-lay2-progress').style.width = progress + "%";
                        // console.log(progress)
                        //成功
                        defer.resolve();
                    }, function (err) {
                        $ionicToast.show("无法进入,请稍后再试!");
                        $log.debug("无法进入用户中心,无法获取积分降级升级的code值,请查看!!");
                        defer.reject();
                    });
                return defer.promise;
            }

            /**
             * 获取用户消息数
             * */

            function getMessageNum() {
                return $getMessage({
                    "method": "query",
                    "querytype": "count",//count
                    "message": {
                        "statuscode": 0//#状态：0未读/1已读/2删除
                    }
                }).then(function (data) {
                    $scope.messageNum = !!data;
                })
            }

        }]);
})();