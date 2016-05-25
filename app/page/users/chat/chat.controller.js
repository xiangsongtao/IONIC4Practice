/**
 * Created by xiangsongtao on 16/3/16.
 * 客服 controller
 */
(function () {
    angular.module('smartac.page')
        .controller('chatCtrl', ['$scope', '$sessionStorage', '$timeout','$ionicScrollDelegate','$ionicToast','$ocLazyLoad','socketFactory','baseUrl','baseInfo', function ($scope, $sessionStorage, $timeout ,$ionicScrollDelegate,$ionicToast,$ocLazyLoad,socketFactory,baseUrl,baseInfo) {

            $scope.serviceTel = baseInfo.serviceTel;
            
            
            
            $ocLazyLoad.load('lazyLoadSocketIO').then(function () {
                var $socket = socketFactory({
                    ioSocket: io.connect(baseUrl.socketChatUrl, {'force new connection': true})
                });
                $scope.visitorPhoto = $sessionStorage.userInfo.photo;
                var customerid = $sessionStorage.userInfo.customerid;
                $scope.dialogs = [];
                //定义chat数据类型(数据作用域链)
                $scope.chat = {
                    message: ""
                };
                // console.log($socket);

                /**
                 * 点击camera
                 * */
                $scope.cameraBtn = function () {
                    $ionicToast.show("此功能尚未开发!")
                };
                /**
                 * 问候语
                 * */
                $timeout(function () {
                    $scope.dialogs.push({message: "您好，请输入您的问题？O(∩__∩)O~", typecode: 1});
                }, 700);

                /**
                 * 发送消息
                 * */
                $scope.sendMessage = function () {
                    if (!$scope.chat.message) {
                        return;
                    }
                    //console.log('发送消息: ' + $scope.message)
                    $socket.emit('appsend', {
                        customerid: customerid,//会员id，
                        message: $scope.chat.message,//‘消息’，(如果msgtype是2，3则message填写资源服务器id)
                        msgtype: 1//1(文本)，2(图片)，3(语音)}
                    });
                    $timeout(function () {
                        $scope.dialogs.push({
                            message: $scope.chat.message,
                            typecode: 2
                        });
                        //清空数据
                        $scope.chat.message = '';
                    }, 0);

                    //滚动到底部
                    $ionicScrollDelegate.scrollBottom(true);
                    $ionicScrollDelegate.isNative;
                    console.log($ionicScrollDelegate)
                };




                /**
                 * 页面进入建立连接及事件
                 * */
                $scope.$on("$stateChangeSuccess", function (event, toState, toParams, fromState, fromParams, error) {
                    if (toState.name == 'subNav.chat') {
                        /**
                         * 接受消息(监听新消息)
                         * 返回数据结构:
                         * data = {
                       *    msgtype: 1(文本)，2(图片)，3(语音),
                       *    message: ‘文本消息’(如果msgtype是2，3则message返回资源服务器id),
                       *    typecode: 1（后台客服发送的消息）2（客户发送的消息）,
                       *    visitorid: customerid,
                       *    date: ‘yyyy-MM-dd HH:mm:ss’
                       * }
                         * */
                        $socket.on('appreceive', function (data) {
                            console.log('socket服务器返回结果', JSON.stringify(data));
                            if (data.typecode == 2) {
                                $timeout(function () {
                                    $scope.message = '';
                                }, 0);
                            }
                            if (data.typecode == 1) {
                                $timeout(function () {
                                    $scope.dialogs.push(data);
                                }, 0);
                            }
                        });

                        /**
                         * 建立连接
                         * Web页面连接上socket服务器后，
                         * 服务器会返回一个successconn请求，
                         * 数据内容为空，表示成功链接上socket服务器
                         * typecode:1,客服; 2,用户
                         * */
                        $socket.on("successconn", function () {
                            console.log('服务器返回successconn请求,socket连接成功!');
                            $socket.emit('login', {customerid: customerid});
                        });
                    }
                });


                /**
                 * 离开页面断开连接
                 * */
                $scope.$on('$destroy', function (e) {
                    $socket.disconnect();
                    $socket.removeAllListeners();
                    //console.log('断开连接');
                });
            });

            console.log();

            // $scope.visitorPhoto = $sessionStorage.userInfo.photo;
            // var customerid = $sessionStorage.userInfo.customerid;
            // $scope.dialogs = [];
            // //定义chat数据类型(数据作用域链)
            // $scope.chat = {
            //     message: ""
            // };
            // console.log($socket);
            //
            // /**
            //  * 点击camera
            //  * */
            // $scope.cameraBtn = function () {
            //     $ionicToast.show("此功能尚未开发!")
            // };
            // /**
            //  * 问候语
            //  * */
            // $timeout(function () {
            //     $scope.dialogs.push({message: "您好，请输入您的问题？O(∩__∩)O~", typecode: 1});
            // }, 700);
            //
            // /**
            //  * 发送消息
            //  * */
            // $scope.sendMessage = function () {
            //     if (!$scope.chat.message) {
            //         return;
            //     }
            //     //console.log('发送消息: ' + $scope.message)
            //     $socket.emit('appsend', {
            //         customerid: customerid,//会员id，
            //         message: $scope.chat.message,//‘消息’，(如果msgtype是2，3则message填写资源服务器id)
            //         msgtype: 1//1(文本)，2(图片)，3(语音)}
            //     });
            //     $timeout(function () {
            //         $scope.dialogs.push({
            //             message: $scope.chat.message,
            //             typecode: 2
            //         });
            //         //清空数据
            //         $scope.chat.message = '';
            //     }, 0);
            //
            //     //滚动到底部
            //     $ionicScrollDelegate.scrollBottom(true);
            // };
            //
            //
            //
            //
            // /**
            //  * 页面进入建立连接及事件
            //  * */
            // $scope.$on("$stateChangeSuccess", function (event, toState, toParams, fromState, fromParams, error) {
            //     if (toState.name == 'subNav.chat') {
            //         /**
            //          * 接受消息(监听新消息)
            //          * 返回数据结构:
            //          * data = {
            //            *    msgtype: 1(文本)，2(图片)，3(语音),
            //            *    message: ‘文本消息’(如果msgtype是2，3则message返回资源服务器id),
            //            *    typecode: 1（后台客服发送的消息）2（客户发送的消息）,
            //            *    visitorid: customerid,
            //            *    date: ‘yyyy-MM-dd HH:mm:ss’
            //            * }
            //          * */
            //         $socket.on('appreceive', function (data) {
            //             console.log('socket服务器返回结果', JSON.stringify(data));
            //             if (data.typecode == 2) {
            //                 $timeout(function () {
            //                     $scope.message = '';
            //                 }, 0);
            //             }
            //             if (data.typecode == 1) {
            //                 $timeout(function () {
            //                     $scope.dialogs.push(data);
            //                 }, 0);
            //             }
            //         });
            //
            //         /**
            //          * 建立连接
            //          * Web页面连接上socket服务器后，
            //          * 服务器会返回一个successconn请求，
            //          * 数据内容为空，表示成功链接上socket服务器
            //          * typecode:1,客服; 2,用户
            //          * */
            //         $socket.on("successconn", function () {
            //             console.log('服务器返回successconn请求,socket连接成功!');
            //             $socket.emit('login', {customerid: customerid});
            //         });
            //     }
            // });
            //
            //
            // /**
            //  * 离开页面断开连接
            //  * */
            // $scope.$on('$destroy', function (e) {
            //     $socket.disconnect();
            //     $socket.removeAllListeners();
            //     //console.log('断开连接');
            // });
        }]);

})();