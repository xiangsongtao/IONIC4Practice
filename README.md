Ionic4Practice
=====================

这个Practice使用IONIC 1.x构建，适用于微信app+IOS+Android项目，该项目主要进行数据展示的功能，故使用WebApp
的方式构建完全够用。希望我在其中总结的方法对你有用！
>题外话：记得在做这些模块的时候，是有些费劲，因为第一次做，而且没人指导，虽然有不会的语法技巧什么的可以问问，但是大多数时间都是自己在琢磨。现在项目的第一期已快完成，剩余的小bug都不事儿。而且第二期也轻车熟路不构成威胁，可以不用再加班了，吼吼！现在再回看自己做的这些，感觉好简单的哦！

## 项目初始化

一般拿到项目是没有node_modules目录的,这里需要安装node及npm,安装方法这里就不再赘述,

安装完后,进入该项目目录,输入

```bash
$ gulp default
```

稍等片刻,新鲜出炉的可运行的index.html就在www目录下,关于配置的问题,可参考gulpfiles.js


## 项目启动

方法1: 项目启动使用的IONIC Lab软件, 使用前需要配置文件路径，完成后选择当前项目然后选择server即可启动项目。    

方法2: 启动webstrom后，在www/index.html上右键选择"run 'index.html'"即可。

## 功能说明
以下功能是我在开发过程中遇到的坑及总结，内容会不断更新，可以star一下，以便持续关注。


### 关于全局结构
思路：因为项目需要在微信环境下运行，如果将所有资源打包后丢给浏览器，会导致浏览器因为等待下载会长时间的白屏，所以
这里会需要使用依赖加载的模式，也就是当进入该页面的时候才加载改页面的资源。因此，按照页面模块功能划分资源位置会方便管理！ 
>你所看的目录结构时重构第三次的结果，前几次惨不忍睹！

```
|-app    
|---css                 
|------common       项目公共样式        
|------ionic        ionic样式     
|------pages        页面样式  
|------ionic.scss   ionic样式主文件        
|------style.css    页面样式主文件
|---filters         公共过滤器
|---directives      公共组件库
|---fonts           字体
|---img             图片
|---lib             Angualr外部资源文件
|---routers         公共路由层
|---service         公共服务层(数据层)
|---tpl             页面模块
|------users            用户中心
|------selfPark         自助停车
|------navigateTo       导航至
|------mallNews         商场资讯
|------mallNavigate     商场导航
|------home             首页
|------brandInfo        商户列表
|------activity         活动
|------authorize        授权页面
|---utils           通用方法模块
|---app.js          主程序
|---bridge.js       桥接文件
|---config.js       配置文件
|---index.html      主index文件
|-hooks
|-platforms
|-plugins
|-readme            说明
|-resources
|-www               dist文件
```

其中tpl将根据页面进行层级划分,将与当前页面相关的HTML、controller、service、directive、filter等放在一起。

### [微信导航栏与APP导航栏同步](https://github.com/xiangsongtao/IONIC4Practice/blob/master/doc/NavigateSync.md)

ionic使用的导航方式永远都是在新增历史记录,而浏览器原生的导航则是在历史记录中有前有后的跳转,因而会在用户操作的过
程出现不同步的现象,这里实现了"后退"和"返回首页"两个方法,方法挂载到mainCtrl根控制器的$rootScope下,这样的话在
别的controller中也可手动调用此方法。


### [鉴权模块](https://github.com/xiangsongtao/IONIC4Practice/blob/master/doc/checkAuthorize.md)

这里主要是针对微信这块。当用户进入我们的app时,如果进入的页面和用户相关,业务要求用户先关注,关注之后才能浏览;如果涉及到会员卡相关,则需要用户注册填写手机号和密码。

模块设计不算难,因为和api耦合度比较深,需要后台逻辑较为复杂。大致流程为: 用户微信进入后会在url中带上code值,将code值传进api会得到用户基本信息及是否关注的字段,通过以上信息进行鉴权操作。

### [微信分享模块](https://github.com/xiangsongtao/IONIC4Practice/blob/master/doc/setShareContent.md)

