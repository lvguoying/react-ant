import React from 'react';
import { Modal,Steps,Select,Icon,Spin,Button,Checkbox,Input,message } from 'antd';

import stylesheet from 'styles/components/taskCopy.scss';
import { getProListByType,getProjectTaskListById } from '../core/service/project.service';
import { copyTask } from '../core/service/task.service';
import { listScroll } from '../core/utils/util';
import TaskTree from './taskTree';

const Step = Steps.Step;
const { Option } = Select;

/*
 * （必填）closedCallback()                                                   // 关闭回调
 * （必填）task:{id:'',name:'',parentId:'',projectId:'',projectName:''}       // 任务数据
 * （选填）successCallBack()                                                  // 复制成功后的回调                
 */

export default class TaskCopy extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            step:0,

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

            taskCopySet:{
                'id':'',
                'name':'',
                'child':'1',
                'endTime':'1',
                'fzr':'1',
                'qrr':'1',
                'loop':'1',
                'lev':'1',
                'money':'1',
                'worktime':'1',
                'parentId':'',
                'projectId':'',
                'projectName':''
            },
            taskCopyLoading:false,
        }
    }

    componentWillMount(){
        this.getProjectList(1); 
        if(this.props.task){ 
            let {taskCopySet} = this.state;
            taskCopySet.id = this.props.task.id;
            taskCopySet.name = this.props.task.name;
            taskCopySet.parentId = this.props.task.parentId;
            taskCopySet.projectId = this.props.task.projectId;
            taskCopySet.projectName = this.props.task.projectName;
            this.setState({taskCopySet:taskCopySet}); 
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
            projectId = this.state.taskCopySet.projectId;
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
        let { step } = this.state;
        if(step === 0){
            this.setState({step:1});
        }else if(step === 1){
            const {taskCopySet} = this.state; 
            this.setState({taskCopyLoading:true});
            copyTask(taskCopySet,(data)=>{
                if(data.err){
                    return false;
                }
                message.success('复制成功！');
                this.props.closedCallback();
                this.setState({taskCopyLoading:false});
                if(this.props.successCallBack){
                    this.props.successCallBack({'taskCopyId':taskCopySet.id,'copyToParentId':taskCopySet.parentId});
                }
            });
        }
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

    valChange(type,val){
        if(type !== 'name' && type !== 'parentId' && type !== 'projectId'){
            if(val){
                val = '1';
            }else{
                val = '';
            }
        }
        let  { taskCopySet } = this.state;
        taskCopySet[type] = val;
        this.setState({taskCopySet:taskCopySet});        
    }

    render(){
        const { step,projectList,taskCopySet,projectListNowPage,taskCopyLoading,projectListAllPage,projectListMoreLoading,projectListLoading,treeList,treeListMoreLoading,treeListLoading,treeListAllPage,treeListNowPage, } = this.state;
        
        let selectedPro = taskCopySet.projectId;
        if( projectList.filter(val=>val.id === taskCopySet.projectId).length === 0 ){
            selectedPro = taskCopySet.projectName;
        }
        const select_pro_data = []; 
        projectList.map((item,i)=>{
            select_pro_data.push(<Option key={item.id} value={item.id}>{item.proname}</Option>);  
        });
        return (
            <Modal
                title="复制任务"
                visible={true}
                width={1000}
                style={{minWidth:'800px'}}
                onCancel={()=>{this.props.closedCallback()}}
                footer={[
                    <Button key="cancel" onClick={()=>{this.props.closedCallback()}}>取消</Button>,
                    (step===1?<Button key="prev" onClick={()=>{this.setState({step:0})}}>上一步</Button>:''),
                    <Button key="next" type="primary" disabled={taskCopyLoading} onClick={()=>{this.onOk()}}>{step===0?'下一步':'确定'}</Button>
                ]}
            >
                <style dangerouslySetInnerHTML={{ __html: stylesheet }} />    
                <Steps current={step}>
                    <Step title="选择复制位置" />
                    <Step title="复制内容设置" />
                </Steps>
                {step===0?
                    <div className="step1">
                        { projectListLoading ?
                            <span style={{margin:'5px 0 10px 0',flex:'0 0 auto',display:'block',textAlign:'left'}}><Icon type="loading" /><span style={{margin:'0 0 0 10px',fontSize:'12px'}}>项目加载中</span></span>
                        :
                            <Select
                                showSearch
                                placeholder={selectedPro}
                                optionFilterProp="children"
                                onChange={(val)=>{this.valChange('projectId',val); this.getProTaskList(1,val)}}
                                notFoundContent="没有找到匹配的项目"
                                value={selectedPro!==taskCopySet.projectId?undefined:taskCopySet.projectId}
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
                                    treeList={treeList}
                                    taskLiConcise={true}
                                    taskOnClickCallBack={(taskId, projectId) => { this.valChange('parentId',taskId) }}
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
                :
                    <div className="step2">
                        <Input value={taskCopySet.name} onChange={(e)=>{this.valChange('name',e.target.value)}}  />     
                        <Checkbox checked={taskCopySet.fzr?true:false} onChange={(e)=>{this.valChange('fzr',e.target.checked)}}>负责人</Checkbox>
                        <Checkbox checked={taskCopySet.qrr?true:false} onChange={(e)=>{this.valChange('qrr',e.target.checked)}}>确认人</Checkbox>
                        <Checkbox checked={taskCopySet.endTime?true:false} onChange={(e)=>{this.valChange('endTime',e.target.checked)}}>完成日期</Checkbox>
                        <Checkbox checked={taskCopySet.money?true:false} onChange={(e)=>{this.valChange('money',e.target.checked)}}>任务绩效</Checkbox>
                        <Checkbox checked={taskCopySet.worktime?true:false} onChange={(e)=>{this.valChange('worktime',e.target.checked)}}>计划工期</Checkbox>
                        <Checkbox checked={taskCopySet.lev?true:false} onChange={(e)=>{this.valChange('lev',e.target.checked)}}>重要程度</Checkbox>
                        <Checkbox checked={taskCopySet.child?true:false} onChange={(e)=>{this.valChange('child',e.target.checked)}}>子任务</Checkbox>
                        <Checkbox checked={taskCopySet.loop?true:false} onChange={(e)=>{this.valChange('loop',e.target.checked)}}>协作关系</Checkbox>
                    </div>
                }                
            </Modal>
        )
    }
}