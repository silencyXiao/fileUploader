# fileUploader
>https://silencyxiao.github.io/fileUploader/single_file.html
### 图片裁切后上传base64到七牛需要注意：
>传过去的需要转换base64，须填写base64之后的字符串 ，除去MIME和base64以及逗号
>UpToken 与后面的字符串保留一个空格 后跟上在服务端请求的token的字符串。
>upload.qiniu.com 上传域名适用于华东空间。华北空间使用 upload-z1.qiniu.com，华南空间使用 upload-z2.qiniu.com，北美空间使用 upload-na0.qiniu.com。
