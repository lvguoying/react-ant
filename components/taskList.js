import React from 'react';
import { Icon,Checkbox,message } from 'antd';

import stylesheet from '../styles/components/taskList.scss';
import { addAttentionWitchTask,cancelAttentionWitchTask,setMilestoneWithTask } from '../core/service/task.service';
import { stateColor,getTagColorByColorCode,stateColorWithTime } from '../core/utils/util';

/*
 * （必填）taskList:[]                // 任务列表数据
 * （必填）taskClickCallBack()        // 点击单个任务的回调函数 传参是任务ID
 * （选填）hideOpt:[]                 // 要隐藏的选项，比如 'user'代表不显示负责人,'project'代表不显示项目名称
 * （必填）taskAttentionCallBack()    // 关注/取消关注 之后的回调
 * （必填）taskCheckedShow:false      // 是否显示复选框
 * （必填）checkingTaskCallBack()     // 返回所有复选的任务ID ['id编号']
 * （必填）checkTaskIds:[]            // 选中的所有任务ID
 * （选填）hideOkTask：false          // 隐藏已完成的，默认不隐藏
 * （选填）hideTaskBox:false          // 隐藏任务包，默认不隐藏
 * （选填）hideTaskIds:[]             // 要隐藏的任务ID
 */

export default class TaskList extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            taskList: [],
            hideOpt: [],
            actTaskId: '',
            taskCheckedShow: false,
            checkTaskIds: []
        }
    }

    componentWillMount() {
        if (this.props.taskList) { 
            this.setState({taskList:this.props.taskList});
        }
        if (this.props.hideOpt) {
            this.setState({hideOpt:this.props.hideOpt});
        }
        if (this.props.taskCheckedShow===true || this.props.taskCheckedShow===false){
            this.setState({taskCheckedShow:this.props.taskCheckedShow});
        }
        if(this.props.checkTaskIds){
            this.setState({checkTaskIds:this.props.checkTaskIds});
        }
    }

    componentWillReceiveProps(nextProps) {
        if(nextProps.taskList) {
            this.setState({taskList:nextProps.taskList});
        }
        if(nextProps.hideOpt){
            this.setState({hideOpt:nextProps.hideOpt});
        }
        if(nextProps.taskCheckedShow===true || nextProps.taskCheckedShow===false){
            this.setState({taskCheckedShow:nextProps.taskCheckedShow});
        }
        if(nextProps.checkTaskIds){
            this.setState({checkTaskIds:nextProps.checkTaskIds});
        }
    }

    componentWillUnmount() {
        this.setState = (state,callback)=>{
            return;
        };  
    }

    attention(e,type,taskId){
        e.stopPropagation();  
	    e.preventDefault();
        if(type === '关注'){
            addAttentionWitchTask(taskId,(data)=>{
                if(data.err){
                    return false;
                }
                if(data){
                    message.success('关注成功！');
                    this.props.taskAttentionCallBack({'id':taskId,'attention':true});
                }else{
                    message.error('关注失败！');
                }
            });
        }else{
            cancelAttentionWitchTask(taskId,(data)=>{
                if(data.err){
                    return false;
                }
                if(data){
                    message.success('取消成功！');
                    this.props.taskAttentionCallBack({'id':taskId,'attention':false});
                }else{
                    message.error('取消失败！');
                }
            });
        }        
    }

    milestone(e,type,taskId){
        e.stopPropagation();  
	    e.preventDefault();
        if(type === '设置'){
            setMilestoneWithTask(taskId,(data)=>{
                if(data.err){
                    return false;
                }
                if(data){
                    message.success('设置里程碑成功！');
                    this.props.taskAttentionCallBack({'id':taskId,'milestone':'1'});
                }
            });
        }else{
            setMilestoneWithTask(taskId,(data)=>{
                if(data.err){
                    return false;
                }
                if(data){
                    message.success('取消里程碑成功！');
                    this.props.taskAttentionCallBack({'id':taskId,'milestone':'0'});
                }
            });
        } 
    }

    checking(e,id){
        let { checkTaskIds } = this.state;
        if(e.target.checked){            
            checkTaskIds.push(id);
        }else{
            checkTaskIds.splice(checkTaskIds.indexOf(id),1);
        }
        this.setState({checkTaskIds:checkTaskIds});
        this.props.checkingTaskCallBack(checkTaskIds);
    }

    render() {
        const {taskList,hideOpt,actTaskId,taskCheckedShow,checkTaskIds} = this.state; 
        const {hideTaskBox,hideOkTask,hideTaskIds} = this.props; 
        return (
            <div className="cpet_taskList">
                <style dangerouslySetInnerHTML={{ __html: stylesheet }} />
                {taskList.map((item,i)=>{
                    if(hideTaskIds.indexOf(item.taskinfo.id)==-1){
                        let isShow = true;
                        if(item.taskinfo.state !== '1' && item.taskinfo.state !== '4'){
                            isShow = true;
                        }else if((item.taskinfo.state === '1' || item.taskinfo.state === '4') && hideOkTask){
                            isShow = false;
                        }else{
                            isShow = true;
                        }
                        if(item.taskinfo.childCount>0 && item.taskinfo.childCount!==item.taskinfo.childSuccess && hideTaskBox){
                            isShow = false;
                        }
                        if(isShow){
                        return <div className={item.taskinfo.id===actTaskId?"taskList_row act":"taskList_row"} key={'cs'+i}>
                                    {stateColor(item.taskinfo.stateName,'state')}
                                    {taskCheckedShow ?
                                        <div className="checkBox">
                                            <Checkbox onChange={(e)=>{this.checking(e,item.taskinfo.id)}}
                                                    checked={checkTaskIds.indexOf(item.taskinfo.id)!==-1?true:false}
                                                    disabled={item.taskinfo.state==='1' || item.taskinfo.state==='4' || item.taskinfo.state==='2'?true:false}
                                            />
                                        </div>
                                    :''}
                                    <div className="taskList_left" style={{left:taskCheckedShow?'25px':''}}
                                        onClick={()=>{this.setState({actTaskId:item.taskinfo.id});this.props.taskClickCallBack(item.taskinfo.id,item.project.id)}}
                                    >
                                        <div className="tit_row">
                                            <span>
                                                {item.taskinfo.taskinfoNumber?item.taskinfo.taskinfoNumber.numberS+'.':''}
                                                {item.taskinfo.rank}
                                            </span>
                                            <div className="taskName textMore">{item.taskinfo.taskname}</div>
                                            <div className="tasklabs">
                                                {item.labels && item.labels.map((lab)=>{
                                                    return <span key={lab.id} className={getTagColorByColorCode('1',lab.color)}>{lab.labelname}</span>
                                                })}
                                            </div>
                                        </div>
                                        <div className="core_row">                                        
                                            <i className="icon iconfont icon-shijian"></i>
                                            <span className="textMore" style={{color:stateColorWithTime(item.taskinfo.stateName,item.taskinfo.planEndTime)}}>
                                                {item.taskinfo.stateName === '1' || item.taskinfo.stateName === '8' || item.taskinfo.stateName === '9' ?
                                                    (item.taskinfo.realityEndTime?item.taskinfo.realityEndTime:'未设置')
                                                :
                                                    (item.taskinfo.planEndTime?item.taskinfo.planEndTime:'未设置')
                                                }
                                            </span>
                                            {hideOpt.indexOf('user')===-1?
                                                <i className="icon iconfont icon-ren2"></i>
                                            :''}                                        
                                            {hideOpt.indexOf('user')===-1?
                                                <span>{item.taskinfo.userResponse?item.taskinfo.userResponse.name:'未指派'}</span>
                                            :''}
                                            {item.taskinfo.state==='2' &&
                                                <i className="icon iconfont icon-shenheren1"></i>
                                            }
                                            {item.taskinfo.state==='2' &&
                                                <span>{item.taskinfo.userFlow?item.taskinfo.userFlow.name:'未指派'}</span>
                                            }
                                            {hideOpt.indexOf('project')===-1?
                                                <i className="icon iconfont icon-xiangmuneirong"></i>
                                            :''}
                                            {hideOpt.indexOf('project')===-1?
                                                <span className="textMore">{item.project.proname}</span>
                                            :''}
                                            <i className="icon iconfont icon-lvzhou_fenzhichangsuo" style={{fontSize:'12px'}}></i>
                                            <span>{item.taskinfo.childSuccess}/{item.taskinfo.childCount}</span>
                                            <i className="icon iconfont icon-discuss"></i>
                                            <span>{item.taskinfo.leaveCount}</span>
                                        </div>
                                    </div>
                                    <div className="taskList_right">
                                        {item.taskinfo.milestone === '1'?
                                            <Icon className="attention" type="flag" style={{color:'#3297fa'}} onClick={(e)=>{this.milestone(e,'取消',item.taskinfo.id)}} />
                                        :
                                            <Icon className="attention" type="flag" style={{color:'#a0a0a0'}} onClick={(e)=>{this.milestone(e,'设置',item.taskinfo.id)}} />
                                        }
                                        {item.taskinfo.collect?
                                            <Icon className="attention" type="star" onClick={(e)=>{this.attention(e,'取消关注',item.taskinfo.id)}} />
                                        :
                                            <Icon className="attention" type="star-o" onClick={(e)=>{this.attention(e,'关注',item.taskinfo.id)}} />
                                        }
                                    </div>
                                </div>
                        }
                    }
                })}
            </div>
        )
    }
}