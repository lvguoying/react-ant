import React from 'react';
import { Icon,Checkbox,Spin,message } from 'antd';

import stylesheet from 'styles/components/taskTree.scss';
import { getProjectTaskListById } from '../core/service/project.service'; 
import { addAttentionWitchTask,cancelAttentionWitchTask,setMilestoneWithTask } from '../core/service/task.service';
import { stateColor,getTagColorByColorCode,stateColorWithTime } from '../core/utils/util';

/*
 *  (必填)treeList:[{}]                // 树列表数据 入参对象格式如下
    *  'projectId': '',
        'parentId': '',
        'taskId': '',
        'name': '',
        'state': '',
        'number': '',
        'tags': [],
        'attention': false,
        'milestone': false,
        'fzr': '',
        'qrr':'',
        'endDate': '',
        'childCount': 0,
        'childSuccess': 1,
        'talkCount': 3,
        'labels':[],
    （选填) taskOnClickCallBack(id)             // 点击单个任务的回掉
    （选填）checkBoxShow: false                 // 是否显示复选按钮
    （选填）checkingCallBack（['id1','id2']）   // 返回选中的任务ID列表
    （选填）checkedTaskIds: ['id1','id2']      // 选中的任务ID列表
    （选填）updateTask: {}                  // 要局部更新的值
    （选填）taskLiConcise: false                // 是否返回简洁的列表，简洁的只包含状态 名称等，单行显示
    （选填）notCheckIds:[]                     //不可选的
    （必填）treeListOnChangeCallBack(treeList) // 数据修改后的回调
    （选填）hideOkTask：false                    // 隐藏已完成
 */

