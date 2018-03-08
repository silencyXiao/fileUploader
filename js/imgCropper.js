void function(w, $) {
  // 上传base图片至七牛云
  function putb64(options) {
    var reqParams = options.base64.split(',')[1]; // 处理base64图片 取data:image/png;base64,之后的字符作为参数
    var url = options.url || '//upload.qiniu.com/putb64/-1';
    $.ajax({
      url: url,
      type: 'POST',
      headers: {
        'Content-Type': 'application/octet-stream',
        'Authorization': 'UpToken ' + options.token
      },
      data: reqParams,
      success: function (res) {
        var key = res.key;
        var picUrl = options.domain + '/' + key;
        
        if (typeof options.success === 'function') {
          options.success(picUrl);
        }
      },
      errer: function (xhr, err, errObj) {
        if (typeof options.error === 'function') {
          options.error(xhr, err, errObj);
        }
      }
    });
  }
  // 获取裁切后的cropper数据对象
  function getCropperImg(selector, options) {

    var $image = $(selector);
    var config = options.cropperOptions || {};
    var defaults = {
        aspectRatio: 1,
        // preview: '.img-preview',
        viewMode: 0, // 图片宽高不能小于裁切框大小
        scalable: false,
        resizable: false,
        movable: false, // 是否允许移动图片
        rotatable: false, // 是否允许旋转图片
        zoomable: true, // 是否允许缩放图片
        scalable: true, // 是否允许水平垂直翻转图片
        cropBoxMovable: true, // 拖动裁切框
        cropBoxResizable: false, // 拖动改变裁切框大小
        minCropBoxWidth: 200,
        minCropBoxHeight: 200
      };

    for (var i in defaults) {
      if (typeof config[i] === 'undefined') {
        config[i] = defaults[i];
      }
    }

    // 创建新的实例对象
    $image
      .cropper('destroy')
      .prop('src', options.imgSrc) // 重置 src
      .cropper(config)
      .data('cropper').getCroppedCanvas({
        width: 200,
        height: 200
      });  
  }

  w.putb64 = putb64;
  w.getCropperImg = getCropperImg;

}(window, $);