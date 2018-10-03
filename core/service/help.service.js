import HttpClient from '../api/HttpClient'

// 获取对应分类的列表
export function findList(page=1,data={},callback) {
     data.isPcMobile = '1';
    HttpClient.AjaxPost('/helps/findList?page='+page, data, list => {
          callback(list);
    })
}

// 获取列表分类
export function findTypeList(data={},callback) {
    data.isPcMobile = '1';
    HttpClient.AjaxPost('/helps/findTypeList', data, list => {
           callback(list);
    })
}

// 获取详情
export function getDetail(id,callback) {
    HttpClient.AjaxPost('/helps/getDetail?id='+id, '', list => {
           callback(list);
    })
}
