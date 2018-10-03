import HttpClient from '../api/HttpClient';

// 获取动态数据
export function getDynamicList(pageNo,data,callback) {
    HttpClient.AjaxPost('/tasklog/findGroupPageIndexNew?pageNo='+pageNo,data, list => {
        callback(list);
    });
}