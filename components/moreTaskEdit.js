import React from 'react';
import { Button,Modal,Calendar,message,Input,Radio,Spin } from 'antd';
import zhCN from 'antd/lib/locale-provider/zh_CN';
import moment from 'moment';

import stylesheet from 'styles/components/tag.scss';
import { dateToString,getTagTitColorByColorCode,getTagColorByColorCode,onlyNumber } from '../core/utils/util';
import { updateMoreTaskData } from '../core/service/task.service';
import { getTagList } from '../core/service/tag.service';
import dingJS from '../core/utils/dingJSApi';

const RadioGroup = Radio.Group;

/*
 * （必填）editType：''             // 批量修改的字段类型 如：'标签' '计划工期'
 * （必填） checkTaskIds：[]        // 选中的taskID
 * （必填） updateCallBack()        // 批量修改成功回调
 */

export default class MoreTaskEdit extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            editType: '',
            checkTaskIds: [],
            modalShow: false,
            editVal: '',

            tagLoading: false,
            tagList: [],
            tagIds: []
        }
    }

    componentWillMount() { 
        if(this.props.editType){
            this.setState({editType:this.props.editType});
            if(this.props.editType==='优先级'){
                this.setState({editVal:3});
            }else if(this.props.editType === '完成日期'){ 
                this.setState({editVal:dateToString(new Date(),'date')});
            }else if(this.props.editType === '标签'){ 
                this.getTagsList();
            }
        }
        if(this.props.checkTaskIds){
            this.setState({checkTaskIds:this.props.checkTaskIds})
        }
    }

    componentWillReceiveProps(nextProps) {
        if(nextProps.editType){
            this.setState({editType:nextProps.editType});
            if(nextProps.editType==='优先级'){
                this.setState({editVal:3});
            }else if(nextProps.editType === '完成日期'){ 
                this.setState({editVal:dateToString(new Date(),'date')});
            }
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

    getTagsList(){
        this.setState({tagLoading:true});
        getTagList((data) => {
            if(data.err){
                return false;
            }
            this.setState({ tagList: data });
            this.setState({tagLoading:false});
        });
    }

    valChange(type,val){
        switch(type){
            case '完成日期':
                const date = dateToString(val._d,'date');
                this.setState({editVal:date});
                break;
        }
    }

    onOk(){
        const { editType,editVal,checkTaskIds,tagIds } = this.state;
        let update = {};
        switch(editType){
            case '完成日期':
                update.planEndTime = editVal;
                break;
            case '任务绩效':
                update.flowConten = editVal;
                break;
            case '计划工期':
                update.workTime = editVal;
                break;
            case '优先级':
                update.coefficienttype = editVal;
                break;
            case '标签':
                update.selectTags = [];
                tagIds.map((item)=>{
                    update.selectTags.push({
                        'id':item
                    })
                });
                break;                
        }
        update.taskinfoIds = checkTaskIds;
        updateMoreTaskData('',update,(data)=>{
            if(data.err){
                return false;
            }
            if(data){
                message.success('批量修改成功！');
                this.props.updateCallBack();
                this.setState({modalShow:false});
            }  
        });
    }

    onModalShow(editType){
        const { checkTaskIds } = this.state;
        if (checkTaskIds.length===0){
            message.info('请选择任务');
        }else{
            if(editType === '负责人' || editType === '确认人'){
                dingJS.selectUser([],editType,(users)=>{
                    let update = {
                        'taskinfoIds': checkTaskIds
                    };
                    if(editType === '负责人'){
                        update.userResponseId = users[0].emplId;
                        update.userResponseName = users[0].name;
                    }else if(editType === '确认人'){
                        update.userFlowId = users[0].emplId;
                        update.userFlowName = users[0].name;
                    }
                    updateMoreTaskData('',update,(data)=>{
                        if(data.err){
                            return false;
                        }
                        if(data){
                            message.success('批量修改成功！');
                            this.props.updateCallBack();
                        }  
                    });
                },false);
            }else{
                this.setState({modalShow:true});
            }
        }
    }

    selectingTag(tagObj,color,type){
        const { tagIds } = this.state;
        const index = tagIds.indexOf(tagObj.id);
        if(index===-1){
            tagIds.push(tagObj.id);
        }else{
            tagIds.splice(index,1);
        }
        this.setState({tagIds:tagIds});
    }

    render() {
        const { editType,modalShow,editVal,tagLoading,tagList,tagIds } = this.state; 
        let content = '您还没有定义标签哦';
        if(tagList.length>0){
            content=(
                <div className="cpet_tag_list" style={{maxHeight:'100%'}}>
                    <Spin spinning={tagLoading} />
                    {
                        tagList.map((item) => {
                            if (item.parentList && item.parentList.length>0) {
                                return (
                                    <div className="tagDiv" key={item.id} style={{maxWidth:'100%'}}>
                                        <div className={'tagName '+getTagTitColorByColorCode(item.color)}>{item.labelname}</div>                                
                                        <ul className="tagUl">
                                            {item.parentList.map((arr)=> { 
                                                return  <li key={arr.id} onClick={()=>{this.selectingTag(arr,item.color,item.type)}}
                                                            className={tagIds.indexOf(arr.id)!==-1 ? getTagColorByColorCode('1',item.color) : getTagColorByColorCode('2',item.color)}
                                                        >
                                                            {arr.labelname}
                                                        </li>
                                            })}
                                        </ul>
                                    </div>
                                )
                            }
                        })
                    }
                </div>
            );
        }
        return (
            <div style={{display:'inline'}}>
                <style dangerouslySetInnerHTML={{ __html: stylesheet }} />          
                     
                <Modal title={editType} visible={modalShow}
                    onCancel={()=>{this.setState({modalShow:false})}}
                    footer={[
                        <Button key="back" onClick={()=>{this.setState({modalShow:false})}}>取消</Button>,
                        <Button key="submit" type="primary" 
                                disabled={(tagIds.length===0 && editType==='标签')||(!editVal && editType!=='标签')?true:false}
                                onClick={()=>{this.onOk()}}
                        >
                          确定
                        </Button>
                    ]}
                >
                    {editType==='完成日期'?
                    <div style={{ width: '100%', border: '1px solid #d9d9d9', borderRadius: 4 }}>
                        <Calendar locale={zhCN} value={moment(editVal, 'YYYY-MM-DD')} fullscreen={false} onSelect={(val)=>{this.valChange('完成日期',val)}} />
                    </div>
                    :''} 
                    {editType==='计划工期' || editType === '任务绩效'?
                        <Input placeholder="请输入数字，允许小数" onChange={(e)=>{onlyNumber(e.target);this.setState({editVal:e.target.value})}} />
                    :''}
                    {editType==='优先级'?
                        <RadioGroup value={editVal} onChange={(e)=>{this.setState({editVal:e.target.value})}}>
                            <Radio value={3}>高</Radio>
                            <Radio value={2}>中</Radio>
                            <Radio value={1}>低</Radio>
                        </RadioGroup>
                    :''}
                    {editType==='标签'?
                        content
                    :''}
                </Modal>  
                {editType==='标签' || editType==='负责人' || editType==='确认人'?
                    <Button style={{fontSize:'13px'}} onClick={()=>{this.setState({tagIds:[]});this.onModalShow(editType)}}>{editType==='标签'?'添加':'修改'}{editType}</Button>  
                    :
                    <div style={{fontSize:'13px'}} onClick={()=>{this.onModalShow(editType)}}>{editType}</div>  
                }                
            </div>
        )
    }
}