import React from 'react'
import Router from 'next/router'
import Storage from '../core/utils/storage'
export default class Index extends React.Component {
  componentDidMount() {
    const token = Storage.get('tokenUser');
    const loginName = Storage.get('loginName');
    if (typeof (token) != 'undefined' && typeof (loginName) != 'undefined') {
      Router.push('/pc_home');
    } else {
      Router.push('/pc_login');
    }
  }
  render() {
    return (<div></div>)
  }
}
