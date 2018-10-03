import React from 'react';
import { Button } from 'antd';
import Router from 'next/router';
import stylesheet from 'styles/components/nullView.scss';

/*
 * （选填）icon
 * （选填）butTxt
 * （选填）butUrl
 * （选填）showTit
 * （选填）showTxt
 * （选填）isLoadingErr:false,     // 是否是网络错误
 * （选填）restLoadingCallBack()   // 如果是网络错误，点击重试的回调
 */

export default class NullView extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
        }
    }

    componentWillMount() {
    }

    componentWillReceiveProps(nextProps) {
    }

    componentWillUnmount() {
        this.setState = (state,callback)=>{
            return;
        };  
    }

    butClick(){
        const {butUrl} = this.props; 
        if(butUrl){
            Router.push(butUrl);	
        }else{
            this.props.restLoadingCallBack();
        }
	}

    render() {
        let { icon,butTxt,butUrl,showTit,showTxt,isLoadingErr }=this.props;
        if(isLoadingErr){
            icon='ku';
            butTxt='点击重试';
            showTit='加载失败';
            showTxt='你可以检查一下网络再试试哦';
        }
        if(!showTit){
            showTit='没有数据哦';
        }
        if(!icon){
            icon='ku';
        }
        return (
            <div className="nullView">
                <style dangerouslySetInnerHTML={{ __html: stylesheet }} />
                <div className="dataBox">
                    <div className="icon"><i className={"icon iconfont icon-"+icon}></i></div>
                    <div className="showTxt">{showTit}</div>
                    <div className="alertTxt">{showTxt}</div>
                    {butTxt || isLoadingErr?
                    <div className="button">
                        <Button type="primary" onClick={()=>{this.butClick();}}>{butTxt}</Button>
                    </div>
                    :''}
                </div>
            </div>
        )
    }
}