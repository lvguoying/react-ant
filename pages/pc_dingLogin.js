import React from 'react';
import Router from 'next/router';
import NProgress from 'nprogress';

import Storage from '../core/utils/storage';
import { getQueryString } from '../core/utils/util';
import stylesheet from '../styles/views/dingLogin.scss';
import HttpClient from '../core/api/HttpClient';
import { dingLoginByCode } from '../core/service/user.service';
import {getDingMessageDetails } from '../core/service/message.service';

Router.onRouteChangeStart = (url) => {
  NProgress.start()
}
Router.onRouteChangeComplete = () => NProgress.done()
Router.onRouteChangeError = () => NProgress.done()

export default class dingLogin extends React.Component {
    constructor() {
        super()
        this.state = {
          loading:true
        }
      
    }
    componentDidMount(){
      HttpClient.AjaxGet('/test/test',()=>{},()=>{});
      setTimeout(()=>{
        const corpid = getQueryString('corpid');
        const suiteKey = getQueryString('SuiteKey');
        // getUserVersion(corpid,(result)=>{
        //   console.log(result,'getUserVersion')
        //   if(result.flag == false){
        //     window.location.href="http://47.94.248.148/qrcode?SuiteKey="+suiteKey+"&corpid="+corpid;
        //   }else{
        //   }
        // });
        this.iniLogin(corpid,suiteKey);
      },500)
    }

    iniLogin(corpid,suiteKey) {
      if (corpid && suiteKey) {
        Storage.set('corpId', corpid);
        DingTalkPC.runtime.permission.requestAuthCode({
          corpId: corpid,
          onSuccess: function (data) {
              console.log(data,'----------------requestAuthCode--------------------')              
              dingLoginByCode(data.code, corpid,(result)=>{
                  if(result.err){
                    return false;
                  }
                  Storage.set("user",result);
                  let messageId = getQueryString('taskinfoId');//获取的是消息id
                  if (messageId) {
                    getDingMessageDetails(messageId,(res)=>{
                      if(res.err){
                        return false;
                      }
                      Storage.set('corpIdMsg', corpid);
                      if(res.isDel == "true"){
                        Router.push('/pc_dingCancel');

                      }else{
                        Router.push('/pc_dingMessage?projectId='+res.projectId+'&taskId='+res.taskinfoId);
                      }
                    });
                  } else {
                    Storage.set('corpIdWork', corpid);
                    const version = HttpClient.getVersion()
                    if(result && result.no != version){
                      Router.push('/pc_guide');
                    }else{
                      Router.push('/pc_task');
                    }
                  }
              });
          },
          onFail: function (err) {
            this.error(err);
          }
        });
      } else { 
        Router.push('/pc_login');
      }
    }
    componentWillReceiveProps(nextProps) {
     
    }

  //错误处理
  error(m) {
    let mes = m;
    if (m =="10000") {
      mes = "您团队的管理员正在设置本应用，请您稍后重试或联系管理员";
    }
    console.log(mes,"*****errmsg*****");
  }
    
	render() {
			return (
          <div className="dingLoging">
		          <style dangerouslySetInnerHTML={{ __html: stylesheet }} />
		      		<div className="loadBox">
		      			  <div className="logoTop">
		      				    <img src="../static/react-static/pcvip/imgs/logoLoading.png?t=1.1"/>
		      			  </div>
		      			  <div className="logoBott">
		      				    <img src="../static/react-static/pcvip/imgs/logoLoad.png?t=1.1"/>
		      			  </div>
		      		</div>
			    </div>
      )
	}
}