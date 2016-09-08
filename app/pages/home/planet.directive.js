'use strict';
/**
 * Created by xiangsongtao on 16/4/17.
 * 首页行星自定义组件(指令)
 */
(function () {
    angular.module('smartac.page')
    //ionPlanetBox外层总容器
        .directive('ionPlanet', [function () {
            return {
                restrict: 'E',
                compile: function (ele, attr) {
                    //点击tap后,返回顶部,如果不这样做,点击背景会出现错误
                    ele.on('touchstart', function () {
                        document.ontouchmove = function (e) {
                            e.preventDefault();
                        };
                    });
                    ele.on('touchmove', function () {
                        document.ontouchmove = function (e) {
                            e.preventDefault();
                        };
                    });
                    ele.on('touchend', function () {
                        document.ontouchmove = angular.noop;
                    });
                },
                controller: ['$scope', '$log', '$timeout', function ($scope, $log, $timeout) {
                    /**
                     * 每个行星定位
                     * */
                    let swiperInnerBox = document.querySelectorAll('.index-bottom-swiper-eachBox');
                    //html的font-size值
                    let baseFontSize = document.documentElement.style.fontSize;
                    //虚线轨迹直径(rem),
                    let circleWidth = 7.8;//rem
                    circleWidth = parseFloat(circleWidth) * parseFloat(baseFontSize);//px
                    let circleRadius = Math.floor((circleWidth / 2) * 100) / 100;
                    //导航栏目个数
                    let itemCount = swiperInnerBox.length;
                    //每一个的角度
                    let regEach = 2 * Math.PI / itemCount;
                    let reg = Math.PI;
                    //每个行星的宽度 = 设定的rem值 * html的font-size值
                    let swiperEachBoxWidth = 1.85;//rem
                    swiperEachBoxWidth = parseFloat(swiperEachBoxWidth) * parseFloat(baseFontSize);
                    //确定每一个行星的位置
                    for (let i = 0; itemCount > i; i++) {
                        //如果特别小,在手机端会出现bug,保留2位小数
                        let sinx = Math.floor(Math.sin(reg) * circleRadius * 100) / 100;
                        let cosx = Math.floor(Math.cos(reg) * circleRadius * 100) / 100;
                        let cssText =
                            'left:' + (circleRadius + sinx - swiperEachBoxWidth / 2) + 'px;' +
                            'top:' + (circleRadius + cosx - swiperEachBoxWidth / 2) + 'px;';
                        swiperInnerBox[i].style.cssText = cssText;
                        reg = reg - regEach;
                    }


                    /**
                     * 控制每个行星旋转
                     * */
                    let swiperEachBoxi = document.querySelectorAll('.index-bottom-swiper-eachBox-i');

                    //找到行星轨迹的虚线DOM
                    let swiperInner = document.getElementById('index-bottom-swiper-inner');

                    //转动之前的状态
                    let rotateBefore = 0;
                    //转动之后的状态
                    let rotateNext = 0;
                    //正在转动的状态
                    let rotateNow = 0;
                    //当前转动百分比
                    let percent = 0;
                    //每次转动的固定角度(6个行星60度)
                    let rotateEachDeg = 360 / itemCount;
                    //滑动速度
                    let velocityX;
                    //正在动画
                    let isAnimate = false;
                    //requestId for requestAnimationFrame
                    let requestId;

                    if (Internal.isIOS) {
                        //当拖动时
                        $scope.onDrag = function (e) {
                            percent = parseFloat(e.gesture.deltaX * 1 / circleWidth);
                            rotateNow = parseFloat(parseFloat(rotateBefore + rotateEachDeg * percent).toFixed(2));
                            move(rotateNow);
                        };
                        //当停止触控
                        $scope.onReleasePlanet = function (e) {
                            velocityX = e.gesture.velocityX;
                            //移动距离不会超过100%,大于50%就进入下一个
                            const MIN_VELOCITY_X = 0.3;
                            const MAX_VELOCITY_X = 1.4;
                            if (parseInt(Math.abs(percent * 100)) < 50) {
                                if (velocityX > MIN_VELOCITY_X && velocityX <= MAX_VELOCITY_X) {
                                    moveNext(1);
                                } else if (velocityX > MAX_VELOCITY_X) {
                                    moveNext(2);
                                } else {
                                    moveBack();
                                }
                            } else {
                                if (velocityX <= MAX_VELOCITY_X) {
                                    moveNext(1);
                                } else if (velocityX > MAX_VELOCITY_X) {
                                    moveNext(2);
                                }
                            }
                        };
                    }


                    //针对安卓,不适用随手动画/////////////////////////
                    if (Internal.isAndroid) {
                        $scope.swipeRight = function () {
                            rotateNow = rotateBefore + rotateEachDeg;
                            moveNext(1);
                            showORNot();
                        };
                        $scope.swipeLeft = function () {
                            rotateNow = rotateBefore - rotateEachDeg;
                            moveNext(1);
                            showORNot();
                        };
                    }


                    //首次进入的动画$timeout
                    $timeout(function () {
                        let animateTime = 3000;
                        rotateBefore=180;
                        animate(180, animateTime);
                        // showORNot();
                        $timeout(function () {
                            //隐藏底部的三个行星不显示
                            showORNot();
                        }, animateTime, false)
                    }, 1000, false);


                    //////////////////////////////////////////////////

                    //转动输入的角度
                    function move(rotate) {
                        ionic.DomUtil.requestAnimationFrame(function () {
                            swiperInner.style.cssText = `transform: rotate(${rotate}deg);-webkit-transform: rotate(${rotate}deg);`;
                            for (let i = 0; swiperEachBoxi.length > i; i++) {
                                swiperEachBoxi[i].style.cssText = `transform: rotate(${rotate * -1}deg);-webkit-transform: rotate(${rotate * -1}deg);`;
                            }
                        })
                    }

                    function moveNext(a) {
                        //判断下一个的位置,是左边还是右边
                        if (rotateNow > rotateBefore) {
                            rotateNext = rotateBefore + rotateEachDeg * a; //右边
                        } else {
                            rotateNext = rotateBefore - rotateEachDeg * a; //左边
                        }
                        animate(rotateNext);
                        rotateBefore = rotateNext;
                        showORNot();
                    }


                    function moveBack() {
                        animate(rotateBefore);
                        showORNot();
                    }


                    function animate(rotate, time) {
                        ionic.DomUtil.requestAnimationFrame(function () {
                            !time && (time = 300);
                            swiperInner.style.cssText = `transform: rotate(${rotate}deg);-webkit-transform: rotate(${rotate}deg);transition-duration: ${time}ms;-webkit-transition-duration: ${time}ms;`;
                            for (let i = 0; swiperEachBoxi.length > i; i++) {
                                swiperEachBoxi[i].style.cssText = `transform: rotate(${rotate * -1}deg);-webkit-transform: rotate(${rotate * -1}deg);transition-duration: ${time}ms;-webkit-transition-duration: ${time}ms;`;
                            }
                            $timeout(function () {
                                rotateNext = 0;
                                rotateNow = 0;
                                percent = 0;
                                console.log("animate Done")
                            }, time, false);
                        })
                    }


                    /**
                     * 隐藏底部的三个行星不显示
                     * */
                    function showORNot() {
                        let rate = rotateBefore / rotateEachDeg;
                        let whichTop;

                        //向右转,角度为正
                        if (rate > 0 || rate == 0) {
                            if (rate > itemCount - 1) {
                                whichTop = rate % itemCount;
                            } else {
                                whichTop = rate;
                            }
                        } else {
                            //  向左转,角度为负
                            if (Math.abs(rate) > itemCount) {
                                whichTop = itemCount + rate % (itemCount);
                                if (whichTop == itemCount) {
                                    whichTop = 0;
                                }
                            } else {
                                whichTop = itemCount + rate;
                            }
                        }
                        //隐藏底部的三个元素
                        let a, b, c;
                        //whichTop
                        switch (whichTop) {
                            case 0:
                                a = 2;
                                b = 3;
                                c = 4;
                                break;
                            case 1:
                                a = 1;
                                b = 2;
                                c = 3;
                                break;
                            case 2:
                                a = 0;
                                b = 1;
                                c = 2;
                                break;
                            case 3:
                                a = 5;
                                b = 0;
                                c = 1;
                                break;
                            case 4:
                                a = 4;
                                b = 5;
                                c = 0;
                                break;
                            case 5:
                                a = 3;
                                b = 4;
                                c = 5;
                                break;
                        }
                        for (let i = 0; swiperInnerBox.length > i; i++) {
                            swiperInnerBox[i].style.opacity = 1;
                        }
                        swiperInnerBox[a].style.cssText += 'opacity:0;transition-duration: 300ms;';
                        swiperInnerBox[b].style.cssText += 'opacity:0;transition-duration: 300ms;';
                        swiperInnerBox[c].style.cssText += 'opacity:0;transition-duration: 300ms;';
                        $log.debug("index为" + whichTop + "的行星在中间");
                        // console.log("index为" + whichTop + "的行星在中间");

                        applyAnimation(whichTop);
                    }

                    /**
                     * 增加顶上元素果冻动画效果
                     *
                     */
                    function applyAnimation(whichTop) {

                        let which;

                        //计算出顶上元素在数组中的位置
                        if (whichTop === 0) {
                            which = 0
                        } else {
                            which = 6 - whichTop
                        }

                        //将NodeList转成真正数组
                        let swiperInnerBoxArr = Array.prototype.slice.call(swiperInnerBox);


                        //增加动画类
                        swiperInnerBoxArr.forEach(function (box, i) {
                            i === which ? box.classList.add("animation-jelly") : box.classList.remove("animation-jelly")
                        })
                    }
                }]
            }
        }])
})();