import React from 'react';
import { Tag,Button } from 'antd';

import stylesheet from '../styles/components/userTag.scss';
import dingJS from '../core/utils/dingJSApi';

/*
 * （必填）selectedUsers:[id:'',name:'']            // 选中的人员
 * （必填）selectedUsersOnchange(selectedUsers)     // 返回当前选中的人员
 * （选填）selectUserTitle:''                       // 选人控件标题
 */

export default class TagComponent extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            selectedUsers:[],
            selectUserTitle:'人员'
        }
    }

    componentWillMount() {
        if(this.props.selectedUsers){
            this.setState({selectedUsers:this.props.selectedUsers});
        }
        if(this.props.selectUserTitle){
            this.setState({selectUserTitle:this.props.selectUserTitle});
        }
    }

    componentWillReceiveProps(nextProps) {
        if(nextProps.selectedUsers){
            this.setState({selectedUsers:nextProps.selectedUsers});
        }
        if(nextProps.selectUserTitle){
            this.setState({selectUserTitle:nextProps.selectUserTitle});
        }
    }

    componentWillUnmount() {
        this.setState = (state,callback)=>{
            return;
        };  
    }

    dellSelectedUser(user){
        const { selectedUsers } = this.state;
        selectedUsers.map((item,i)=>{
            if(item.id === user.id){
                selectedUsers.splice(i,1);
                return false;
            }
        });
        this.setState({selectedUsers:selectedUsers});  
        this.props.selectedUsersOnchange(selectedUsers);
    }

    selectUser(){
        const { selectedUsers,selectUserTitle} = this.state;
        const seledUserIds = selectedUsers.map((item)=>{
            return item.id
        });
        const that = this;
        console.log('-----------------userTag开始选人-------------------',selectedUsers,seledUserIds);
        dingJS.selectUser(selectedUsers,selectUserTitle,(users)=>{
            console.log('选人组件返回值：',users);
            const selingUser = [];
            users.map((item)=>{
                selingUser.push({
                    'id':item.emplId,
                    'name':item.name
                });
            });
            that.props.selectedUsersOnchange(selingUser);
        });
    }

    render() {
        const { selectedUsers } = this.state;
        return(
            <div className="userTag">
                <style dangerouslySetInnerHTML={{ __html: stylesheet }} />
                {selectedUsers.map((item)=>{
                    return(
                        <Tag>
                            {item.name}
                            <svg aria-hidden="true" className="pro-icon" onClick={() => {this.dellSelectedUser(item)}}>
                                <use xlinkHref="#pro-myfg-yichu"></use>
                            </svg>
                        </Tag>
                    )
                })}              
                <Button onClick={()=>{this.selectUser()}} style={{height:'30px'}}>
                    选择人员
                </Button>
            </div>
        )
    }
}