微信分享，一般是和获取微信config绑定到一起的，而且一旦获取就设置分享内容，因为无法预期用户何时点击了分享按钮，so，还是设置一个默认的分享比较好。我这里设置的默认分享配置在config中，内容是邀请用户注册，并进入后跳转到注册页面。因为还要考虑到不同的设备环境（微信和app），具体看内文。

### bridge作为不同设备的中间层

这部分我是使用一次开发的脚本，但是随后增加的接口就和以前的不一样了，主要是调用同一个接口方法实现功能，具体的使用哪个方法由当时的设备环境判断。保证接口一致！

### [移动端最佳CSS实践(SCSS)](https://github.com/xiangsongtao/IONIC4Practice/blob/master/doc/CSS4Mobile.md)

这里主要是为了兼容低端安卓微信浏览器而进行的阐述。因为这样的设备对新版flex布局不兼容，导致样式问题，但是他们对旧版的flex-box可行，故需要对flex加前缀的同时，引入另一套旧flex布局。我们一般的思路是使用autoprefixer做，但是有坑！具体见内文。

### [快速进入微信Loading页面](https://github.com/xiangsongtao/IONIC4Practice/blob/master/doc/Loader.md)

因为项目是使用ionic组件库及样式库的，首次加载会需要下载核心资源，故！需要一个loading页，给这些资源一个加载提示。有人说，恩，将loading的html放在index.html中不就行了吗？但是这样，页面会有很长时间的白屏，然后突然跳到loading，然后突然跳到主页。这个并没有达到我们的预期，因为浏览器在加载页内script中的资源时会阻塞页面的渲染。最佳的做法是将我们的资源使用一个资源加载器加载，首页index.html中只放加载器，这样，就愉快的看到loading示数不断到100%了。具体见内文。

### 微信端OcLazyLoad终极解决方案(使用懒函数)

### 关于数据缓存策略

这里不再展开，只在这里说说。我的项目是根据不同的设备环境做不同的处理。微信：将所有信息存到sessionStorage中，当然factory或者service也可以做，但是我找不到足够的理由让我这么去做。APP的用户ID存到Localstorage中，其余存到sessionStorage中；暂时还没遇到什么问题，先酱紫。



### 是否使用requirejs？

当然不使用,因为angular就是一个很好的模块化工具。再加上ocLoazload和Gulp的打包,requirejs在项目中已无存在的意义。如果nb，用webpack吧。

### 建议使用Gulp

因为我gulp用的比较熟，而且很简单，真的！另外，我的项目很依赖gulp。app设计的文件夹是“app”，gulp生成的文件夹为“www”，这样文件不重复，方便对目标清理，干爽。内文中我会附上我常用的插件，因为踩过坑，所以比较真切，希望对你有用，当前时间2016/5/31，如果超过3个月，不保证以上内容可用。余下间内文。

### 关于页面进入自动跳转(适用于分享特定页面)

这部分用于微信公众号内微官网的部分，因为在微信公众号下部的导航栏可以跳转到webapp的不同部分，方便快速进入的作用（用户中心、积分查询、优惠券列表），但是如果直接进入有些很强势，打破了既有规则。既然是规则，那就维护一套比较好，遵守规则！nm/

我现在要求所有中途进入的页面的首页必须是Home，之后再此基础上跳转。恩，规则！就这么定了！

### 异步代码的循环输出

根据异步代码对后续循环产生的影响的不同,在这里分为两种情况,一种是:对后续代码无影响,比如打印输出,结果只有一种,使用闭包即可;另一种:循环请求数据,如果成功继续请求,如果失败则stop,并返回错误结果。这种情况使用迭代方法。具体实现间内文。

### [在IOS下,如何将webapp打造成和Native App一样的体验?](https://github.com/xiangsongtao/IONIC4Practice/blob/master/doc/lookLikeNativeApp.md)

只是对meta标签进行的加工，参照内文的代码即可，或者网上找找，这部分很简单。

>方便在手机上调试app模式，嘿！


