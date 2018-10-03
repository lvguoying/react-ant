import React from 'react'
import {message,Modal,Input,Button} from 'antd';
import stylesheet from 'styles/components/feedback.scss'
import { saveFeedback } from '../core/service/feedback.service';

export default class Feedback extends React.Component {	
	constructor(props) {
		super(props)
		this.state = {
            loading:false,
			remarks:'', //反馈描述
			mail:'', //联系邮箱
			feedbackShow:false,
		}	
	}
	componentDidMount(){
        if(this.props.feedbackShow === true || this.props.feedbackShow === false){
            this.setState({feedbackShow:this.props.feedbackShow});
        }
	}
	componentWillReceiveProps(nextProps){
        if(nextProps.feedbackShow === true || nextProps.feedbackShow === false){
            this.setState({feedbackShow:nextProps.feedbackShow});
        }
	}
	componentWillUnmount() {
        this.setState = (state,callback)=>{
            return;
        };  
    }
	
	saveFeedback(){
        const{remarks,mail,feedbackShow}=this.state;
        saveFeedback(remarks,mail,(data)=>{
			if(data.err){
                return false;
            }
            if(data){
                message.success('感谢您提出的宝贵意见');
                this.setState({mail:'',remarks:''});
                this.props.closeCallBack();
            }
        });
    }
	confirm=()=>{
		this.setState({feedbackShow:false,mail:'',remarks:''});
		this.props.closeCallBack();
	}
	ok=()=>{
		const {remarks,mail} = this.state;
		if(!remarks || remarks.trim().length<1){
			message.error('请输入您的建议或疑问');
		}else if(!mail){
			message.error('请输入您的联系方式，如手机号');
		}else {
			this.saveFeedback();
		}
	
	}
	render() {	
		const {remarks,mail,loading,feedbackShow} = this.state;
		return (
			<Modal visible={feedbackShow}
				title="联系服务商"
				onOk={this.ok}
				onCancel={this.confirm}
				maskClosable={false}
				afterClose={this.confirm}
				footer={[
					<Button key="back" size="large" onClick={this.confirm}>关闭</Button>,
					<Button key="submit" type="primary" size="large" loading={loading} onClick={this.ok}>
					提交
					</Button>,
				]}
				className="feedback_min"
						>
			<div className="feedback_box">
			<style dangerouslySetInnerHTML={{ __html: stylesheet }} />
				<div className="ewm">
					<div className="info">
					<b>电话：</b><br/>
					029-85798790<br/><br/>
					<b>邮箱：</b><br/>
					1001@antbim.com<br/><br/>
					<b>官方网站：</b><br/>
					http://www.antbim.com
					</div>
					<div className="pic">
						<img src="../static/react-static/pcvip/imgs/ewmMaYi.png" />
					</div>
				</div>
				<div className="box">
					<span className="title">
						留言反馈：
					</span>
					<span  className="count" >
					<textarea className="textar" rows={4}  placeholder="您在使用蚂蚁分工的过程中，有任何的建议或疑问，都可以随时提交给我们"   value={remarks}
						onChange={(e)=>{
							this.setState({remarks:e.target.value})
						}} />
					</span>
				</div>
				<div className="box" >
					<span  className="title" >
						联系方式：
					</span>
					<span className="count" >
					<Input placeholder="您的联系方式，如手机号"  value={mail}
					onChange={(e)=>{
							this.setState({mail:e.target.value})
						}}  maxLength={30} />
					</span>
				</div>
		   </div>
		   </Modal>
		);
	}
}