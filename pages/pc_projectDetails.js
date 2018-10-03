import React from 'react';
import { bindActionCreators } from 'redux';
import withRedux from 'next-redux-wrapper';
import { Layout, Radio, Button, Spin, Icon, Modal, Steps, Upload, message, Select, Checkbox } from 'antd';
import Router from 'next/router';
import { LocaleProvider } from 'antd';
import zh_CN from 'antd/lib/locale-provider/zh_CN';
import 'moment/locale/zh-cn';

import { initStore } from '../store';
import stylesheet from 'styles/views/projectDetails.scss';
import Head from '../components/header';
import TaskTree from '../components/taskTree';
import { getProjectTaskListById, getProListByType,updateImportExcelByProject } from '../core/service/project.service';
import TaskDetails from '../components/taskDetails';
import MoreTaskEdit from '../components/moreTaskEdit';
import ProjectChart from '../components/projectChart';
import ProjectFiles from '../components/projectFiles';
import { listScroll, getTeamInfoWithMoney } from '../core/utils/util';
import * as projectAction from '../core/actions/project';
import ProjectPlusGantt from '../components/ProjectPlusGantt';
import ProjectCreate from '../components/projectCreate';
import dingJS from '../core/utils/dingJSApi';
import { baseURI,visitUrl } from '../core/api/HttpClient';
import MoneyEnd from '../components/moneyEnd';
import { getImportLog,getExportMenuData } from '../core/service/file.service';
import TaskCreate from '../components/taskCreate';

const { Content } = Layout;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
const { Option } = Select;
const confirm = Modal.confirm;
const Step = Steps.Step;
const downUrl = baseURI + '/CommonExcel/downLoadTaskTest?projectId=';
const upUrl = baseURI + '/CommonExcel/doImpExcel?configBeanName=antExcelDrExcelConfig&projectId=';

