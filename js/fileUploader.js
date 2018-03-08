void function () {
  var createUploader = function (options) {
    var uploadedFiles = options.uploadedFiles || []; // 已上传成功文件
    var addedFiles = []; // 已添加队列文件
   
    var uploader = Qiniu.uploader({
      runtimes: 'html5,flash,html4', //上传模式,依次退化
      browse_button: options.button, //上传选择的点选按钮，**必需**
      // uptoken_url: '/token', //Ajax请求upToken的Url，**强烈建议设置**（服务端提供）
      uptoken: options.token, //若未指定uptoken_url,则必须指定 uptoken ,uptoken由其他程序生成
      // uptoken_url: '/util/upkey?uptoken',
      // unique_names: true, // 默认 false，key为文件名。若开启该选项，SDK为自动生成上传成功后的key（文件名）。
      // save_key: true,   // 默认 false。若在服务端生成uptoken的上传策略中指定了 `sava_key`，则开启，SDK会忽略对key的处理
      domain: options.domain, //bucket 域名，下载资源时用到，**必需**
      container: options.container, //上传区域DOM ID，默认是browser_button的父元素，
      max_file_size: options.fileSize || '10mb', //最大文件体积限制
      flash_swf_url: '//cdn.bootcss.com/plupload/2.1.9/Moxie.swf', //引入flash
      max_retries: 1, //上传失败最大重试次数
      dragdrop: options.dragdrop === true ? true : false, //开启可拖曳上传
      drop_element: options.container, //拖曳上传区域元素的ID，拖曳文件或文件夹后可触发上传
      multi_selection: options.multi === true ? true : false, // 是否支持多文件上传
      chunk_size: '4mb', //分块上传时，每片的体积
      auto_start: options.autoStart === false ? false : true, //选择文件后自动上传，若关闭需要自己绑定事件触发上传
      filters: {
        max_file_size: options.fileSize || '10mb', //最大文件体积限制
        prevent_duplicates: options.duplicate === false ? true : false,
        mime_types: [{ // 限制文件上传类型，默认为图片
          title: options.title ? options.title : 'Image files',
          extensions: options.extensions ? options.extensions : 'jpg,jpeg,gif,png'
        }]
      },
      resize: options.resize,
      /* Object, 对上传图片进行压缩 resize: {
          width: 100, 指定压缩后图片的宽度， 如果没有设置该属性则默认为原始图片的宽度
          height: 100, 指定压缩后图片的高度， 如果没有设置该属性则默认为原始图片的高度
          crop: true, 是否裁剪图片
          quality: 60, 压缩后图片的质量，只对jpg格式的图片有效，默认为90。
          preserve_headers: false 压缩后是否保留图片的元数据， true为保留， false为不保留, 默认为true。 删除图片的元数据能使图片的体积减小一点点
        }*/
      init: {
        'FilesAdded': function (up, files) {

          var isMulti = up.getOption('multi_selection');
          var maxFileNum = options.maxSelectFileNum || 10; // 单次多选最多上传文件数量

          // 限制单次上传文件最多不能超过指定数量，默认10
          if (isMulti && files.length > maxFileNum) {
            for (var i = maxFileNum; i < files.length; i++) {
              up.removeFile(files[i]);
            }
            files = files.slice(0, maxFileNum); // 更新删除后的文件队列
            // 超出单次上传文件数量限制提示
            var tipMsg = '单次上传文件最多不能超过' + maxFileNum + '个';
            alert(tipMsg);
          }
          
          var totalFileNum = options.maxTotalFileNum || 20; // 累计最多上传文件数量
          var curFileNum = uploadedFiles.length + addedFiles.length + files.length; // 当前上传文件数量，已上传文件+加入队列文件
          
          // 限制累计上传文件数量不能超过指定数量，默认20
          if (curFileNum > totalFileNum) {
            var removeIndex = totalFileNum - uploadedFiles.length - addedFiles.length; // 需要移除的文件索引
            for (var i = removeIndex; i < files.length; i++) { 
              up.removeFile(files[i]);
            }
            files = files.slice(0, removeIndex); // 更新删除后的文件队列
            // 超出累计上传文件数量限制提示
            var tipMsg = '累计上传文件最多不能超过' + totalFileNum + '个';
            alert(tipMsg);
          }
          
          plupload.each(files, function (file) {
            addedFiles.push(file); // 更新已添加队列文件数组
            // 文件添加进队列后,处理相关的事情
            try {
              var fileItem = file.getNative();
              var url = window.URL || window.webkitURL || window.mozURL;
              var src = url.createObjectURL(fileItem);
            } catch (e) {}
            console.log('添加files...');
            if (typeof options.add == 'function') {
              options.add(up, file, src);
            }
          });
        },
        'BeforeUpload': function (up, file) {
          // 每个文件上传前,处理相关的事情
          if (typeof options.beforeUpload === 'function') {
            options.beforeUpload(up, file);
          }
        },
        'UploadProgress': function (up, file) {
          // 每个文件上传时,处理相关的事情
          console.log('file上传中...');
          if (typeof options.progress === 'function') {
            options.progress(up, file);
          }
        },
        'FilesRemoved': function(up, files) {
          // 文件被删除时，处理相关事情
          files.forEach(function(file) {
            console.log('file['+ file.id +']已从文件队列中移除...');
            // 删除已添加数组中的数据
            addedFiles.forEach(function (curVal, index) {
              if (curVal.id === file.id) {
                addedFiles.splice(index, 1);
              }
            });
          });
          if (typeof options.removeFile === 'function') {
            options.removeFile(up, file);
          }
        },
        'FileUploaded': function (up, file, info) {
          // 每个文件上传成功后,处理相关的事情
          var res = JSON.parse(info);
          var src = options.domain + '/' + res.key;
          
          if (typeof options.success === 'function') {
            options.success(up, file, src);
          }
        },
        'Error': function (up, err, errTip) {
          var maxFileSize = up.getOption('filters').max_file_size; // 最大文件大小
          var extensions = up.getOption('filters').mime_types[0].extensions; // 支持扩展名
          if (typeof options.error === 'function') {
            options.error(err, errTip, {
              maxFileSize: maxFileSize,
              extensions: extensions
            });
          }
          console.error('错误代码:' + err.message + '(' + err.code + ')');
          //上传出错时,处理相关的事情
        },
        'UploadComplete': function (up, files) {
          //队列文件处理完毕后,处理相关的事情
          if (typeof options.complete === 'function') {
            options.complete(up, files);
          }
        },
        'Key': function (up, file) {
          // 若想在前端对每个文件的key进行个性化处理，可以配置该函数
          // 该配置必须要在 unique_names: false , save_key: false 时才生效
          if (typeof options.callFileName === 'function') {
            return options.callFileName(file);
          }
          // 默认文件命名 domain/当前日期/文件名称
          var date = new Date();
          var m = (date.getMonth() + 1) < 10 ? ('0' + (date.getMonth() + 1)) : (date.getMonth() + 1);
          var d = date.getDate() < 10 ? ('0' + date.getDate()) : date.getDate();
          var key = '' + date.getFullYear() + m + d + '/' + file.name;
          
          return key
        }
      }
    });
    return uploader; 
  };
  Qiniu.createUploader = createUploader;
}();