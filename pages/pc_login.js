import React from 'react';
import { Input,Button } from 'antd';
import Router from 'next/router';

import { login } from '../core/service/user.service';
import Storage from '../core/utils/storage';

export default class Login extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      username: '18161828136',
      password: '18161828136'
    }

  }

  componentWillMount() {
  }

  componentDidMount() {
  }

  componentWillUnmount() {
  }

  componentWillReceiveProps(nextProps) {
  }

  loginClick() {
    const { username,password } = this.state;

    login(username,password,(data)=>{
      if(data.err){
        return false;
      }
      if (data) {
        Storage.set('user',data);
        Router.push('/pc_task');
      }
    });
  }

  valChange(type,val) {
    if (type === 'username') {
      this.setState({username:val});
    } else if (type === 'password') {
      this.setState({password:val});
    }
  }

  render() {
    const {username,password} = this.state;
    return (
      <div style={{width:'500px',margin:'150px auto 0 auto'}}>
          <Input placeholder="用户名" value={username} onChange={(e)=>{this.valChange('username',e.target.value)}} />
          <Input placeholder="密码" value={password} onChange={(e)=>{this.valChange('password',e.target.value)}} />
          <Button type="primary" onClick={()=>{this.loginClick()}}>登录</Button>
      </div>
    )
  }
}