import HttpClient from '../api/HttpClient';

// 获取任务列表
/* data = {
 *   panelId: ['0']            // 0未完成  1已完成  2待确认  3未指派  4已终止       // 当group是任务进展
 *                             // 1未确定，2今天，3逾期，4近期，5以后               // 当group是截止日期
 *                             // 1高，2中，3低                                   // 当group是优先级
 *                             // 1 0-300，2 300-800，3 800-2000，4 未设置        // 当group是任务绩效
 *                             // 1 1天以内，2 1-3天，3 3天以上，4 未定义          // 当group是计划工期
 *   group: 'evolve'           // 分组方式： evolve任务进展,planTime截至日期,coefficienttype优先级,flowConten任务绩效,worktime计划工期 
 *   menuType: 'sub1'          // 分类：sub1我负责的,my_succeed我确认的,my_add我创建的,my_be我指派的,my_attention我关注的
 *   projectIds: ['001']       // 项目ID
 *   labelId： ['001']         // labelID
 *   'planTimeSear':{          // 截止日期 区间查询
          'start':'',
          'end':''
        },
        'worktimeSear':{       // 预计工期 区间查询
          'min':'',
          'max':''
        },
        'flowContenSear':{     // 任务绩效 区间查询
          'min':'',
          'max':''
        },
        'userSear':{           // 人 区间查询
          'type':'0',          // 负责人0 确认人1
          'userIds':['']       // userId
      }
 * }
 */
export function getTaskListByCondition(pageNo, pageSize, data, callback,isSmall) {    
    HttpClient.AjaxPost('/taskHome/taskIniNew?pageNo='+pageNo+'&pageSize='+pageSize,data, list => {
        callback(list);
    },isSmall);
}

// 获取字典数据
/* data = 'ant_taskinfo_flow,ant_taskinfo_state'
 * ant_taskinfo_flow                任务绩效分组
 * ant_taskinfo_state               任务状态
 * ant_taskinfo_coefficienttype     优先级
 * ant_task_home_planTime           截止日期
 * ant_task_home_workTime           计划工期
 */
export function getDictsByTypes(data, callback,isSmall){    
    HttpClient.AjaxPost('/taskinfo/findDict?type='+data,'', list => {
        callback(list);
    },isSmall);
}

// 邀请关注
export function attentionUsers(taskId,users,callback,isSmall){
    const data = {
        objectId: taskId,
        rtype: "b",
        users: users
    };
    HttpClient.AjaxPost('/collect/inviteAttention', data, list => {
        callback(list);
    },isSmall);
}

// 关注任务
export function addAttentionWitchTask(taskId, callback,isSmall){    
    const data = {rtype: "b", objectId: taskId};  
    HttpClient.AjaxPost('/collect/collect', data, list => {
        callback(list);
    },isSmall);
}

// 取消关注任务
export function cancelAttentionWitchTask(taskId, callback){
    const data = {rtype: "b", objectId: taskId};    
    HttpClient.AjaxPost('/collect/callCollect', data, list => {
        callback(list);
    });
}

// 设置里程碑任务
export function setMilestoneWithTask(taskId,callback,isSmall) {
    HttpClient.AjaxPost('/taskinfo/updateMilestoneIndex?id='+taskId,'', list => {
        callback(list);
    },isSmall)
}

// 批量修改任务数据
/*
 * updateData:{
        'coefficienttype': '',
        'flowConten': '',
        'planEndTime': '',
        'selectTags': [],
        'taskinfoIds': [],
        'userFlowId': '',
        'userFlowName': '',
        'userResponseId': '',
        'userResponseName': '',
        'workTime':''
    }
 */
export function updateMoreTaskData(proId,data,callback,isSmall){
    HttpClient.AjaxPost('/taskinfo/taskinfoUpdaleAll?progectId='+proId, data, list => {
        callback(list);
    },isSmall);
}

// 获取任务详情数据
export function getTaskDetailsDataById(taskId,proId,callback,isSmall){
    HttpClient.AjaxPost('/taskinfo/findByTaskinfoId?id='+taskId+'&projectId='+proId, '', list => {
        callback(list);
    },isSmall);
}

// 修改单条任务
/*
 * data:{
 *   workTime: '',                                      // 预计工期
 *   labelrelations: [{labe对象，后台传的}]              // 标签
 * }
 */
export function updateTaskById(data,callback,isSmall){
    HttpClient.AjaxPost('/taskinfo/updateMoreIndex', data, list => {
        callback(list);
    },isSmall);
}

// 获取任务的子任务数据
export function getChildTaskById(id,callback,isSmall){
    HttpClient.AjaxPost('/taskinfo/findChildTaskinfo?id='+id, '', list => {
        callback(list);
    },isSmall);
}

// 获取任务的协作任务数据
export function getCoopTaskById(id,callback,isSmall){    
    HttpClient.AjaxPost('/taskinfo/findreLevanceTaskinfo?id='+id, '', list => {
        callback(list);
    },isSmall);
}

// 获取任务的文件数据
export function getTaskFilesById(id,callback,isSmall){    
    HttpClient.AjaxPost('/taskinfo/findTaskinfoFiles?tId='+id, '', list => {
        callback(list);
    },isSmall);
}

// 修改任务任务状态
/*data = {
    id:taskinfoId,
    projectId:projectId,
    state:'0'              // 0重启 1完成 1审核通过 0驳回 4终止
    taskSignRemarks:''     // 审核说明 完成说明


    taskIds:批量修改状态ids
}*/
export function updateTaskStateByCode(data,callback,isSmall) {
    HttpClient.AjaxPost('/taskinfo/updateStateIndex',data, list => {
        callback(list);
    },isSmall);
}

