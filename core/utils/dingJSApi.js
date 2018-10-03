  
import React from 'react'
import Storage from './storage'
import HttpClient from '../api/HttpClient'
import {message} from 'antd'
export default class dingJS extends React.Component { 
    // 选人
    static selectUser(selectUser = [], title, onSuccess, multiple=true,isSmall) {
        let users = [];
        if(selectUser && selectUser.length > 0){
            selectUser.map((item)=>{
                users.push(item.userid);
            });
        }
        let corpid = Storage.get('corpIdWork');
        if(isSmall){
            corpid = Storage.get('corpIdMsg');
        }
        let _this = this;
        DingTalkPC.biz.contact.choose({
            startWithDepartmentId: 0, //-1表示打开的通讯录从自己所在部门开始展示, 0表示从企业最上层开始，(其他数字表示从该部门开始:暂时不支持)
            multiple: multiple?true:false, //是否多选： true多选 false单选； 默认true
            users: users, //默认选中的用户列表，userid；成功回调中应包含该信息
            disabledUsers: [],// 不能选中的用户列表，员工userid
            corpId: corpid, //企业id
            max: multiple?1500:1, //人数限制，当multiple为true才生效，可选范围1-1500
            limitTips: "", //超过人数限制的提示语可以用这个字段自定义
            isNeedSearch: true, // 是否需要搜索功能
            title: title, // 如果你需要修改选人页面的title，可以在这里赋值 
            local: "true", // 是否显示本地联系人，默认false
            onSuccess: function (data) {
                console.log(data,'*********selectUsered*********')
                let userId = data;
                HttpClient.AjaxPost('/user/isAuth',userId,result => {
                    if(result.type=="0"){
                        /* 反参格式
                            * [{
                            *    'emplId': '',
                            *    'name': '',
                            *    'avatar': '',
                            * }]
                            */
                        onSuccess(data);
                    }else if(result.type=="1"){
                        DingTalkPC.device.notification.confirm({
                            message:result.message,
                            title: "提示",
                            buttonLabels: [result.label],
                            onSuccess : function(resultData) {
                                onSuccess(result.users);
                            },
                            onFail : function(err) {}
                        });
                    }else if(result.type=="2"){
                        DingTalkPC.device.notification.confirm({
                            message:result.message,
                            title: "提示",
                            buttonLabels: [result.label, '取消'],
                            onSuccess : function(result) {
                                if(result.buttonIndex == 0){
                                    _this.selectUser(selectUser,title, onSuccess, onFail,multiple,isSmall);
                                }
                            },
                            onFail : function(err) {}
                        });
                    }
                },isSmall)
            },
            onFail: function (err) {
                console.log(err);
            }
        });
    } 

    // 获取钉钉免登 code
    static getLoginCode(corpid,success,fail) {
        DingTalkPC.runtime.permission.requestAuthCode({
            corpId: corpid,
            onSuccess: function (result) {
                if(success){
                    success(result.code)
                }
            },
            onFail: function (err) {
                fail(err)
            }
        })
    }

