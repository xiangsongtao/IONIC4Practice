移动端最佳CSS实践(SCSS)
===============

## 需求场景： 

这里主要是为了兼容低端安卓微信浏览器而进行的阐述。因为这样的设备对新版flex布局不兼容，导致样式问题，但是他们对旧版的display:box可行，故需要对flex加前缀的同时，引入另一套旧flex布局。我们一般的思路是使用autoprefixer做，但是有坑！

-  因为当我们使用

```
justify-content: space-around;
align-content: space-around;
flex-wrap
flex-flow
```

时，发现旧版的flex没有这样的属性可以对应。当然方法是能解决的```flex-wrap: wrap;```的问题，可通过```flex-direction：column```解决。

-  ```justify-content: space-around;```的问题需要手动设置他们之间的margin。

## 模块描述

- 如果传入参数为空，则微信设置默认内容，而app则不作为。
- 如果分享的时候用户登录过，微信会获取用户id，分享的连接加上分享人的id信息和webapp进入的跳转位置。
- 发送分享请求之前会进行地址签名，因为此应用是单页面页应用，故只需签名一次，签名好的信息保存到sessionStorage中，并且之后前面获取sessionStorage中的信息。
- 默认的分享内容建议放在config中。


## 使用scss的mixin：

下面是ionic中的_mixins.scss文件，可参考。绝大多数情况，gulp-autoprefixer就够用了。


```
// Flexbox Mixins
// --------------------------------------------------
// http://philipwalton.github.io/solved-by-flexbox/
// https://github.com/philipwalton/solved-by-flexbox

@mixin display-flex {
  display: -webkit-box;
  display: -webkit-flex;
  display: -moz-box;
  display: -moz-flex;
  display: -ms-flexbox;
  display: flex;
}

@mixin display-inline-flex {
  display: -webkit-inline-box;
  display: -webkit-inline-flex;
  display: -moz-inline-flex;
  display: -ms-inline-flexbox;
  display: inline-flex;
}

@mixin flex-direction($value: row) {
  @if $value == row-reverse {
    -webkit-box-direction: reverse;
    -webkit-box-orient: horizontal;
  } @else if $value == column {
    -webkit-box-direction: normal;
    -webkit-box-orient: vertical;
  } @else if $value == column-reverse {
    -webkit-box-direction: reverse;
    -webkit-box-orient: vertical;
  } @else {
    -webkit-box-direction: normal;
    -webkit-box-orient: horizontal;
  }
  -webkit-flex-direction: $value;
  -moz-flex-direction: $value;
  -ms-flex-direction: $value;
  flex-direction: $value;
}

@mixin flex-wrap($value: nowrap) {
  // No Webkit Box fallback.
  -webkit-flex-wrap: $value;
  -moz-flex-wrap: $value;
  @if $value == nowrap {
      -ms-flex-wrap: none;
  } @else {
      -ms-flex-wrap: $value;
  }
  flex-wrap: $value;
}

@mixin flex($fg: 1, $fs: null, $fb: null) {
  -webkit-box-flex: $fg;
  -webkit-flex: $fg $fs $fb;
  -moz-box-flex: $fg;
  -moz-flex: $fg $fs $fb;
  -ms-flex: $fg $fs $fb;
  flex: $fg $fs $fb;
}

@mixin flex-flow($values: (row nowrap)) {
  // No Webkit Box fallback.
  -webkit-flex-flow: $values;
  -moz-flex-flow: $values;
  -ms-flex-flow: $values;
  flex-flow: $values;
}

@mixin align-items($value: stretch) {
  @if $value == flex-start {
    -webkit-box-align: start;
    -ms-flex-align: start;
  } @else if $value == flex-end {
    -webkit-box-align: end;
    -ms-flex-align: end;
  } @else {
    -webkit-box-align: $value;
    -ms-flex-align: $value;
  }
  -webkit-align-items: $value;
  -moz-align-items: $value;
  align-items: $value;
}

@mixin align-self($value: auto) {
  -webkit-align-self: $value;
  -moz-align-self: $value;
  @if $value == flex-start {
    -ms-flex-item-align: start;
  } @else if $value == flex-end {
    -ms-flex-item-align: end;
  } @else {
    -ms-flex-item-align: $value;
  }
  align-self: $value;
}

@mixin align-content($value: stretch) {
  -webkit-align-content: $value;
  -moz-align-content: $value;
  @if $value == flex-start {
    -ms-flex-line-pack: start;
  } @else if $value == flex-end {
    -ms-flex-line-pack: end;
  } @else {
    -ms-flex-line-pack: $value;
  }
  align-content: $value;
}

@mixin justify-content($value: stretch) {
  @if $value == flex-start {
    -webkit-box-pack: start;
    -ms-flex-pack: start;
  } @else if $value == flex-end {
    -webkit-box-pack: end;
    -ms-flex-pack: end;
  } @else if $value == space-between {
    -webkit-box-pack: justify;
    -ms-flex-pack: justify;
  } @else {
    -webkit-box-pack: $value;
    -ms-flex-pack: $value;
  }
  -webkit-justify-content: $value;
  -moz-justify-content: $value;
  justify-content: $value;
}

@mixin flex-order($n) {
  -webkit-order: $n;
  -ms-flex-order: $n;
  order: $n;
  -webkit-box-ordinal-group: $n;
}

@mixin responsive-grid-break($selector, $max-width) {
  @media (max-width: $max-width) {
    #{$selector} {
      -webkit-box-direction: normal;
      -moz-box-direction: normal;
      -webkit-box-orient: vertical;
      -moz-box-orient: vertical;
      -webkit-flex-direction: column;
      -ms-flex-direction: column;
      flex-direction: column;

      .col, .col-10, .col-20, .col-25, .col-33, .col-34, .col-50, .col-66, .col-67, .col-75, .col-80, .col-90 {
        @include flex(1);
        margin-bottom: ($grid-padding-width * 3) / 2;
        margin-left: 0;
        max-width: 100%;
        width: 100%;
      }
    }
  }
}

```