// 删除任务
export function deleteTaskById(id,projectId,callback,isSmall) {
    HttpClient.AjaxPost('/taskinfo/deleteTaskinfo?id='+id+'&projectId='+projectId,'', list => {
        callback(list);
    },isSmall)
}

// 催办任务
/*ids:被催办的任务id数组['',''], tid:详情的任务id, type:1 子任务,2:前序任务*/
export function urgeTaskById(ids,tid,type,callback,isSmall) {   
    HttpClient.AjaxPost('/taskinfo/expedite?tid='+tid+'&type='+ type, ids, list => {
        callback(list);
    },isSmall);
}

// 批量催办子任务
export function urgeSonTaskByTaskId(id,callback,isSmall) {   
    HttpClient.AjaxPost('/taskinfo/expediteSonTask', {id:id}, list => {
        callback(list);
    },isSmall);
}

// 认领任务
export function claimTaskById(ids,callback,isSmall) {
    HttpClient.AjaxPost('/taskinfo/drawTaskinfo',ids, list => {
        callback(list);
    },isSmall);
}

// 删除协作任务
export function deleteCoopTaskById(recordId,nowTaskId,callback,isSmall) {
    HttpClient.AjaxPost('/taskrrelation/deleteTaskrTelation?id='+recordId+'&taskinfo='+nowTaskId,'', list => {
        callback(list);
    },isSmall);
}

// 创建任务
/* data = {
    planEndTimeString: "2018-07-13",
    taskname:"555666",
    userResponse:{
        userid: "393dc1f0b64d4609a5b71502e2917232"
    }
   }
 */
export function createTask(progectId,parentId,data,callback,isSmall) {
    HttpClient.AjaxPost('/taskinfo/addTaskinfo?progectId='+progectId+"&pid="+parentId, data, list => {
        callback(list);
    },isSmall);
}

// 添加讨论
/*
 * data = {description:'描述',taskinfo:{id:'任务ID'},reply:{id:'回复人的ID'},files:[{文件对象}]}
 */
export function addTalkAtTask(data,callback,isSmall) {
    HttpClient.AjaxPost('/leave/addLeave', data, list => {
        callback(list);
    },isSmall)
}

// 删除讨论
export function deleteTalkById(id,callback,isSmall) {
    HttpClient.AjaxPost('/leave/deleteLeave?id='+id,'', list => {
        callback();
    },isSmall)
}

// 复制任务
/*
 *  userResponse     // 负责人    复制传1  不复制传空
	taskFile         // 完成日期      复制传1  不复制传空
	childTask        // 子任务     复制传1  不复制传空
	userFlow         // 确认人        复制传1  不复制传空
	taskeva          // 协作任务         复制传1  不复制传空
	flowConten       // 任务绩效    复制传1 不复制传空
	workTime         // 计划工期                 复制传1  不复制传空
	coefficientType  // 重要程度       复制传1  不复制传空
	parentId         // 父任务id 
	projectId        // 项目id
 */
export function copyTask(data,callback) {   
    const task={
        'id':data.id,          
        'taskname':data.name,  
        'userResponse':data.fzr, 
        'taskFile':data.endTime,
        'childTask':data.child,
        'userFlow':data.qrr,
        'taskeva':data.loop,
        'flowConten':data.money, 
        'workTime':data.worktime, 
        'coefficientType':data.lev, 
        'parentId':data.parentId, 
        'projectId':data.projectId 
    }; 
    HttpClient.AjaxPost('/taskinfo/copyTaskNew',task, list => {
        callback(list);
    })
}

// 移动任务
/*
 * type 1移动到根目录 否则不传
 */
export function moveTask(taskId,parentId,type,callback){
    HttpClient.AjaxPost('/taskinfo/relateFatherTaskNew?resourceId='+taskId+'&targetId='+parentId+'&type='+type,'', list => {
        callback(list);
    });
}

// 查询计算公式
export function getFormulaById(id,callback) {
    HttpClient.AjaxPost('/calculate/getPrefTypeByProjectId?projectId='+id,'', list => {
        callback(list);
    });
}

// 添加、修改计算公式
export function updateFormula(data,callback){    
    HttpClient.AjaxPost('/calculate/savePrefType',data, list => {
        callback(list);
    })
}

// 添加前序任务 
export function addPrevCoopTaskByTaskId(taskId,coopTaskIds,callback){    
    const data = {antTaskinfo:{id:taskId},selectIds:coopTaskIds};
    HttpClient.AjaxPost('/taskrrelation/saveTaskrTelationParent',data, list => {
        callback(list);
    })
}

// 添加后序任务 
export function addNextCoopTaskByTaskId(taskId,coopTaskIds,callback){    
    const data = {antTaskinfo:{id:taskId},selectIds:coopTaskIds};
    HttpClient.AjaxPost('/taskrrelation/saveTaskrTelationNext',data, list => {
        callback(list);
    })
}

// 获取任务的面包屑
export function getTaskBreadById(projectId,taskId,callback,isSmall){    
    HttpClient.AjaxPost('/taskinfo/findByProjectId?id='+projectId+'&pid='+taskId,'', list => {
        callback(list);
    },isSmall)
}

// 获取未完成的子任务
export function getSonTask(taskId,callback,isSmall){    
    HttpClient.AjaxPost('/taskinfo/sonTask?id='+taskId,'', list => {
        callback(list);
    },isSmall)
}
