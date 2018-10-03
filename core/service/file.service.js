import HttpClient from '../api/HttpClient';

// 删除文件
export function deleteFileById(id,callback,isSmall) {
    HttpClient.AjaxPost('/files/deleteFile?id='+id, [], list => {
        callback(list);
    },isSmall);
}

// 上传图片 传给我们自己的服务器后台 后台返回图片地址
/*
 * 入参{'Base64Image':''}
 * 出参{'fileUrlAbsolute':{}} 
 */
export function updateImgsInService(baseUrl,callback,isSmall){
    const data = {
        'Base64Image': baseUrl
    };
    HttpClient.AjaxPost('/files/uploadBase64', data, list => {
        callback(list);
    },isSmall);
}

/*
 * 上传图片
 * 入参{'data':''}
 * 出参{'file':{}} 
 */
export function updateDingFileService(pid,type,data,callback,isSmall){
    HttpClient.AjaxPost('/files/uploadDingFile?pid='+pid+'&type='+type, data, list => {
        callback(list);
    },isSmall);
}

// 获取导入数据日志
export function getImportLog(projectId,pageNo,callback,isSmall){
    HttpClient.AjaxPost('/taskinfo/channelList?projectId='+projectId+'&pageNo='+pageNo, '', list => {
        callback(list);
    },isSmall);
}


/**
 * 获取导出目录数据
 * @param {*} projectId 项目id
 * @param {*} parentId  父任务id，导出全部项目传空
 * @param {*} callback 
 */
export function getExportMenuData(projectId,parentId,callback){
    HttpClient.AjaxPost('/CommonExcel/findExportList?projectId='+projectId+'&parentId='+parentId, '', list => {
        callback(list);
    });
}