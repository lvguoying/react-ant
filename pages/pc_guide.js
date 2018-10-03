import React from 'react';
import { Layout,Radio,Input,Icon,Tag,Modal,Button,Checkbox,Row,Col,Dropdown,Menu } from 'antd';
import Router from 'next/router';

import stylesheet from 'styles/views/guide.scss';
import stylesheet1 from 'styles/views/projectDetails.scss';
import stylesheet2 from 'styles/components/header.scss';
import stylesheet3 from '../styles/components/taskDetails.scss';
import TagComponent from '../components/tag';
import TaskTree from '../components/taskTree';
import { guideUpdate } from '../core/service/user.service';

const { Content } = Layout;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
const Search = Input.Search;
const { TextArea } = Input;
const { Header } = Layout;

const treeList= [{
	"projectId": "d61230dedba3429ab882641768a93f3a",
	"parentId": "0",
	"taskId": "ff2e4aa7d69d4903b27bd82890fb2524",
	"name": "产品测试",
	"state": "0",
	"number": "1",
	"tags": [],
	"attention": false,
	"milestone": false,
	"fzr": "高海洋",
	"qrr": "高海洋",
	"endDate": "未设置",
	"endDate_real": "2018-09-02 ",
	"childCount": 1,
	"childSuccess": 0,
	"talkCount": 0,
	"loading": false,
	"labels": []
}];
const menu = (
    <Menu>
        <Menu.Item>
            <a>个人标签管理</a>
        </Menu.Item>
    </Menu>
);

