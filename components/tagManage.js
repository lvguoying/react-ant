import React from 'react'
import {Icon,Button,Select,Checkbox, Input ,Cascader,message,Modal} from 'antd';

import stylesheet from 'styles/components/tagManage.scss';
import NullView from '../components/nullView';
import { getStringTagColor ,getTagColorByColorCode} from '../core/utils/util';
import {
    getLabelList,
    findLabelUser,
    addLabel,
    updateLabel,
    updateLabelParent,
    deleteLabel,
    deleteAllLabel,
    addLabelUser,
    addProjectType,
    getProjectTypeList,
    updateProjectType,
    getPersonLabel,
    addPersonLabel,
    updatePersonLabel,
    deleteAllPersonLabel,
} from '../core/service/tag.service';
import { Spin } from 'antd';
const option =Select.option;
const confirm = Modal.confirm;
/*****
 * type:1      //个人标签
 * type:2      //公共标签
 * type:3      //项目分类
 * closedCallBack()     //关闭弹层回调
 * title:''            //弹框标题显示
 * *****/
export default class tagManage extends React.Component{
    constructor(props) {
		super(props)
		this.state = {
            exitShow:false,         //添加标签分类是否显示
            addsecondShow:false,    //添加二级标签是否显示
            colorList:[],
            tagList:[],
            tagIndex:'-1',
            tagTwoIndex:'0',
            labelIndex:'0',
            selectColor:'75ccff',
            greateLabelName:"",
            greateLabelTwoName:"",
            parentList:[],
            indexList:[],
            pid:'',
            twoEditShow:false,
            oneEditShow:false,
            deleteShow:false,
            projectManageLoading:false,
            publicTagLoading:false,
            personTagLoading:false,
            oneEditIndex:null,
			oneLabelOldName:null,
			twoLabelOldName:null,
			oneLabelEditName:null,
            twoLabelEditName:null,
            oneDeleteIconIndex:null,
		}	
    }
    componentWillMount(){
        if(this.props.type == '3'){
            this.getProjectManage();
        }else if(this.props.type == '2'){
            this.getPublicTag();
        }else if(this.props.type == '1'){
            this.getPersonLabel();
        }
    }
    componentWillReceiveProps(nextProps){
        if(nextProps.type == '3'){
            this.getProjectManage();
        }else if(nextProps.type == '2'){
            this.getPublicTag();
        }else if(nextProps.type == '1'){
            this.getPersonLabel();
        }
    }	
    componentWillUnmount() {
        this.setState = (state, callback) => {
            return;
        };
    }
    
    
    //获取项目分类
    getProjectManage(){
        this.setState({projectManageLoading:true});
        getProjectTypeList((data)=>{
            if(data.err){
                return false;
            }
            this.setState({colorList:data.colorList,tagList:data.labels,projectManageLoading:false});
        });
    }
    //获取公共标签
    getPublicTag(){
        this.setState({publicTagLoading:true});
        getLabelList((data)=>{
            if(data.err){
                return false;
            }
            this.setState({colorList:data.colorList,tagList:data.labels,publicTagLoading:false});
        });
    }
    //获取个人标签
    getPersonLabel(){
        this.setState({personTagLoading:true});
        getPersonLabel((data)=>{
            if(data.err){
                return false;
            }
            if(data){
                this.setState({parentList:data.labels,pid:data.parentId,personTagLoading:false});
            }
        });
    }
    changeColor(e){
		this.setState({selectColor:e});
    }
    //编辑标签颜色
    updateLabelColor(e,mainTag){
		if(mainTag){
  			updateLabel(mainTag.labelname,mainTag.id,e,(data)=>{
                if(data.err){
                    return false;
                }
                  if(data){
                    message.success("修改成功");
                    if(this.props.type == '3'){
                        this.getProjectManage();
                    }else if(this.props.type == '2'){
                        this.getPublicTag();
                    }
                    this.setState({oneEditIndex:null,twoEditIndex:null,oneLabelEditName:null,twoLabelEditName:null});
                  }
              });	
		}
    } 
    //删除标签或删除项目分类
    labelDelete(e,id){
        e.stopPropagation();
        e.preventDefault();
        deleteLabel(id,(data)=>{
            if(data.err){
                return false;
            }
            if(data){
                message.success('操作成功')
                this.setState({delLabels:[]})
            }
            if(this.props.type == '3'){
                this.getProjectManage();
            }else if(this.props.type == '2'){
                this.getPublicTag();
            }else if(this.props.type == '1'){
                this.getPersonLabel();
            }
        });
    }
    //点击返回一级标签的下标
    labelClick(id){
        const {tagList}=this.state;
        for(let i=0;i<tagList.length;i++){
            let item=tagList[i];
            if(item.id == id){
               this.setState({tagIndex:i});
               break;
            }
        }
    }
    //点击二级标签返回二级标签
    labelTwoClick(pid,id,index){
        const {tagList,indexList,parentList,labelIndex}=this.state;
        var that=this;
        if(this.props.type == '1'){
            for(let i=0;i<parentList.length;i++){
                let item = parentList[i];
                if(item.id==id){
                    that.setState({tagTwoIndex:i});
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
            for(let j=0;j<tagList.length;j++){
                let tag=tagList[j];
                if(tag.id == pid){
                    this.setState({labelIndex:j});
                }
            }
            for(var i=0; i<tagList[labelIndex].parentList.length; i++){
                const label=tagList[labelIndex].parentList[i];
                if(label.id==id){
                    that.setState({tagTwoIndex:i});
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
    }
    // 编辑标签
  	labelEdit(id,name,labNo,color){
		if(name && name.length>16){
			message.error("标签长度不能大于16个字符");
			return;
		}
  		if((labNo=='one' && (name==this.state.oneLabelOldName || name==null)) || (labNo=='two' && (name==null || name==this.state.twoLabelOldName)) ){
  			this.setState({oneEditIndex:null,twoEditIndex:null,oneLabelEditName:null,twoLabelEditName:null});
  		}else{  			
              updateLabel(name,id,color,(data)=>{
                if(data.err){
                    return false;
                }
                if(this.props.type == '3'){
                    this.getProjectManage();
                }else if(this.props.type == '2'){
                    this.getPublicTag();
                }else if(this.props.type == '1'){
                    this.getPersonLabel();
                }
                message.success("修改成功");
                this.setState({oneEditIndex:null,twoEditIndex:null,oneLabelEditName:null,twoLabelEditName:null});
            });	
  		}  		
    } 
    //添加标签
    submitLabel(e,tag){
        e.stopPropagation();    
        e.preventDefault();
      const {tagList,selectColor,labelIndex,greateLabelName,greateLabelTwoName}=this.state;
      if(tag=="一级" && greateLabelTwoName && greateLabelTwoName.length > 16){
          message.error("一级标签长度不能大于16个字符");
          return;
      }
      if(tag=="二级" && greateLabelName && greateLabelName.length >16){
          message.error("二级标签长度不能大于16个字符");
          return;
      }
      
        if(tag=="一级"){
            let name = greateLabelTwoName;
            let data = {labelname:name,color:selectColor};  
            if(this.props.type == '3'){
                addProjectType(data,'',(res)=>{
                    if(res.err){
                        return false;
                    }
                    if(res){
                        message.success('添加成功');
                    }
                    this.getProjectManage();
                });
            }else if(this.props.type == '2'){
                addLabel(data,'',(res)=>{
                    if(res.err){
                        return false;
                    }
                    if(res){
                        message.success('添加成功');
                    }
                    this.getPublicTag();
                });
            }
            this.setState({exitShow:false});
        }else if(tag=="二级"){
            let pid = tagList[labelIndex].id;
            let name = greateLabelName;
            let data = {labelname:name,color:''}; 
            if(this.props.type == '3'){
                addProjectType(data,pid,(res)=>{
                    if(res.err){
                        return false;
                    }
                    if(res){
                        message.success('添加成功');
                    }
                    this.getProjectManage();
                });
            }else if(this.props.type == '2'){
                addLabel(data,pid,(res)=>{
                    if(res.err){
                        return false;
                    }
                    if(res){
                        message.success('添加成功');
                    }
                    this.getPublicTag();
                });
            }
        }  		
    }
    //添加个人标签
    addPerson(e){
        const{pid,greateLabelName}=this.state;
        let name = greateLabelName;
        addPersonLabel(name,pid,(res)=>{
            if(res.err){
                return false;
            }
            if(res){
                message.success('添加成功');
            }
            this.getPersonLabel();
        });
        this.setState({addsecondShow:false});
    }
    //添加标签方法
    addLabel(e,tag){
        if(this.props.type == '1'){
            if(!e.target.value){
               message.info('请输入标签名称');
               return;
            }
            this.addPerson(e);
        }else{
            this.submitLabel(e,tag);
        }
    }
    //提示弹框
    showConfirm(title,e,id){
        const that =this;
        confirm({
            title:title,
            onOk() {
                that.labelDelete(e,id);
            },
            onCancel() {
            },
          });
    }
    render(){
        const{colorList,selectColor,tagList,exitShow,pid,twoLabelEditName,tagIndex,parentList,projectManageLoading,publicTagLoading,personTagLoading,addsecondShow,indexList,labelIndex,tagTwoIndex,oneEditIndex,greateLabelName,greateLabelTwoName,twoEditShow,oneEditShow}=this.state;
        const that=this;
        return(
            <Modal
            title={this.props.title}
            visible={true}
            onCancel={()=>{this.props.closedCallBack()}}
            width={620}
            footer={[<Button type="primary" key="back" onClick={()=>{this.props.closedCallBack();}}>关闭</Button>]}
            >
            <div className="manageBox" onClick={(e)=>{e.stopPropagation();e.preventDefault();this.setState({exitShow:false})}}>
            <style dangerouslySetInnerHTML={{ __html: stylesheet }} />
            <Spin spinning={projectManageLoading || publicTagLoading || personTagLoading} />
                {this.props.type == '1'?'':
                <div className="addTagTitle-row">
                    <div className="addTagTitle" onClick={(e)=>{e.stopPropagation();e.preventDefault();this.setState({exitShow:true})}}>
                        <Icon type="plus-circle-o"/>
                        <span>添加组</span>
                    </div>
                </div>}
                {exitShow?
                <div className="addBox" onClick={(e)=>{e.stopPropagation();e.preventDefault();}}>
                    <div>
                        <Input placeholder="请添加分组" className="input"
                        value={greateLabelTwoName}
                        onChange={(e)=>{this.setState({greateLabelTwoName:e.target.value})}}/>
                    </div>
                    <div className="addBottom">
                        <div className="selBox">
                            <Select value={selectColor} className={"choose "+getTagColorByColorCode('1',selectColor)} onChange={(e)=>{this.changeColor(e)}}>
                                {colorList&&colorList.length>0?colorList.map((color, index) => {
                                    return <Select.Option value={color.value} key={color.id}><div className={"selTagColor "+getTagColorByColorCode('1',color.value)} style={{marginTop:'5px'}}></div>{color.value==selectColor?<Icon type="check" className="check"/>:''}</Select.Option>
                                }):''
                                }
                            </Select>
                        </div>
                        <div className="okButton">
                            <Button  className="button" onClick={()=>{this.setState({exitShow:false});}}>取消</Button>
                            <Button type="primary" className="button" onClick={(e)=>{this.submitLabel(e,'一级');this.setState({greateLabelTwoName:''})}}>确定</Button>
                        </div>
                    </div>
                </div>:''}
                {this.props.type == '1'?
                <div className="personBox">
                    <div className="personDelete">
                        <Icon type="delete" onClick={(e)=>{this.showConfirm('是否删除所有个人标签？',e,pid)}}/>
                    </div>
                    <div className="personLabelBox">
                        <ul>
                        {parentList && parentList.length > 0 ? parentList.map((person, value) => {
                                return(
                                    <li key={person.id}>
                                        {tagTwoIndex==value && twoEditShow?
                                            <Input 
                                            className="exitName"
                                            defaultValue={person.labelname}
                                            autoFocus
                                            onPressEnter={()=>{that.labelEdit(person.id,that.state.twoLabelEditName,'two');this.setState({twoEditShow:false})}}
                                            placeholder={person.labelname}
                                            onChange={(e)=>{that.setState({twoLabelEditName:e.target.value});}}	
                                            onBlur={()=>{that.labelEdit(person.id,that.state.twoLabelEditName,'two');this.setState({twoEditShow:false})}}
                                            />
                                            :
                                            <div style={{position:"relative"}}>
                                                <span className={"labelName textMore "+getTagColorByColorCode('2',person.color)} 
                                                onClick={()=>{this.labelTwoClick('',person.id,value);this.setState({twoEditShow:true})}}>{person.labelname}</span>
                                                <Icon type="close" className="tagIcon" onClick={(e)=>{this.labelDelete(e,person.id);}}/>
                                            </div>
                                        }
                                    </li>
                                        )
                            }):''}
                            {addsecondShow?
                                <li>
                                    <Input
                                    className="secondInput"
                                    onBlur={(e)=>{this.setState({addsecondShow:false});this.addLabel(e,'二级');this.setState({greateLabelName:''})}}
                                    value={greateLabelName}
                                    autoFocus
                                    onPressEnter={(e)=>{this.setState({addsecondShow:false});this.addLabel(e,'二级');this.setState({greateLabelName:''})}}
                                    onChange={(e)=>{this.setState({greateLabelName:e.target.value})}}/>
                                </li>
                            :''}
                                <li className="addSecond" onClick={()=>{this.setState({addsecondShow:true,})}}>
                                    <Icon type="plus-circle-o" className="plus"/>
                                    添加
                                </li>
                        </ul>
                    </div>
                </div>
                :
                <div className="tagListBox">
                {tagList && tagList.length > 0?tagList.map((item,i)=>{
                    return(
                        <div className="tagList" key={item.id}>
                            <div className="tagTop">
                            {oneEditIndex==i && oneEditShow?
                                <Input placeholder={item.labelname} className="inputTitle"
                                defaultValue={item.labelname}
                                autoFocus
                                onPressEnter={()=>{this.labelEdit(item.id,this.state.oneLabelEditName,'one',item.color);this.setState({oneEditShow:false})}}
                                onBlur={()=>{this.labelEdit(item.id,this.state.oneLabelEditName,'one',item.color);this.setState({oneEditShow:false})}}
                                onChange={(e)=>{that.setState({oneLabelEditName:e.target.value});}}/>    
                            :
                                (item.labelname == '个人标签'?<div className="tagName">{item.labelname}</div>:<div className="tagName" onClick={()=>{this.setState({oneEditIndex:i,oneEditShow:true})}}>{item.labelname}</div>)
                            }
                                <div className="colorSelect">
                                    <Select defaultValue={getStringTagColor(item)?getStringTagColor(item).substring(1):''} onChange={(e)=>{this.updateLabelColor(e,item)}}>
                                    {colorList && colorList.length>0?colorList.map((color,value)=>{
                                        return(
                                        <Select.Option value={color.value} key={color.id}><span className={"selTagColor "+getTagColorByColorCode('1',color.value)}></span>{color.value==item.color?<Icon type="check" className="check"/>:''}</Select.Option>
                                        )
                                    }):''}
                                    {colorList && colorList.indexOf(getStringTagColor(item).substring(1))==-1?<Select.Option value={getStringTagColor(item).substring(1)} key={item.id}><span className={"selTagColor "+getTagColorByColorCode('1',getStringTagColor(item).substring(1))}></span></Select.Option>:''}
                                    </Select>
                                </div>
                                {item.labelname === "个人标签"?'':<Icon type="delete" className="delete" onClick={(e)=>{this.showConfirm('是否删除该分组以及分组下的所有标签？',e,item.id);}}/>}
                            </div>
                            <div className="tagBottom">
                                <ul>
                                    {item.parentList && item.parentList.length>0?item.parentList.map((tim,index)=>{
                                        return(
                                            <li key={tim.id}>
                                            {tagIndex==i && tagTwoIndex==index && twoEditShow?
                                                <Input 
                                                className="exitName"
                                                defaultValue={tim.labelname}
                                                autoFocus
                                                onPressEnter={()=>{that.labelEdit(tim.id,that.state.twoLabelEditName,'two',item.color);this.setState({twoEditShow:false})}}
                                                placeholder={tim.labelname}
                                                onChange={(e)=>{that.setState({twoLabelEditName:e.target.value});}}	
                                                onBlur={()=>{that.labelEdit(tim.id,that.state.twoLabelEditName,'two',item.color);this.setState({twoEditShow:false})}}
                                                />
                                                :
                                                <div style={{position:"relative"}}>
                                                    <span className={"labelName textMore "+getTagColorByColorCode('2',item.color)}
                                                    onClick={()=>{this.setState({tagTwoIndex:index});this.labelClick(item.id);this.labelTwoClick(item.id,tim.id,index);this.setState({twoEditShow:true})}}>
                                                        {tim.labelname}
                                                    </span>
                                                    <Icon type="close" className="tagIcon" onClick={(e)=>{this.labelDelete(e,tim.id);}}/>
                                                </div>
                                            }  
                                            </li>
                                        )
                                    }):''}
                                    {labelIndex==i && addsecondShow?
                                    <li>
                                        <Input
                                        className="secondInput"
                                        onBlur={(e)=>{this.setState({addsecondShow:false});this.addLabel(e,'二级');this.setState({greateLabelName:''})}}
                                        value={greateLabelName}
                                        autoFocus
                                        onPressEnter={(e)=>{this.setState({addsecondShow:false});this.addLabel(e,'二级');this.setState({greateLabelName:''})}}
                                        onChange={(e)=>{this.setState({greateLabelName:e.target.value})}}/>
                                    </li>
                                    :''}
                                    <li className="addSecond" onClick={()=>{this.setState({addsecondShow:true,labelIndex:i})}}>
                                        <Icon type="plus-circle-o" className="plus"/>
                                        添加
                                    </li>
                                </ul>
                            </div>
                        </div>
                    )
                }):<NullView/>}
                </div>}
            </div>
            </Modal>
        );
    }
}