class ProjectDetails extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            switchPage: 'a',
            projectId: '',
            hideOkTask: false,

            treeList: [],
            treeListNowPage: 1,
            treeListAllPage: 0,
            treeListLoading: false,
            treeListMoreLoading: false,
            notCheckIds:[],

            taskDetailsId: '',
            selectedTaskName: '',
            taskDetailsProId: '',
            taskDetailsParentId: '',
            taskDetailsState: '',
            taskDetailsShow: false,
            animateClass: '',

            moreEdit: false,
            checkedIds: [],

            searchProType: '1',
            projectList: [],
            projectName:'',
            jurisdiction: '',
            projectTaskCount:0,
            projectListLoading: false,
            projectListMoreLoading: false,
            projectListNowPage: 1,
            projectListAllPage: 0,

            projectSearchDivOnTop: false,

            ProjectCreateShow: '',

            moneyEnd: false,

            importExcelShow: false,
            importExcelUpdating:false,
            importName: '',
            importUpLoading: false,
            importAlert: '导入到最上级任务中',
            importStep: 0,
            importErrNowPage: 1,
            importErrAllPage: 0,
            importErrLoading: false,
            importErrLog: [],
            importSuccess:0,
            importErr:0,

            exportExcelShow: false,
            exportData:[],
            exportLoading:false,
            exportCountLoading:false,

            taskCreateShow:false,
            taskCreateProject:{},
        }
    }

    componentWillMount() {
        if (this.props.url.query.taskId) {
            this.setState({ taskDetailsId: this.props.url.query.taskId, taskDetailsShow: true });
            this.animateAdd();
        }
        if (this.props.url.query.id) {
            const projectId = this.props.url.query.id;
            this.setState({ projectId: projectId, taskDetailsProId: projectId });
            this.getProTaskList(1, projectId);
        } 
        if (this.props.projectSearchVal.type) {
            this.setState({ searchProType: this.props.projectSearchVal.type });       
        } 
        this.getProjectList(this.props.projectSearchVal.type?this.props.projectSearchVal.type:'1', this.props.projectSearchVal.labelIds?this.props.projectSearchVal.labelIds:[], 1);
    }

    componentDidMount() {
        dingJS.authDingJsApi();
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.url.query.taskId) {
            this.setState({ taskDetailsId: nextProps.url.query.taskId, taskDetailsShow: true });
            this.animateAdd();
        }
        if (nextProps.url.query.id) {
            const projectId = nextProps.url.query.id;
            this.setState({ projectId: projectId, taskDetailsProId: projectId });
            this.getProTaskList(1, projectId);
        }else{
            this.getProjectList();
        }
        if (nextProps.projectSearchVal.type) {
            this.setState({ searchProType: nextProps.projectSearchVal.type });            
        }
    }

    componentWillUnmount() {    
        this.setState = (state,callback)=>{
            return;
        };  
    }

    getProTaskList(pageNo, projectId, hideOkTask='') { 
        if (!pageNo) {
            pageNo = 1;
        }
        if (!projectId) {
            projectId = this.state.projectId;
        }
        if(hideOkTask === '' || hideOkTask === undefined){
            hideOkTask = this.state.hideOkTask;
        }
        if (pageNo === 1) {
            this.setState({ treeListLoading: true });
        } else {
            this.setState({ treeListMoreLoading: true });
        }
        getProjectTaskListById(projectId, '', '', pageNo, (data) => {       
            if(data.err){
                return false;
            }     
            let {treeList,notCheckIds} = this.state;
            if(pageNo === 1){
                treeList = [];
                notCheckIds = [];
            }
            if (data.taskPage && data.taskPage.list && data.taskPage.list.length > 0) { 
                data.taskPage.list.map((item, i) => {
                    treeList.push({
                        'projectId': item.project.id,
                        'parentId': item.taskinfo.parent.id,
                        'taskId': item.taskinfo.id,
                        'name': item.taskinfo.taskname,
                        'state': item.taskinfo.stateName,
                        'number': (item.taskinfo.taskinfoNumber ? item.taskinfo.taskinfoNumber.numberS + '.' : '') + item.taskinfo.rank,
                        'tags': [],
                        'attention': item.taskinfo.collect ? true : false,
                        'milestone': item.taskinfo.milestone?true:false,
                        'fzr': item.taskinfo.userResponse ? item.taskinfo.userResponse.name : '未指派',
                        'qrr': item.taskinfo.userFlow?item.taskinfo.userFlow.name:'未指派',
                        'endDate': item.taskinfo.planEndTime?item.taskinfo.planEndTime:'未设置',
                        'endDate_real': item.taskinfo.realityEndTime?item.taskinfo.realityEndTime:'',
                        'childCount': item.taskinfo.child,
                        'childIngCount': item.taskinfo.childCount,
                        'childSuccess': item.taskinfo.childSuccess,
                        'talkCount': item.taskinfo.leaveCount,
                        'loading': false,
                        'labels': item.labels
                    });
                    if(item.taskinfo.state === '1' || item.taskinfo.state === '4' || item.taskinfo.state === '2'){
                        notCheckIds.push(item.taskinfo.id);
                    }
                });
            } 
            if(data.count && data.count.project){ 
                this.setState({ projectName: data.count.project.proname, projectTaskCount: data.count.count, jurisdiction: data.count.project.jurisdiction });
            } 
            this.setState({ treeList: treeList,notCheckIds:notCheckIds, treeListNowPage: data.taskPage?data.taskPage.pageNo:1, treeListAllPage: data.taskPage?data.taskPage.last:1 });
            this.setState({ treeListMoreLoading: false, treeListLoading: false });
        },hideOkTask);
    }

    treeBoxScroll(e) {
        const { treeListNowPage, treeListAllPage } = this.state;
        const isOnBottom = listScroll(e);
        if (isOnBottom && treeListNowPage < treeListAllPage) {
            this.getProTaskList(treeListNowPage + 1);
        }
    }

    getProjectList(type, labIds=[], pageNo, isReLoad) { 
        if (!type) {
            type = this.state.searchProType;
        }
        if (!pageNo) {
            pageNo = 1;
        }
        if (pageNo === 1) {
            this.setState({ projectListLoading: true });
        } else {
            this.setState({ projectListMoreLoading: true });
        } 

        const projectSeachVal = {
            'type': type
        }
        this.props.setProjectSeachVal(projectSeachVal); 

        getProListByType(type, pageNo, (data) => {  
            if(data.err){
                return false;
            }
            if(isReLoad){
                if(data.projects.length>0){
                    Router.push('/pc_projectDetails?id='+data.projects[0].id);
                }else{
                    Router.push('/pc_project');
                }
            }

            if (data.pageNo === 1) {
                this.setState({ projectList: data.projects });
            } else {
                const projectList = JSON.parse(JSON.stringify(this.state.projectList));
                if(data && data.projects && data.projects.length > 0){
                    data.projects.map((item) => {
                        if (projectList.filter(val => val.id === item.id).length === 0) {
                            projectList.push(item);
                        }
                    });
                }
                this.setState({ projectList: projectList });
            }
            this.setState({ projectListNowPage: data.pageNo, projectListAllPage: data.last });
            this.setState({ projectListLoading: false, projectListMoreLoading: false });
        }, 40, []);
    }

    projectListScroll(e) {
        const { projectListNowPage, projectListAllPage } = this.state;
        if (listScroll(e) && projectListNowPage < projectListAllPage) {
            this.getProjectList('', '', projectListNowPage + 1);
        }
    }

    projectOnClick(id) {
        this.cancelMoreEdit();
        this.setState({taskDetailsShow:false});
        Router.push('/pc_projectDetails?id=' + id);
    }

    switchPage(name) {
        if (name === 'a') {
            this.setState({ switchPage: name });
        } else {   
            if (!getTeamInfoWithMoney('是否可用')) {
                this.setState({ moneyEnd: true });
            }else{
                this.setState({ switchPage: name });
            }
        }
    }

    getImportErrLog(projectId,pageNo){
        if(pageNo > 1){
            this.setState({importErrLoading:true});
        }
        getImportLog(projectId,pageNo,(res)=>{            
            if(res.err){
                this.setState({importUpLoading:false});
                return false;
            }
            if(res.pageNo === 1){
                this.setState({importErrLog:res.list,importSuccess:res.successCount,importErr:res.failCount});
            }else{
                let list = JSON.parse(JSON.stringify(this.state.importErrLog));
                if(res && res.list && res.list.length > 0){
                    res.list.map((item)=>{
                        list.push(item);
                    });
                }
                this.setState({importErrLog:list});
            }
            this.setState({importErrLoading:false,importErrNowPage:res.pageNo,importErrAllPage:res.last});
        });
    }

    importExcelErrLogScroll(e) {
        const { importErrNowPage, importErrAllPage, projectId } = this.state;
        const isOnBottom = listScroll(e);
        if (isOnBottom && importErrNowPage < importErrAllPage) {
            this.getImportErrLog(projectId,importErrNowPage + 1);
        }
    }

    updateImportExcel(importErr){
        // if(importErr == 0){
            this.setState({importExcelUpdating:true});
            const { projectId,taskDetailsId } = this.state;
            updateImportExcelByProject(projectId,taskDetailsId,(res)=>{
                if(res.err){
                    return false;
                }
                message.success('导入成功');
                this.setState({ importExcelShow: false, importExcelUpdating: false });
                this.getProTaskList(1,projectId);
            });
        // }else{
        //     message.error('导入模板中包含错误内容，请修改后导入');
        // }
    }

    importExcel() {
        const { importExcelShow, importName, projectId, taskDetailsId,selectedTaskName,importExcelUpdating,importUpLoading,importStep,importErrLog, importSuccess, importErr, importErrLoading, importErrAllPage, importErrNowPage } = this.state;
        const that = this;
        let url = upUrl + projectId;
        let { importAlert } = this.state;
        if (importName === '导入子任务') {
            url = upUrl + projectId + '&taskinfoId=' + taskDetailsId;
            importAlert = '导入到“'+selectedTaskName+'”任务中';
        }else{
            importAlert = '导入到最上级任务中';
        }
        const props = {
            action: url,
            showUploadList: false,
            onChange(info) {
                if (info.file.status === 'uploading' && importExcelShow) {
                    that.setState({ importUpLoading: true });
                }
                if (info.file.status === 'done' && importExcelShow) {
                    if(info.file.response && info.file.response.success){
                        that.setState({ importUpLoading: false, importStep:1 });
                        that.getImportErrLog(projectId,1);
                    }else{
                        message.info(info.file.response.errmsg);
                        that.setState({ importUpLoading: false });
                    }
                } else if (info.file.status === 'error' && importExcelShow) {
                    message.error(`${info.file.name} 文件导入失败`);
                    that.setState({ importUpLoading: false, importAlert:'文件导入失败'});
                }
            }
        };
        return (
            <Modal
                title={importName}
                visible={importExcelShow}
                width={800}    
                onCancel={() => { this.setState({ importExcelShow: false }) }}            
                footer={[
                    <Button key="quxiao" onClick={() => { this.setState({ importExcelShow: false, importUpLoading: false }) }}>取消</Button>,
                    (importStep===1 && <Button key="back" onClick={()=>{this.setState({importStep:0})}}>上一步</Button>),
                    (importStep===1 && <Button key="submit" type="primary" disabled={importExcelUpdating } onClick={() => { this.updateImportExcel(importErr); }}>{importExcelUpdating?<Icon type="loading" />:''}提交</Button>)
                ]}
            >
                <Steps current={importStep}>
                    <Step title="上传数据" />
                    <Step title="验证数据并完成" />
                </Steps>
                {importStep===0?
                    <div className="importStyle">
                        <div className="p">{importAlert}</div>
                        <Upload {...props}>
                            <Button type="primary">
                                {importUpLoading ? <Icon type="loading" /> : <Icon type="upload" />} {importUpLoading ? '正在上传' : '上传表格'}
                            </Button>
                        </Upload>
                    </div>
                :   
                    <div className="importStyle">
                        <p>成功数量<span>{importSuccess}</span>失败数量<span>{importErr}</span>，请根据失败原因修改后重新导入</p>
                        <div className="rowBox head">
                            <div className="one">任务名称</div>
                            <div className="two">所在行</div>
                            <div className="three">数据校验</div>
                            <div className="four">失败原因</div>
                        </div>
                        <div className="listBox" onScroll={(e)=>{this.importExcelErrLogScroll(e)}}>
                            {importErrLog&&importErrLog.length>0?importErrLog.map((item)=>{
                                return(
                                    <div className="rowBox" key={item.id}>
                                        <div className="one">{item.taskname}</div>
                                        <div className="two">{item.indexNumber}</div>
                                        <div className="three">{item.whether==='0'?<Icon type="check" style={{color:'#3a9d09'}} />:<Icon type="close" style={{color:'#e10215'}} />}</div>
                                        <div className="four">{item.errlog}</div>
                                    </div>
                                )
                            }):''}
                            {!importErrLoading && importErrNowPage<importErrAllPage?
                                <div className="moreLoadingRow">下拉加载更多</div>
                            :''}
                            {!importErrLoading && (importErrNowPage>importErrAllPage || importErrNowPage===importErrAllPage) ?
                                <div className="moreLoadingRow">已经到底喽</div>
                            :''}
                            {importErrLoading?
                                <div className="moreLoadingRow"><Icon type="loading" className="loadingIcon" />正在加载更多</div>
                            :''}
                        </div>
                    </div>
                } 
                {importStep === 0 && <a href={visitUrl+'/exceltemplate/template.xlsx'} download target="_blank" className="importBut"><i className="icon iconfont icon-microsoftexcel"></i>下载模板.xlsx</a>}  
            </Modal>
        );
    }

    treeListOnChange(newTreeList){
        let notCheckIds = [];
        const loop = (list) => {
            list.forEach((item,i)=>{
                if(item.childList && item.childList.length>0){
                    loop(item.childList);
                } 
                if(item.state === '1' || item.state === '4' || item.state === '2' || item.state === '9' || item.state === '8'){
                    notCheckIds.push(item.taskId);
                }
            });            
        }
        loop(newTreeList);
        this.setState({notCheckIds:notCheckIds});
    }

    setDataByArgs(treeList,task,args){ 
        const loop = (list) => {
            list.forEach((item,i)=>{
                if(item.childList && item.childList.length>0){
                    loop(item.childList);
                } 
                if(item.taskId == task.id){
                    if(args && args.length > 0){
                        args.map((argName)=>{ 
                            item[argName] = task[argName];                        
                        });
                    }
                    return false;
                }
            });            
        }
        loop(treeList);
        this.setState({treeList:treeList}); 
    }

    taskMove(moveObj){ 
        let { treeList,projectId,hideOkTask } = this.state;
        let nowTask = {};
        const loop = (list,loopType) =>{
            list.forEach((item,i)=>{
                if(item.childList && item.childList.length>0){
                    loop(item.childList,loopType);
                }
                if(loopType === 'moveToPid' && (item.taskId === moveObj.moveToParentId || item.taskId === moveObj.copyToParentId)){ // 到达的父任务    
                    if(nowTask.state === '1' || nowTask.state === '8' || nowTask.state === '9'){
                        item.childSuccess = item.childSuccess+1;
                    }
                    let childrenList = [];
                    getProjectTaskListById(projectId,item.taskId,'',1,(data)=>{
                        if(data.err){
                            return false;
                        }        
                        if(data.taskPage.list){                            
                            data.taskPage.list.map((ite,i)=>{
                                childrenList.push({
                                    'projectId': ite.project.id,
                                    'parentId': ite.taskinfo.parent.id,
                                    'taskId': ite.taskinfo.id,
                                    'name': ite.taskinfo.taskname,
                                    'state': ite.taskinfo.stateName,
                                    'number': (ite.taskinfo.taskinfoNumber?ite.taskinfo.taskinfoNumber.numberS+'.':'') + ite.taskinfo.rank,
                                    'tags': [],
                                    'attention': ite.taskinfo.collect?true:false,
                                    'milestone': ite.taskinfo.milestone?true:false,
                                    'fzr': ite.taskinfo.userResponse?ite.taskinfo.userResponse.name:'未指派',
                                    'qrr': ite.taskinfo.userFlow?ite.taskinfo.userFlow.name:'未指派',
                                    'endDate': ite.taskinfo.planEndTime?ite.taskinfo.planEndTime:'未设置',
                                    'endDate_real': ite.taskinfo.realityEndTime?ite.taskinfo.realityEndTime:'未设置',
                                    'childCount': ite.taskinfo.child,
                                    'childIngCount': ite.taskinfo.childCount,
                                    'childSuccess': ite.taskinfo.childSuccess,
                                    'talkCount': ite.taskinfo.leaveCount,
                                    'openChild': false,
                                    'loading': false,
                                    'labels':ite.labels
                                });
                            });    
                            const taskSet = {'id':item.taskId,'childCount':item.childCount+1,'childSuccess':item.childSuccess,'childList':childrenList};  
                            this.setDataByArgs(treeList,taskSet,['childCount','childSuccess','childList']);                       
                        } 
                    },hideOkTask);                     
                    return false;
                }
                if(loopType === 'moveNowPid' && item.taskId === nowTask.parentId ){   // 离开的父任务                    
                    
                    if(nowTask.state === '1' || nowTask.state === '8' || nowTask.state === '9'){
                        item.childSuccess = item.childSuccess-1;
                    }
                    let childrenList = [];
                    getProjectTaskListById(projectId,item.taskId,'',1,(data)=>{
                        if(data.err){
                            return false;
                        }        
                        if(data.taskPage.list){                            
                            data.taskPage.list.map((ite,i)=>{
                                childrenList.push({
                                    'projectId': ite.project.id,
                                    'parentId': ite.taskinfo.parent.id,
                                    'taskId': ite.taskinfo.id,
                                    'name': ite.taskinfo.taskname,
                                    'state': ite.taskinfo.stateName,
                                    'number': (ite.taskinfo.taskinfoNumber?ite.taskinfo.taskinfoNumber.numberS+'.':'') + ite.taskinfo.rank,
                                    'tags': [],
                                    'attention': ite.taskinfo.collect?true:false,
                                    'milestone': ite.taskinfo.milestone?true:false,
                                    'fzr': ite.taskinfo.userResponse?ite.taskinfo.userResponse.name:'未指派',
                                    'qrr': ite.taskinfo.userFlow?ite.taskinfo.userFlow.name:'未指派',
                                    'endDate': ite.taskinfo.planEndTime?ite.taskinfo.planEndTime:'未设置',
                                    'endDate_real': ite.taskinfo.realityEndTime?ite.taskinfo.realityEndTime:'未设置',
                                    'childCount': ite.taskinfo.child,
                                    'childIngCount': ite.taskinfo.childCount,
                                    'childSuccess': ite.taskinfo.childSuccess,
                                    'talkCount': ite.taskinfo.leaveCount,
                                    'openChild': false,
                                    'loading': false,
                                    'labels':ite.labels
                                });
                            });                        
                        }
                        const taskSet = {'id':item.taskId,'childCount':item.childCount-1,'childSuccess':item.childSuccess,'childList':childrenList};
                        this.setDataByArgs(treeList,taskSet,['childCount','childSuccess','childList']);
                    },hideOkTask);                       
                    return false;
                }
                if(loopType === 'task' && ( item.taskId === moveObj.moveTaskId || item.taskId === moveObj.taskCopyId)){ 
                    nowTask = JSON.parse(JSON.stringify(item));                                 
                    return false;                   
                }             
            });
        }

        loop(treeList,'task');
        if(nowTask.parentId==="0"){        
            getProjectTaskListById(projectId,'0','',1,(data)=>{
                if(data.err){
                    return false;
                }   
                let list = [];     
                if(data.taskPage.list){                            
                    data.taskPage.list.map((ite,i)=>{
                        list.push({
                            'projectId': ite.project.id,
                            'parentId': ite.taskinfo.parent.id,
                            'taskId': ite.taskinfo.id,
                            'name': ite.taskinfo.taskname,
                            'state': ite.taskinfo.stateName,
                            'number': (ite.taskinfo.taskinfoNumber?ite.taskinfo.taskinfoNumber.numberS+'.':'') + ite.taskinfo.rank,
                            'tags': [],
                            'attention': ite.taskinfo.collect?true:false,
                            'milestone': ite.taskinfo.milestone?true:false,
                            'fzr': ite.taskinfo.userResponse?ite.taskinfo.userResponse.name:'未指派',
                            'qrr': ite.taskinfo.userFlow?ite.taskinfo.userFlow.name:'未指派',
                            'endDate': ite.taskinfo.planEndTime?ite.taskinfo.planEndTime:'未设置',
                            'endDate_real': ite.taskinfo.realityEndTime?ite.taskinfo.realityEndTime:'未设置',
                            'childCount': ite.taskinfo.child,
                            'childIngCount': ite.taskinfo.childCount,
                            'childSuccess': ite.taskinfo.childSuccess,
                            'talkCount': ite.taskinfo.leaveCount,
                            'openChild': false,
                            'loading': false,
                            'labels':ite.labels
                        });
                    });                         
                }
                this.setState({treeList:list}); 
            },hideOkTask);  
        }else{
            if(moveObj.moveTaskId){                
                loop(treeList,'moveNowPid'); 
                loop(treeList,'moveToPid');             
            }else{ 
                loop(treeList,'moveToPid');
            }    
        }   
    }

    updateTask(task){  
        /* 处理移动/复制任务 */
        if(task.moveTaskId || task.taskCopyId){
            this.taskMove(task);
            return false;
        }
        /* 处理删除，删除第一级的时候 直接重新刷新树列表的第一页 */
        if(task.parentId==='0' && task.delTask){
            this.getProTaskList(1);
            return false;
        }

        let { treeList,projectId } = this.state;
        const loop = (list) => {
            list.forEach((item,i)=>{
                /* 处理删除，删除非一级的时候 根据父ID，重新刷父ID的任务列表 */
                if(task.id && item.taskId === task.parentId && task.delTask){ 
                    getProjectTaskListById(projectId,task.parentId,'',1,(data)=>{   
                        if(data.err){
                            return false;
                        }  
                        const childList = [];        
                        if(data.taskPage.list){                            
                            data.taskPage.list.map((ite,i)=>{
                                childList.push({
                                    'projectId': ite.project.id,
                                    'parentId': ite.taskinfo.parent.id,
                                    'taskId': ite.taskinfo.id,
                                    'name': ite.taskinfo.taskname,
                                    'state': ite.taskinfo.stateName,
                                    'number': (ite.taskinfo.taskinfoNumber?ite.taskinfo.taskinfoNumber.numberS+'.':'') + ite.taskinfo.rank,
                                    'tags': [],
                                    'attention': ite.taskinfo.collect?true:false,
                                    'milestone': ite.taskinfo.milestone?true:false,
                                    'fzr': ite.taskinfo.userResponse?ite.taskinfo.userResponse.name:'未指派',
                                    'qrr': ite.taskinfo.userFlow?ite.taskinfo.userFlow.name:'未指派',
                                    'endDate': ite.taskinfo.planEndTime?ite.taskinfo.planEndTime:'未设置',
                                    'endDate_real': ite.taskinfo.realityEndTime?ite.taskinfo.realityEndTime:'未设置',
                                    'childCount': ite.taskinfo.child,
                                    'childIngCount': ite.taskinfo.childCount,
                                    'childSuccess': ite.taskinfo.childSuccess,
                                    'talkCount': ite.taskinfo.leaveCount,
                                    'openChild': false,
                                    'loading': false,
                                    'labels':ite.labels
                                });
                            });                            
                        }
                        list[i].childList = childList; 
                        list[i].childCount = list[i].childCount-1;
                        if(task.state === '1' || task.state === '8' || task.state === '9'){
                            list[i].childSuccess = list[i].childSuccess - 1;
                        }
                        this.setState({treeList:treeList});
                    });
                    return false;
                }
                
                if(item.childList && item.childList.length>0){
                    loop(item.childList);
                } 

                if(task.id && item.taskId === task.id){    
                    if(task.name && item.name !== task.name){  
                        const taskSet = {'id':task.id,'name':task.name}; 
                        this.setDataByArgs(treeList,taskSet,['name']);
                    }                    
                    if(task.state && item.state !== task.state){ 
                        const taskSet = {'id':task.id,'state':task.state}; 
                        this.setDataByArgs(treeList,taskSet,['state']);
                    }
                    if(task.planEndTime!==undefined && item.endDate !== task.planEndTime){ 
                        const taskSet = {'id':task.id,'endDate':task.planEndTime}; 
                        this.setDataByArgs(treeList,taskSet,['endDate']);
                    }
                    if(task.realityEndTime!==undefined && item.endDate !== task.realityEndTime){ 
                        const taskSet = {'id':task.id,'endDate_real':task.realityEndTime}; 
                        this.setDataByArgs(treeList,taskSet,['endDate_real']);
                    }
                    if(task.attention===true || task.attention===false){
                        const taskSet = {'id':task.id,'attention':task.attention}; 
                        this.setDataByArgs(treeList,taskSet,['attention']);
                    } 
                    if(task.milestone===true || task.milestone===false){
                        const taskSet = {'id':task.id,'milestone':task.milestone}; 
                        this.setDataByArgs(treeList,taskSet,['milestone']);
                    }
                    if(task.fzr){
                        const taskSet = {'id':task.id,'fzr':task.fzr}; 
                        this.setDataByArgs(treeList,taskSet,['fzr']);
                    }else if(task.fzr === ''){
                        const taskSet = {'id':task.id,'fzr':''}; 
                        this.setDataByArgs(treeList,taskSet,['fzr']);
                    }
                    if(task.childSuccess>0 || task.childSuccess==0 || task.childCount>0 || task.childCount==0){
                        const taskSet = {'id':task.id,'childSuccess':task.childSuccess,'childCount':task.childCount}; 
                        this.setDataByArgs(treeList,taskSet,['childSuccess','childCount']);
                    }
                    if(task.talkCount>0 || task.talkCount===0){
                        const taskSet = {'id':task.id,'talkCount':task.talkCount}; 
                        this.setDataByArgs(treeList,taskSet,['talkCount']);
                    }
                    if(task.tags){ 
                        const taskSet = {'id':task.id,'labels':[]}; 
                        task.tags.map((lab)=>{
                            taskSet.labels.push({
                                'id':lab.id,
                                'labelname':lab.name,
                                'type':'1',
                                'color':lab.color
                            });
                        });
                        this.setDataByArgs(treeList,taskSet,['labels']);
                    }
                    return false;
                }
            });            
        }
        loop(treeList);
    }

    projectEditCallBack(val){
        if(val === '刷新'){
            this.getProjectList('','','',true);            
        }else{
            if(val.id){
                this.setState({projectName:val.proname});
                const { projectList } = this.state;
                if(projectList && projectList.length > 0){
                    projectList.map((item,i)=>{
                        if(item.id === val.id){ 
                            projectList[i].attstr04 = val.attstr04;
                            projectList[i].proname = val.proname;
                            this.setState({projectList:projectList});
                            return false;
                        }
                    });
                }
            }
        }
        this.setState({ ProjectCreateShow: false });
    }

    exportClick(domId){
        this.setState({exportLoading:true});
        setTimeout(() => {
            this.setState({exportLoading:false});
        }, 8000);
        document.getElementById(domId).click(); 
    }

    exportExcel(){
        let {exportData,exportExcelShow,projectId,taskDetailsId,exportLoading,exportCountLoading} = this.state;
        return (
            <Modal
                title="导出任务"
                visible={exportExcelShow}
                width={800}    
                onCancel={() => { this.setState({ exportExcelShow: false }) }}            
                footer={[]}>
                <Spin spinning={exportLoading} size="large">
                   <div className="importStyle">
                        <div className="rowBox head">
                            <div className="one">任务序号</div>
                            <div className="two">数量</div>
                            <div className="three">操作</div>
                        </div>
                        <div className="listBox">
                            {exportCountLoading?<Spin />:''}
                            {exportData&&exportData.length>0?exportData.map((item,i)=>{
                                return(
                                    <div className="rowBox" key={"exportData"+i}>
                                        <div className="one">{item.startTask.fullRank + "---------" + item.endTask.fullRank}</div>
                                        <div className="two">{item.moreSize}</div>
                                        <div className="three">
                                            <Button type="primary" onClick={()=>{this.exportClick("exportTask"+i)}}>导出任务</Button>
                                        </div>
                                        <a href={downUrl + projectId + '&parentId=' + taskDetailsId + '&start='+ item.startCount} download target='_blank' id={"exportTask"+i}></a> 
                                    </div>
                                )
                            }):''}
                        </div>
                    </div>
                </Spin>
            </Modal>
        );
    }

    getExportData(){
        let {projectId,taskDetailsId} = this.state;
        this.setState({exportExcelShow:true,exportData:[],exportCountLoading:true})
        getExportMenuData(projectId,taskDetailsId,(data)=>{
            if(data.exportCount == 0){
                message.info("该项目没有要导出的项目！");
            }else{
                let exportData = data.exportData;
                this.setState({exportData:exportData})
            }
            this.setState({exportCountLoading:false})
        });
        
    }

    cancelMoreEdit(){
        this.setState({ moreEdit: false, checkedIds: [] });
    }

    animateAdd(){
        this.setState({animateClass: 'animated_05s fadeInRightBig'});
        const _this = this;
        setTimeout(function(){
            _this.setState({animateClass: ''});
        }, 500);
    }
    headMenuIcon(){
        const{projectSearchDivOnTop}=this.state;
        if(projectSearchDivOnTop){
            this.setState({projectSearchDivOnTop:false});
        }else{
            this.setState({projectSearchDivOnTop:true});
        }
    }
    render() {
        const { switchPage, treeList, moneyEnd, projectName,notCheckIds,projectTaskCount,projectId,jurisdiction,hideOkTask, importExcelShow,exportExcelShow,taskCreateShow, animateClass, ProjectCreateShow, taskDetailsParentId, searchProType, projectSearchDivOnTop, projectList, projectListNowPage, projectListAllPage, projectListLoading, projectListMoreLoading, taskDetailsShow, taskDetailsId, taskDetailsState, taskDetailsProId, moreEdit, checkedIds, treeListNowPage, treeListAllPage, treeListMoreLoading, treeListLoading } = this.state;
        
        return (
            <LocaleProvider locale={zh_CN}>
                <Layout>
                    <style dangerouslySetInnerHTML={{ __html: stylesheet }} />
                    <Head iconOnClickCallBack={() => { this.headMenuIcon();}} />
                    {taskDetailsShow ?
                        <div className={"taskDetailsBox "+animateClass}>
                            <TaskDetails
                                taskId={taskDetailsId}
                                projectId={taskDetailsProId}
                                closeCallBack={() => { this.setState({ taskDetailsShow: false, taskDetailsId: '' }) }}
                                updatedTaskCallBack={(val) => {if(switchPage==='a'){if(val==='刷新'){this.getProTaskList()}else{this.updateTask(val)} }}}
                            />
                        </div>
                    : ''}
                    <Content onClick={() => { this.setState({ taskDetailsShow: false, taskDetailsId: '' }) }}>
                        <div className="opet_projectDetails">                            
                            {taskCreateShow === '创建任务' && 
                                <TaskCreate task={{'projectId':projectId}} 
                                            successCallBack={()=>{this.getProTaskList(1,projectId)}} 
                                            closedCallBack={()=>{this.setState({taskCreateShow:''})}} />
                            }
                            {taskCreateShow === '创建子任务' && 
                                <TaskCreate task={{'id':taskDetailsId,'projectId':projectId}} 
                                            successCallBack={()=>{this.getProTaskList(1,projectId)}}
                                            closedCallBack={()=>{this.setState({taskCreateShow:''})}} 
                                />
                            }
                            {ProjectCreateShow === '创建项目' ?
                                <ProjectCreate updateOkCallback={(val) => { this.getProjectList() } } closedCallBack={() => { this.setState({ ProjectCreateShow: false }) }} />
                            : ''}
                            {ProjectCreateShow === '编辑项目' ?
                                <ProjectCreate updateOkCallback={(val) => { this.projectEditCallBack(val) } } 
                                               projectId={projectId} 
                                               closedCallBack={() => { this.setState({ ProjectCreateShow: false }) }} 
                                />
                            : ''}
                            {moneyEnd ?
                                <MoneyEnd alertText={getTeamInfoWithMoney("专业版提示")} closeCallBack={() => { this.setState({ moneyEnd: false }) }} />
                                : ''}
                            {importExcelShow ?
                                this.importExcel()
                                : ''}
                            {exportExcelShow ?
                                this.exportExcel()
                                : ''}
                            {projectSearchDivOnTop ? <div className="pro_search_fixed_box" onClick={() => { this.setState({ projectSearchDivOnTop: false }) }}></div> : ''}
                            <div className={projectSearchDivOnTop ? "pro_search pro_search_fixed" : "pro_search"}>
                                <Button icon="plus-circle-o" type="primary" onClick={() => { this.cancelMoreEdit();this.setState({ ProjectCreateShow: '创建项目' }) }}>创建项目</Button>
                                <RadioGroup value={searchProType} buttonStyle="solid" onChange={(e) => { this.cancelMoreEdit();this.setState({ searchProType: e.target.value }); this.getProjectList(e.target.value) }}>
                                    <RadioButton value="1">全部</RadioButton>
                                    <RadioButton value="2">我参与</RadioButton>
                                    <RadioButton value="4">我负责</RadioButton>
                                    <RadioButton value="3">我关注</RadioButton>
                                </RadioGroup>
                                <div className="pro-list" onScroll={(e) => { this.projectListScroll(e) }}>
                                    <Spin spinning={projectListLoading} />
                                    {projectList && projectList.length > 0 ?
                                        projectList.map((item, i) => {
                                            return <li key={item.id} onClick={() => { this.projectOnClick(item.id) }} className={projectId === item.id ? "textMore act" : "textMore"}>
                                                <div className="pic">
                                                    <svg className="pro-icon" aria-hidden="true">
                                                        {item.attstr04 ?
                                                            <use xlinkHref={item.attstr04}></use>
                                                            :
                                                            <use xlinkHref="#pro-myfg-1020"></use>
                                                        }
                                                    </svg>
                                                </div>
                                                {item.proname}</li>
                                        })
                                        : ''}
                                    {!projectListMoreLoading && projectListNowPage < projectListAllPage ?
                                        <div className="moreLoadingRow">
                                            下拉加载更多
                                    </div>
                                        : ''}
                                    {projectListMoreLoading ?
                                        <div className="moreLoadingRow">
                                            <Icon type="loading" className="loadingIcon" />
                                            正在加载更多
                                    </div>
                                        : ''}
                                    {!projectListMoreLoading && projectListNowPage === projectListAllPage ?
                                        <div className="moreLoadingRow">
                                            已经到底喽
                                    </div>
                                        : ''}
                                </div>
                            </div>
                            <div className="pro_cont_top">
                                <h1>
                                    <label className="textMore">{projectName}</label>
                                    <span>共计{projectTaskCount}个任务</span>
                                </h1>       
                                <Icon className="proSet" type={jurisdiction=='true'?"setting":"profile"} 
                                        onClick={() => { this.cancelMoreEdit();this.setState({ ProjectCreateShow: '编辑项目' }) }} 
                                />                                                       
                                <RadioGroup value={switchPage} onChange={(e) => { this.cancelMoreEdit();this.switchPage(e.target.value) }}>
                                    <RadioButton value="a">任务列表</RadioButton>
                                    <RadioButton value="b">
                                        {getTeamInfoWithMoney('版本名称')!=='专业版'?
                                            <svg className="pro-icon zuanshi" aria-hidden="true">
                                                <use xlinkHref={"#pro-myfg-zuanshi"}></use>
                                            </svg>
                                        :""}
                                        任务文件
                                    </RadioButton>
                                    <RadioButton value="c">
                                        {getTeamInfoWithMoney('版本名称')!=='专业版'?
                                            <svg className="pro-icon zuanshi" aria-hidden="true">
                                                <use xlinkHref={"#pro-myfg-zuanshi"}></use>
                                            </svg>
                                        :""}
                                        数据统计
                                    </RadioButton>
                                    <RadioButton value="d">
                                        {getTeamInfoWithMoney('版本名称')!=='专业版'?
                                            <svg className="pro-icon zuanshi" aria-hidden="true">
                                                <use xlinkHref={"#pro-myfg-zuanshi"}></use>
                                            </svg>
                                        :""}
                                        甘特图
                                    </RadioButton>
                                </RadioGroup>                                
                            </div>
                            {switchPage === 'a' ?
                                <div className="pro_buts"> 
                                    {!moreEdit && !taskDetailsId && <Button type="primary" icon="plus-circle-o" onClick={()=>{this.setState({taskCreateShow:'创建任务'})}}>创建任务</Button>}
                                    {!moreEdit && taskDetailsId && 
                                        <Button type="primary" icon="plus-circle-o" 
                                                onClick={(e)=>{e.stopPropagation();e.preventDefault();this.setState({taskCreateShow:'创建子任务'})}}
                                                disabled = {taskDetailsState=='1' || taskDetailsState=='8' || taskDetailsState=='9' || taskDetailsState=='4'}
                                        >
                                            创建子任务
                                        </Button>
                                    }
                                    {!moreEdit && !taskDetailsId && getTeamInfoWithMoney('是否可用') && 
                                        <Button icon={getTeamInfoWithMoney('版本名称')==='专业版'?"login":""} onClick={() => { this.setState({ importExcelShow: true, importStep:0, importName: '导入任务' }) }}>
                                            {getTeamInfoWithMoney('版本名称')!=='专业版'?
                                                <svg className="pro-icon zuanshi" aria-hidden="true">
                                                    <use xlinkHref={"#pro-myfg-zuanshi"}></use>
                                                </svg>
                                            :''}
                                            导入任务
                                        </Button>
                                    }
                                    {!moreEdit && !taskDetailsId && !getTeamInfoWithMoney('是否可用') && 
                                        <Button onClick={() => { this.setState({ moneyEnd: true }); }}>
                                            <svg className="pro-icon zuanshi" aria-hidden="true">
                                                <use xlinkHref={"#pro-myfg-zuanshi"}></use>
                                            </svg>
                                            导入任务
                                        </Button>
                                    }
                                    {!moreEdit && !taskDetailsId && !getTeamInfoWithMoney('是否可用') && 
                                        <Button onClick={() => { this.setState({ moneyEnd: true }); }}>
                                            <svg className="pro-icon zuanshi" aria-hidden="true">
                                                <use xlinkHref={"#pro-myfg-zuanshi"}></use>
                                            </svg>
                                            导出任务
                                        </Button>
                                    } 
                                    {!moreEdit && !taskDetailsId && getTeamInfoWithMoney('是否可用') && 
                                        <Button icon={getTeamInfoWithMoney('版本名称')==='专业版'?"logout":""} onClick={()=>{this.getExportData();}}>
                                            {getTeamInfoWithMoney('版本名称')!=='专业版'?
                                                <svg className="pro-icon zuanshi" aria-hidden="true">
                                                    <use xlinkHref={"#pro-myfg-zuanshi"}></use>
                                                </svg>
                                            :''}
                                            导出任务
                                        </Button>
                                    }
                                    {!moreEdit && taskDetailsId && getTeamInfoWithMoney('是否可用') && 
                                        <Button icon={getTeamInfoWithMoney('版本名称')==='专业版'?"login":""}
                                                onClick={(e) => { e.stopPropagation();e.preventDefault();this.setState({ importExcelShow: true, importStep:0, importName: '导入子任务' }) }}
                                                disabled = {taskDetailsState=='1' || taskDetailsState=='8' || taskDetailsState=='9' || taskDetailsState=='4'}
                                        >
                                            {getTeamInfoWithMoney('版本名称')!=='专业版'?
                                                <svg className="pro-icon zuanshi" aria-hidden="true">
                                                    <use xlinkHref={"#pro-myfg-zuanshi"}></use>
                                                </svg>
                                            :''}
                                            导入子任务
                                        </Button>
                                    }
                                    {!moreEdit && taskDetailsId && !getTeamInfoWithMoney('是否可用') && 
                                        <Button onClick={(e) => { e.stopPropagation();e.preventDefault();this.setState({ moneyEnd: true }); }}
                                                disabled = {taskDetailsState=='1' || taskDetailsState=='8' || taskDetailsState=='9' || taskDetailsState=='4'}
                                        >
                                            <svg className="pro-icon zuanshi" aria-hidden="true">
                                                <use xlinkHref={"#pro-myfg-zuanshi"}></use>
                                            </svg>
                                            导入子任务
                                        </Button>
                                    }
                                    {!moreEdit && taskDetailsId && !getTeamInfoWithMoney('是否可用') && 
                                        <Button onClick={(e) => { e.stopPropagation();e.preventDefault();this.setState({ moneyEnd: true }); }}>
                                            <svg className="pro-icon zuanshi" aria-hidden="true">
                                                <use xlinkHref={"#pro-myfg-zuanshi"}></use>
                                            </svg>
                                            导出子任务
                                        </Button>
                                    }
                                    {!moreEdit && taskDetailsId && getTeamInfoWithMoney('是否可用') && 
                                        <Button icon={getTeamInfoWithMoney('版本名称')==='专业版'?"logout":""} onClick={(e)=>{ e.stopPropagation();e.preventDefault();this.getExportData();this.setState({exportExcelShow:true})}}
                                        >
                                            {getTeamInfoWithMoney('版本名称')!=='专业版'?
                                                <svg className="pro-icon zuanshi" aria-hidden="true">
                                                    <use xlinkHref={"#pro-myfg-zuanshi"}></use>
                                                </svg>
                                            :''}
                                            导出子任务
                                        </Button>
                                    }
                                    {!moreEdit && !taskDetailsId && getTeamInfoWithMoney('是否可用') && 
                                        <Button icon={getTeamInfoWithMoney('版本名称')==='专业版'?"edit":""} onClick={() => { this.setState({ moreEdit: true }) }}>
                                            {getTeamInfoWithMoney('版本名称')!=='专业版'?
                                                <svg className="pro-icon zuanshi" aria-hidden="true">
                                                    <use xlinkHref={"#pro-myfg-zuanshi"}></use>
                                                </svg>
                                            :''}
                                            批量修改
                                        </Button>
                                    }
                                    {!moreEdit && !taskDetailsId && !getTeamInfoWithMoney('是否可用') && 
                                        <Button onClick={() => { this.setState({ moneyEnd: true }); }}>
                                            <svg className="pro-icon zuanshi" aria-hidden="true">
                                                <use xlinkHref={"#pro-myfg-zuanshi"}></use>
                                            </svg>
                                            批量修改
                                        </Button>
                                    }
                                    {moreEdit ? <MoreTaskEdit editType="标签" checkTaskIds={checkedIds} updateCallBack={() => { this.getProTaskList() }} /> : ''}
                                    {moreEdit ? <MoreTaskEdit editType="负责人" checkTaskIds={checkedIds} updateCallBack={() => { this.getProTaskList() }} /> : ''}
                                    {moreEdit ? <MoreTaskEdit editType="确认人" checkTaskIds={checkedIds} updateCallBack={() => { this.getProTaskList() }} /> : ''}
                                    {moreEdit &&
                                        <Select placeholder="更多修改" style={{ width: 110, fontSize:'16px', margin:'0 10px 0 0' }} value={'更多修改'}>
                                            <Option value="more1">
                                                <MoreTaskEdit editType="完成日期" checkTaskIds={checkedIds} updateCallBack={() => { this.getProTaskList() }} />
                                            </Option>
                                            <Option value="more2">
                                                <MoreTaskEdit editType="计划工期" checkTaskIds={checkedIds} updateCallBack={() => { this.getProTaskList() }} />
                                            </Option>
                                            <Option value="more4">
                                                <MoreTaskEdit editType="任务绩效" checkTaskIds={checkedIds} updateCallBack={() => { this.getProTaskList() }} />
                                            </Option>
                                            <Option value="more3">
                                                <MoreTaskEdit editType="优先级" checkTaskIds={checkedIds} updateCallBack={() => { this.getProTaskList() }} />
                                            </Option>                                             
                                        </Select>
                                    }
                                    {moreEdit ? <Button type="primary" onClick={() => { this.cancelMoreEdit() }}>取消</Button> : ''}
                                    <Checkbox style={{margin:'0 0 0 15px'}} checked={hideOkTask} onChange={(e) => { this.setState({ hideOkTask: e.target.checked }); this.getProTaskList(1,'',e.target.checked) }}>隐藏已完成</Checkbox>
                                </div>
                                : ''}
                            {switchPage === 'a' ?
                                <div className="pro_cont" onScroll={(e) => { this.treeBoxScroll(e); }}>
                                    <Spin spinning={treeListLoading} /> 
                                    {treeList.length > 0 ?
                                        <TaskTree treeList={treeList}
                                            checkBoxShow={moreEdit}
                                            checkedTaskIds={checkedIds}
                                            taskOnClickCallBack={(taskId, projectId, parentId, taskname, taskState) => { 
                                                this.cancelMoreEdit();
                                                this.setState({ taskDetailsId: taskId, taskDetailsProId: projectId, taskDetailsParentId: parentId, selectedTaskName: taskname, taskDetailsState: taskState});
                                                if(!taskDetailsShow){
                                                    this.setState({taskDetailsShow:true});
                                                    this.animateAdd()
                                                }
                                            }}
                                            checkingCallBack={(arr) => { this.setState({ checkedIds: arr }) }}
                                            treeListOnChangeCallBack={(val)=>{ this.treeListOnChange(val) }}
                                            notCheckIds={notCheckIds}
                                            hideOkTask={hideOkTask}
                                        />
                                        : ''}
                                    {!treeListMoreLoading && treeListNowPage < treeListAllPage ?
                                        <div className="moreLoadingRow">下拉加载更多</div>
                                        : ''}
                                    {treeListMoreLoading ?
                                        <div className="moreLoadingRow"><Icon type="loading" className="loadingIcon" />正在加载更多</div>
                                        : ''}
                                    {!treeListMoreLoading && treeListNowPage === treeListAllPage ?
                                        <div className="moreLoadingRow">已经到底喽</div>
                                        : ''}
                                </div>
                                : ''}
                            {switchPage === 'c' ?
                                <div className="pro_cont" style={{ top: '65px', background: 'none', padding: '0', overflow: 'hidden' }}>
                                    <ProjectChart projectId={projectId} jurisdiction={jurisdiction} />
                                </div>
                            : ''}
                            {switchPage === 'b' ?
                                <div className="pro_cont" style={{ top: '65px' }}>
                                    <ProjectFiles projectId={projectId} />
                                </div>
                            : ''}
                            {switchPage === 'd' ?
                                <div className="pro_cont" style={{ top: '65px' }} onClick={(e)=>{e.stopPropagation();e.preventDefault()}}>
                                    <ProjectPlusGantt projectId={projectId} 
                                        taskOnClickCallBack={(taskId, projectId) => { 
                                            this.setState({ taskDetailsId: taskId, taskDetailsProId: projectId });
                                            if(!taskDetailsShow){
                                                this.setState({taskDetailsShow:true});
                                                this.animateAdd();
                                            }
                                        }} 
                                    />
                                </div>
                            : ''}
                        </div>
                    </Content>
                </Layout>
            </LocaleProvider>
        )
    }
}

function mapStateToProps(state) {
    return {
        projectSearchVal: state.project.projectSearchVal
    };
}
const mapDispatchToProps = (dispatch) => {
    return {
        setProjectSeachVal: bindActionCreators(projectAction.setProjectSeachVal, dispatch)
    }
}
export default withRedux(initStore, mapStateToProps, mapDispatchToProps)(ProjectDetails)