export default class guide extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            nowPage:1,
        }
    }

    componentWillMount() {

    }

    componentDidMount() {

    }

    componentWillUnmount() {    
        this.setState = (state,callback)=>{
            return;
        };  
    }

    createProjectRender(){
        const { nowPage } = this.state;
        return(
            <Modal
                title={"创建项目"}
                maskClosable={true}
                visible={true}
                width={620}
                height={'auto'}  
                onCancel={(e)=>{this.setState({nowPage:nowPage+1})}}              
                footer={
                    [
                        
                        <Button key="back" type="back">取消</Button>,
                        <Button key='submit' type="primary" className="save_button">
                            创建
                            <div className="createDashed" onClick={(e)=>{e.stopPropagation();e.preventDefault();}}></div>
                            <div className="guideAlert guideAlert_top" 
                                 style={{right: '3px',bottom: '36px',width: '240px'}}
                                 onClick={(e)=>{e.stopPropagation();e.preventDefault();}}
                            >
                                <div className="create"></div>
                                填写项目名称等相关信息，就可以创建一个新项目。
                            </div>                            
                        </Button>
                    ]
                }
            >
                <div className="createProModalWrap" onClick={(e)=>{this.setState({nowPage:nowPage+1})}}></div>
                <div style={{width:'80%',float:'left'}}>
                    <div className="projectCreate-list">
                        <span className="title">项目名称</span>
                        <div className="other">
                            <Input placeholder="请输入项目名称" />
                        </div>
                    </div>   
                    <div className="projectCreate-list">
                        <span className="title">项目分类</span>
                        <div className="other">
                            <TagComponent
                                isProjectTypes={true}
                                poverPosition="topLeft"
                                tagSelecteds={[]}
                                tagChangeCallBack={(val) => {}}
                                canEdit={true}
                            />
                        </div>
                    </div>                 
                </div>
                <div style={{width:'20%',float:'left',padding:'0 0 0 15px'}}>
                    <div className="pic_icon">
                        <div className="pic-main" style={{cursor:'no-drop'}}>
                            <svg className="pro-icon" aria-hidden="true">
                                <use xlinkHref="#pro-myfg-1020"></use>
                            </svg>
                        </div>
                    </div>           
                </div> 
                <div className="projectCreate-list">
                    <span className="title">描述</span>
                    <div className="other">
                        <TextArea placeholder="请输入描述" autosize={{ minRows: 2, maxRows: 6 }} size="small" />
                    </div>
                </div>               
                <div>
                    <div className="projectCreate-list">
                        <span className="title">负责人</span>
                        <div className="other">
                            <div className="person-main">
                                <div className="person">
                                    <span>高海洋</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="projectCreate-list">
                        <span className="title">管理员</span>
                        <div className="other">
                            <div className="person-main">
                                <div className="person">
                                    <span>高海洋</span>
                                    <svg aria-hidden="true">
                                        <use xlinkHref="#pro-myfg-yichu"></use>
                                    </svg>
                                </div>
                                <div className="person person-add">
                                    <Icon type="plus" />
                                    <span>添加</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="projectCreate-list">
                        <span className="title">成员</span>
                        <div className="other">
                            <div className="person-main">
                                <div className="person">
                                    <span>高海洋</span>
                                    <svg aria-hidden="true">
                                        <use xlinkHref="#pro-myfg-yichu"></use>
                                    </svg>
                                </div>
                                <div className="person person-add">
                                    <Icon type="plus" />
                                    <span>添加</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="projectCreate-list">
                    <span className="title">可见范围</span>
                    <div className="other">
                        <RadioGroup>
                            <Radio value={1} checked={false}>团队所有人可见</Radio>
                            <Radio value={0} checked={true}>项目成员可见</Radio>
                        </RadioGroup>
                    </div>
                </div>
            </Modal>
        )
    }

    projectDetailsRender(){
        const { nowPage } = this.state; 
        return(
            <Content>
                <style dangerouslySetInnerHTML={{ __html: stylesheet1 }} />
                <div className="opet_projectDetails">    
                    <div className="pro_search">
                        <Button icon="plus-circle-o" type="primary">创建项目</Button>
                        <RadioGroup value={"1"} buttonStyle="solid">
                            <RadioButton value="1">全部</RadioButton>
                            <RadioButton value="2">我参与</RadioButton>
                            <RadioButton value="4">我负责</RadioButton>
                            <RadioButton value="3">我关注</RadioButton>
                        </RadioGroup>
                        <div className="pro-list">
                            <li className="textMore">
                                <div className="pic">
                                    <svg className="pro-icon" aria-hidden="true">
                                        <use xlinkHref="#pro-myfg-1006"></use>
                                    </svg>
                                </div>
                                示例项目
                            </li>
                            <li className="textMore">
                                <div className="pic">
                                    <svg className="pro-icon" aria-hidden="true">
                                        <use xlinkHref="#pro-myfg-1016"></use>
                                    </svg>
                                </div>
                                钉钉的改进要求
                            </li>
                        </div>
                    </div>
                    <div className="pro_cont_top">
                        <h1>
                            <label className="textMore">如何使用蚂蚁分工</label>
                            <span>共计6个任务</span>
                        </h1>       
                        <Icon className="proSet" type="setting" />                                                       
                        <RadioGroup value={"a"}>
                            <RadioButton value="a">任务列表</RadioButton>
                            <RadioButton value="b" style={{position:'relative'}}>
                                任务文件
                                {nowPage===3?
                                    <div className="lineBox" style={{left:'5px',right:'5px'}}></div>
                                :""}
                                {nowPage===3?
                                    <div className="guideLine" style={{top:'42px',height:'50px'}}></div>
                                :''}
                                {nowPage===3?
                                    <div className="guideAlert" style={{width:'230px',top:'100px',right:'0'}}>项目中的任务文件、讨论文件、成果文件，都在这里面。</div>
                                :""}
                            </RadioButton>
                            <RadioButton value="c" style={{position:'relative'}}>
                                数据统计
                                {nowPage===3?
                                    <div className="lineBox" style={{left:'5px',right:'5px'}}></div>
                                :""}
                                {nowPage===3?
                                    <div className="guideLine" style={{top:'41px',height:'150px'}}></div>
                                :''}
                                {nowPage===3?
                                    <div className="guideAlert" style={{width:'220px',top:'200px',right:'0'}}>图表化项目统计，一眼看清项目进展、任务概况。</div>
                                :""}
                            </RadioButton>
                            <RadioButton value="d" style={{position:'relative'}}>
                                甘特图
                                {nowPage===3?
                                    <div className="lineBox" style={{left:'5px',right:'5px'}}></div>
                                :""}
                                {nowPage===3?
                                    <div className="guideLine" style={{top:'41px',height:'250px'}}></div>
                                :''}
                                {nowPage===3?
                                    <div className="guideAlert" style={{width:'220px',top:'300px',right:'0'}}>其他家都没有的甘特图，我们蚂蚁分工有。</div>
                                :""}
                            </RadioButton>
                        </RadioGroup>                                
                    </div>
                    <div className="pro_buts"> 
                        <Button type="primary" icon="plus-circle-o" style={{position:'relative'}}>
                            {nowPage===4?'创建任务':''}
                            {nowPage===5?'创建子任务':''}
                            {/*nowPage==='4' && <div className="lineBox"></div>*/} 
                            {/*nowPage==='4' && <div className="guideLine" style={{top:'43px',height:'10px'}}></div>*/}
                            {nowPage===5 || nowPage===4 ? 
                                <div className="guideAlert guideAlert_top" style={nowPage===5?{width:'210px',top:'48px',left:'0'}:{width:'190px',top:'48px',left:'0'}}>
                                    <div className="jt" style={{left:'41px',right:'auto'}}></div>                           
                                    {nowPage===4?'在当前项目下创建任务':''}
                                    {nowPage===5?'在选中的任务下创建子任务':''}
                                </div>
                            :''}
                        </Button>
                        <Button icon="login">导入任务</Button>
                        <Button icon="logout">导出任务</Button>
                        <Button icon="edit">批量修改</Button>
                        <Checkbox style={{margin:'0 0 0 15px'}} checked={false}>隐藏已完成</Checkbox>
                    </div>
                    <div className="pro_cont">
                        <TaskTree treeList={treeList}
                            checkBoxShow={false}
                            checkedTaskIds={[]}
                            taskOnClickCallBack={(taskId, projectId, parentId, taskname, taskState) => {}}
                            checkingCallBack={(arr) => {}}
                            treeListOnChangeCallBack={(val)=>{}}
                            notCheckIds={[]}
                            hideOkTask={[]}
                        />
                    </div>
                </div>
            </Content>
        )
    }

    headerRender(){ 
        const { nowPage } = this.state;        
        return (
            <Header>
                <style dangerouslySetInnerHTML={{ __html: stylesheet2 }} />
                <Row>
                    <Col span={20}>
                        <div className="ant-dropdown-link">
                            <div className="title">
                                蚂蚁分工
                                <span style={{width:'61px'}}>
                                    专业版
                                    <svg className="pro-icon zuanshi" aria-hidden="true" style={{margin:'0 0 0 5px'}}>
                                        <use xlinkHref={"#pro-myfg-zuanshi"}></use>
                                    </svg>
                                </span>
                            </div>
                        </div>
                        <ul className="header-menu" style={{margin:'15px 0 0 0',height:'35px',lineHeight:'35px'}}>                            
                            <li style={{position:'relative'}}>
                                任务
                                {nowPage===6?
                                    <div className="lineBox" style={{left:'5px',right:'5px'}}></div>
                                :""}
                                {nowPage===6?
                                    <div className="guideLine" style={{top:'50px',height:'135px'}}></div>
                                :''}
                                {nowPage===6?
                                    <div className="guideAlert" style={{width:'220px',top:'185px',right:'0'}}>功能强大的任务列表，助你合理安排每日工作。</div>
                                :""}
                            </li>
                            <li>项目</li>
                            <li style={{position:'relative'}}>
                                动态
                                {nowPage===6?
                                    <div className="lineBox" style={{left:'5px',right:'5px'}}></div>
                                :""}
                                {nowPage===6?
                                    <div className="guideLine" style={{top:'50px',height:'247px'}}></div>
                                :''}
                                {nowPage===6?
                                    <div className="guideAlert" style={{width:'220px',top:'295px',left:'0'}}>
                                        事无巨细的动态列表，团队动态一目了然。         
                                        {/*<div className="guideNext" style={{top:'105px',left:'0'}}
                                            onClick={()=>{this.guideEnd()}}
                                        >马上去操作</div>*/}                                
                                    </div>                                    
                                :""}
                            </li>
                        </ul>
                    </Col>
                    <Col span={4}>
                        <Dropdown overlay={menu}  trigger={['click']}>
                            <div className="setup">
                                <span>设置</span>
                            </div>
                        </Dropdown>
                        <Icon type="bell" className="icon">
                            <div className="msg">5</div>
                        </Icon>
                        <div className="menu_down">
                            <div className="user">张三</div>
                        </div>
                    </Col>
                </Row>
            </Header>
        )
    }

    taskDetailsRender(){
        return (
            <div className="taskDetails">
                <style dangerouslySetInnerHTML={{ __html: stylesheet3 }} />         
                <div className="guideAlert guideAlert_top" style={{width:'210px',top:'201px',left:'15px'}}>
                    <div className="jt" style={{right:'auto',left:'16px'}}></div>
                    对任务进行编辑，文字、图片、文件，统统都可以。
                </div>   
                {/*关闭按钮*/}
                <div className="closeIcon">
                    <Icon type="caret-right" />
                    <div style={{position:'absolute',top:'0',bottom:'0',left:'0',right:'0',background:'rgba(0,0,0,0.4)',zIndex:'1',borderTopLeftRadius:'5px',borderBottomLeftRadius:'5px'}}></div>
                </div>    
                
                {/*讨论小层*/}
                <div className="talkBox">
                    <div className="text">参与讨论</div>
                    <div className="users">						
                        <div className="user add"><Icon type="plus" /></div>
                    </div>
                </div>
                
                {/*面包屑*/}
                <div className="bread">
                    <div className="objName">
                        <span className="textMore">如何使用蚂蚁分工</span>
                        <Icon className="icon" type="right" />
                    </div>
                    <div className="breadList">
                        <span className="taskName textMore">操作说明</span>
                    </div>
                    <div className="more">
                        <Icon className="attention" type="star-o" />
                        <span>关注</span>
                        <Dropdown overlay={menu}
                                placement={"bottomRight"}
                        >
                            <a className="ant-dropdown-link" href="#">								
                                <Icon type="down" style={{margin:'2px 3px 0 6px'}} />
                                更多
                            </a>
                        </Dropdown>
                    </div>
                </div>
                {/*标题*/}
                <div className="title" style={{ top: '47px' }}>
                    <div className="left">
                        <div className="tag state_jxz">进行中</div>
                        <div className="No textMore">
                            1.23
                        </div>
                        <div className="titTxt">
                            <div className="show textMore">产品测试</div>
                        </div>
                    </div>
                    <div className="right">
                        <Button size="large" type="primary">标记完成</Button>
                    </div>
                </div>
                <div className="taskDetailsScroll">
                    <div className="taskContBox">
                        <div className="taskCont">
                            <div>该任务未填写描述</div>
                            <ul className="accessory">
                                {/*<li>
                                    <Icon type="paper-clip" className="icon" />
                                    <span className="textMore">使用说明.png</span>
                                    <a><Icon type="download" className="downLoad" /></a>
                                </li>*/}
                            </ul>
                        </div>
                    </div>
                    {/*任务要求细节*/}
                    <ul className="bottomDetail">
                        <li className="tagList">
                            <i className="icon iconfont icon-biaoqian1 icon"></i>
                            <div className="tit">标签</div>
                            <div className="valBox" style={{ margin: '0', padding: '0 10px 0 0' }}>
                                <TagComponent tagSelecteds={[]}
                                    canAdd={true}
                                    canEdit={true}
                                    tagChangeCallBack={(val) => {}}
                                    maxHeight='200px'
                                />
                            </div>
                        </li>
                        <li>
                            <i className="icon iconfont icon-fuzeren1 icon"></i>
                            <div className="tit">负责人</div>
                            <div className="valBox">
                                <span className="val textMore" style={{ flex: '0 0 auto' }}>
                                    高海洋
                                </span>
                                <Icon type="close-circle" className="close" />
                                <div className="selUser" style={{ flex: '1', textAlign: 'right' }}>
                                    <i className="icon iconfont icon-chengyuan1 valIcon selUserIcon-show"></i>
                                </div>
                            </div>
                        </li>
                        <li>
                            <i className="icon iconfont icon-shenheren1 icon"></i>
                            <div className="tit">确认人</div>
                            <div className="valBox">
                                <span className="val textMore" style={{ flex: '0 0 auto' }}>
                                    未指派
                                </span>
                                <div className="selUser" style={{ flex: '1', textAlign: 'right' }}>
                                    <i className="icon iconfont icon-chengyuan1 valIcon selUserIcon-show"></i>
                                </div>
                            </div>
                        </li>
                        <li>
                            <i className="icon iconfont icon-riqi1 icon"></i>
                            <div className="tit">
                                截止日期							
                            </div>
                            <div className="valBox"> 
                                <span className="val textMore" style={{ flex: '0 0 auto' }}>
                                    未设置							
                                </span>
                            </div>
                        </li>
                        <li>
                            <i className="icon iconfont icon-renwujixiao icon"></i>
                            <div className="tit">任务绩效</div>
                            <div className="valBox">
                                <span className="val">
                                    <div className="val textMore">
                                        <span>0</span>
                                    </div>
                                </span>
                                <i className="icon iconfont icon-bianji valIcon" ></i>
                            </div>
                        </li>
                        <li>
                            <i className="icon iconfont icon-yujigongqi icon"></i>
                            <div className="tit">计划工期</div>
                            <div className="valBox">
                                <span className="val">
                                    <div className="val textMore">
                                        <span>5</span>
                                    </div>
                                </span>
                                <i className="icon iconfont icon-bianji valIcon" ></i>
                            </div>
                        </li>
                        <li>
                            <i className="icon iconfont icon-zhongyaochengdu icon"></i>
                            <div className="tit">优先级</div>
                            <div className="valBox">
                                <Dropdown overlay={menu}>
                                    <a className="ant-dropdown-link" href="#">
                                        未设定 <Icon type="down" />
                                    </a>
                                </Dropdown>
                            </div>
                        </li>
                        <div style={{ clear: 'both' }}></div>
                    </ul>
                    {/*切换按钮*/}
                    <div className="switch">
                        {/*选项卡切换按钮*/}
                        <div className="buttons">
                            <Button>
                                子任务
                                <span>0/1</span>
                                <div className='img'></div>
                            </Button>
                            <Button>
                                协作任务
                                <span>2</span>
                                <div className='img'></div>
                            </Button>
                            <Button>
                                文件
                                <span>1</span>
                                <div className='img'></div>
                            </Button>
                        </div>
                        {/*动态标题*/}
                        <div className="discuss">
                            <div className="disIcon">
                            <i className="icon iconfont icon-discuss"></i>
                            </div>
                            <div className="tit">讨论动态</div>
                            <div className="check">
                                <Checkbox checked={true}>
                                    显示日志
                                </Checkbox>
                            </div>
                        </div>
                        {/*动态列表*/}
                        <ul className="disList">
                            <li>
                                <Icon type="caret-right" />
                                <label>2018-09-04 12:52:00</label>
                                <span>高海洋 创建了任务</span>
                            </li>
                            <li>
                                <Icon type="caret-right" />
                                <label>2018-09-05 15:00:18</label>
                                <span>高海洋 标记完成了前序任务：前序产品测试</span>
                            </li>
                            {/*<li className="chat">
                                <div className="photo">
                                    <label>雨薇</label>
                                </div>
                                <div className="cont">
                                    <div className="top">
                                        林雨薇
                                        {'   '}
                                        {'2018-02-04 13:22:05'}
                                        <i className="icon iconfont icon-discuss"></i>
                                    </div>
                                    <div className="bottom">
                                        这个功能蛮简单的。
                                    </div>
                                </div>
                            </li>*/}
                        </ul>
                    </div>
                </div>
            </div>
        )
    }

    guideEnd(){ 
        guideUpdate((data)=>{
            Router.push('/pc_task');
        })
    }

    render(){
        const { nowPage } = this.state; 
        return(
            <Layout>
                <style dangerouslySetInnerHTML={{ __html: stylesheet }} />
                <div className="guideBlack" onClick={()=>{if(nowPage===6){this.guideEnd()}else{this.setState({nowPage:nowPage+1})}}}></div>
                <div className="guideEndTxt" style={{top:'15px',right:'163px'}} onClick={()=>{Router.push('/pc_task')}}>关闭引导</div>
                {this.headerRender()}
                {nowPage===3 || nowPage===4 ||  nowPage===5 || nowPage===6?
                    this.projectDetailsRender()
                :''}
                {nowPage===5?
                    <div style={{width:'45%',top:'65px',bottom:'0',position:'fixed',right:'0',boxShadow:'0 0 5px #ccc',minWidth:'600px',background:'#fff',zIndex:'10005'}}>
                        {this.taskDetailsRender()}
                        <div style={{position:'absolute',top:'0',bottom:'0',left:'0',right:'0',background:'rgba(0,0,0,0.4)',zIndex:'1'}} onClick={(e)=>{this.setState({nowPage:nowPage+1})}}></div>
                    </div>
                :''}  
                {nowPage===5?
                    <div className="guideAlert guideAlert_top" style={{width:'165px',top:'112px',right:'59px'}}>
                        <div className="jt"></div>
                        重要的任务记得关注
                    </div>
                :''}         
                {nowPage===1 | nowPage===2?
                    <Content className="project">
                        {nowPage===2 && 
                            this.createProjectRender()
                        }  
                        <div className="project-filter">
                            <div className="switchRow">
                                <RadioGroup defaultValue={'3'} >
                                    <RadioButton value="1">所有项目</RadioButton>
                                    <RadioButton value="2">我参与的</RadioButton>
                                    <RadioButton value="4">我负责的</RadioButton>
                                    <RadioButton value="3">我关注的</RadioButton>
                                </RadioGroup>              
                                <Icon type="up-circle-o"/>
                                <Search
                                    placeholder="项目搜索"
                                    style={{ width: 200, margin:'3px 15px 0 0', float:'right' }}
                                />
                            </div>
                            <div className="project-filter-item">
                                <div className="title textMore">项目类型</div>
                                <div className="ct">
                                    <Tag className="tag_all03_75ccff">开发迭代</Tag>
                                    <Tag className="tag_all03_75ccff">运营推广</Tag>
                                    <Tag className="tag_all03_75ccff">钉钉衔接</Tag>
                                </div>
                            </div> 
                            <div className="project-filter-item">
                                <div className="title textMore">进展阶段</div>
                                <div className="ct">
                                    <Tag className="tag_all04_89c997">进行中</Tag>
                                    <Tag className="tag_all04_89c997">已完结</Tag>
                                    <Tag className="tag_all04_89c997">筹备中</Tag>
                                </div>
                            </div> 
                            <div className="project-filter-item">
                                <div className="title textMore">责任部门</div>
                                <div className="ct">
                                    <Tag className="tag_all05_c8c4fc">技术</Tag>
                                    <Tag className="tag_all05_c8c4fc">运营</Tag>
                                    <Tag className="tag_all05_c8c4fc">产品</Tag>
                                    <Tag className="tag_all05_c8c4fc">后勤</Tag>
                                </div>
                            </div>         
                        </div>
                        <div className="project-main">
                            <div className="project-main-ct" >
                                <div className="project-card">
                                    <div className="card card-add" style={{position:'relative'}}>
                                        {nowPage===1 &&
                                            <div className="item" style={{left:'0',right:'15px',position:'absolute',zIndex:'10001',background:'none',border:'2px dashed #fff'}}>
                                                <div className="guideAlert guideAlert_right" style={{right:'-178px',top:'72px'}}><div className="jt"></div>开始创建一个项目</div>
                                            </div>
                                        }
                                        <div className="item">
                                            <Icon type="plus-circle-o" /> 
                                            <p>创建项目</p>
                                        </div>
                                    </div>                                
                                </div>
                            </div>
                        </div>
                    </Content>
                :''}
            </Layout>
        )
    }
}