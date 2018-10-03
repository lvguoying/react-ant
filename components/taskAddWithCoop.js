import React from 'react';
import { Modal,Icon,Spin,Button,message } from 'antd';

import stylesheet from 'styles/components/taskCopy.scss';
import { getProjectTaskListById } from '../core/service/project.service';
import { addPrevCoopTaskByTaskId,addNextCoopTaskByTaskId } from '../core/service/task.service';
import { listScroll } from '../core/utils/util';
import TaskTree from './taskTree';

/*
 * （必填）closedCallback()                                                   // 关闭回调
 * （必填）task:{id:'',projectId:''}                                          // 任务数据 
 * （必填）successCallback()                                                  // 添加成功刷新页面
 */

export default class TaskAddWithCoop extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            treeList:[],
            treeList: [],
            treeListNowPage: 1,
            treeListAllPage: 0,
            treeListLoading: false,
            treeListMoreLoading: false,

            coopTaskIds:[],
            taskId:''
        }
    }

    componentWillMount(){
        if(this.props.task){ 
            this.setState({taskId:this.props.task.id}); 
            this.getProTaskList(1,this.props.task.projectId);
        }         
    }

    componentWillUnmount() {
        this.setState = (state,callback)=>{
            return;
        };  
    }

    getProTaskList(pageNo, projectId) {
        if (!pageNo) {
            pageNo = 1;
        }
        if (!projectId) {
            projectId = this.props.task.projectId;
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
            let treeList = [];
            if(pageNo>1){
                treeList = this.state.treeList;
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
                        'childCount': item.taskinfo.childCount,
                        'childSuccess': item.taskinfo.childSuccess,
                        'talkCount': item.taskinfo.leaveCount,
                        'loading': false
                    });
                });
            }            
            
            this.setState({ treeList:treeList,treeListNowPage: data.taskPage.pageNo, treeListAllPage: data.taskPage.last });
            this.setState({ treeListMoreLoading: false, treeListLoading: false });
        });
    }

    onOk(){
        const { title } = this.props;
        const { taskId,coopTaskIds } = this.state;
        
        if(!coopTaskIds || coopTaskIds.length <= 0){
            message.warning('请选择'+title+'！');
            return;
        }
        if(title === '前序任务'){
            addPrevCoopTaskByTaskId(taskId,coopTaskIds,(data)=>{
                if(data.err){
                    return false;
                }
                message.success('添加前序任务成功！');
                this.props.successCallback();
                this.props.closedCallback();
            });
        }else if(title === '后序任务'){
            addNextCoopTaskByTaskId(taskId,coopTaskIds,(data)=>{
                if(data.err){
                    return false;
                }
                message.success('添加后序任务成功！');
                this.props.successCallback();
                this.props.closedCallback();
            });
        }
    }

    scrollOnBottom(e) {
        const isOnButtom = listScroll(e);
        const { treeListAllPage, treeListNowPage } = this.state;
        if(isOnButtom && treeListNowPage<treeListAllPage) {
            this.getProTaskList(treeListNowPage+1);
        }
    }

    render(){
        const { treeList,treeListMoreLoading,treeListLoading,treeListAllPage,treeListNowPage,coopTaskIds } = this.state;
        const { title } = this.props;
        return (
            <Modal
                title={"添加"+title}
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
                <div className="step1" style={{margin:'0',padding:'0',background:'none'}}>
                    <div className="taskTree" onScroll={(e)=>{this.scrollOnBottom(e)}}>
                        <Spin spinning={treeListLoading} />
                        {treeList.length > 0 ?
                            <TaskTree 
                                treeList={treeList?treeList:[]}
                                checkedTaskIds={coopTaskIds?coopTaskIds:[]}
                                taskLiConcise={true}
                                checkBoxShow={true}
                                notCheckIds={this.props.notCheckIds?this.props.notCheckIds:[]}
                                treeListOnChangeCallBack={(val)=>{this.setState({treeList:val})}}
                                checkingCallBack={(val)=>{this.setState({coopTaskIds:val})}}
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