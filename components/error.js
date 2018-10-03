import React from 'react';
import { Button ,Icon} from 'antd';
import Router from 'next/router';
import stylesheet from 'styles/components/error.scss';

/*
 * data:{
 *      Icon:'',
 *      errorTxt:'',
 *      alertTxt:'',        
 *      butTxt:'',
 *      butUrl:'',
 * }
 */

export default class Error extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            butShow:false,
            data:{
                Icon:'',
                errorTxt:'',
                alertTxt:'',
                butTxt:'',
                butUrl:'',
            }
        }
    }

    componentWillMount() {
        if(this.props.data){
            let data=this.props.data;
            if(data.butUrl){
                this.setState({butShow:true});
            }
            let newData={
                Icon:data.Icon,
                errorTxt:data.errorTxt,
                alertTxt:data.alertTxt,
                butTxt:data.butTxt,
                butUrl:data.butUrl,
            }
            this.setState({data:newData});
        }
    }

    componentWillUnmount() {
        this.setState = (state,callback)=>{
            return;
        };  
    }

    componentWillReceiveProps(nextProps) {
        if(nextProps.data){
            let data=nextProps.data;
            if(data.butUrl){
                this.setState({butShow:true});
            }
            let newData={
                Icon:data.Icon,
                errorTxt:data.errorTxt,
                alertTxt:data.alertTxt,
                butTxt:data.butTxt,
                butUrl:data.butUrl,
            }
            this.setState({data:newData});
        }
    }
    clickBut(){
        const{data}=this.state;
        Router.push(data.butUrl);
    }    

    render() {
        const {butShow,data} = this.state;
        return (
            <div>
                <style dangerouslySetInnerHTML={{ __html: stylesheet }} />
                <div className="errorBox">
                    <div className="icon_box">
                        <Icon type={data.Icon}/>
                    </div>
                    <div className="right_box">
                        <div className="errorTxt">{data.errorTxt}</div>
                        <div className="alertTxt">{data.alertTxt}</div>
                        {butShow?
                            <div className="button">
                                <Button type="primary" onClick={()=>{this.clickBut();}}>{data.butTxt}</Button>
                            </div>
                        :''}
                    </div>
                </div>
            </div>
        )
    }
}