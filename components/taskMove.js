import React from 'react';
import { Modal,Select,Icon,Spin,Button,message } from 'antd';

import stylesheet from 'styles/components/taskCopy.scss';
import { getProListByType,getProjectTaskListById } from '../core/service/project.service';
import { moveTask } from '../core/service/task.service';
import { listScroll } from '../core/utils/util';
import TaskTree from './taskTree';

const { Option } = Select;

/*
 * （必填）closedCallback()                                        // 关闭回调
 * （必填）task:{id:'',name:'',projectId:'',projectName:''}        // 任务数据     
 * （选填）successCallBack()                                       // 移动成功回调           
 */

export default class TaskMove extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            projectListLoading:false,
            projectListMoreLoading:false,
            projectList:[],
            projectListAllPage:0,
            projectListNowPage:0,

            treeList:[],
            treeList: [],
            treeListNowPage: 1,
            treeListAllPage: 0,
            treeListLoading: false,
            treeListMoreLoading: false,

            taskMoveSet:{
                'id':'',
                'name':'',
                'parentId':'',
                'projectId':'',
                'type':''
            }   
        }
    }

    componentWillMount(){
        this.getProjectList(1);
        if(this.props.task){ 
            let {taskMoveSet} = this.state;
            taskMoveSet.id = this.props.task.id;
            taskMoveSet.name = this.props.task.name;
            taskMoveSet.projectId = this.props.task.projectId;
            taskMoveSet.projectName = this.props.task.projectName;
            this.setState({taskMoveSet:taskMoveSet}); 
            this.getProTaskList(1,this.props.task.projectId);
        }         
    }

    componentWillUnmount() {
        this.setState = (state,callback)=>{
            return;
        };  
    }

    getProjectList(pageNo) {
        if(!pageNo){
            pageNo = 1;
        }
        if(pageNo === 1){
            this.setState({projectListLoading:true});
        }else{
            this.setState({projectListMoreLoading:true});
        }
        getProListByType('1',pageNo,(data)=>{
            if(data.err){
                return false;
            }
            if(data.pageNo === 1){
                this.setState({projectList:data.projects});
            }else{
                const projectList = this.state.projectList;                
                data.projects.map((item)=>{
                    if(projectList.filter(val=>val.id === item.id).length === 0){
                        projectList.push(item);
                    }
                });
                this.setState({projectList:projectList});
            }
          this.setState({projectListAllPage:data.last, projectListNowPage:data.pageNo});
          this.setState({projectListLoading:false,projectListMoreLoading:false});
        });
    }

    getProTaskList(pageNo, projectId) {
        if (!pageNo) {
            pageNo = 1;
        }
        if (!projectId) {
            projectId = this.state.taskMoveSet.projectId;
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
            let { treeList } = this.state;
            if(pageNo === 1){
                treeList = [];
            }
            if (data.taskPage.list) {
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
                        'fzr': item.taskinfo.userResponse ? item.taskinfo.userResponse.name : '未指定',
                        'endDate': item.taskinfo.planEndTime,
                        'childCount': item.taskinfo.child,
                        'childIngCount': item.taskinfo.childCount,
                        'childSuccess': item.taskinfo.childSuccess,
                        'talkCount': item.taskinfo.leaveCount,
                        'loading': false
                    });
                });
            }
            this.setState({ treeList: treeList, treeListNowPage: data.taskPage.pageNo, treeListAllPage: data.taskPage.last });
            this.setState({ treeListMoreLoading: false, treeListLoading: false });
        });
    }

    onOk(){
        let { taskMoveSet,treeList } = this.state;
        if(!taskMoveSet.parentId){
            taskMoveSet.parentId = taskMoveSet.projectId;
            taskMoveSet.type = '1';
        }
        moveTask(taskMoveSet.id,taskMoveSet.parentId,taskMoveSet.type,(res)=>{ 
            if(res.err){
                return false;
            }
            message.success('移动成功！');
            this.props.closedCallback();
            if(this.props.successCallBack){
                this.props.successCallBack({'moveTaskId':taskMoveSet.id,'moveToParentId':taskMoveSet.parentId}); 
            }
        })
    }

    scrollOnBottom(type,e) {
        const isOnButtom = listScroll(e);
        if(type === 'project'){
            const { projectListAllPage, projectListNowPage } = this.state;
            if(isOnButtom && projectListNowPage<projectListAllPage) {
                this.getProjectList(projectListNowPage+1);
            }
        }else if(type === 'taskTree'){
            const { treeListAllPage, treeListNowPage } = this.state;
            if(isOnButtom && treeListNowPage<treeListAllPage) {
                this.getProTaskList(treeListNowPage+1);
            }
        }
    }

    render(){
        const { projectList,taskMoveSet,projectListNowPage,projectListAllPage,projectListMoreLoading,projectListLoading,treeList,treeListMoreLoading,treeListLoading,treeListAllPage,treeListNowPage, } = this.state;
        
        let selectedPro = taskMoveSet.projectId;
        if( projectList.filter(val=>val.id === taskMoveSet.projectId).length === 0 ){
            selectedPro = taskMoveSet.projectName;
        }
        const select_pro_data = []; 
        projectList.map((item,i)=>{
            select_pro_data.push(<Option key={item.id} value={item.id}>{item.proname}</Option>);  
        });
        return (
            <Modal
                title="移动任务"
                visible={true}
                width={1000}
                style={{minWidth:'800px'}}
                onCancel={()=>{this.props.closedCallback()}}
                footer={[
                    <Button key="cancel" onClick={()=>{this.props.closedCallback()}}>取消</Button>,
                    <Button key="next" type="primary" onClick={()=>{this.onOk()}}>确定</Button>
                ]}
            >
                <style dangerouslySetInnerHTML={{ __html: stylesheet }} />    
                <div className="step1" style={{margin:'0'}}>
                    { projectListLoading ?
                        <span style={{margin:'5px 0 10px 0',flex:'0 0 auto',display:'block',textAlign:'left'}}><Icon type="loading" /><span style={{margin:'0 0 0 10px',fontSize:'12px'}}>项目加载中</span></span>
                    :
                        <Select
                            showSearch
                            placeholder={selectedPro}
                            optionFilterProp="children"
                            onChange={(val)=>{ let {taskMoveSet} = this.state; taskMoveSet.projectId = val; this.setState({taskMoveSet:taskMoveSet}); this.getProTaskList(1,val) }}
                            notFoundContent="没有找到匹配的项目"
                            value={selectedPro!==taskMoveSet.projectId?undefined:taskMoveSet.projectId}
                            filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                            onPopupScroll={(e)=>{this.scrollOnBottom('project',e)}}
                        >
                            {select_pro_data}
                            {!projectListMoreLoading && projectListNowPage === projectListAllPage?
                                <Option value="disabled" disabled>已经是最后一页喽</Option>
                            :''}
                            {!projectListMoreLoading && projectListNowPage < projectListAllPage?
                                <Option value="disabled" disabled>下拉加载更多</Option>
                            :''}
                        </Select>
                    }
                    <div className="taskTree" onScroll={(e)=>{this.scrollOnBottom('taskTree',e)}}>
                        <Spin spinning={treeListLoading} />
                        {treeList.length > 0 ?
                            <TaskTree 
                                treeList={treeList?treeList:[]}
                                taskLiConcise={true}
                                taskOnClickCallBack={(taskId, projectId) => { let {taskMoveSet} = this.state; taskMoveSet.parentId = taskId; this.setState({taskMoveSet:taskMoveSet}) }}
                                treeListOnChangeCallBack={(val)=>{this.setState({treeList:val})}}
                            />
                        : ''}
                        {!treeListMoreLoading && treeListNowPage < treeListAllPage ?
                            <div className="moreLoadingRow">下拉加载更多</div>
                        : ''}
                        {treeListMoreLoading ?
                            <div className="moreLoadingRow"><Icon type="loading" className="loadingIcon" />正在加载更多</div>
                        : ''}
                        {!treeListMoreLoading && treeListNowPage === treeListAllPage ?
                            <div className="moreLoadingRow">已经是最后一页喽</div>
                        : ''}
                    </div>
                </div>              
            </Modal>
        )
    }
}