export default class TaskTree extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            treeList: [],
            act: '',
            checkedTaskIds: [],
            taskLiConcise: false,
            notCheckIds:[]
        }
    }

    componentWillMount() {
        /*if(this.props.treeList){
            let treeList = JSON.parse(JSON.stringify(this.props.treeList));
            this.setState({treeList:treeList});
        }
        if(this.props.checkedTaskIds){
            this.setState({checkedTaskIds:this.props.checkedTaskIds});
        }
        if(this.props.notCheckIds){
            this.setState({notCheckIds:this.props.notCheckIds});
        }
        if(this.props.taskLiConcise === true || this.props.taskLiConcise === false){
            this.setState({taskLiConcise:this.props.taskLiConcise});
        }*/
    }

    componentWillReceiveProps(nextProps) {
        /*if( nextProps.treeList ){
            const tree = nextProps.treeList;
            this.setState({treeList:JSON.parse(JSON.stringify(tree))});
        }
        if(nextProps.checkedTaskIds){
            this.setState({checkedTaskIds:nextProps.checkedTaskIds});
        }
        if(nextProps.updateTask){
            const updateTask = nextProps.updateTask; 
            if(updateTask.name){ 
                const task = {'id':updateTask.id,'name':updateTask.name}; 
                this.setDataByArgs(this.state.treeList,task,['name']);
            }
            if(updateTask.state){ 
                const task = {'id':updateTask.id,'state':updateTask.state}; 
                this.setDataByArgs(this.state.treeList,task,['state']);
            }
            if(updateTask.attention===true || updateTask.attention===false){
                const task = {'id':updateTask.id,'attention':updateTask.attention}; 
                this.setDataByArgs(this.state.treeList,task,['attention']);
            } 
            if(updateTask.milestone===true || updateTask.milestone===false){
                const task = {'id':updateTask.id,'milestone':updateTask.milestone}; 
                this.setDataByArgs(this.state.treeList,task,['milestone']);
            }
            if(updateTask.fzr){
                const task = {'id':updateTask.id,'fzr':updateTask.fzr}; 
                this.setDataByArgs(this.state.treeList,task,['fzr']);
            }else if(updateTask.fzr === ''){
                const task = {'id':updateTask.id,'fzr':''}; 
                this.setDataByArgs(this.state.treeList,task,['fzr']);
            }
            if(updateTask.childSuccess>0 || updateTask.childSuccess==0 || updateTask.childCount>0 || updateTask.childCount==0){
                const task = {'id':updateTask.id,'childSuccess':updateTask.childSuccess,'childCount':updateTask.childCount}; 
                this.setDataByArgs(this.state.treeList,task,['childSuccess','childCount']);
            }
            if(updateTask.talkCount>0 || updateTask.talkCount===0){
                const task = {'id':updateTask.id,'talkCount':updateTask.talkCount}; 
                this.setDataByArgs(this.state.treeList,task,['talkCount']);
            }
        }*/
        /*
        if(nextProps.taskLiConcise === true || nextProps.taskLiConcise === false){
            this.setState({taskLiConcise:nextProps.taskLiConcise});
        }*/
    }

    componentWillUnmount() {
        this.setState = (state,callback)=>{
            return;
        };  
    }

    attention(task){
        if(task.attention){
            cancelAttentionWitchTask(task.taskId,(data)=>{
                if(data.err){
                    return false;
                }
                message.success('取消关注成功！')
                task.attention = false;
                this.setDataByArgs(this.props.treeList,task,['attention']);
            });
        }else{
            addAttentionWitchTask(task.taskId,(data)=>{
                if(data.err){
                    return false;
                }
                message.success('关注成功！')
                task.attention = true;
                this.setDataByArgs(this.props.treeList,task,['attention']);
            });
        }
    }

    milestone(task){
        if(task.milestone){
            setMilestoneWithTask(task.taskId,(data)=>{
                if(data.err){
                    return false;
                }
                message.success('取消里程碑成功！')
                task.milestone = false;
                this.setDataByArgs(this.props.treeList,task,['milestone']);
            });
        }else{
            setMilestoneWithTask(task.taskId,(data)=>{
                if(data.err){
                    return false;
                }
                message.success('设置里程碑成功！')
                task.milestone = true;
                this.setDataByArgs(this.props.treeList,task,['milestone']);
            });
        }
    }

    checkingTask(val,id){  
        const { checkedTaskIds } = this.props;
        if(val){
            checkedTaskIds.push(id);
        }else{
            const index = checkedTaskIds.indexOf(id);
            checkedTaskIds.splice(index,1);
        }
        //this.setState({checkedTaskIds:checkedTaskIds});
        if(this.props.checkingCallBack){
            this.props.checkingCallBack(checkedTaskIds);
        }
    }

    returnTask(task){
        const { act } = this.state;
        let { checkBoxShow,checkedTaskIds,taskLiConcise,notCheckIds } = this.props; 
        if(!notCheckIds){
            notCheckIds=[];
        }
        return (
            <div className={task.taskId === act ?"taskList_row act":"taskList_row"}
                 style={taskLiConcise?{height:'50px'}:{}}
                 onClick={(e)=>{if(e.target.tagName!=='INPUT'){e.stopPropagation();e.preventDefault();}}}
            >{/*此冒泡阻止用于 点击空白处 关闭详情页的功能*/}
                {stateColor(task.state,'state')}
                {checkBoxShow?
                    <div className="checkBox" style={taskLiConcise?{margin:'0px 0 0 20px'}:{}}>
                        <Checkbox checked={checkedTaskIds.indexOf(task.taskId)!==-1?true:false} 
                                  disabled={notCheckIds.indexOf(task.taskId)!==-1?true:false} 
                                  onChange={(e)=>{this.checkingTask(e.target.checked,task.taskId)}} 
                        />
                    </div>
                :''}
                <div className="taskList_left" style={{left:'25px'}} 
                     onClick={()=>{
                        if(this.props.taskOnClickCallBack){
                            this.setState({act:task.taskId});
                            this.props.taskOnClickCallBack(task.taskId,task.projectId,task.parentId,task.name,task.state)
                        }
                    }}
                >
                    <div className="tit_row">
                        <span>{task.number}</span>
                        <div className="taskName textMore">{task.name}</div>
                        {!taskLiConcise?
                            <div className="tasklabs">
                                {task.labels && task.labels.map((lab)=>{
                                    return <span key={lab.id} className={getTagColorByColorCode('1',lab.color)}>{lab.labelname}</span>
                                })}
                            </div>
                        :
                            <div className="userBox">
                                <i className="icon iconfont icon-ren2"></i>
                                <span>{task.fzr}</span>
                            </div>
                        }
                    </div>
                    {!taskLiConcise?
                        <div className="core_row">
                            <i className="icon iconfont icon-shijian"></i>
                            <span style={{color:stateColorWithTime(task.state,task.endDate)}}> 
                                {task.state === '1' || task.state === '8' || task.state === '9'?
                                    (task.endDate_real?task.endDate_real:'未设置')
                                :
                                    (task.endDate?task.endDate:'未设置')
                                }
                            </span>
                            <i className="icon iconfont icon-ren2"></i>
                            <span>{task.fzr?task.fzr:'未指派'}</span>
                            {task.state=='2' &&
                                <i className="icon iconfont icon-shenheren1"></i>
                            }
                            {task.state=='2' &&
                                <span>{task.qrr?task.qrr:'未指派'}</span>
                            }
                            <i className="icon iconfont icon-lvzhou_fenzhichangsuo" style={{fontSize:'12px'}}></i>
                            <span>{task.childSuccess}/{task.childIngCount}</span>
                            <i className="icon iconfont icon-discuss"></i>
                            <span>{task.talkCount?task.talkCount:0}</span>
                        </div>
                    :''}
                </div>
                {!taskLiConcise?
                    <div className="taskList_right">   
                        {task.milestone?
                            <Icon className="attention" type="flag" style={{color:'#3297fa'}} onClick={()=>{this.milestone(task)}} />
                        :
                            <Icon className="attention" type="flag" style={{color:'#a0a0a0'}} onClick={()=>{this.milestone(task)}} />
                        }                 
                        <Icon className="attention" type={task.attention?'star':'star-o'} onClick={()=>{this.attention(task)}} />
                    </div>
                :''}
            </div>
        )
    }

    returnTree(list){ 
        const { taskLiConcise } = this.props;
        const el = list.map((item,i)=>{
            return (
                <div className="tree_row" key={'treeTask'+item.taskId}>
                    <div className="tree_icon">
                        {item.childCount>0?
                            <Icon style={taskLiConcise?{margin:'15px 0 0 0'}:{}} type={item.openChild?"minus-circle-o":"plus-circle-o"} onClick={()=>{item.loading=true;this.openChild(item)}}  /> 
                        :
                            <i style={taskLiConcise?{margin:'15px 0 0 0'}:{}} className="icon iconfont icon-yuandianxiao"></i>
                        }
                    </div>
                    <div className="tree_task">
                        <Spin spinning={item.loading} />
                        {this.returnTask(item)}
                        {item.openChild && item.childList && item.childList.length>0?this.returnTree(item.childList):''}
                    </div>
                </div>
            )
        })
        return el;
    }

    openChild(task){
        let { hideOkTask } = this.props;
        if(!hideOkTask){
            hideOkTask = false;
        }
        if(task.openChild){
            task.openChild = false;
            this.setDataByArgs(this.props.treeList,task,['openChild']);
            this.setChildList(this.props.treeList,task.taskId,[]);            
        }else{
            task.loading = true;
            task.openChild = true;
            this.setDataByArgs(this.props.treeList,task,['loading','openChild']);

            getProjectTaskListById(task.projectId,task.taskId,'',1,(data)=>{      
                if(data.err){
                    return false;
                }          
                if(data.taskPage.list){
                    const childList = [];
                    data.taskPage.list.map((item,i)=>{
                        childList.push({
                            'projectId': item.project.id,
                            'parentId': item.taskinfo.parent.id,
                            'taskId': item.taskinfo.id,
                            'name': item.taskinfo.taskname,
                            'state': item.taskinfo.stateName,
                            'number': (item.taskinfo.taskinfoNumber?item.taskinfo.taskinfoNumber.numberS+'.':'') + item.taskinfo.rank,
                            'tags': [],
                            'attention': item.taskinfo.collect?true:false,
                            'milestone': item.taskinfo.milestone?true:false,
                            'fzr': item.taskinfo.userResponse?item.taskinfo.userResponse.name:'未指派',
                            'qrr': item.taskinfo.userFlow?item.taskinfo.userFlow.name:'未指派',
                            'endDate': item.taskinfo.planEndTime?item.taskinfo.planEndTime:'未设置',
                            'endDate_real': item.taskinfo.realityEndTime?item.taskinfo.realityEndTime:'未设置',
                            'child': item.taskinfo.child,
                            'childCount': item.taskinfo.childCount,
                            'childIngCount': item.taskinfo.childCount,
                            'childSuccess': item.taskinfo.childSuccess,
                            'talkCount': item.taskinfo.leaveCount,
                            'openChild': false,
                            'loading': false,
                            'labels':item.labels
                        });
                    });
                    this.setChildList(this.props.treeList,task.taskId,childList);
                }
            },hideOkTask);
        }
    }

    setChildList(treeList,id,childList){
        const loop = (list) => {
            list.forEach((item,i)=>{
                if(item.childList && item.childList.length>0){
                    loop(item.childList);
                } 
                if(item.taskId == id){
                    item.childList = childList;
                    item.loading = false;
                }
            });            
        }
        loop(treeList);
        //this.setState({treeList:treeList}); 
        this.props.treeListOnChangeCallBack(treeList);
    }

    setDataByArgs(treeList,task,args){ 
        const loop = (list) => {
            list.forEach((item,i)=>{
                if(item.childList && item.childList.length>0){
                    loop(item.childList);
                } 
                if(item.taskId == task.id){
                    args.map((argName)=>{
                        item[argName] = task[argName];
                    })
                    //item.loading = task.loading;
                    //item.openChild = task.openChild;
                }
            });            
        }
        loop(treeList);
        //this.setState({treeList:treeList}); 
        this.props.treeListOnChangeCallBack(treeList);
    }

    render() {
        const { treeList } = this.props; 
        return (
            <div className="cpet_task_tree">
                <style dangerouslySetInnerHTML={{ __html: stylesheet }} />
                {this.returnTree(treeList)}
            </div>
        )
    }
}