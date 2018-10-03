import React from 'react';
import { Layout, Select, Calendar, Spin, Icon,DatePicker, message,Popover } from 'antd';
import Router from 'next/router';
import { LocaleProvider } from 'antd';
import zh_CN from 'antd/lib/locale-provider/zh_CN';
import 'moment/locale/zh-cn';
import moment from 'moment';

import stylesheet from 'styles/views/dynamicNew.scss';
import Head from '../components/header';
import ProjectSelect from '../components/projectSelect'
import TaskDetails from '../components/taskDetails'
import { getDynamicList } from '../core/service/dynamic.service';
import { listScroll,dateToString,isLoadingErr } from '../core/utils/util';
import NullView from '../components/nullView';
import dingJS from '../core/utils/dingJSApi';
import { format } from 'path';

const { Content } = Layout;
const Option = Select.Option;
const dateFormat = 'YYYY/MM/DD';

export default class Dynamic extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            dynamicList: [],
            dynamicListLoading: false,
            dynamicListMoreLoading: false, 
            dynamicListLoadingCount: 0,
            dynamicPage:1,
            dynamicAllPage:0,
            dynamicSearUsers:[],
            dynamicSearProIds:[],
            dynamicSearDate:'',
            projectSelelctShow:false,
            selectedProjectList:[],
            taskDetailShow:false,
            taskId:'',
            proId:'',
            dynamicMenuShow:false,
            animate:'',
        }
    }

    componentWillMount() {
        const nowDate = dateToString(new Date(),'date');
        this.setState({dynamicSearDate:nowDate});
        this.getDynamicData(1,[],[],nowDate);
    }    

    componentDidMount() {
        dingJS.authDingJsApi();
    }

    componentWillUnmount() {    
        this.setState = (state,callback)=>{
            return;
        };  
    }

   
    //获取动态数据
    getDynamicData(pageNo,users,proIds,date){
        if(!pageNo){
            pageNo = this.state.dynamicPage;
        }
        if(!users){
            users = [];
            if(this.state.dynamicSearUsers.length>0){
                this.state.dynamicSearUsers.map((item)=>{
                    users.push({
                        'userid':item.userid,
                        'name':item.name
                    })
                });
            }
        }
        if(!proIds){
            proIds = this.state.dynamicSearProIds;
        }
        if(!date){
            date = this.state.dynamicSearDate;
        }
        const dynamicSearch = {
            'projectIds': proIds,
            'persons': users,
            'date': date
        };
        if(pageNo === 1){
            this.setState({dynamicListLoading:true});
        }else{
            this.setState({dynamicListMoreLoading:true});
        } 
        getDynamicList(pageNo,dynamicSearch,(res)=>{
            if(res.err){
                this.setState({dynamicListLoadingCount:'err'});
                this.setState({dynamicListLoading:false,dynamicListMoreLoading:false});

                if(pageNo>1){
                    message.error(isLoadingErr());
                }
                return false;
            }
            if(res.result.pageNo === 1){
                if(res.result.list){
                    this.setState({dynamicList:res.result.list});
                }else{
                    this.setState({dynamicList:[]});
                }
            }else{
                const dynamicList = JSON.parse(JSON.stringify(this.state.dynamicList));
                res.result.list.map((item)=>{
                    dynamicList.push(item);
                });
                this.setState({dynamicList:dynamicList});
            }
            let {dynamicListLoadingCount} = this.state;
            if(dynamicListLoadingCount === 'err'){
                this.setState({dynamicListLoadingCount:1});
            }else{
                this.setState({dynamicListLoadingCount:dynamicListLoadingCount+1});
            }
            this.setState({dynamicPage:res.result.pageNo,dynamicAllPage:res.result.last});
            this.setState({dynamicListLoading:false,dynamicListMoreLoading:false});
        });
    }


    //下拉加载
    scrollOnBottom(e) {
        const isOnButtom = listScroll(e);
        const { dynamicAllPage, dynamicPage } = this.state;
        if(isOnButtom && dynamicPage<dynamicAllPage) {
            this.getDynamicData(dynamicPage+1);
        }
    }
    //选人
    selectUser(){
        const { dynamicSearUsers} = this.state;
        const that = this;
        console.log('-----------------userTag开始选人-------------------',dynamicSearUsers);
        dingJS.selectUser(dynamicSearUsers,'人员',(users)=>{
            console.log('选人组件返回值：',users);
            const selingUser = [];
            users.map((item)=>{
                selingUser.push({
                    'userid':item.emplId,
                    'name':item.name,
                    'photo':item.avatar,
                });
            });
            this.setState({dynamicSearUsers:selingUser});
            this.getDynamicData(1,selingUser,'','');
            this.refs.rightDiv.scrollTop=0;
        });
    }
    //删除选中人员
    dellSelectedUser(user){
        const { dynamicSearUsers } = this.state;
        dynamicSearUsers.map((item,i)=>{
            if(item.userid === user.userid){
                dynamicSearUsers.splice(i,1);
                return false;
            }
        });
        this.setState({dynamicSearUsers:dynamicSearUsers});
        this.getDynamicData(1,dynamicSearUsers,'','');
    }
    //返回nickName
    getNickNameByName(name){
        let str = name.replace(/[^\u4e00-\u9fa5]/gi,"");
        let nickname = str.substr(str.length-2);  
        return nickname;
    }
    disabledEndDate = (endValue) => { 
        const now = new Date();
        return endValue.valueOf() >= now;
    }
    
    onSelectChange(value,that){
        const val = value.valueOf();
        const da = dateToString(new Date(val),'date');
        this.setState({dynamicSearDate:da});
        this.getDynamicData(1,'','',da);
        this.refs.rightDiv.scrollTop=0;
    }
    projectChange(val){
        const {dynamicSearProIds} =this.state;
        let projectIds=[];
        val.map((item)=>{
            projectIds.push(item.id);
        });
        this.setState({dynamicSearProIds:projectIds,selectedProjectList:val});
        this.getDynamicData(1,'',projectIds,'');
        this.refs.rightDiv.scrollTop=0;
    }
    deleteProject(id){
        const {selectedProjectList,dynamicSearProIds} =this.state;
        if(selectedProjectList.length>0){
            selectedProjectList.map((item,index)=>{
                if(item.id === id){
                    selectedProjectList.splice(index,1);
                    dynamicSearProIds.splice(index,1);
                }
            });
            this.setState({selectedProjectList:selectedProjectList});
        }
        this.getDynamicData(1,'',dynamicSearProIds,'');
        this.refs.rightDiv.scrollTop=0;
    }
    routerPage(type,item){
        let pId = item.antProject.id;
        let tId = item.objectId;
        if(type === 'task'){
            if((item.antProject && item.antProject.delFlag == '1') || (item.taskinfo && item.taskinfo.delFlag == '1')){
                message.info('该任务已被删除，无法查看')
            }else{
                this.setState({taskDetailShow:true,proId:pId,taskId:tId,animate:'animated_05s fadeInRightBig'});
            }
        }else if(type === 'project'){
            if((item.antProject && item.antProject.delFlag == '1') || (item.taskinfo && item.taskinfo.delFlag == '1')){
                message.info('该项目已被删除，无法查看')
            }else{
                Router.push('/pc_projectDetails?id='+pId);
            }
        }
    }
    headMenu(){
        const {dynamicMenuShow}=this.state;
        if(dynamicMenuShow){
            this.setState({dynamicMenuShow:false});
        }else{
            this.setState({dynamicMenuShow:true});
        }
    }
    render() {
        const { dynamicList,selectedProjectList,taskDetailShow,animate,dynamicMenuShow,proId,taskId,dynamicListLoadingCount,dynamicListMoreLoading,dynamicPage,dynamicAllPage,projectSelelctShow,dynamicSearUsers,dynamicListLoading} = this.state;
        
        return (
            <LocaleProvider locale={zh_CN}>
            <Layout>
                <style dangerouslySetInnerHTML={{ __html: stylesheet }} />
                <Head 
                iconOnClickCallBack={()=>{this.headMenu();}}
                />
                <Content className="dynamic">
                    {taskDetailShow?
                        <div className={"taskDetailBox "+animate}>
                            <TaskDetails
                            closeCallBack={()=>{this.setState({taskDetailShow:false});}}
                            taskId={taskId}
                            projectId={proId}
                            updatedTaskCallBack={(val)=>{if(val == '刷新'){this.getDynamicData(1,'','','');}}}/>
                        </div>
                    :''}
                    {projectSelelctShow?
                        <ProjectSelect title={'选择项目'} 
                        closedCallBack={()=>{this.setState({projectSelelctShow:false});}}
                        selectedProjects={JSON.parse(JSON.stringify(selectedProjectList))}
                        selectedCallBack={(val)=>{this.projectChange(JSON.parse(JSON.stringify(val)));}}/>
                    :''}
                    {taskDetailShow?<div className="taskDetailsCen" onClick={(e)=>{this.setState({taskDetailShow:false})}}></div>:''}
                    {dynamicMenuShow?<div className="dynamicCen" onClick={(e)=>{this.setState({dynamicMenuShow:false})}}></div>:''}
                    <div className={dynamicMenuShow?"dynamic-left-fixed dynamic-left":"dynamic-left"}>
                        <div className="date">
                            {/* <DatePicker open={true}/> */}
                            <Calendar fullscreen={false} 
                            onSelect={(val)=>{this.onSelectChange(val)}}
                            disabledDate={this.disabledEndDate}
                            />
                        </div>
                        <div className="project">
                            <div className="chooseTitle">
                                <div className="proTitle">项目筛选:</div>
                                <div className="add">
                                    <Icon type="plus" className="plus" onClick={()=>{this.setState({projectSelelctShow:true})}}/>
                                </div>
                            </div>
                            <div className="projectList">
                            {selectedProjectList && selectedProjectList.length>0?selectedProjectList.map((project,index)=>{
                                return(
                                    <div className="listName textMore" key={project.id} onClick={()=>{this.deleteProject(project.id);}}>{project.name}</div>
                                )
                            }):<span className="null">所有项目</span>}
                            </div>
                        </div>
                        <div className="person">
                            <div className="personTitle">
                                <div className="personChoose">人员筛选:</div>
                                <div className="add-person">
                                    <Icon type="plus" className="plus2" onClick={()=>{this.selectUser();}}/>
                                </div>
                            </div>
                            <div className="personList">
                            {dynamicSearUsers && dynamicSearUsers.length>0?dynamicSearUsers.map((tim,i)=>{
                                return(
                                    <div className="personName">
                                        <div className="personUserName" onClick={()=>{this.dellSelectedUser(tim)}}>
                                            <div className="personUser">{tim.photo !== ''?<img src={tim.photo}/>:<span>{this.getNickNameByName(tim.name)}</span>}</div>
                                            <div className="personAllName">{tim.name.slice(0,3)}</div>
                                        </div>
                                    </div>
                                )
                            })
                            :<span className="null">所有人员</span>}
                            </div>
                        </div>
                    </div>
                    <div className="dynamic-right" onScroll={(e)=>{this.scrollOnBottom(e)}} ref="rightDiv">
                    <Spin spinning={dynamicListLoading} />
                    {dynamicList && dynamicList.length>0?dynamicList.map((item,i)=>{
                        if(i==0 || dynamicList[i].date !== dynamicList[i-1].date){
                            return(
                                <div key={item.id}>
                                    <div className="week">
                                        <div className="weekDate">
                                            <div>{item.date}</div>
                                            <div>{item.week}</div>
                                        </div>
                                        {/* <div className="dynamicNum">478条动态</div> */}
                                    </div>
                                    <div className="text">
                                        <div className="dynamicPro textMore">
                                            <div className="line"></div>
                                            {/* <div className="gray">来自项目：</div> */}
                                            <div className="proName">{item.antProject.proname}</div>
                                        </div>
                                        <div className="contentTop">
                                            <div className="time">{item.creatDate}</div>
                                            {item.createBy.photo !== ''?
                                                <div className="photo"><img src={item.createBy.photo}/></div>
                                            :<div className="photo" style={{lineHeight:'24px'}}><span>{item.createBy.nickname}</span></div>
                                            }
                                            <div className="name">{item.createBy.name}</div>
                                        </div>
                                        <div className="contentMain">
                                            {item.description}
                                            {item.type == "T"?
                                                <span 
                                                onClick={()=>{this.routerPage('task',item)}}>
                                                {item.taskinfo.taskname}
                                                </span>
                                            :
                                                <span 
                                                onClick={()=>{this.routerPage('project',item)}}>
                                                {item.antProject.proname}
                                                </span>
                                            }
                                        </div>
                                        {item.remarks?<div className="contentBottom">{"“"+item.remarks+"”"}</div>:""}
                                        <div className="fileBox">
                                            <ul>
                                            {item.fileList && item.fileList.length>0?item.fileList.map((tim,i)=>{
                                                if(tim.type){
                                                    return  <li key={tim.id}>
                                                                <i className="paper iconfont icon-excelicon"></i>
                                                                <div className="fileName textMore" onClick={()=>{dingJS.previewImage(tim)}}>{tim.fileName}</div>
                                                            </li>
                                                }else{
                                                    return  <li key={tim.id}>
                                                                <div className="fileImg">
                                                                    <img src={tim.fileUrlAbsolute} onClick={()=>{dingJS.previewImage(tim)}}/>
                                                                </div>
                                                            </li>
                                                }
                                            }):''}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            )
                        }else if(i ==0 || dynamicList[i].antProject.id !== dynamicList[i-1].antProject.id){
                            return(
                                <div key={item.id}>
                                    <div className="text">
                                        <div className="dynamicPro textMore">
                                            <div className="line"></div>
                                            {/* <div className="gray">来自项目：</div> */}
                                            <div className="proName">{item.antProject.proname}</div>
                                        </div>
                                        <div className="contentTop">
                                            <div className="time">{item.creatDate}</div>
                                            {item.createBy.photo !== ''?
                                                <div className="photo"><img src={item.createBy.photo}/></div>
                                            :<div className="photo" style={{lineHeight:'24px'}}><span>{item.createBy.nickname}</span></div>
                                            }
                                            <div className="name">{item.createBy.name}</div>
                                        </div>
                                        <div className="contentMain">
                                            {item.description}
                                            {item.type == "T"?
                                                <span 
                                                onClick={()=>{this.routerPage('task',item)}}>
                                                {item.taskinfo.taskname}
                                                </span>
                                            :
                                                <span 
                                                onClick={()=>{this.routerPage('project',item)}}>
                                                {item.antProject.proname}
                                                </span>
                                            }
                                        </div>
                                        {item.remarks?<div className="contentBottom">{"“"+item.remarks+"”"}</div>:""}
                                        <div className="fileBox">
                                            <ul>
                                            {item.fileList && item.fileList.length>0?item.fileList.map((tim,i)=>{
                                                if(tim.type){
                                                    return  <li key={tim.id}>
                                                                <i className="paper iconfont icon-excelicon"></i>
                                                                <div className="fileName textMore" onClick={()=>{dingJS.previewImage(tim)}}>{tim.fileName}</div>
                                                            </li>
                                                }else{
                                                    return  <li key={tim.id}>
                                                                <div className="fileImg">
                                                                    <img src={tim.fileUrlAbsolute} onClick={()=>{dingJS.previewImage(tim)}}/>
                                                                </div>
                                                            </li>
                                                }
                                            }):''}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            )
                        }else{
                            return(
                                <div key={item.id}>
                                    <div className="text">
                                        <div className="contentTop">
                                            <div className="time">{item.creatDate}</div>
                                            {item.createBy.photo !== ''?
                                                <div className="photo"><img src={item.createBy.photo}/></div>
                                            :<div className="photo" style={{lineHeight:'24px'}}><span>{item.createBy.nickname}</span></div>
                                            }
                                            <div className="name">{item.createBy.name}</div>
                                        </div>
                                        <div className="contentMain">
                                            {item.description}
                                            {item.type == "T"?
                                                <span 
                                                onClick={()=>{this.routerPage('task',item)}}>
                                                {item.taskinfo.taskname}
                                                </span>
                                            :
                                                <span 
                                                onClick={()=>{this.routerPage('project',item)}}>
                                                {item.antProject.proname}
                                                </span>
                                            }
                                        </div>
                                        {item.remarks?<div className="contentBottom">{"“"+item.remarks+"”"}</div>:""}
                                        <div className="fileBox">
                                            <ul>
                                            {item.fileList && item.fileList.length>0?item.fileList.map((tim,i)=>{
                                                if(tim.type){
                                                    return  <li key={tim.id}>
                                                                <i className="paper iconfont icon-excelicon"></i>
                                                                <div className="fileName textMore" onClick={()=>{dingJS.previewImage(tim)}}>{tim.fileName}</div>
                                                            </li>
                                                }else{
                                                    return  <li key={tim.id}>
                                                                <div className="fileImg">
                                                                    <img src={tim.fileUrlAbsolute} onClick={()=>{dingJS.previewImage(tim)}}/>
                                                                </div>
                                                            </li>
                                                }
                                            }):''}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            )
                        }
                    }):''}
                    {dynamicList.length===0 && dynamicListLoadingCount>0 &&
                        <NullView />
                    }
                    {dynamicList.length===0 && dynamicListLoadingCount==='err' &&
                        <NullView isLoadingErr={true} restLoadingCallBack={()=>{this.getDynamicData(1)}} />
                    }
                    {!dynamicListMoreLoading && dynamicPage<dynamicAllPage && dynamicListLoadingCount!=='err'?
                        <div className="moreLoadingRow">下拉加载更多</div>
                    :''}
                    {!dynamicListMoreLoading &&  dynamicPage===dynamicAllPage && dynamicListLoadingCount!=='err'?
                        <div className="moreLoadingRow">已经到底喽</div>
                    :''}
                    {dynamicListMoreLoading?
                        <div className="moreLoadingRow"><Icon type="loading" className="loadingIcon" />正在加载更多</div>
                    :''}
                    </div>
                </Content>
            </Layout>
            </LocaleProvider>
        )
    }
}