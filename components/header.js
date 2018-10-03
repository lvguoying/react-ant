import React from 'react';
import { Layout, Row, Col, Dropdown, Icon, Menu, Button } from 'antd';
import Router from 'next/router';
import NProgress from 'nprogress';

import stylesheet from 'styles/components/header.scss';
import Message from '../components/message';
import TaskCreate from '../components/taskCreate';
import { getMessageCount } from '../core/service/message.service';
import Storage from '../core/utils/storage';
import Feedback from './feedback';
import TagManage from './tagManage';
import MoneyEnd from '../components/moneyEnd';
import { getTeamInfoWithMoney } from '../core/utils/util';
import VersionUpdate from '../components/versionUpdate';

Router.onRouteChangeStart = (url) => {
    NProgress.start()
}
Router.onRouteChangeComplete = () => NProgress.done()
Router.onRouteChangeError = () => NProgress.done()

const { Header } = Layout;

/*
 * （选填）menuShow：false         // 顶部菜单小图标是否显示
 * （选填）menuClickCallBack(val)  // 点击对应菜单的回调
 * （选填）iconOnClickCallBack()   // 点击顶部小图标的回调
 */

export default class Head extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            act: '/home',
            menuShow: false,
            messageShow: false,
            createShow: false,
            messageCount:0,
            user:{},
            isAysc:'',
            feedShow:false,    //意见反馈弹框是否显示
            projectManage:false, //项目分类管理是否显示
            publicManage:false,
            personManage:false,

            teamMoneyEnd:false,
            versionAlert:false,
            versionUpdateShow:false,
        }
    }

    componentWillMount() {
        this.getMsgCount();
        const user = Storage.get('user');  
        this.setState({ user: user });
    }

    componentDidMount() {
        const that = this;
        window.addEventListener('resize', (e)=>{
            if(document.documentElement.clientWidth>1250){
                that.setState({menuShow:false});
            }
        });

        this.menuAct();
    }

    componentWillReceiveProps() {
        this.menuAct();
    }

    componentWillUnmount() {    
        this.setState = (state,callback)=>{
            return;
        };  
    }

    menuAct() {
        const url = Router.router.pathname;
        this.setState({ act: url });
    }

    getMsgCount() {
        getMessageCount((res) => {
            if(res.err){
                return false;
            }
            this.setState({ messageCount: res.messageCount,isAysc:res.tiem?res.tiem.isAdmin:''});
        });
    }

    menuSwitch() {
        const { act } = this.state;
        if (act.indexOf('/pc_task') !== -1) {
            if (this.state.menuShow) {
                this.setState({ menuShow: false });
            } else {
                this.setState({ menuShow: true });
            }
        } else if (act.indexOf('/pc_projectDetails') !== -1) {
            this.props.iconOnClickCallBack();
        }else if(act.indexOf('/pc_dynamicNew') !== -1){
            this.props.iconOnClickCallBack();
        }
    }

    render() {
        const { act,menuShow ,messageShow,user,createShow,messageCount,feedShow,projectManage,publicManage,personManage,versionAlert,isAysc,versionUpdateShow,teamMoneyEnd} = this.state;
        const menu = (
            <Menu>
                {isAysc == '1'?
                <Menu.Item>
                    {getTeamInfoWithMoney('是否可用') ? 
                        <a onClick={()=>{this.setState({projectManage:true})}}>
                            {getTeamInfoWithMoney('版本名称')!=='专业版'?
                                <svg className="pro-icon zuanshi" aria-hidden="true">
                                    <use xlinkHref={"#pro-myfg-zuanshi"}></use>
                                </svg>
                            :''}
                            项目分类管理
                        </a>
                        :
                        <a onClick={() => { this.setState({versionAlert:true}) }}>
                            <svg className="pro-icon zuanshi" aria-hidden="true">
                                <use xlinkHref={"#pro-myfg-zuanshi"}></use>
                            </svg>
                            项目分类管理
                        </a>
                    }
                </Menu.Item>
                :''}
                {isAysc == '1'?
                <Menu.Item>
                    {getTeamInfoWithMoney('是否可用') ? 
                        <a onClick={()=>{this.setState({publicManage:true})}}>
                            {getTeamInfoWithMoney('版本名称')!=='专业版'?
                                <svg className="pro-icon zuanshi" aria-hidden="true">
                                    <use xlinkHref={"#pro-myfg-zuanshi"}></use>
                                </svg>
                            :''}
                            公共标签管理
                        </a>
                        :
                        <a onClick={() => { this.setState({versionAlert:true}) }}>
                            <svg className="pro-icon zuanshi" aria-hidden="true">
                                <use xlinkHref={"#pro-myfg-zuanshi"}></use>
                            </svg>
                            公共标签管理
                        </a>
                    }
                </Menu.Item>
                :''}
                <Menu.Item>
                    <a onClick={()=>{this.setState({personManage:true})}}>个人标签管理</a>
                </Menu.Item>
                <Menu.Item>
                    <a onClick={()=>{this.setState({feedShow:true});}}>联系服务商</a>
                </Menu.Item>
                <Menu.Item>
                    <a onClick={()=>{Router.push('/pc_guide')}}>功能引导</a>
                </Menu.Item>                
                <Menu.Item>
                    <a onClick={()=>{Router.push('/pc_help');}}>帮助中心</a>
                </Menu.Item>
                <Menu.Item>
                    <a onClick={()=>{this.setState({versionUpdateShow:true})}}>版本说明</a>
                </Menu.Item>
            </Menu>
        );
        let { selectKey } = this.props;
        if (selectKey === '') {
            selectKey = 'all';
        }
        return (
            <div>
                <style dangerouslySetInnerHTML={{ __html: stylesheet }} />
                <Header>
                    {versionUpdateShow? <VersionUpdate closeCallBack={()=>{this.setState({versionUpdateShow:false})}} /> : ''}
                    {createShow ? <TaskCreate closedCallBack={()=>{this.setState({createShow:false})}}/> : ''}
                    {teamMoneyEnd && <MoneyEnd alertText={getTeamInfoWithMoney('续费提示')} closeCallBack={()=>{this.setState({teamMoneyEnd:false})}} />}
                    {versionAlert && <MoneyEnd alertText={getTeamInfoWithMoney('专业版提示')} closeCallBack={()=>{this.setState({versionAlert:false})}} />}
                    <Row>
                        <Col span={20}>
                            {act.indexOf('/pc_task') !== -1 || act.indexOf('/pc_projectDetails') !== -1 || act.indexOf('/pc_dynamicNew') !== -1?
                                <Icon type="menu-unfold" className="barIcon" onClick={() => { this.menuSwitch() }} />
                                : ''}
                            {menuShow ?
                                <div className="listMenuBox" onClick={() => { this.setState({ menuShow: false }) }}>
                                    <ul className="listMenu">
                                        <li>
                                            <div className="tit"><Icon type="mail" /><span>我的任务</span></div>
                                            <ul>
                                                <li className={selectKey === 'sub1' ? 'act' : ''} onClick={() => { this.props.menuClickCallBack('sub1') }}>我负责的</li>
                                                <li className={selectKey === 'my_add' ? 'act' : ''} onClick={() => { this.props.menuClickCallBack('my_add') }}>我创建的</li>
                                                <li className={selectKey === 'my_be' ? 'act' : ''} onClick={() => { this.props.menuClickCallBack('my_be') }}>我指派的</li>
                                                <li className={selectKey === 'my_succeed' ? 'act' : ''} onClick={() => { this.props.menuClickCallBack('my_succeed') }}>我确认的</li>
                                                <li className={selectKey === 'my_attention' ? 'act' : ''} onClick={() => { this.props.menuClickCallBack('my_attention') }}>我关注的</li>
                                            </ul>
                                        </li>
                                        <li className={selectKey === 'all' ? 'act' : ''}>
                                            {getTeamInfoWithMoney('是否可用') && 
                                                <div onClick={() => { this.props.menuClickCallBack('all') }} className="tit">
                                                    {getTeamInfoWithMoney('版本名称')==='专业版'?
                                                        <Icon type="mail" />
                                                    :''}
                                                    {getTeamInfoWithMoney('版本名称')!=='专业版'?
                                                        <svg className="pro-icon zuanshi" aria-hidden="true">
                                                            <use xlinkHref={"#pro-myfg-zuanshi"}></use>
                                                        </svg>
                                                    :''}
                                                    <span>全部任务</span>
                                                </div>
                                            }
                                            {!getTeamInfoWithMoney('是否可用') && 
                                                <div onClick={() => { this.setState({versionAlert:true}) }} className="tit">
                                                    <svg className="pro-icon zuanshi" aria-hidden="true">
                                                        <use xlinkHref={"#pro-myfg-zuanshi"}></use>
                                                    </svg>
                                                    <span>全部任务</span>
                                                </div>
                                            }
                                        </li>
                                        <div className="butBox">
                                            <Button type="primary" onClick={() => { this.setState({ createShow: true }) }}>创建任务</Button>
                                        </div>
                                    </ul>
                                </div>
                                : ''}
                            <div className="ant-dropdown-link">
                                <div className="title">
                                    蚂蚁分工
                                    <span style={getTeamInfoWithMoney('版本名称') === '专业版'?{width:'80px'}:(getTeamInfoWithMoney('版本名称') === '试用版'?{minWidth:'110px'}:{})}>
                                        {getTeamInfoWithMoney('版本名称')==='试用版'?
                                            '专业版'
                                        :getTeamInfoWithMoney('版本名称')}
                                        {getTeamInfoWithMoney('版本名称') !== '基础版'?
                                            <svg className="pro-icon zuanshi" aria-hidden="true" style={{margin:'0 5px 0 5px'}}>
                                                <use xlinkHref={"#pro-myfg-zuanshi"}></use>
                                            </svg>
                                        :""}
                                        {getTeamInfoWithMoney('版本名称')=== '试用版'?
                                            '试用'
                                        :''}
                                    </span>
                                </div>
                                {getTeamInfoWithMoney('版本名称') === '试用版' || (getTeamInfoWithMoney('版本名称') !== '试用版' && getTeamInfoWithMoney('剩余天数') < 16) ?
                                    <div className="p">
                                        剩余<span>{getTeamInfoWithMoney('剩余天数')<0?0:getTeamInfoWithMoney('剩余天数')}</span>天
                                    </div>
                                :''}
                                {getTeamInfoWithMoney('版本名称') === '试用版' || (getTeamInfoWithMoney('版本名称') !== '试用版' && getTeamInfoWithMoney('剩余天数') < 16) ?
                                    <div className="xfBtn" 
                                        //  style={getTeamInfoWithMoney('版本名称')==='试用版'?{margin:'0 0 0 37px'}:{}}
                                         onClick={()=>{this.setState({teamMoneyEnd:true})}}>续费/升级</div>
                                :''}
                            </div>
                            <ul className="header-menu">
                                {/*<li className={act.indexOf('/pc_home') !== -1 ? 'act' : ''} onClick={() => { Router.push('/pc_home') }}>首页</li>*/}
                                <li className={act.indexOf('/pc_task') !== -1 ? 'act' : ''} onClick={() => { Router.push('/pc_task') }}>任务</li>
                                <li className={act.indexOf('/pc_project') !== -1 ? 'act' : ''} onClick={() => { Router.push('/pc_project') }}>项目</li>
                                <li className={act.indexOf('/pc_dynamicNew') !== -1 ? 'act' : ''} onClick={() => { Router.push('/pc_dynamicNew') }}>动态</li>
                            </ul>
                        </Col>
                        <Col span={4}>
                            <Dropdown overlay={menu} trigger={['click']}>
                                <div className="setup">
                                    <span>设置</span>
                                </div>
                            </Dropdown>
                            <Icon type="bell" className="icon" onClick={() => { this.setState({ messageShow: true }) }}>
                                {messageCount>0?<div className="msg">{messageCount>99?'99+':messageCount}</div>:''}
                            </Icon>
                            <div className="menu_down">
                                {user.photo ?
                                    <img className="img" src={user.photo} />
                                    :
                                    <div className="user">{user.nickname}</div>
                                }
                            </div>
                        </Col>
                        {messageShow ?
                            <Message closeCallBack={() => { this.setState({ messageShow: false }) }} messageCountOnChange={(val) => { this.setState({ messageCount: val });}} />
                            : ''}
                        {feedShow?
                            <Feedback feedbackShow={feedShow} closeCallBack={()=>{this.setState({feedShow:false})}}/>
                        :''}
                        {projectManage?
                            <TagManage type='3' title="项目分类管理" closedCallBack={()=>{this.setState({projectManage:false})}}/>
                        :''}
                        {publicManage?
                            <TagManage type='2' title="公共标签管理" closedCallBack={()=>{this.setState({publicManage:false})}}/>
                        :''}
                        {personManage?
                            <TagManage type='1' title="个人标签管理" closedCallBack={()=>{this.setState({personManage:false})}}/>
                        :''}
                    </Row>
                </Header>
            </div>
        )
    }
}