import HttpClient from '../api/HttpClient';

// 获取未读消息
export function findReadMessage(page=1,callback) {
     HttpClient.AjaxPost('/message/findMessage?pageNo='+page+'&read=','', list => {
        callback(list);
    });
}

// 消息详情
export function findMessageDetail(id,callback) {
    HttpClient.AjaxPost('/message/findMessageDetail?id='+id,'', list => {
        callback(list);
    });
}

// 任务id获取项目id
export function findTaskinfoByProjectId(id,type,callback) {
    HttpClient.AjaxPost('/taskinfo/findTaskinfoByProjectId?taskId='+id+'&type='+type,'', list => {
        callback(list);
    })
}
// 改为已读
export function updateRead(ids,callback) {
    HttpClient.AjaxPost('/message/updateReadBath?ids='+ids,'', list => {
        callback(list);
    })
}

// 全部改为已读
export function updateAllRead(callback) {
    HttpClient.AjaxPost('/message/updateAllRead?','', list => {
          callback(list);
    })
}
// 清除已读
export function deleteBath(ids,read,callback) {
    HttpClient.AjaxPost('/message/deleteBath?ids='+ids + '&read=' + read,'', list => {
          callback(list); 
    })
}

// 获取未读数量
export function getMessageCount(callback){
    HttpClient.AjaxPost('/time/timeList','', list => {
        callback(list); 
    })
}

// 消息id获取项目id任务id
export function getDingMessageDetails(id,callback) {
    HttpClient.AjaxPost('/taskinfo/getDingMessageDetails?taskinfoId='+id,'', list => {
        callback(list);
    })
}