     // 上传图片 multiple：是否上传多个，默认一次上传一个
     static uploadImage(onSuccess,multiple=false,isSmall) {
        HttpClient.AjaxPost('/uploadAttachment/getUploadMethod','', result => {
            let data = result;
            if(data.state){
                DingTalkPC.biz.util.uploadImage({
                    multiple: multiple, //是否多选，默认false
                    max: 9, //最多可选个数
                    onSuccess: function (result) {
                        if (onSuccess)
                            onSuccess(result)
                    },
                    onFail: function (err) {
                        console.log(err,'---------uploadImage--------------')
                        console.log(err);
                    }
                })
            }else{
                //钉钉文件上传
                DingTalkPC.biz.util.uploadAttachment({
                    image:{multiple:true,max:multiple?9:1,spaceId: data.spaceid+''},
                    space:{corpId:data.antIsvCorpSuite.corpid,spaceId:data.spaceid+'', max:multiple?9:1},
                    file:{spaceId:data.spaceid+'',max:multiple?9:1},
                    types:["photo","file","space"],
                    onSuccess: function (result) {
                        console.log(result);
                        if(onSuccess){
                            onSuccess(result)
                            /*
                                * 反参格式
                                * {
                                    type:'', // 用户选择了哪种文件类型 ，image（图片）、file（手机文件）、space（钉盘文件）
                                    data: [
                                        {
                                        spaceId: "232323",
                                        fileId: "DzzzzzzNqZY",
                                        fileName: "审批流程.docx",
                                        fileSize: 1024,
                                        fileType: "docx"
                                        },
                                        {
                                        spaceId: "232323",
                                        fileId: "DzzzzzzNqZY",
                                        fileName: "审批流程1.pdf",
                                        fileSize: 1024,
                                        fileType: "pdf"
                                        },
                                        {
                                        spaceId: "232323",
                                        fileId: "DzzzzzzNqZY",
                                        fileName: "审批流程3.pptx",
                                        fileSize: 1024,
                                        fileType: "pptx"
                                        }
                                    ]
                            
                                }
                                */
                        }
                    },
                    onFail: function (err) {
                        console.log(err);
                    }
                });
            }
        },isSmall);
    }

    // 预览图片
    static previewImage(files,isSmall) {
        let corpid = Storage.get('corpidWork');
        if(isSmall){
            corpid = Storage.get('corpidMsg');
        }
        console.log(files,'previewImagey');
        if(files.fileId){
            HttpClient.AjaxPost('/uploadAttachment/authDingFilePreview',files, result => {
                DingTalkPC.biz.cspace.preview({
                    corpId:corpid,
                    spaceId:files.spaceId,
                    fileId:files.fileId,
                    fileName:files.fileName,
                    fileSize:files.fileSize,
                    fileType:files.fileType,
                    onSuccess: function() {
                        //无，直接在弹窗页面显示文件详细信息
                    },
                    onFail: function(err) {
                        console.log(err);
                    }
                });
            },isSmall);
        }else{
            let date = [];
            const url = files.fileUrlAbsolute?files.fileUrlAbsolute.replace(/\\/g, '/'):'';
            let suffixIndex=url.lastIndexOf(".");  
            let suffix=url.substring(suffixIndex+1).toUpperCase();  
            if(suffix!="BMP"&&suffix!="JPG"&&suffix!="JPEG"&&suffix!="PNG"&&suffix!="GIF"){  
                window.location.href = url;
                return;
            }  
            if (date.length == 0) {
                date.push(url);
            }
            DingTalkPC.biz.util.previewImage({
                urls: date,//图片地址列表
                current: url,//当前显示的图片链接
                onSuccess: function (result) {
                    /**/
                    console.log(result, '---------result----------------')
                },
                onFail: function (err) {
                    console.log(err, '---------err----------------')
                }
            });
        }
    }

    // 授权JsApi接口
    static authDingJsApi(onSuccess){
        var urlData = encodeURIComponent(location.href.split('#')[0]);
        HttpClient.AjaxPost('/dingTalk/mobilejs?urlData='+urlData,'', result => {
            let data = result;
            DingTalkPC.config({
                agentId: data.appid, // 必填，微应用ID
                corpId: data.corpid,//必填，企业ID
                timeStamp: data.timeStamp, // 必填，生成签名的时间戳
                nonceStr: data.nonceStr, // 必填，生成签名的随机串
                signature: data.signature, // 必填，签名
                type: 0,   //选填。0表示微应用的jsapi,1表示服务窗的jsapi。不填默认为0。该参数从dingtalk.js的0.8.3版本开始支持
                jsApiList: ['biz.util.ut','device.notification.confirm','biz.contact.choose','biz.util.uploadImage', 'biz.util.previewImage','biz.util.uploadAttachment','biz.cspace.preview','biz.contact.complexPicker'] // 必填，需要使用的jsapi列表，注意：不要带dd。
            });
            DingTalkPC.error(function (error) {
                console.log('dd errorPC: ' + JSON.stringify(error));
                if(onSuccess){
                    onSuccess();
                }
            });
            DingTalkPC.ready(function () {
                if(onSuccess){
                    onSuccess();
                }
            });
        },false)
    }    
}