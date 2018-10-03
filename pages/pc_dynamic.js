import React from 'react';
import { Layout, Select, Calendar, Spin, Icon,DatePicker, message } from 'antd';
import Router from 'next/router';
import { LocaleProvider } from 'antd';
import zh_CN from 'antd/lib/locale-provider/zh_CN';
import 'moment/locale/zh-cn';
import moment from 'moment';

import stylesheet from 'styles/views/dynamic.scss';
import Head from '../components/header';
import { getProListByType } from '../core/service/project.service';
import { getDynamicList } from '../core/service/dynamic.service';
import { listScroll,dateToString,isLoadingErr } from '../core/utils/util';
import UserTag from '../components/userTag'; 
import NullView from '../components/nullView';
import dingJS from '../core/utils/dingJSApi';

const { Content } = Layout;
const Option = Select.Option;

export default class Dynamic extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            projectList: [],
            projectListNowPage: 1,    
            projectListAllPage: 0,   
            projectListLoading: false,
            projectSelecteds: [],

            dynamicList: [],
            dynamicListLoading: false,
            dynamicListMoreLoading: false, 
            dynamicListLoadingCount: 0,
            dynamicListNowPage:1,
            dynamicListAllPage:0,
            dynamicSearUsers:[],
            dynamicSearProIds:[],
            dynamicSearDate:''
        }
    }

    componentWillMount() {
        const nowDate = dateToString(new Date(),'date');
        this.setState({dynamicSearDate:nowDate});
        this.getProjectList();
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

    getDynamicData(pageNo,users,proIds,date){
        if(!pageNo){
            pageNo = this.state.dynamicListNowPage;
        }
        if(!users){
            users = [];
            this.state.dynamicSearUsers.map((item)=>{
                users.push({
                    'userid':item.id,
                    'name':item.name
                })
            });
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
            this.setState({dynamicListNowPage:res.result.pageNo,dynamicListAllPage:res.result.last});
            this.setState({dynamicListLoading:false,dynamicListMoreLoading:false});
        });
    }

    scrollOnBottom(type,e) {
        const isOnButtom = listScroll(e);
        if(type === 'project'){
            const { projectListAllPage, projectListNowPage } = this.state;
            if(isOnButtom && projectListNowPage<projectListAllPage) {
                this.getProjectList(projectListNowPage+1);
            }
        }else if(type === 'dynamic'){
            const { dynamicListAllPage, dynamicListNowPage } = this.state;
            if(isOnButtom && dynamicListNowPage<dynamicListAllPage) {
                this.getDynamicData(dynamicListNowPage+1);
            }
        }
    }

    selectedUsersOnchange(users){
        this.setState({dynamicSearUsers:users});
        const userArr = [];
        users.map((item)=>{
            userArr.push({
                'userid':item.id,
                'name':item.name
            });
        });
        this.getDynamicData(1,userArr,'','');
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
    }

    render() {
        const { projectList,dynamicSearUsers,dynamicSearProIds,dynamicList,dynamicListLoadingCount,dynamicListLoading,projectListMoreLoading,dynamicListNowPage,dynamicListAllPage,projectListNowPage,projectListAllPage,dynamicSearDate,dynamicListMoreLoading } = this.state;
        let children = []; 
        projectList.map((item, i) => {
            children.push(
                <Option key={item.id}>
                    <svg className="pro-icon" aria-hidden="true">
                        {item.attstr04 ?
                            <use xlinkHref={item.attstr04}></use>
                            :
                            <use xlinkHref="#pro-myfg-1000"></use>
                        }
                    </svg> 
                    {item.proname}
                </Option>);
        }); 

        return (
            <LocaleProvider locale={zh_CN}>
            <Layout>
                <style dangerouslySetInnerHTML={{ __html: stylesheet }} />
                <Head />
                <Content className="d-bg-gray d-flex-con dynamic">
                    <div className="d-bg-white dynamic-filter">
                        <div className="dynamic-filter-item">
                            <div className="title">所属项目</div>
                            <div className="ct">
                                <Select
                                    mode="multiple"
                                    optionFilterProp={'children'}
                                    placeholder="请选择项目"
                                    onChange={(val) => {this.setState({dynamicSearProIds:val});this.getDynamicData(1,'',val,'') }}
                                    style={{ maxWidth: '100%', minWidth: '200px' }}
                                    value={dynamicSearProIds}
                                    onPopupScroll={(e)=>{this.scrollOnBottom('project',e)}}
                                >
                                    {children}
                                    {!projectListMoreLoading && projectListNowPage === projectListAllPage?
                                        <Option value="disabled" disabled>已经到底喽</Option>
                                    :''}
                                    {!projectListMoreLoading && projectListNowPage < projectListAllPage?
                                        <Option value="disabled" disabled>下拉加载更多</Option>
                                    :''}
                                </Select>
                            </div>
                        </div>
                        <div className="dynamic-filter-item" style={{border:'0'}}>
                            <div className="title">人员</div>
                            <div className="ct">
                                <UserTag selectedUsers={dynamicSearUsers} selectedUsersOnchange={(val)=>{this.selectedUsersOnchange(val);}} selectUserTitle="人员" />
                            </div>
                        </div>
                        <div className="dateSearch_row">
                            <div className="title">截止日期</div>
                            <div className="ct">
                                <DatePicker value={moment(dynamicSearDate, 'YYYY-MM-DD')} 
                                            onChange={(val)=>{const da = dateToString(new Date(val),'date');this.setState({dynamicSearDate:da});this.getDynamicData(1,'','',da)}} 
                                />
                            </div>
                        </div>
                    </div>
                    <div className="filter-main">
                        <div className="filter-main-list d-bg-white">
                            <p className="bb f14 main-title">动态列表
                            </p>
                            <div className="container" onScroll={(e)=>{this.scrollOnBottom('dynamic',e)}}>
                                <Spin spinning={dynamicListLoading} />
                                {dynamicList && dynamicList.length>0 ? dynamicList.map((item, i) => { 
                                    if (i == 0 || dynamicList[i].date != dynamicList[i - 1].date) {
                                        return (
                                            <div className="oMain" key={item.id}>
                                                <div className="objectTit">
                                                    <div className="date">
                                                        <div className="cen">{item.date}</div>
                                                        <div className="min">{item.week}</div>
                                                    </div>
                                                    <div className="line"></div>
                                                    <div className="objName">{item.antProject.proname}</div>
                                                </div>
                                                <div className="ct" >
                                                    <ul>
                                                        <li className='listItem'>
                                                            {item.createBy?
                                                                <div className="pic">
                                                                    {item.createBy.photo?
                                                                        <img src={item.createBy.photo} />
                                                                        :
                                                                        <div className="user">{item.createBy.nickname}</div>
                                                                    }
                                                                </div>
                                                            :
                                                                <div className="pic">   
                                                                    <div className="user">已删</div> 
                                                                </div>
                                                            }
                                                            <div className="right-ct">
                                                                <div className="name">
                                                                    <span className="defal">{item.createBy?item.createBy.name:'被删除用户'}</span>{item.description}
                                                                    {item.type == 'T' ?
                                                                        <span className="d-text-green" onClick={()=>{if(item.attstr01==='1'){message.info('该任务/项目已被删除，无法查看')}else{Router.push('/pc_projectDetails?id='+item.antProject.id+'&taskId='+item.objectId)}}}>
                                                                            {item.taskinfo.taskname}
                                                                        </span>
                                                                    :
                                                                        <span className="d-text-green" onClick={()=>{if(item.attstr01==='1'){message.info('该任务/项目已被删除，无法查看')}else{Router.push('/pc_projectDetails?id='+item.antProject.id)}}}>
                                                                            {item.antProject.proname}
                                                                        </span>
                                                                    }
                                                                </div>
                                                                <div className="time">
                                                                    {item.creatDate}
                                                                </div>
                                                            </div>
                                                        </li>
                                                    </ul>
                                                </div>
                                            </div>
                                        )
                                    } else if (dynamicList[i].antProject.id != dynamicList[i - 1].antProject.id) {
                                        return (
                                            <div className="oMain" key={item.id}>
                                                <div className="objectTit">
                                                    <div className="dateNull">
                                                    </div>
                                                    <div className="line"></div>
                                                    <div className="objName">{item.antProject.proname}</div>
                                                </div>
                                                <div className="ct" >
                                                    <ul>
                                                        <li className='listItem'>
                                                            {item.createBy?
                                                                <div className="pic">
                                                                    {item.createBy.photo?
                                                                        <img src={item.createBy.photo} />
                                                                        :
                                                                        <div className="user">{item.createBy.nickname}</div>
                                                                    }
                                                                </div>
                                                            :
                                                                <div className="pic">   
                                                                    <div className="user">已删</div> 
                                                                </div>
                                                            }
                                                            <div className="right-ct">
                                                                <div className="name">
                                                                    <span className="defal">{item.createBy?item.createBy.name:'被删除用户'}</span>{item.description}
                                                                    {item.type == 'T' ?
                                                                        <span className="d-text-green" onClick={()=>{if(item.attstr01==='1'){message.info('该任务/项目已被删除，无法查看')}else{Router.push('/pc_projectDetails?id='+item.antProject.id+'&taskId='+item.objectId)}}}>
                                                                            {item.taskinfo.taskname}
                                                                        </span>
                                                                    :
                                                                        <span className="d-text-green" onClick={()=>{if(item.attstr01==='1'){message.info('该任务/项目已被删除，无法查看')}else{Router.push('/pc_projectDetails?id='+item.antProject.id)}}}>
                                                                            {item.antProject.proname}
                                                                        </span>
                                                                    }
                                                                </div>
                                                                <div className="time">
                                                                    {item.creatDate}
                                                                </div>
                                                            </div>
                                                        </li>
                                                    </ul>
                                                </div>
                                            </div>
                                        )
                                    } else { 
                                        return (
                                            <div className="ct" key={item.id}>
                                                <ul>
                                                    <li className='listItem'>
                                                        {item.createBy ?
                                                            <div className="pic">
                                                                {item.createBy.photo?
                                                                    <img src={item.createBy.photo} />
                                                                    :
                                                                    <div className="user">{item.createBy.nickname}</div>
                                                                }
                                                            </div>
                                                        :
                                                            <div className="pic">   
                                                                <div className="user">已删</div> 
                                                            </div>
                                                        }
                                                        <div className="right-ct">
                                                            <div className="name">
                                                                <span className="defal">{item.createBy?item.createBy.name:'被删除用户'}</span>{item.description}
                                                                {item.type == 'T' ?
                                                                    <span className="d-text-green" onClick={()=>{if(item.attstr01==='1'){message.info('该任务/项目已被删除，无法查看')}else{Router.push('/pc_projectDetails?id='+item.antProject.id+'&taskId='+item.objectId)}}}>
                                                                        {item.taskinfo.taskname}
                                                                    </span>
                                                                :
                                                                    <span className="d-text-green" onClick={()=>{if(item.attstr01==='1'){message.info('该任务/项目已被删除，无法查看')}else{Router.push('/pc_projectDetails?id='+item.antProject.id)}}}>
                                                                        {item.antProject.proname}
                                                                    </span>
                                                                }
                                                            </div>
                                                            <div className="time">
                                                                {item.creatDate}
                                                            </div>
                                                        </div>
                                                    </li>
                                                </ul>
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
                                {!dynamicListMoreLoading && dynamicListNowPage<dynamicListAllPage && dynamicListLoadingCount!=='err'?
                                    <div className="moreLoadingRow">下拉加载更多</div>
                                :''}
                                {!dynamicListMoreLoading &&  dynamicListNowPage===dynamicListAllPage && dynamicListLoadingCount!=='err'?
                                    <div className="moreLoadingRow">已经到底喽</div>
                                :''}
                                {dynamicListMoreLoading?
                                    <div className="moreLoadingRow"><Icon type="loading" className="loadingIcon" />正在加载更多</div>
                                :''}
                            </div>

                        </div>
                        <div className="calendar">
                            <p className="bb f14 main-title">日期选择</p>
                            <div className="calendar-ct ba">
                                <Calendar fullscreen={false} 
                                    disabledDate={this.disabledEndDate}
                                    onSelect={(val)=>{this.onSelectChange(val)}}
                                />
                            </div>                            
                        </div>
                    </div>
                </Content>
            </Layout>
            </LocaleProvider>
        )
    }
}