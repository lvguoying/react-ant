import HttpClient from '../api/HttpClient';

// 获取标签列表
/*
 * 返回值 type:'1'  个人标签
 *        type:'2'  公共标签
 *        type:'3'  项目分类
 */
export function getTagList(callback,isSmall) {
    HttpClient.AjaxPost('/label/findLabelByUser','', list => {
        callback(list);
    },isSmall);
}

// 获取项目分类列表
export function getProjectTypeList(callback,isSmall){ 
    HttpClient.AjaxPost('/label/labelProjectList','', list => {
        callback(list);
    },isSmall);
}
//添加项目分类
export function addProjectType(data,pid,callback,isSmall) {
    HttpClient.AjaxPost('/label/addProjectLabel?pid='+pid,data, list => {
        callback(list);
    },isSmall)
}
//修改项目分类
export function updateProjectType(data,callback,isSmall){ 
    HttpClient.AjaxPost('/label/updateProjectLabel',data, list => {
        callback(list);
    },isSmall);
}
//获取标签列表
export function getLabelList(callback,isSmall) {
    HttpClient.AjaxPost('/label/findLabelAll','', list => {
            callback(list);
    },isSmall)
}
//通过标签获取用户
export function findLabelUser(id,callback,isSmall) {
    HttpClient.AjaxPost('/label/findLabelUser?lid='+id,'', list => {
            callback(list);
    },isSmall)
}
//添加标签
export function addLabel(data,pid,callback,isSmall) {
    HttpClient.AjaxPost('/label/addLabel?pid='+pid,data, list => {
        callback(list);
    },isSmall)
}
//编辑标签
export function updateLabel(name,id,color,callback,isSmall) {
    HttpClient.AjaxPost('/label/updateLabel',{id:id,labelname:name,color:color?color:''}, list => {
        callback(list);
    },isSmall)
}
//更换父标签
export function updateLabelParent(id,parentId,callback) {
    HttpClient.AjaxPost('/label/updateLabelParent',{'id':id,'parent':{'id':parentId}}, list => {
        callback(list);
    })
}
//删除标签
export function deleteLabel(id,callback) {
    HttpClient.AjaxPost('/label/deleteLabel?id='+id,'', list => {
        callback(list);
    })
}  
//删除多个标签
export function deleteAllLabel(ids,callback) {
    HttpClient.AjaxPost('/label/deleteLabelAll',ids, list => {
        callback(list);
    })
}   

//获取自己和公共标签
export function findLabelByUser(callback,isSmall) {
        HttpClient.AjaxPost('/label/findLabelByUser','', list => {
            callback(list);
        },isSmall)
}

//获取个人标签
export function getPersonLabel(callback,isSmall) {
    HttpClient.AjaxPost('/label/getPersonLabel','', list => {
        callback(list);
    },isSmall)
}

//添加个人标签
export function addPersonLabel(name,pid,callback,isSmall) {
    HttpClient.AjaxPost('/label/addPersonLabel?pid='+pid,name, list => {
        callback(list);
    },isSmall)
}


