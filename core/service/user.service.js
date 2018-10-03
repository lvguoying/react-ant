import HttpClient from '../api/HttpClient';


// 测试登录
export function login(user, password, callback) {
    HttpClient.AjaxPost('/user/loginUser',{loginName: user,password: password}, list => {
        callback(list);
    });
}

export function guideUpdate(callback){
    const version = HttpClient.getVersion();
    HttpClient.AjaxPost('/user/updateLoginState?type=pc&version='+version,'', list => {
        callback(list);
    });
}

// 钉钉二维码登录
export function dingLoginByQrCode(userCode,corpId,callback) {
    HttpClient.AjaxPost('/user/dingtalkId?cid='+userCode+'&s='+corpId,'', list => {
        callback(list);
    });
}

// 判断用户是否登录新版本
export function getUserVersion(corpId,callback){
    HttpClient.AjaxPost('/user/getUserVersion?corpid='+corpId,'', list => {
        callback(list);
    });
}

// 钉钉code登录
export function dingLoginByCode(userCode,corpId,callback) {
    HttpClient.AjaxPost('/user/dingtalkCodeLogin?code='+userCode+'&corpid='+corpId,'', list => {
        callback(list);
    });
}

// 钉钉获取授权jsapi信息
export function getDingUserCode(corpid,SuiteKey,urlData,callback) {
    HttpClient.AjaxPost('/dingTalk/mobilejs?corpid='+corpid+'&SuiteKey='+SuiteKey+'&urlData='+urlData,'', list => {
        callback(list);
    });
}

// 获取用户业务数据统计
export function getUserBusinessStatistics(callback){ 
    HttpClient.AjaxPost('/taskHome/getData','', list => {
        callback(list);
    });
}   

// 我的任务 图表 按月查传month  按周查传week
export function getUserTaskChart(searDate,callback){
    HttpClient.AjaxPost('/taskHome/getMyTask?type='+searDate,'', list => {
        callback(list);
    });    
}

// 我的绩效 图表
export function getUserMoneyChart(projectIds,searDate,callback){    
    const data = {
        projectIds : projectIds,
        type : searDate
    };
    HttpClient.AjaxPost('/taskHome/getMyConten',data, list => {
        callback(list);
    });  
}

// 通知信息
export function getMessageByUser(pageNo,callback) {
    HttpClient.AjaxPost('/message/findMessage?pageNo='+pageNo+'&read=','', list => {
        callback(list);
    });
}