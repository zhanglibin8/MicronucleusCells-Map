/**
 * Created by zlb on 18-1-22.
 */
var handle = (function () {
    var imgUrl = 'img/';//'image/';
    var totalW = 14047;//61952;
    var totalH = 14289;//41984;
    var scaleNum = 1;//缩放倍数
    var maxScaleNum = 2;//最大缩放倍数
    var minScaleNum = 0.5;//最小缩放倍数
    var scaleStep = 0.05;//缩放步长
    var curXy = {x:0, y:0,left:0,top:0};//记录当前的行和列 默认(0,0)
    var magnifierW,magnifierH;//放大镜大小

    var addEvent = function (ele, xEvent, fn) {
        if (ele.attachEvent) {
            ele.attachEvent('on' + xEvent, fn);
        } else {
            ele.addEventListener(xEvent, fn, false);
        }
    };
    /**
     * 预加载
     * @param src 图片地址
     */
    var preLoad = function (src) {
        console.log(totalH/256,totalW/256);
        for(var i = 0; i < Math.ceil(totalH/256); i++){
            (function (i) {
                for(var j = 0; j < Math.ceil(totalW/256); j++){
                    (function (j) {
                        var imgWrap = new Image();
                        imgWrap.src = imgUrl + i + '_' + j + '.jpg';
                        imgWrap.onload = function () {
                            console.log(1)
                        };
                        imgWrap.onerror = function () {
                            console.log(2);
                        }
                    })(j);
                }
            })(i);
        }
        console.log(totalH/256,totalW/256)
    };
    /**
     * 将碎片拼接到容器
     * @param xy
     */
    var show = function (xy) {
        //console.log(xy.left,xy.top);
        var imgW = 256 * scaleNum;
        var imgH = 256 *scaleNum;
        var box = $('#inner');
        box.empty();
        //横向和纵向分别可以放多少张
        var totalX = Math.ceil($('#show').width()/imgW) + 1;
        var totalY = Math.ceil($('#show').height()/imgH) + 1;
        box.width(totalX * imgW);
        box.height(totalY * imgH);
        for(var j = 0; j < totalY; j++){
            (function (j) {
                var h = xy.y + j;
                $('<br/>').appendTo($('#inner'));
                for(var i = 0; i < totalX; i++){
                    var imgFrag = new Image();
                    var w = xy.x + i;
                    if(w<Math.ceil(totalW / 256)&&h<Math.ceil(totalH / 256)) {
                        imgFrag.src = imgUrl + h + '_' + w + '.jpg';
                        imgFrag.width = imgW;
                        imgFrag.height = imgH;
                        $(imgFrag).appendTo($('#inner'))
                    }
                }
            })(j);
        }
        $('#inner').css({
            left: xy.left,
            top: xy.top
        })
    };
    /**
     * 放大镜平移事件
     */
    var dragMagnifierFn = function () {
        var left = 0,top = 0;
        var ww = $('#thumbnail').width();
        var hh = $('#thumbnail').height();
        //$('#thumbnail').off();
        $('#thumbnail').on('mousedown',function (e) {
            var id = e.target.id;
            var offx = e.offsetX;
            var offy = e.offsetY;
            if(id != 'Magnifier'){//点击位置跳动
                var w = $('#Magnifier').width();
                var h = $('#Magnifier').height();
                // console.log(offx,offy);
                var xy = getXy(offx,offy);
                // console.log(xy);
                var _left = offx - parseFloat($('#Magnifier').width())/2;
                var _top = offy - parseFloat($('#Magnifier').height())/2;
                //过界判断
                if(_left <= 0){
                    _left = 0;
                }
                if(_left >= ww - w){
                    _left = ww - w
                }
                if(_top <= 0){
                    _top = 0
                }
                if(_top >= hh - h){
                    _top = hh - h
                }
                $('#Magnifier').css({
                    left: _left,
                    top: _top
                });
                var _xy = getXy(_left,_top);
                show(_xy);
            }

            if(id == 'Magnifier'){//放大镜
                $(this).on('mousemove',function (e) {
                    var w = $('#Magnifier').width();
                    var h = $('#Magnifier').height();
                    //console.log(e)
                    //console.log(e.clientX - $('#thumbnail').offset().left, e.clientY - $('#thumbnail').offset().top);
                    left = e.clientX - $('#thumbnail').offset().left - offx;
                    top = e.clientY - $('#thumbnail').offset().top - offy;
                    //过界判断
                    if(left <= 0){
                        left = 0;
                    }
                    if(left >= ww - w){
                        left = ww - w
                    }
                    if(top <= 0){
                        top = 0
                    }
                    if(top >= hh - h){
                        top = hh - h
                    }
                    //console.log(left,top);
                    $('#Magnifier').css({
                        left: left,
                        top: top
                    });
                    var xy = getXy(left,top);
                    show(xy);
                    //console.log('mousemove Xy: ',xy)
                })
            }
        });
        //鼠标抬起后结束移动事件
        $('body').on('mouseup',function (e) {
            if(e.target.id == 'Magnifier'){
                $('#thumbnail').off('mousemove');
                var xy = getXy(left,top);
                //show(xy);
                curXy = xy;
                //console.log(left,top)
                //console.log('mouseup Xy: ',xy)
            }
            //console.log(curXy)
        })
    };
    /**
     * 放大镜点击跳转事件
     */
    var clickMagnifierFn = function () {
        //$('#thumbnail').off();
        $('#thumbnail').click(function (e) {
            var left = e.clientX - $('#thumbnail').offset().left;
            var top = e.clientY - $('#thumbnail').offset().top;
            $('#Magnifier').css({
                left: left - parseFloat($('#Magnifier').width())/2,
                top: top - parseFloat($('#Magnifier').height())/2
            });
            var xy = getXy(left,top);
            show(xy);
            curXy = xy;
            console.log('click Xy: ', xy);
        })
    };
    /**
     * 获取图像开始位置行和列
     * @param left 放大镜位置
     * @param top
     * @returns {{x: number, y: number, left: number, top: number}}
     */
    var getXy = function (left,top) {
        var ww = $('#thumbnail').width();
        var hh = $('#thumbnail').height();
        var xy = {
            x:Math.floor( left/ ww * totalW / 256),
            y:Math.floor( top/ hh * totalH / 256),
            left:-(left / ww * totalW / 256 - Math.floor(left / ww * totalW / 256)) * 256 * scaleNum,
            top:-(top / hh * totalH / 256 - Math.floor(top / hh * totalH / 256)) * 256 * scaleNum
        };
        return xy
    };
    //61952*41984preLoad
    var resetMagnifierSize = function (totalW,totalH,callback) {
        //加载缩略图
        $('#thumbnail').css('background','url("'+ imgUrl +'thumbnail.jpg") no-repeat');
        var imgWrap = new Image();
        imgWrap.src = imgUrl + 'thumbnail.jpg';
        imgWrap.onload = function () {
            console.log('缩略图宽高: ',imgWrap.width,imgWrap.height)
            $('#thumbnail').width(imgWrap.width);
            $('#thumbnail').height(imgWrap.height);
            var w = $('#thumbnail').width() * ($('#show').width()/totalW);
            var h = $('#thumbnail').height() * ($('#show').height()/totalH);
            console.log('放大镜宽高: ',w,h)
            $('#Magnifier').width(w);
            $('#Magnifier').height(h);
            magnifierW = w;
            magnifierH = h;
            if(typeof callback == 'function'){
                callback();
            }
        }

    };
    /**
     * 小数转化百分数
     * @param point
     * @returns {string}
     */
    var toPercent = function (point){
        return Number(point*100).toFixed(1) + "%";
    };
    /**
     * 缩放
     */
    var scaleFn = function (e) {
        e = e || window.event;
        //阻止浏览器自带的Ctrl+滚轮缩放功能
        if (e.wheelDelta && e.ctrlKey) {//IE/Opera/Chrome
            e.returnValue = false;
        } else if (e.detail && e.ctrlKey) {//Firefox
            e.returnValue = false;
        }
        e.stopPropagation();
        e.cancelBubble = true;
        e.preventDefault();
        var scale_before = scaleNum;
        var MagnifierWidth_before = parseFloat($('#Magnifier').width());
        var MagnifierHeight_before = parseFloat($('#Magnifier').height());
        var ll = parseFloat($('#Magnifier').css('left'));
        var tt = parseFloat($('#Magnifier').css('top'));
        if (e.wheelDelta) {//IE/Opera/Chrome
            if (e.wheelDelta > 0) {//上滚
                scaleNum += scaleStep;
                if(scaleNum >= maxScaleNum){
                    scaleNum = maxScaleNum
                }
            } else {//下滚
                scaleNum -= scaleStep;
                if(scaleNum <= minScaleNum){
                    scaleNum = minScaleNum
                }
            }
        } else if (e.detail) {//Firefox
            if (e.detail > 0) {//下滚
                scaleNum -= scaleStep;
                if(scaleNum <= minScaleNum){
                    scaleNum = minScaleNum
                }
            } else {//上滚
                scaleNum += scaleStep;
                if(scaleNum >= maxScaleNum){
                    scaleNum = maxScaleNum
                }
            }
        }
        //show(curXy)
        //图像缩放
        var imgW = 256*scaleNum;
        var imgH = 256*scaleNum;
        $('#inner img').width(imgW);
        $('#inner img').height(imgH);
        //show(curXy);
        //放大镜缩放
        //console.log(magnifierW,magnifierH);
        var magW = magnifierW * (1/scaleNum);
        var magH = magnifierH * (1/scaleNum);
        $('#Magnifier').width(magW);
        $('#Magnifier').height(magH);

        //以中心缩放，需要改变位置
        //console.log(ll,tt);
        var _left = ll + (MagnifierWidth_before - magW)/2;
        var _top = tt + (MagnifierHeight_before - magH)/2;
        var w = $('#Magnifier').width();
        var h = $('#Magnifier').height();
        var ww = $('#thumbnail').width();
        var hh = $('#thumbnail').height();
        //过界判断
        if(_left <= 0){
            _left = 0;
        }
        if(_left >= ww - w){
            _left = ww - w
        }
        if(_top <= 0){
            _top = 0
        }
        if(_top >= hh - h){
            _top = hh - h
        }
        $('#Magnifier').css({
            left: _left,
            top: _top
        });
        show(getXy(_left,_top));
        //缩放比例
        $('#scaleNum').html(toPercent(scaleNum));
        //刷新放大镜拖拽
        //dragMagnifierFn()
    };
    /**
     * 平移
     */
    var moveFn = function () {
        var ww = $('#inner').width();
        var hh = $('#inner').height();
        var www = $('#thumbnail').width();
        var hhh = $('#thumbnail').height();
        var left = 0,top = 0;
        var move_left = 0,move_top = 0;
        $('#hide').off();
        $('#hide').on('mousedown',function (e) {
            var w = $('#Magnifier').width();
            var h = $('#Magnifier').height();
            var clientX = e.clientX;
            var clientY = e.clientY;
            left = parseInt($('#Magnifier').css('left'));
            top = parseInt($('#Magnifier').css('top'));
            $(this).on('mousemove',function (e) {
                move_left = (e.clientX - clientX) * (w / ww);
                move_top = (e.clientY - clientY) * (h / hh);
                $('#Magnifier').css({
                    left: left - move_left,
                    top: top - move_top
                });
                //过界判断
                if(left - move_left <= 0){
                    left  = move_left;
                }
                if(left - move_left >= www - w){
                    left  = www - w + move_left
                }
                if(top - move_top <= 0){
                    top = move_top
                }
                if(top - move_top >= hhh - h){
                    top = hhh - h + move_top
                }
                //console.log(left - move_left,top - move_top);
                //var x = Math.floor((left - move_left) / www * totalW / 256);
                //var y = Math.floor((top - move_top) / hhh * totalH / 256);
                var xy = getXy(left - move_left,top - move_top);
                //console.log(xy);
                show(xy);
            })
        });
        //鼠标抬起后结束移动事件
        $('body').on('mouseup',function (e) {
            if(e.target.id == 'hide'){
                $('#hide').off('mousemove');
                //var x = Math.floor((left - move_left) / www * totalW / 256);
                //var y = Math.floor((top - move_top) / hhh * totalH / 256);
                var xy = getXy(left - move_left,top - move_top);
                //console.log(xy);
                //show(xy);
                curXy = xy;
            }
            //console.log(curXy)
        })
    };
    /**
     * 根据大图位置计算放大镜位置
     * @param xy
     */
    var getMagnifierXy = function (xy) {

    };

    var testCoverCanvas = function () {
        $('#cover')[0].width = $('#show').width();
        $('#cover')[0].height = $('#show').height();
        $('#cover').drawText({
            text:'I am cover canvas!',
            fillStyle:'#000',
            fontSize: 50,
            fontFamily: 'Arial',
            x: 400, y: 400
        })
    };



    return {
        init: function () {
            // preLoad();
            //按比例计算放大镜大小
            //resetMagnifierSize(totalW,totalH);
            show({x:0,y:0,left:0,top:0});
            //放大镜拖动事件
            dragMagnifierFn();
            //放大镜点击跳转位置事件
            // clickMagnifierFn();
            //缩放
            addEvent(window, 'mousewheel', scaleFn);
            addEvent(window, 'DOMMouseScroll', scaleFn);
            //平移
            moveFn();
            //testCoverCanvas();
        },
        resetMagnifierSize:resetMagnifierSize,
        totalW:totalW,
        totalH:totalH
    }
})();
$(document).ready(function () {
    //按比例计算放大镜大小
    handle.resetMagnifierSize(handle.totalW,handle.totalH,function () {
        handle.init();
    });
});