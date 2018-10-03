import React from 'react';
import { Layout, Icon, Radio, Spin, Select,Button,Modal,Checkbox } from 'antd';
import echarts from 'echarts/lib/echarts';
import 'echarts/lib/chart/pie';

import stylesheet from 'styles/views/home.scss';
import Head from '../components/header';
import { getUserBusinessStatistics, getUserTaskChart, getUserMoneyChart, getMessageByUser } from '../core/service/user.service';
import { getProListByType } from '../core/service/project.service';
import Storage from '../core/utils/storage';
import { listScroll,getTeamInfoWithMoney } from '../core/utils/util';
import MoneyEnd from '../components/moneyEnd';
import NullView from '../components/nullView';

const { Content } = Layout;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
const { Option } = Select;

export default class Home extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            userBusData: {},
            user: {},
            userBusLoading: false,

            userTaskDataLoading: false,
            userTaskDataDate: 'all',
            userTaskChartText: [],

            userMoneyDataLoading: false,
            userMoneyDataDate: 'all',
            userMoneyText: [],

            userMessageLoading: false,
            userMessageMoreLoading:false,
            userMessageList: [],
            userMessageNowPage: 1,
            userMessageLastPage: 0,

            projectListLoading:false,
            projectListMoreLoading:false,
            projectList:[],
            projectListAllPage:0,
            projectListNowPage:0,
            projectSelecteds:[],

            moneyEndShow:false,
        }   
    }

    componentDidMount(){
        const endthreeDaysShow = Storage.get('endthreeDaysShow');
        const teamState = getTeamInfoWithMoney();
        if(teamState === '已过期'){
            this.setState({moneyEndShow:true});
        }else if(teamState !== '正常' && endthreeDaysShow!=='不提醒'){
            this.useStop(teamState);
        }

        const user = Storage.get('user');
        this.setState({ user: "吕国营" });
        this.getUserBusData();
        this.userTaskChart('all');
        this.userMoneyData([], 'all');
        this.userMessage(1);
        this.getProjectList();

        window.addEventListener('resize', this.resize.bind(this));
    }

    componentWillUnmount() {    
        window.removeEventListener('resize',this.resize);
        //重写组件的setState方法，直接返回空
        this.setState = (state,callback)=>{
            return;
        };  
    }

    resize(){
        this.userTaskChart('','重绘');
        this.userMoneyData('','','重绘');
    }

    useStop(msg){
        Modal.info({
            title: msg,
            okText:'知道了',
            content: (
                <div>
                <p style={{margin:'0'}}>请提前续费，以免影响正常使用</p>
                <p style={{margin:'5px 0 0 0'}}><Checkbox onChange={(e)=>{ Storage.set('endthreeDaysShow',(e.target.checked?'不提醒':'提醒')) }}>不再提醒</Checkbox></p>
                </div>
            )
        })
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

    getUserBusData() {
        this.setState({ userBusLoading: true });
        getUserBusinessStatistics((res) => {
            if(res.err){
                return false;
            }
            this.setState({ userBusData: res, userBusLoading: false });
        });
    }

    userTaskChart(date,isDraw) {
        var userTaskChart = echarts.init(document.getElementById('userTaskChartBox'));
        if(isDraw === '重绘'){
            userTaskChart.resize();
            return false;
        }

        if (!date) {
            date = this.state.userTaskDataDate;
        } else if (date === 'all') {
            date = '';
            this.setState({userTaskDataDate:'all'});
        } else{
            this.setState({userTaskDataDate:date});
        }
        this.setState({ userTaskDataLoading: true });
        getUserTaskChart(date, (res) => {
            if(res.err){
                return false;
            }
            const taskDatas = [];
            let userTaskChartText = [];
            res.map((item) => {
                let color = '';
                let type = '';
                switch (item.type) {
                    case '0': //我创建
                        color = '#3ba0ff';
                        type = '我创建';                        
                        break;
                    case '1': //我负责
                        color = '#36cbcb';
                        type = '我负责';
                        break;
                    case '2': //我确认
                        color = '#975fe4';
                        type = '我确认';
                        break;
                    case '3': //我指派
                        color = '#f2637b';
                        type = '我指派';
                        break;
                    case '4': //我关注
                        color = '#fad337';
                        type = '我关注';
                        break;
                }
                taskDatas.push({
                    value: item.allCount,
                    name: type,
                    itemStyle: {
                        color: color
                    }
                });
                userTaskChartText.push({
                    'all':item.allCount,
                    'bfb':item.percent,
                    'type':type,
                    'ywc':item.wcCount,
                    'color':color
                });
            });
            this.setState({userTaskChartText:userTaskChartText});
            
            var userTaskChartOpt = {
                tooltip: {
                    trigger: 'item',
                    formatter: "{a} <br/>{b}: {c} ({d}%)"
                },
                // legend: {
                //     orient: 'vertical',
                //     x: 'left',
                //     data: ['我创建', '我负责', '我确认', '我指派', '我关注']
                // },
                series: [
                    {
                        name: '我的任务',
                        type: 'pie',
                        radius: ['50%', '70%'],
                        avoidLabelOverlap: false,
                        label: {
                            normal: {
                                show: false,
                                position: 'center'
                            },
                            emphasis: {
                                show: false,
                                textStyle: {
                                    fontSize: '30',
                                    fontWeight: 'bold'
                                }
                            }
                        },
                        labelLine: {
                            normal: {
                                show: false
                            }
                        },
                        data: taskDatas
                    }
                ]
            };
            userTaskChart.setOption(userTaskChartOpt);
            this.setState({ userTaskDataLoading: false });
        });
    }

    userMoneyData(projectIds, date, isDraw) {
        var userTaskChart = echarts.init(document.getElementById('userMoneyChartBox'));
        if(isDraw === '重绘'){
            userTaskChart.resize();
            return false;
        }

        this.setState({ userMoneyDataLoading: true });
        if(!projectIds){
            projectIds = this.state.projectSelecteds;
        }
        if(!date){
            date = this.state.userMoneyDataDate;
        }
        if(date === 'all'){
            date = '';
            this.setState({userMoneyDataDate:'all'});
        }else{
            this.setState({userMoneyDataDate:date});
        } 
        getUserMoneyChart(projectIds, date, (res) => { 
            if(res.err){
                return false;
            }
            const taskDatas = [{
                value: res.createTsak.performance,
                name: '创建任务',
                itemStyle: {
                    color: '#3ba0ff'
                },
                bfb:res.createTsak.percentage
            }, {
                value: res.assignTask.performance,
                name: '指派任务',
                itemStyle: {
                    color: '#f2637b'
                },
                bfb:res.assignTask.percentage
            }, {
                value: res.confirmTask.performance,
                name: '确认任务',
                itemStyle: {
                    color: '#975fe4'
                },
                bfb:res.confirmTask.percentage
            }, {
                value: res.normalTask.performance,
                name: '正常完成',
                itemStyle: {
                    color: '#4dcb73'
                },
                bfb:res.normalTask.percentage
            }, {
                value: res.advanceTask.performance,
                name: '逾期完成',
                itemStyle: {
                    color: '#fad337'
                },
                bfb:res.advanceTask.percentage
            }, {
                value: res.overdueTask.performance,
                name: '提前完成',
                itemStyle: {
                    color: '#36cbcb'
                },
                bfb:res.overdueTask.percentage
            }];

            this.setState({userMoneyText:taskDatas});
            
            var userTaskChartOpt = {
                tooltip: {
                    trigger: 'item',
                    formatter: "{a} <br/>{b}: {c} ({d}%)"
                },
                // legend: {
                //     orient: 'vertical',
                //     x: 'left',
                //     data: ['创建任务', '指派任务', '确认任务', '正常完成', '逾期完成', '提前完成']
                // },
                series: [
                    {
                        name: '我的绩效',
                        type: 'pie',
                        radius: ['50%', '70%'],
                        avoidLabelOverlap: false,
                        label: {
                            normal: {
                                show: false,
                                position: 'center'
                            },
                            emphasis: {
                                show: false,
                                textStyle: {
                                    fontSize: '30',
                                    fontWeight: 'bold'
                                }
                            }
                        },
                        labelLine: {
                            normal: {
                                show: false
                            }
                        },
                        data: taskDatas
                    }
                ]
            };
            userTaskChart.setOption(userTaskChartOpt);
            this.setState({ userMoneyDataLoading: false });
        });
    }

    userMessage(pageNo) {
        if(pageNo === 1){
            this.setState({ userMessageLoading: true });
        }else{
            this.setState({userMessageMoreLoading:true});
        }
        getMessageByUser(pageNo, (res) => {
            if(res.err){
                return false;
            }
            if (res.page === 1) {
                this.setState({ userMessageList: res.list });
            } else {
                const { userMessageList } = this.state;
                res.list.map((item) => {
                    if (userMessageList.filter(val => val.id === item.id).length === 0) {
                        userMessageList.push(item);
                    }
                });
                this.setState({ userMessageList: userMessageList });
            }
            this.setState({ userMessageNowPage: res.page, userMessageLastPage: res.last });
            this.setState({ userMessageLoading: false, userMessageMoreLoading: false });
        });
    }

    messageScroll(e) {
        const { userMessageLastPage, userMessageNowPage } = this.state;
        const isOnbottom = listScroll(e);
        if (isOnbottom && userMessageNowPage < userMessageLastPage) {
            this.userMessage(userMessageNowPage + 1);
        }
    }

    scrollOnBottom(e) {
        const isOnButtom = listScroll(e);
        const { projectListAllPage, projectListNowPage } = this.state;
        if(isOnButtom && projectListNowPage<projectListAllPage) {
            this.getProjectList(projectListNowPage+1);
        }
    }

    render() {
        const { userBusData, user,moneyEndShow, userTaskChartText,userMoneyText, userMessageMoreLoading,projectListMoreLoading,projectSelecteds,projectListLoading, userBusLoading,projectListNowPage,projectListAllPage, userMessageLastPage,projectList,userMoneyDataDate, userTaskDataDate, userMessageNowPage, userTaskDataLoading, userMoneyDataLoading, userMessageLoading, userMessageList } = this.state;
        let data={alertTxtIcon:'frown-o'};
        const select_pro_data = []; 
        projectList.map((item,i)=>{
            select_pro_data.push(<Option key={item.id}>{item.proname}</Option>);  
        });
        return (
            <Layout>
                <style dangerouslySetInnerHTML={{ __html: stylesheet }} />
                {moneyEndShow && <MoneyEnd canClosed={false} />}
                <Head />
                <Content className="homePage">
                    <div className="homePage_top">
                        <Spin spinning={userBusLoading} />                        
                        {user.photo?
                            <img className="img" src={user.photo} />
                        :
                            <div className="user">{user.nickname?user.nickname:''}</div>  
                        }          
                        <h1>你好，{user.name?user.name:''}！祝你开心快乐每一天！</h1>
                        <div className="titBox">
                            <div className="min">参与项目</div>
                            <div className="max">{userBusData.projectCount?userBusData.projectCount:0}</div>
                        </div>
                        <div className="line"></div>
                        <div className="titBox">
                            <div className="min">任务数</div>
                            <div className="max">{userBusData.unTask?userBusData.unTask:0}/{userBusData.totalTask?userBusData.totalTask:0}</div>
                        </div>
                        <div className="line"></div>
                        <div className="titBox">
                            <div className="min">绩效统计</div>
                            <div className="max">{userBusData.allConten?userBusData.allConten:0}</div>
                        </div>
                    </div>
                    <div className="homePage_bottom">
                        <div className="homePage_bottom_left">
                            <div className="tit_row" style={{ flex: '0 0 auto' }}><div className="label">通知</div><Icon type="sync" onClick={() => { this.userMessage(1) }} />{/*<a style={{ float: 'right' }}>全部动态</a>*/}</div>
                            <div className="dy_row_box" onScroll={(e) => { this.messageScroll(e) }}>
                                <Spin spinning={userMessageLoading} />
                                {userMessageList && userMessageList.length >0 ?userMessageList.map((item) => {
                                    let content = {};
                                    try {
                                        content = JSON.parse(item.description);
                                    } catch (error) {
                                        content = {'描述':item.description,};
                                    }
                                    let arr=[];
                                    for(var o in content){ 
                                        arr.push(<span style={{display: 'inline-block'}} key={o}> 
                                                    {o == '讨论内容'?<div dangerouslySetInnerHTML={{__html:content[o]}}></div>:<div>{content[o]}</div>}
                                                </span>);
                                    }
                                    return <div className="dy_row" key={item.id}>
                                                <div className="user">{item.createBy.name}</div>
                                                <div className="cont">
                                                    <div className="dyText">{item.subject} <span>{arr[0]}</span></div>
                                                    <p>{item.createDate}</p>
                                                </div>
                                            </div>
                                }):<NullView data={data}/>}
                                {!userMessageMoreLoading && userMessageNowPage < userMessageLastPage ?
                                    <div className="moreLoadingRow">下拉加载更多</div>
                                    : ''}
                                {userMessageMoreLoading ?
                                    <div className="moreLoadingRow"><Icon type="loading" className="loadingIcon" />正在加载中</div>
                                    : ''}
                                {!userMessageMoreLoading && userMessageNowPage === userMessageLastPage ?
                                    <div className="moreLoadingRow">{userMessageList && userMessageList.length >0?'已经到底喽':''}</div>
                                    : ''}
                            </div>
                        </div>
                        <div className="homePage_bottom_right">
                            <div className="topBox">
                                <div className="box">
                                    <div className="tit_row">
                                        <div className="label">我的任务</div>
                                        <RadioGroup value={userTaskDataDate} size="small"
                                            onChange={(e) => { this.userTaskChart(e.target.value) }}
                                        >
                                            <RadioButton value="all">全部</RadioButton>
                                            <RadioButton value="month">本月</RadioButton>
                                            <RadioButton value="week">本周</RadioButton>
                                        </RadioGroup>
                                    </div>
                                    <div className="cont_box">
                                        <Spin spinning={userTaskDataLoading} />
                                        <div className="div" id="userTaskChartBox"></div>
                                        <div className="div" style={{display:'flex',justifyContent:'center',flexDirection:'column'}}>
                                            {userTaskChartText.map((item,i)=>{
                                                return  <div className="li" key={i+'userTaskChartText'}>
                                                            <div className="dian" style={{background:item.color}}></div>
                                                            <div className="charType">{item.type}</div>
                                                            <div className="baifenbi">{item.bfb}</div>
                                                            <div className="dataVal"><b>{item.ywc}</b>/{item.all}</div>
                                                        </div>
                                            })}                                            
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bottomBox">
                                <div className="box">
                                    <div className="tit_row">
                                        <div className="label">我的绩效</div>
                                        <RadioGroup value={userMoneyDataDate} size="small"
                                                    onChange={(e)=>{this.userMoneyData('',e.target.value)}}
                                        >
                                            <RadioButton value="all">全部</RadioButton>
                                            <RadioButton value="month">本月</RadioButton>
                                            <RadioButton value="week">本周</RadioButton>
                                        </RadioGroup>
                                    </div>
                                    <div style={{flex: '0 0 auto',textAlign:'right',padding:'15px',display:'flex'}}>         
                                        { projectListLoading ?
                                            <span style={{margin:'5px 0 0 0',flex:'1',display:'block',textAlign:'left'}}><Icon type="loading" /><span style={{margin:'0 0 0 10px',fontSize:'12px'}}>项目加载中</span></span>
                                        :
                                            <div style={{flex:'1'}}><Select
                                                mode="multiple"
                                                style={{width:'100%', maxWidth:'450px' }}
                                                placeholder="请选择项目"
                                                value={projectSelecteds}
                                                onChange={(val)=>{this.setState({projectSelecteds:val})}}
                                                onPopupScroll={(e)=>{this.scrollOnBottom(e)}}
                                            >
                                                {select_pro_data}
                                                {!projectListMoreLoading && projectListNowPage === projectListAllPage?
                                                    <Option value="disabled" disabled>已经到底喽</Option>
                                                :''}
                                                {!projectListMoreLoading && projectListNowPage < projectListAllPage?
                                                    <Option value="disabled" disabled>下拉加载更多</Option>
                                                :''}
                                            </Select>
                                            </div>
                                        }
                                        <Button style={{flex: '0 0 auto', margin:'0 0 0 7px'}} onClick={()=>{this.userMoneyData()}}>确定</Button>
                                        <Button style={{flex: '0 0 auto', margin:'0 0 0 7px'}} type="dashed" onClick={()=>{this.setState({projectSelecteds:[]});this.userMoneyData([])}}>全部项目</Button>
                                    </div>
                                    <div className="cont_box">
                                        <Spin spinning={userMoneyDataLoading} />
                                        <div className="div" id="userMoneyChartBox"></div>
                                        <div className="div" style={{display:'flex',justifyContent:'center',flexDirection:'column'}}>
                                            {userMoneyText.map((item,i)=>{
                                                return  <div className="li" key={i+'userMoneyText'}>
                                                            <div className="dian" style={{background:item.itemStyle.color}}></div>
                                                            <div className="charType">{item.name}</div>
                                                            <div className="baifenbi">{item.bfb}</div>
                                                            <div className="dataVal">{Math.round(item.value * 100) / 100}</div>
                                                        </div>
                                            })}                                            
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Content>
            </Layout>
        )
    }
}