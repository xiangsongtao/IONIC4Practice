/**
 * Created by xiangsongtao on 16/3/16.
 * 自助停车-自助缴费-缴费-controller
 */
(function () {
    angular.module('smartac.page')
        .controller('selfPayToPayCtrl',
            ['$scope', '$state', '$stateParams', '$filter', '$integralInfo', '$sessionStorage', '$getCode', '$ionicLoading', '$payForParking', '$ionicToast', '$timeout', '$q', '$ionicScrollDelegate', '$goBackWhenError', '$rootScope', '$userCouponList', '$log',
                function ($scope, $state, $stateParams, $filter, $integralInfo, $sessionStorage, $getCode, $ionicLoading, $payForParking, $ionicToast, $timeout, $q, $ionicScrollDelegate, $goBackWhenError, $rootScope, $userCouponList, $log) {
                    //选择微信支付
                    $scope.wxSelected = false;
                    $scope.selectWXToPay = function () {
                        $scope.wxSelected = !$scope.wxSelected;
                        $scope.zfbSelected = false;
                        calculate();
                    };
                    // 选择支付宝支付
                    $scope.zfbSelected = false;
                    $scope.selectZFBToPay = function () {
                        $scope.wxSelected = false;
                        $scope.zfbSelected = !$scope.zfbSelected;
                        calculate();
                    };


                    var payInfo = $stateParams.data;
                    // 假数据
                    var payInfo = {
                        discount: 5,
                        entryTime: "2016-04-22 08:50",
                        paymentNumber: 1,
                        price: 7000,
                        seqNumber: "123000678",
                        ticketNumber: "1234.1234.1234",
                        time: 20
                    };
                    //数据增补
                    var payInfo_otherInfo = {
                        entryTime: $filter('yyyyMMdd_HHmmss_minus')(payInfo.entryTime),
                        nowTime: $filter('yyyyMMdd_HHmmss_minus')(new Date()),
                        price: parseFloat(payInfo.price) - parseFloat(payInfo.discount),
                        finalPrice: ""
                    };
                    //对象更新
                    angular.extend(payInfo, payInfo_otherInfo);
                    //更新view
                    $scope.payInfo = payInfo;
                    // 可用积分
                    $scope.integralCanUse;
                    //积分抵扣信息(满XXX积分可抵扣XXX元)
                    $scope.needIntegral;
                    $scope.relatedMoney;

                    //可用卡券列表
                    $scope.finnalCouponArr = [];

                    //停车最多可兑换的积分数
                    $scope.limitIntegral;

                    //每小时停车费
                    $scope.parkingHour2money = 30;//需呀写code
                    //积分抵扣钱数
                    $scope.intergal2money = 0;
                    //停车券抵扣钱数
                    $scope.coupon2money = 0;

                    /**
                     * 页面初始化逻辑
                     * 1. 获得积分抵扣规则
                     * 2. 获得可用卡券
                     * 3. 获取当前积分对象
                     * */
                    $q.all([
                        getRelatedCoupon(),
                        getExchangeCode(),
                        integralInfo(),
                        getLimitIntInfo()])
                        .then(function () {
                            //计算积分数
                            calculate();
                            //计算抵扣积分信息列表
                            caculateIntergalGroup();
                        }, function (err) {
                            $goBackWhenError()
                        });


                    /**
                     * 显示停车的卡券标题
                     * */
                    $scope.showCouponDetail = true;
                    $scope.showParkingCoupon = function () {
                        if (!$scope.finnalCouponArr.length) {
                            $ionicToast.show("暂无卡券可用!")
                            return false
                        }
                        $scope.showCouponDetail = !$scope.showCouponDetail;
                        $ionicScrollDelegate.resize();
                    };
                    //点击选择卡券
                    // $scope.selectedCouponValue = 0;
                    $scope.selectParkingCoupon = function (fee) {
                        //停车券抵扣钱数
                        $scope.coupon2money = $scope.parkingHour2money*fee;
                        calculate();
                        $scope.showCouponDetail = true;
                        $ionicScrollDelegate.resize();
                    };

                    /**
                     * 选择积分标题
                     * */
                    $scope.showIntergalDetail = true;
                    $scope.showIntergalGroup = function () {
                        $scope.showIntergalDetail = !$scope.showIntergalDetail;
                    };
                    //选择积分菜单明细
                    $scope.selectIntergral = function (index) {
                        var intergal = $scope.needIntegral * (index + 1);
                        $scope.intergal2money = $scope.relatedMoney * (index + 1);
                        $log.debug("intergal=" + intergal + "; money=" + $scope.intergal2money);
                        calculate();
                        $scope.showIntergalDetail = true;
                        $ionicScrollDelegate.resize();
                    };

                    $scope.intergalGroupArr = [];
                    function caculateIntergalGroup() {
                        // //max
                        // $scope.limitIntegral
                        // //only500
                        // $scope.needIntegral
                        // //500->10yuan
                        // $scope.relatedMoney
                        // //my integral
                        // $scope.integralCanUse

                        var count;
                        if ($scope.limitIntegral > $scope.integralCanUse) {
                            count = Math.floor($scope.integralCanUse / $scope.needIntegral);
                        } else {
                            count = Math.floor($scope.limitIntegral / $scope.needIntegral);
                        }
                        for (var i = 1; count > i - 1; i++) {
                            $scope.intergalGroupArr.push($scope.needIntegral * i)
                        }
                    }

                    /**
                     * 确认支付按钮
                     * */
                    $scope.confirmToPay = function () {
                        if ($scope.finalPrice && !$scope.wxSelected) {
                            $ionicToast.show("请选择余额支付方式!")
                            return
                        }
                        $ionicLoading.show({template: "正在支付"});
                        $payForParking({
                            "paymentInfo": {
                                "custid": 25,
                                "seqNumber": "123000678",
                                "ticketNumber": "1234.1234.1234",
                                "couponid": 1211,//优惠券id
                                "couponAmount": 5,// 优惠券支付金额
                                "wechatAmount": 10,//微信支付金额
                                "alipayAmount": 0,//支付宝支付金额
                                "pointPayNum": 500,//积分支付的积分数量
                                "pointPayAmount": 5//积分支付的抵扣金额
                            }
                        }).then(function (data) {
                            $timeout(function () {
                                $ionicToast.show("支付成功!")

                                $timeout(function () {
                                    $rootScope.goBack(2)
                                    // history.go(-2)
                                }, 700, false);

                            }, 1000, false);

                        }, function (errText) {
                            $ionicToast.show("支付失败," + errText);
                        }).finally(function () {
                            $timeout(function () {
                                $ionicLoading.hide();
                            }, 700)
                        })
                    }


                    /**
                     * 费用计算
                     * */
                    function calculate() {
                        // //max
                        // $scope.limitIntegral
                        // //only500
                        // $scope.needIntegral
                        // //500->10yuan
                        // $scope.relatedMoney
                        // //my integral
                        // $scope.integralCanUse

                        //coupon -> money
                        $scope.coupon2money

                        //intergal -> money
                        $scope.intergal2money

                        //final money need to pay = total-intergal2money-coupon2money
                        $scope.finalPrice = payInfo.price - $scope.coupon2money - $scope.intergal2money;

                    }

                    /**
                     * 获取当前积分对象
                     * */
                    function integralInfo() {
                        return $integralInfo({
                            "method": "getCustPointMain",
                            "conditions": {
                                "custid": $sessionStorage.userInfo.customerid
                            }
                        }).then(function (data) {
                            $scope.integralCanUse = data.currenttotalnum;
                        }, function (errText) {
                            $ionicToast.show("积分查询失败," + errText)
                        }).finally(function () {

                        })
                    }

                    /**
                     * 获取积分抵扣信息(满XXX积分可抵扣XXX元)
                     * */
                    function getExchangeCode() {
                        return $getCode({
                            "keyname": "integralexchange4pk"
                        }).then(function (data) {
                            angular.forEach(data, function (value) {
                                if (value.keyname == "integralexchange_1") {
                                    $scope.needIntegral = parseInt(value.keycode);
                                }
                                if (value.keyname == "integralexchange_2") {
                                    $scope.relatedMoney = parseFloat(value.keycode).toFixed(2);
                                }
                            });
                        }, function (errText) {
                            $ionicToast.show("获取积分抵扣信息失败," + errText)
                        })
                    }

                    /**
                     * 获取能抵扣的电子卡券(抵用券)
                     * 抵用券有最低 抵用金额,如果传入数小于抵用金额则此卡不可用
                     * @params:fee 传入金额
                     * */
                    function getRelatedCoupon() {
                        return $userCouponList({
                            "conditions": {
                                "custid": $sessionStorage.userInfo.customerid.toString(),
                                "categorycode": "",//2,抵扣券;3,现金券,5停车券
                                "typecode": 1,//1 卡券 ;2 礼品
                                "statuscode": 2,//1 已使用;2 未使用;3 已过期
                                "querytype": "main",
                                "page": {
                                    "index": 1,
                                    "num": 999
                                },
                                "sort": {
                                    "column": "get_time",
                                    "type": "desc"
                                }
                            }
                        }).then(function (data) {
                            // console.log(data)
                            $scope.finnalCouponArr = data;
                        }, function (errText) {

                        })
                    }

                    /**
                     * 获得会员停车最多可使用积分数
                     * */
                    function getLimitIntInfo() {
                        return $getCode({
                            "keyname": "int4parkcanuse"
                        }).then(function (data) {
                            $scope.limitIntegral = parseInt(data[0].keycode);
                            // console.log(limitIntegral)
                        }, function (err) {

                        });
                    }

                }]);
})();
