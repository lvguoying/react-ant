import HttpClient from '../api/HttpClient';
import { toASCII } from 'punycode';

// 根据类型获取项目列表
/*
 * type:'1'                    // 1团队所有 2我参与的 3我收藏的 4我负责的
 */
export function getProListByType(type,pageNo,callback,pageSize=40,labelIds=[],search='') {
    const data = {
        'type':type,
        'labelId':labelIds,
        'orderBy':'DESC',
        'search':search
    };
    HttpClient.AjaxPost('/project/projectPageIndex?pageSize='+pageSize+'&pageNo='+pageNo,data, list => {
        callback(list);
    });
}

// 关注项目
export function addAttentionWitchProject(objectId, callback){    
    const data = {rtype: "a", objectId: objectId};  
    HttpClient.AjaxPost('/collect/collect', data, list => {
        callback(list);
    });
}
// 取消关注项目
export function cancelAttentionWitchProject(objectId, callback){
    const data = {rtype: "a", objectId: objectId};    
    HttpClient.AjaxPost('/collect/callCollect', data, list => {
        callback(list);
    });
}

// 获取项目的任务树结构数据
export function getProjectTaskListById(progectId,parentId,taskId,pageNo,callback,hideOkTask='') {
    HttpClient.AjaxPost('/taskinfo/findTreePageList?progectId='+progectId+'&pId='+parentId+'&pageNo='+pageNo+'&id='+taskId, {'hidden':hideOkTask}, list => {
        callback(list);
    })
}
// 加载项目列表
export function getProjectList(callback){
    HttpClient.AjaxPost('/project/projectList','', list => {
        callback(list);
    })
}

// 创建项目
/*
 * {
	category:"0"         // PC创建的
	id:""                // 修改的时候传项目ID
	memberofpros:[{选人组件获取到的信息
		0:{负责人信息
		  delete:""      // 为'1'删除
		  id:""          // 删除时 传递用户的记录ID
		  rtype:"2"
		  user:{
              userid: "8ff0cc5eeb9a4db8929cb5832c05e0b2"
         }
		1:{rtype: "1", id: "",…}管理员信息
		2:{rtype: "0", id: "",…}项目成员信息
		]
	    opentype:"0"是否全员可见（0为不可见）
	    proname:"测试添加2" 项目名称
	    proremark:"三十四" 项目描述
	    attstr04:"" 项目图标
	    labelIds：[id,id] 项目分类id集合(数组)
	}
 */
// 创建修改项目
export function createProject(data,callback){
    HttpClient.AjaxPost('/project/projectAddNew',data, list => {
        callback(list);
    })
}

// 删除项目 
export function deleteProject(id,callback){
    HttpClient.AjaxPost('/project/projectDelete', {'id':id}, list => {
        callback(list);
    })
}

// 人员任务统计
export function getChartByUserTask(data,callback){    
    HttpClient.AjaxPost('/calculate/getTasktableCount',data, list => {
        callback(list);
    })
}

// 人员绩效统计
export function getChartByUserMoney(data,callback){    
    HttpClient.AjaxPost('/calculate/getContenTableData',data, list => {
        callback(list);
    })
}

// 任务概述统计
export function getChartByTaskSituation(id,callback){    
    HttpClient.AjaxPost('/calculate/project?id='+id,'', list => {
        callback(list);
    })
}

// 项目进展统计
export function getChartByProjectProgress(data,callback){    
    HttpClient.AjaxPost('/calculate/getProgressView',data, list => {
        callback(list);
    })
}

// 获取项目的文件列表
export function getFileListByProjectId(projectId,parentId,pageSize=50,pageNo=1,callback,fileName){
    HttpClient.AjaxPost('/files/fileIdexListNew?projectId='+projectId+'&parentId='+parentId+'&fileName='+fileName+'&pageSize='+pageSize+'&pageNo='+pageNo, {}, list => {
        callback(list);
    });
}

// 获取项目甘特图数据
export function getProjectChartData(id,callback) {
    HttpClient.AjaxPost('/project/projectGantt?id='+id,'', list => {
        callback(list);
    });
}

// 获取项目设置的数据
export function getProjectCreateInfoById(id,callback) {
    HttpClient.AjaxPost('/project/projectDetailsNew?id='+id,'', list => {
        callback(list);
    });
}

// 提交导入的数据
export function updateImportExcelByProject(projectId,parentId,callback){
    HttpClient.AjaxPost('/taskinfo/affirmChannel?type=0&projectId='+projectId+'&taskinfoId='+parentId,'', list => {
        callback(list);
    });
}

// 项目更新
/*export function projectUpdate(data,callback) {
    HttpClient.AjaxPost('/project/projectUpdate',data,list => {
        callback(list);
    });
}*/






