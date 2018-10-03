import React from 'react'
import { Modal, Input, Radio, Icon, message, Button, Popover } from 'antd'

import stylesheet from 'styles/components/projectCreate.scss';
import { createProject, getProjectCreateInfoById, deleteProject } from '../core/service/project.service';
import {getByteLen} from '../core/utils/util'
import TagComponent from '../components/tag';
import dingJS from '../core/utils/dingJSApi';
import Storage from '../core/utils/storage';
const { TextArea } = Input;

const RadioGroup = Radio.Group;
const confirm = Modal.confirm;

const iconList = ['1000', '1001', '1002', '1003', '1004', '1005', '1006', '1007', '1008', '1009',
    '1010', '1011', '1012', '1013', '1014', '1015', '1016', '1017', '1018', '1019', '1020'
]

/*
 * （选填） projectId:''                                          // 如果没传，就是新创建项目，如果传了，就是项目设置
 * （必填） updateOkCallback({id:'',name:'',icon:'',fzrName:''})  // 提交成功之后回调函数，返回项目数据
 * （必填） closedCallBack()                                      // 关闭回调
 */

export default class projectCreate extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            projectCreateInfo: {
                category: '0',
                id: '',
                memberofpros: [],
                opentype: '0',
                proname: '',
                proremark: '',
                attstr04: '#pro-myfg-1020',//项目图标
                labelIds: [],//[id,id] 项目分类id集合(数组)
            },
            proSelectedTags: [],
            showMore:true,
            projectId: '',
            projectPicShow: true,
            jurisdiction:false,
            svnGroupShow:false,
            saveLoading:false,
            proNameLength:0,
            proDescLength:0,
        }
    }

    componentWillMount() {
        if (this.props.projectId) {
            this.setState({ projectId: this.props.projectId });
            this.getProjectCreateInfo(this.props.projectId);
        }else{
            const user = Storage.get('user');
            let { projectCreateInfo } = this.state;
            projectCreateInfo.memberofpros = [{
                user: user,
                rtype: '2'
            }, {
                user: user,
                rtype: '1'
            }, {
                user: user,
                rtype: '0'
            }]
            this.setState({ projectCreateInfo: projectCreateInfo });
            this.setState({jurisdiction:true});
        }
    }

    componentWillReceiveProps(nextProps) {
    }

    componentWillUnmount() {
        this.setState = (state,callback)=>{
            return;
        };  
    }

    moreShow() {
        let { showMore } = this.state;
        this.setState({ showMore: !showMore });
    }

    projectUpate(e, type) {
        this.setState({svnGroupShow:false});
        const { projectCreateInfo ,proNameLength,proDescLength} = this.state;
        if (type === 'opentype') {
            projectCreateInfo.opentype = e.target.value;
        }
        if (type === 'proname') {
            projectCreateInfo.proname = e.target.value;
            let proNameLength = getByteLen(e.target.value.slice(0,30));
            this.setState({proNameLength:proNameLength});
        }
        if (type === 'proremark') {
            projectCreateInfo.proremark = e.target.value;
            let proDescLength =getByteLen(e.target.value.slice(0,200));
            this.setState({proDescLength:proDescLength});
        }
        this.setState({ projectCreateInfo: projectCreateInfo }); 
        if (type === 'handleOk') {
            this.setState({saveLoading:true});
            createProject(projectCreateInfo, (data) => {
                if(data.err){
                    this.setState({saveLoading:false}); 
                    return false;
                }
                const { projectId } = this.state;
                if (projectId === '') {
                    message.success('创建成功！');
                    this.props.updateOkCallback('刷新');
                } else {
                    message.success('保存成功！'); 
                    const pro = {
                        'id': projectCreateInfo.id,
                        'proname': projectCreateInfo.proname,
                        'attstr04': projectCreateInfo.attstr04,
                        'tags': this.state.proSelectedTags
                    }
                    this.props.updateOkCallback(pro);                    
                }
                this.props.closedCallBack();
                this.setState({saveLoading:false});                
            });
        }
    }

    getProjectCreateInfo(id) { 
        let { projectCreateInfo } = this.state;
        getProjectCreateInfoById(id, (data) => {
            if(data.err){
                return false;
            }
            if (data) {
                projectCreateInfo.id = id;
                projectCreateInfo.proname = data.ant.proname;
                projectCreateInfo.proremark = data.ant.proremark;
                if (data.ant.attstr04 === '' || data.ant.attstr04 === undefined) {
                    projectCreateInfo.attstr04 = '#pro-myfg-1000';
                } else {
                    projectCreateInfo.attstr04 = data.ant.attstr04;
                }
                projectCreateInfo.opentype = data.ant.opentype;
                data.label.map((item, index) => {
                    if(item.label){
                        projectCreateInfo.labelIds.push(item.label.id);
                    }
                });
                // setUpButton 权限
                if (data.ant.setUpButton) {
                    this.setState({ jurisdiction: true });
                } else {
                    this.setState({ jurisdiction: false });
                }
                projectCreateInfo.memberofpros = data.users;

                const proSelectedTags = [];
                data.label.map((item) => {
                    proSelectedTags.push({
                        'id': item.label.id,
                        'name': item.label.labelname,
                        'type': '2',
                        'color': item.label.color
                    });
                });
                this.setState({ projectCreateInfo: projectCreateInfo, proSelectedTags: proSelectedTags });
            }
        })
    }

    onChoosePic(val) {
        const { projectCreateInfo } = this.state;
        projectCreateInfo.attstr04 = val;
        this.setState({ projectCreateInfo: projectCreateInfo,svnGroupShow:false });
    }

    selUser(type, title, multiple) { // 0成员 1管理员 2负责人 负责人单选
        title = '请选择' + title;
        let { projectCreateInfo } = this.state;
        let selectUsers = [];
        let oldSelectUserIds = [];
        projectCreateInfo.memberofpros.map((item, i) => {
            if (item.rtype === type && item.delete != '1') {
                selectUsers.push(item.user);
                oldSelectUserIds.push(item.user.userid);
            }
        });
        console.log('本来选中的人:',selectUsers);
        const that = this;
        dingJS.selectUser(selectUsers, title, (users) => {
            if (users && users.length > 0) {
                if(type == '2'){
                    projectCreateInfo.memberofpros.map((item,i)=>{
                        if(item.rtype == '2'){
                            let bb = true;
                            if(item.user.userid == users[0].emplId){
                                item.user = {
                                    'userid':users[0].emplId,
                                    'name':users[0].name
                                };
                                bb = false;
                            }else{
                                item.delete = '1';
                            }
                            if(bb){
                                item.user = {
                                    'userid':users[0].emplId,
                                    'name':users[0].name
                                };
                            }
                            that.setState({projectCreateInfo:projectCreateInfo});
                            return false;
                        }
                    });
                }else{
                    let selectUserIds = []
                    if(users && users.length > 0){
                        console.log(oldSelectUserIds,'oldSelectUserIds');
                        users.map((item)=>{
                            selectUserIds.push(item.emplId);
                            if(oldSelectUserIds.indexOf(item.emplId)===-1){
                                projectCreateInfo.memberofpros.push({
                                    'user':{
                                        'userid':item.emplId,
                                        'name':item.name
                                    },
                                    'rtype':type
                                })
                                console.log(item,'添加的user');
                            } else{
                                projectCreateInfo.memberofpros.map((it)=>{
                                    if(it.userid == item.emplId && type == it.rtype &&  it.delete == '1'){
                                        it.delete = '';
                                        console.log(it,'删除后添加的user');
                                    }                      
                                });
                            }
                        })
                    }
                    console.log(selectUserIds,'selectUserIds');
                    projectCreateInfo.memberofpros.map((item)=>{
                        if(selectUserIds.indexOf(item.user.userid) ==-1 && type == item.rtype){
                            item.delete = '1';
                            console.log(item,'要删除的user');
                        }                      
                    });
                    that.setState({projectCreateInfo:projectCreateInfo});
                }
            }
        }, multiple)
    }

    editDel(id, rtype) {
        let { projectCreateInfo } = this.state;
        projectCreateInfo.memberofpros.map((item) => {
            if (item.user.userid === id && item.rtype === rtype) {
                item.delete = '1';
                return false;
            }
        });
        this.setState({ projectCreateInfo: projectCreateInfo });

    }

    getProTag(val) {
        const { projectCreateInfo } = this.state;
        this.setState({ proSelectedTags: val });
        let lab = val.map((item, i) => {
            return (
                item.id
            )
        })
        projectCreateInfo.labelIds = lab;
        this.setState({ projectCreateInfo: projectCreateInfo });
    }

    dellProject(id){
        this.setState({svnGroupShow:false});
        const that = this;
        confirm({
            title: '您是否确认删除此项目？',
            content: '',
            okText: '确定',
            okType: 'danger',
            cancelText: '取消',
            onOk() {
                deleteProject(id,(data)=>{ 
                    if(data.err){
                        return false;
                    }
                    message.success('删除成功！');
                    that.props.closedCallBack();
                    that.props.updateOkCallback('刷新');
                });
            },
            onCancel() {}
        });
    }
    
    render() {
        const { proSelectedTags, projectCreateInfo, showMore, projectId, projectPicShow,jurisdiction,svnGroupShow,saveLoading,proDescLength, proNameLength} = this.state; 
        const content = (
            <div className="svnGroup">
                {iconList && iconList.length > 0 ? iconList.map((item, i) => {
                    return (
                        <span key={item} onClick={(e) => { this.onChoosePic("#pro-myfg-" + item) }}>
                            <svg className="pro-icon" aria-hidden="true">
                                <use xlinkHref={"#pro-myfg-" + item}></use>
                            </svg>
                        </span>
                    );
                }) : ''}
                {/*<Button type="primary" className="ok" onClick={()=>{this.setState({svnGroupShow:false})}}>确定</Button>*/}
            </div>
        ); 
        return (
            <Modal
                title={projectId ? "项目设置" : "创建项目"}
                maskClosable={false}
                onCancel={() => { this.props.closedCallBack()}}
                visible={true}
                width={620}                
                footer={
                    [
                        (!jurisdiction?'':(projectId?<Button key="delete" disabled={!jurisdiction ?true:false} onClick={()=>{this.dellProject(projectId)}} className="cancelProject">删除该项目</Button>:'')),
                        <Button key="back" type="back" onClick={() => { this.setState({svnGroupShow:false});this.props.closedCallBack() }}>取消</Button>,
                        ( !jurisdiction?'':
                        <Button key='submit' type="primary" 
                                className={projectCreateInfo.proname == '' || !jurisdiction?"save_button":''} 
                                onClick={(e) => this.projectUpate(e, 'handleOk')} disabled={projectCreateInfo.proname == '' || !jurisdiction || saveLoading? true : false}
                        >
                            {saveLoading?<Icon type="loading" />:''}
                            {projectId ? '保存' : '创建'}
                        </Button>)
                    ]
                }
            >
                <style dangerouslySetInnerHTML={{ __html: stylesheet }} />
                <div style={{width:'80%',float:'left'}} onClick={()=>{this.setState({svnGroupShow:false})}}>
                    <div className="projectCreate-list">
                        <span className="title">项目名称</span>
                        <div className="other proName">
                            <Input placeholder="请输入项目名称" disabled={!jurisdiction} value={projectCreateInfo.proname.slice(0,30)} onChange={(e) => this.projectUpate(e, 'proname')} />
                            <span>{proNameLength}</span>/30
                        </div>
                    </div>   
                    <div className="projectCreate-list">
                        <span className="title">项目分类</span>
                        {!jurisdiction?'':
                        <div className="other">
                            <TagComponent
                                isProjectTypes={true}
                                poverPosition="topLeft"
                                tagSelecteds={proSelectedTags}
                                tagChangeCallBack={(val) => { this.setState({ proSelectedTags: val }); this.getProTag(val) }}
                                canEdit={jurisdiction}
                            />
                        </div>
                        }
                    </div>                 
                </div>
                <div style={{width:'20%',float:'left',padding:'0 0 0 15px'}}>
                    <div className="pic_icon">
                        {projectPicShow && jurisdiction ?
                            <Popover content={content} title={<div>请选择图标<Icon type="close" onClick={()=>{this.setState({svnGroupShow:false})}} style={{float:'right',cursor:'pointer',margin:'5px 0 0 0'}} /></div>} 
                                     placement="topLeft" trigger="click" visible={svnGroupShow}
                            >
                                <div className="pic-main" style={{cursor:'pointer'}}>
                                    <svg className="pro-icon" aria-hidden="true" onClick={()=>{this.setState({svnGroupShow:!svnGroupShow})}}>
                                        <use xlinkHref={projectCreateInfo.attstr04}></use>
                                    </svg>
                                    <span>修改</span>
                                </div>
                            </Popover>
                            :
                            <div className="pic-main" style={{cursor:'no-drop'}}>
                                <svg className="pro-icon" aria-hidden="true">
                                    <use xlinkHref={projectCreateInfo.attstr04}></use>
                                </svg>
                            </div>

                        }
                    </div>           
                </div> 
                <div className="projectCreate-list" onClick={()=>{this.setState({svnGroupShow:false})}}>
                    <span className="title">描述</span>
                    <div className="other proDesc">
                        <TextArea placeholder="请输入描述" disabled={!jurisdiction} autosize={{ minRows: 2, maxRows: 6 }} size="small" value={projectCreateInfo.proremark.slice(0,200)} onChange={(e) => this.projectUpate(e, 'proremark')} />
                        <div>
                            <span>{proDescLength}</span>/200
                        </div> 
                    </div>
                </div>               
                {showMore ?
                    <div onClick={()=>{this.setState({svnGroupShow:false})}}>
                        <div className="projectCreate-list">
                            <span className="title">负责人</span>
                            <div className="other">
                                <div className="person-main">
                                    {
                                        projectCreateInfo.memberofpros.map((item) => {
                                            if (item.rtype === "2" && item.delete !== '1') {
                                                return (
                                                    <div className="person" key={item.user.userid+'fzr'} onClick={() =>{ if(jurisdiction){ this.selUser('2', '负责人',false)} }}>
                                                        <span>{item.user.name}</span>
                                                    </div>
                                                )
                                            }
                                        })
                                    }
                                </div>
                            </div>
                        </div>
                        <div className="projectCreate-list">
                            <span className="title">管理员</span>
                            <div className="other">
                                <div className="person-main">
                                    {
                                        projectCreateInfo.memberofpros.map((item) => {
                                            if (item.rtype === "1" && item.delete !== '1') {
                                                return (
                                                    <div className="person" key={item.user.userid+'gly'}>
                                                        <span>{item.user.name}</span>
                                                        {jurisdiction && 
                                                            <svg aria-hidden="true" onClick={() => this.editDel(item.user.userid, item.rtype)}>
                                                                <use xlinkHref="#pro-myfg-yichu"></use>
                                                            </svg>
                                                        }
                                                    </div>
                                                )
                                            }
                                        })
                                    }
                                    {jurisdiction && 
                                        <div className="person person-add" onClick={() => this.selUser('1', '管理员', true)}>
                                            <Icon type="plus" />
                                            {/* <span>添加</span> */}
                                        </div>
                                    }
                                </div>
                            </div>
                        </div>
                        <div className="projectCreate-list">
                            <span className="title">成员</span>
                            <div className="other">
                                <div className="person-main">
                                    { 
                                        projectCreateInfo.memberofpros.map((item) => {
                                            if (item.rtype === "0" && item.delete !== '1') { 
                                                return (
                                                    <div className="person" key={item.user.userid+'cy'}>
                                                        <span>{item.user.name}</span>
                                                        {jurisdiction && 
                                                            <svg aria-hidden="true" onClick={() => { this.editDel(item.user.userid, item.rtype) }}>
                                                                <use xlinkHref="#pro-myfg-yichu"></use>
                                                            </svg>
                                                        }
                                                    </div>
                                                )
                                            }
                                        })
                                    }
                                    {jurisdiction &&
                                        <div className="person person-add" onClick={() => this.selUser('0', '成员', true)}>
                                            <Icon type="plus" />
                                            {/* <span>添加</span> */}
                                        </div>
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                    : ''}
                <div className="projectCreate-list" onClick={()=>{this.setState({svnGroupShow:false})}}>
                    <span className="title">可见范围</span>
                    <div className="other">
                        <RadioGroup onChange={(e) => this.projectUpate(e, 'opentype')} disabled={!jurisdiction}>
                            <Radio value={1} checked={projectCreateInfo.opentype == '1' ? true : false}>团队所有人可见</Radio>
                            <Radio value={0} checked={projectCreateInfo.opentype == '0' ? true : false}>项目成员可见</Radio>
                        </RadioGroup>
                    </div>
                </div>
                {/* {showMore ?
                    <div className="moreCon" onClick={() => this.moreShow()}>
                        <span></span>
                        <label>更多<Icon type="up" /></label>
                        <span></span>
                    </div>
                    :
                    <div className="moreCon" onClick={() => this.moreShow()}>
                        <span></span>
                        <label>更多<Icon type="down" /></label>
                        <span></span>
                    </div>
                } */}
            </Modal>
        )
    }
}