import React from 'react'
import { Icon, Button, Select, Checkbox, Input, Cascader, message } from 'antd';

import stylesheet from 'styles/views/tagManage.scss';
import Header from '../components/header'
import NullView from '../components/nullView';
import { getStringTagColor, getTagColorByColorCode } from '../core/utils/util';
import {
    getLabelList,
    addLabel,
    updateLabel,
    updateLabelParent,
    deleteLabel,
    deleteAllLabel,
    addProjectType,
    getProjectTypeList,
    getPersonLabel,
    addPersonLabel,
} from '../core/service/tag.service';
import { Spin } from 'antd';
import ContentEditable from 'react-contenteditable';
/*****
 * type:1      //个人标签
 * type:2      //公共标签
 * type:3      //项目分类
 * *****/
export default class tagManage extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            exitShow: false,         //添加标签分类是否显示
            addsecondShow: false,    //添加二级标签是否显示
            colorList: [],
            tagList: [],
            tagIndex: '0',
            delLabels: [],
            selectColor: '75ccff',
            greateLabelName: "",
            greateLabelTwoName: "",
            leftMenuShow: false,
            parentList: [],
            indexList: [],
            pid: '',
            projectManageLoading: false,
            publicTagLoading: false,
            personTagLoading: false,
            oneEditIndex: null,
            oneLabelOldName: null,
            twoLabelOldName: null,
            oneLabelEditName: null,
            twoLabelEditName: null,
            oneDeleteIconIndex: null,
        }
    }
    componentWillMount() {
        if (this.props.url.query.type == '3') {
            this.getProjectManage();
            this.setState({ leftMenuShow: true });
        } else if (this.props.url.query.type == '2') {
            this.getPublicTag();
            this.setState({ leftMenuShow: true });
        } else if (this.props.url.query.type == '1') {
            this.getPersonLabel();
            this.setState({ leftMenuShow: false });
        }
    }
    componentWillReceiveProps(nextProps) {
        if (nextProps.url.query.type == '3') {
            this.getProjectManage();
            this.setState({ leftMenuShow: true });
        } else if (nextProps.url.query.type == '2') {
            this.getPublicTag();
            this.setState({ leftMenuShow: true });
        } else if (nextProps.url.query.type == '1') {
            this.getPersonLabel();
            this.setState({ leftMenuShow: false });
        }
    }

    componentWillUnmount() {
        this.setState = (state, callback) => {
            return;
        };
    }

    //点击一级标签返回标签id
    labelClick(id) {
        const { tagList } = this.state;
        var that = this;
        for (let i = 0; i < tagList.length; i++) {
            let item = tagList[i];
            if (item.id == id) {
                that.setState({ tagIndex: i });
                break;
            }
        }
        this.setState({ delLabels: [] });
    }
    //点击返回二级标签的下标
    labelClickTwo(id,index){
        const {tagList,indexList,tagIndex,parentList}=this.state;
        var that=this;
        if(this.props.url.query.type == '1'){
            for(let i=0;i<parentList.length;i++){
                let item = parentList[i];
                if(item.id==id){
                    that.setState({labelIndex:i});
                    if(indexList.indexOf(index) !== -1){
                        indexList.splice(indexList.indexOf(index),1);
                    }else{
                        indexList.push(index);
                    }
                    this.setState({indexList:indexList})
                      break;
                }
            }
        }else{
            for(let i=0; i<tagList[tagIndex].parentList.length; i++){
                let item = tagList[tagIndex].parentList[i];
                if(item.id==id){
                  that.setState({labelIndex:i});
                  if(indexList.indexOf(index) !== -1){
                      indexList.splice(indexList.indexOf(index),1);
                  }else{
                      indexList.push(index);
                  }
                  this.setState({indexList:indexList})
                    break;
              }
            }	
        }
  		this.setState({delLabels:[]});
    }
    //获取项目分类
    getProjectManage() {
        this.setState({ projectManageLoading: true });
        getProjectTypeList((data) => {
            if(data.err){
                return false;
            }
            this.setState({ colorList: data.colorList, tagList: data.labels, projectManageLoading: false });
        });
    }
    //获取公共标签
    getPublicTag() {
        this.setState({ publicTagLoading: true });
        getLabelList((data) => {
            if (data.err) {
                return false;
            }
            this.setState({ colorList: data.colorList, tagList: data.labels, publicTagLoading: false });
        });
    }
    //获取个人标签
    getPersonLabel() {
        this.setState({ personTagLoading: true });
        getPersonLabel((data) => {
            if(data.err){
                return false;
            }
            if (data) {
                this.setState({ parentList: data.labels, pid: data.parentId, personTagLoading: false });
            }
        });
    }

    //删除多个标签或批量删除项目分类
    labelsDel() {
        deleteAllLabel(this.state.delLabels, (data) => {
            if(data.err){
                return false;
            }
            if (data) {
                if (this.props.url.query.type == '3') {
                    message.success('操作成功')
                    this.getProjectManage();
                } else if (this.props.url.query.type == '2') {
                    message.success('操作成功')
                    this.getPublicTag();
                } else if (this.props.url.query.type == '1') {
                    message.success('操作成功')
                    this.getPersonLabel();
                }
                this.setState({ delLabels: [], indexList: [] });
            }
        });
    }
    //选择标签
    selectLabel(e, id) {
        const { delLabels } = this.state;
        if (e.target.checked == true) {
            delLabels.push(id);
        } else {
            for (let i in delLabels) {
                if (delLabels[i] == id) {
                    delLabels.splice(i, 1);
                    break;
                }
            }
        }
        this.setState({ delLabels: delLabels });
    }
    labelDelete(e, id) {
        //删除标签或删除项目分类
        e.stopPropagation();
        e.preventDefault();
        deleteLabel(id, (data) => {
            if(data.err){
                return false;
            }
            if (data) {
                message.success('操作成功')
                this.setState({ delLabels: [] })
            }
            if (this.props.url.query.type == '3') {
                this.getProjectManage();
            } else if (this.props.url.query.type == '2') {
                this.getPublicTag();
            } else if (this.props.url.query.type == '1') {
                this.getPersonLabel();
            }
        });
    }
    //移动父标签
    onChangeLabelParent(time, item) {
        let parentId = time[0];
        if (item.parent.id != parentId) {
            updateLabelParent(item.id, parentId, (data) => {
                if(data.err){
                    return false;
                }
                if (data) {
                    message.success('移动成功');
                    this.setState({ tagList: data.labels });
                    if (this.props.url.query.type == '3') {
                        this.getProjectManage();
                    } else {
                        this.getPublicTag();
                    }
                }
            });
        }
    }
    //添加标签
    submitLabel(e, tag) {
        e.stopPropagation();
        e.preventDefault();
        const { tagList, selectColor, tagIndex, greateLabelName, greateLabelTwoName } = this.state;
        if (tag == "一级" && greateLabelTwoName && greateLabelTwoName.length > 16) {
            message.error("一级标签长度不能大于16个字符");
            return;
        }
        if (tag == "二级" && greateLabelName && greateLabelName.length > 16) {
            message.error("二级标签长度不能大于16个字符");
            return;
        }

        if (tag == "一级") {
            let name = greateLabelTwoName;
            let data = { labelname: name, color: selectColor };
            if (this.props.url.query.type == '3') {
                addProjectType(data, '', (res) => {
                    if(res.err){
                        return false;
                    }
                    if (res) {
                        message.success('添加成功');
                    }
                    this.getProjectManage();
                });
            } else if (this.props.url.query.type == '2') {
                addLabel(data, '', (res) => {
                    if (res.err) {
                        return false;
                    }
                    if (res) {
                        message.success('添加成功');
                    }
                    this.getPublicTag();
                });
            }
            this.setState({ exitShow: false });
        } else if (tag == "二级") {
            let pid = tagList[tagIndex].id;
            let name = greateLabelName;
            let data = { labelname: name, color: '' };
            if (this.props.url.query.type == '3') {
                addProjectType(data, pid, (res) => {
                    if(res.err){
                        return false;
                    }
                    if (res) {
                        message.success('添加成功');
                    }
                    this.getProjectManage();
                });
            } else if (this.props.url.query.type == '2') {
                addLabel(data, pid, (res) => {
                    if (res.err) {
                        return false;
                    }
                    if (res) {
                        message.success('添加成功');
                    }
                    this.getPublicTag();
                });
            }
            this.setState({ addsecondShow: false });
        }
    }
    //添加个人标签
    addPerson(e) {
        const { pid, greateLabelName } = this.state;
        let name = greateLabelName;
        addPersonLabel(name, pid, (res) => {
            if(res.err){
                return false;
            }
            if (res) {
                message.success('添加成功');
            }
            this.getPersonLabel();
        });
        this.setState({ addsecondShow: false });
    }
    //添加标签方法
    addLabel(e, tag) {
        if (this.props.url.query.type == '1') {
            this.addPerson(e);
        } else {
            this.submitLabel(e, tag);
        }
    }
    //添加二级标签字段
    labelTwo() {
        if (this.props.url.query.type == '3') {
            return <span>添加二级项目分类</span>
        } else if (this.props.url.query.type == '2') {
            return <span>添加公共标签</span>
        } else if (this.props.url.query.type == '1') {
            return <span>添加个人标签</span>
        }
    }

    changeColor(e) {
        this.setState({ selectColor: e });
    }
    //编辑标签颜色
    updateLabelColor(e, mainTag) {
        if (mainTag) {
            updateLabel(mainTag.labelname, mainTag.id, e, (data) => {
                if (data.err) {
                    return false;
                }
                if (data) {
                    message.success("修改成功");
                    if (this.props.url.query.type == '3') {
                        this.getProjectManage();
                    } else if (this.props.url.query.type == '2') {
                        this.getPublicTag();
                    }
                    this.setState({ oneEditIndex: null, twoEditIndex: null, oneLabelEditName: null, twoLabelEditName: null });
                }
            });
        }
    }
    // 编辑标签
    labelEdit(id, name, labNo, color) {
        if (name && name.length > 16) {
            message.error("标签长度不能大于16个字符");
            return;
        }
        if ((labNo == 'one' && (name == this.state.oneLabelOldName || name == null)) || (labNo == 'two' && (name == null || name == this.state.twoLabelOldName))) {
            this.setState({ oneEditIndex: null, twoEditIndex: null, oneLabelEditName: null, twoLabelEditName: null });
        } else {
            updateLabel(name, id, color, (data) => {
                if(data.err){
                    return false;
                }
                message.success("修改成功");
                if (this.props.url.query.type == '3') {
                    this.getProjectManage();
                } else if (this.props.url.query.type == '2') {
                    this.getPublicTag();
                }
                this.setState({ oneEditIndex: null, twoEditIndex: null, oneLabelEditName: null, twoLabelEditName: null });
            });
        }
    }

    handleKeyup(e) {
        const el = e.target;
        let value = el.innerText

        //由于contenteditable属性产生的换行机制问题
        //纯文本模式下，会加Unicode等于10的2位字符，同时由于删减时有时会自动补充
        //所以产生如下判断
        if (e.keyCode == '13')
            value = value.substring(0, value.length - 1);
        if (e.keyCode == '8') {
            if (value.length >= 2) {
                if (value.charCodeAt(value.length - 1) == 10 && value.charCodeAt(value.length - 2) == 10) {
                    value = value.substring(0, value.length - 1);
                }
                else if (value.charCodeAt(value.length - 1) == 10 && value.charCodeAt(value.length - 2) != 10) {
                    value = value.substring(0, value.length - 1);
                }
            }

        }
        //以防万一
        if (value.charCodeAt(0) == 10 && value.length == 1)
            value = "";

    }
    //个人标签
    personLabelRender() {
        const { parentList, tagList, tagIndex, delLabels, indexList } = this.state;
        let data = { alertTxtIcon: 'frown-o' };
        let options = [];
        tagList.map((item, i) => {
            options.push({ value: item.id, label: item.labelname });
        });
        const that = this;
        if (this.props.url.query.type == '1') {
            return <div className="content_bottom">
                <h3>个人标签</h3>
                <ul>
                    {parentList && parentList.length > 0 ? parentList.map((item, i) => {
                        return (
                            <li key={i}>
                                <Checkbox onChange={(e) => { this.selectLabel(e, item.id) }} checked={indexList.indexOf(i) == -1 ? false : true} onClick={() => { this.labelClickTwo(item.id, i); }}></Checkbox>
                                <ContentEditable className="labelName"
                                    html={item.labelname}
                                    disabled={false}
                                    onChange={(e) => { that.setState({ twoLabelEditName: e.target.value }) }}
                                    onBlur={() => that.labelEdit(item.id, that.state.twoLabelEditName, 'two')}
                                    onClick={() => { that.setState({ twoLabelOldName: item.labelname }) }}
                                    onKeyDown={(e) => { this.handleKeyup(e) }}
                                />
                                <span className="icon">
                                    <Icon type="delete" className="icon_delete" onClick={(e) => { this.labelDelete(e, item.id); }} />
                                </span>
                                {/* <Cascader options={options} value={[item.parent.id]} onChange={(time)=>this.onChangeLabelParent(time,item)}>
                                            <Icon type="copy" className="copy_icon"/>
                                        </Cascader> */}
                            </li>
                        )
                    }) : <NullView data={data} />}
                </ul>
            </div>;
        } else {
            return <div className="content_bottom">
                <h3>{tagList && tagList[tagIndex] ? tagList[tagIndex].labelname : ''}</h3>
                <div style={{ flex: '1', overflow: 'auto' }}>
                    <ul>
                        {tagList && tagList[tagIndex] && tagList[tagIndex].parentList && tagList[tagIndex].parentList.length > 0 ? tagList[tagIndex].parentList.map((item, index) => {
                            return (
                                <li key={index}>
                                    <Checkbox onChange={(e) => { this.selectLabel(e, item.id) }} checked={indexList.indexOf(index) == -1 ? false : true} onClick={() => { this.labelClickTwo(item.id, index); }}></Checkbox>
                                    <ContentEditable className="labelName"
                                        html={item.labelname}
                                        disabled={false}
                                        onChange={(e) => { that.setState({ twoLabelEditName: e.target.value }); }}
                                        onBlur={() => that.labelEdit(item.id, that.state.twoLabelEditName, 'two')}
                                        onClick={() => { that.setState({ twoLabelOldName: item.labelname }); }}
                                        onKeyDown={(e) => { this.handleKeyup(e) }}
                                    />
                                    <span className="icon">
                                        <Icon type="delete" className="icon_delete" onClick={(e) => { this.labelDelete(e, item.id); }} />
                                    </span>
                                    <Cascader options={options} value={[item.parent.id]} onChange={(time) => this.onChangeLabelParent(time, item)}>
                                        <span className="copy_icon">
                                            <Icon type="copy" className="copy_icon_child" />
                                        </span>
                                    </Cascader>
                                </li>
                            )
                        }) : <NullView data={data} />}
                    </ul>
                </div>
            </div>
        }
    }

    render() {
        const { exitShow, addsecondShow, colorList, tagList, oneEditIndex, indexList, oneLabelOldName, twoLabelOldName, oneLabelEditName, twoLabelEditName, tagIndex, projectManageLoading, publicTagLoading, personTagLoading, delLabels, selectColor, greateLabelTwoName, greateLabelName, parentList, leftMenuShow } = this.state;
        let mainTag = tagList[tagIndex];
        let sColor = getStringTagColor(mainTag);
        const that = this;
        return (
            <div onClick={(e) => { e.stopPropagation(); e.preventDefault(); this.setState({ exitShow: false, addsecondShow: false }) }}>
                <style dangerouslySetInnerHTML={{ __html: stylesheet }} />
                <Header />
                <Spin spinning={projectManageLoading || publicTagLoading || personTagLoading} />
                <div className="tagBox">
                    {leftMenuShow ?
                        <div className="menu_left">
                            {exitShow ?
                                <div className="exitBox" onClick={(e) => { e.stopPropagation(); e.preventDefault(); }}>
                                    <Input className="input" placeholder="请输入分类名称"
                                        value={greateLabelTwoName}
                                        onChange={(e) => { this.setState({ greateLabelTwoName: e.target.value }) }} />
                                    <div className="selBox">
                                        <div>
                                            <Select value={selectColor} className={"choose " + getTagColorByColorCode('1', selectColor)} onChange={(e) => { this.changeColor(e) }}>
                                                {colorList && colorList.length > 0 ? colorList.map((color, index) => {
                                                    return <Select.Option value={color.value} key={color.id}><div className={"selColor " + getTagColorByColorCode('1', color.value)} style={{ marginTop: '5px' }}></div></Select.Option>
                                                }) : ''
                                                }
                                            </Select>
                                        </div>
                                        <div>
                                            <Button type="primary" className="button" onClick={(e) => { this.submitLabel(e, '一级'); this.setState({ greateLabelTwoName: '' }) }}>确定</Button>
                                        </div>
                                    </div>
                                </div>
                                : ''}
                            <div className="left_top">
                                <Button type="dashed" className="addTag" onClick={(e) => { e.stopPropagation(); e.preventDefault(); this.setState({ exitShow: true }) }}>
                                    <Icon type="plus" />
                                    <span>添加分类</span>
                                </Button>
                            </div>
                            <div className="left_bottom">
                                {that.props.url.query.type == '3' || that.props.url.query.type == '2' ? (tagList && tagList.length > 0 ? tagList.map((item, i) => {
                                    return (
                                        <div className={i == tagIndex ? 'tagName ' + getTagColorByColorCode('2', item.color) : 'tagName'} key={i}
                                            onClick={() => { this.labelClick(item.id); if (item.labelname == "个人标签" && item.parent.id == 0) { this.setState({ oneEditIndex: null }) } else { this.setState({ oneEditIndex: i, oneLabelOldName: item.labelname }) } }}
                                            onMouseOver={() => { that.setState({ oneDeleteIconIndex: i }) }}
                                            onMouseOut={() => { that.setState({ oneDeleteIconIndex: null }) }}
                                        >
                                            {i == tagIndex ?
                                                <Select value={sColor ? sColor.substring(1) : ''} onChange={(e) => { this.updateLabelColor(e, mainTag) }}>
                                                    {colorList && colorList.length > 0 ? colorList.map((color, index) => {
                                                        return <Select.Option value={color.value} key={color.id}><span className={"selColor " + getTagColorByColorCode('1', color.value)}></span></Select.Option>
                                                    }) : ''
                                                    }
                                                    {colorList && colorList.indexOf(sColor.substring(1)) == -1 ? <Select.Option value={sColor.substring(1)} key={item.id}><span className={"selColor " + getTagColorByColorCode('1', sColor.substring(1))}></span></Select.Option> : ''}
                                                </Select>
                                                :
                                                <div className="tagName_select">
                                                    <span className={"icon_select " + getTagColorByColorCode('1', item.color)}></span>
                                                    <Icon type="down" className="icon" />
                                                </div>
                                            }
                                            <span className={oneEditIndex == i ? "display-none" : "tagOne"}>{item.labelname}</span>
                                            <ContentEditable className={oneEditIndex == i ? "tagOne labelEditText " + getTagColorByColorCode('2', item.color) : "display-none"}
                                                html={item.labelname}
                                                disabled={false}
                                                onChange={(e) => { that.setState({ oneLabelEditName: e.target.value }); }}
                                                onBlur={() => that.labelEdit(item.id, that.state.oneLabelEditName, 'one', item.color)}
                                                onKeyDown={(e) => { this.handleKeyup(e) }}
                                            />
                                            <span className="delete">
                                                <Icon type={item.labelname == '个人标签' ? '' : 'delete'} className="delete_icon" onClick={(e) => { e.stopPropagation(); e.preventDefault(); this.labelDelete(e, item.id); }} />
                                            </span>
                                        </div>
                                    )
                                }) : '') : ''}
                            </div>
                        </div>
                        : ''}
                    <div className="content">
                        <div className="content_top">
                            <Button className={indexList.length <= 0 ? "delete delete_click" : "delete"} type="primary"
                                disabled={indexList.length <= 0 ? true : false}
                                onClick={() => { this.labelsDel() }}>
                                <Icon type="delete" className="delete_icon" />
                                <span>全部移除</span>
                            </Button>
                            <div className="second">
                                <Button type="dashed" className="add" onClick={(e) => { e.stopPropagation(); e.preventDefault(); this.setState({ addsecondShow: true }) }}>
                                    <Icon type="plus" className="add_icon" />
                                    {this.labelTwo()}
                                </Button>
                                {addsecondShow ?
                                    <div className="addsecond" onClick={(e) => { e.stopPropagation(); e.preventDefault(); }}>
                                        <Input placeholder={this.props.url.query.type == '3' ? '请输入项目分类名称' : '请输入标签名称'} className="input_sec"
                                            value={greateLabelName}
                                            onChange={(e) => { this.setState({ greateLabelName: e.target.value }) }} />
                                        <Button type="primary" className="primary" onClick={(e) => { this.addLabel(e, '二级'); this.setState({ greateLabelName: '' }) }}>确定</Button>
                                    </div>
                                    : ''}
                            </div>
                        </div>
                        {that.personLabelRender()}
                    </div>
                </div>
            </div>
        );
    }
}