import React from 'react'
import {Spin,Icon,Modal,Row, Col,Popover,Button} from 'antd';
import InfiniteScroll from 'react-bidirectional-infinite-scroll';
import Router from 'next/router'
import stylesheet from 'styles/components/message.scss'
import {findReadMessage,
		updateRead,
		updateAllRead,
		deleteBath,
} from '../core/service/message.service';
import { listScroll} from '../core/utils/util';
import NullView from '../components/nullView';
const confirm = Modal.confirm;
/*********
 * closeCallBack()(必填)  //关闭回调
 * messageCountOnChange()(必填) // 返回未读数量
 * 
 * ********/
export default class Message extends React.Component {	
	constructor(props) {
		super(props)
		this.state = {
			messData:[],
			page:1, //当前页数
			last:0,//总页数
			loading: false,
			messageListMoreLoading:false,
			taskDetailLoading:false,
			messageCount:0, //未读数量
			finally: 'none',
			topIcon: 'none',
			read:1,
			isRead:true, //已读
			selectIds:[],
			selectAllType:'0',
		}	
	}
	componentWillMount(){
		this.getMessage();
	}
	componentWillReceiveProps(nextProps){
	}	
	componentWillUnmount() {
        this.setState = (state,callback)=>{
            return;
        };  
    }
	getMessage(pageNow=1){
		if(pageNow===1){
			this.setState({loading:true});
		  }else{
			this.setState({messageListMoreLoading:true});
		  }    
		if (!pageNow) {
			pageNow = 1;
		}
		findReadMessage(pageNow,(data)=>{
			if(data.err){
                return false;
            }
			if(data){
				if(data.list){
					if(data.page ===1){
						this.setState({
							messData: data.list,
							messageCount: data.messageCount,
							messageRedCount: data.messageRedCount,
							page:data.page,
							last:data.last,
						});
					this.props.messageCountOnChange(data.messageCount);
					}else{
						let newPage = JSON.parse(JSON.stringify(this.state.messData));
						data.list.map((item,i)=>{
							let key=item.id;
							newPage.push(item);
						});
						this.setState({messData:newPage});
					}
					this.setState({page:data.page,last:data.last});
				}
			}else{
				this.setState({messData:[],page:1,last:0});
			}
			this.setState({loading:false,messageListMoreLoading:false});
		});
	}

	// 未读全部改为已读
	readAll(){
		var that = this;
		confirm({
			title: '您确定要全部已读？',
			okText: '确定',
			cancelText: '取消',
			onOk() {	        		
				updateAllRead((data)=>{
					if(data.err){
						return false;
					}
					that.setState({
						messData: data.list,
						last: data.last,
						messageCount: data.messageCount,
						messageRedCount: data.messageRedCount,
					});
					that.props.messageCountOnChange(data.messageCount);
				});
			},
			onCancel() {},
		});	
	}
	//跳转任务详情与未读改为已读
	read(item){
		const {messageCount}=this.state;
		let ids=[];
		ids.push(item.id);
		updateRead(ids,(data)=>{
			if(data.err){
                return false;
            }
			this.setState({messageCount:data.messageCount});
			this.props.messageCountOnChange(data.messageCount);
			this.props.closeCallBack();
			Router.push('/pc_projectDetails?id='+item.projectId+'&taskId='+item.taskinfoId);
		});
	}
	
	renderMess(){
		let _this=this;
		const {messData,selectIds,read,messageCount}=this.state;
		let nullData={alertTxtIcon:'frown-o'};
		let data=messData.length>0?( messData.map(function(item,index){
			let content = {};
			try {
				content = JSON.parse(item.description);
			} catch (error) {
				content = {'描述':item.description,'操作者':item.createBy.name};
			}
			let arr=[];
			for(var o in content){ 
				arr.push(<span className="tit" style={{display: 'block'}} key={o}><span className="cont"> {o} : </span> 
						{o == '讨论内容'?<div className="cont" dangerouslySetInnerHTML={{__html:content[o]}}></div>:<div className="cont">{content[o]}</div>}
					</span>);
			}
			return <li key={index}>
						<div className="mess">
								<div className="messBox">
										{item.type != 'b'?
										<Popover placement="right" content='点击查看任务详情'>
											<div className="tit-size" style={{cursor:'pointer'}} onClick={()=>{_this.read(item);}}>
												<span className="subject">{item.subject}</span>	
												<span className="time tit">{item.createDate }</span>
											</div>
										</Popover>:
										<Popover placement="right" content='点击查看项目详情'>
										<div className="tit-size" style={{cursor:'pointer'}}  onClick={()=>{_this.read(item);}}>
											<span className="subject">{item.subject}</span>	
											<span className="time tit">{item.createDate }</span>
										</div>
										</Popover>}
										{<div className="msg-content">{arr}</div>}
										<div className={item.read=='0'?'read readRed':'read'}></div>
								</div>
						</div>
						<div className="clear"></div>
					</li>
				
		}) ):<NullView data={nullData}/>
		return data;
	}
  	
	/*
	 * 滚动到底部
	 * */
	/*scrollLoad(){
		let {page, last} = this.state;
		if (page < last) {
			page++;
			this.setState({ messageListMoreLoading: true, page , finally: 'block'});
			this.getMessage(page);
		} else {
			if(last>1){
				this.setState({ finally: 'block' });
			}
		}
	}*/
	confirm=()=>{
		this.setState({last:1,read:'1'});
		this.props.closeCallBack();
	}
	//下拉加载
	scrollBottom(e){
		const onBottom = listScroll(e);
		const {page,last} = this.state;
		if(onBottom && page<last){
			this.getMessage(page+1);
		}
	}
	//删除已读
	delBath(){
		let {selectIds,read} = this.state;
		var that = this;
		confirm({
			title: '您确定要清除已读？',
			okText: '确定',
			cancelText: '取消',
			onOk() {	        		
				deleteBath(selectIds,1,(data)=>{
					if(data.err){
						return false;
					}
					that.setState({
						messData: data.list,
						last: data.last,
						messageCount: data.messageCount,
						messageRedCount: data.messageRedCount,
						selectAllType:'0'
					});
				});
			},
			onCancel() {},
		});	
	}
	
	render() {	
		const {messageCount,loading,messageListMoreLoading,read, page, last} =this.state;
		return (
			<Modal 
				visible={true}
				title="消息通知"
				onOk={this.confirm}
				onCancel={this.confirm}
				maskClosable={false}
				afterClose={this.confirm}
				className="mes_min"
				footer={[
					<Button key="back" size="large" onClick={()=>{this.delBath()}}>清除已读</Button>,
			        <Button key="submit" type="primary"  size="large" onClick={()=>{this.readAll();}}>一键已读</Button>
				]}>
			<div className="mes_box">
			<style dangerouslySetInnerHTML={{ __html: stylesheet }} />
			{messageCount > 0?<div className={read=='1'?'tag tag-red':'tag'}>{messageCount>99?'99+':messageCount}</div>:null}		
			<div className="message" onScroll={(e)=>{this.scrollBottom(e);}}>
				<div className="box">
					<Row className="content">
						<Col span={20}  >
							<ul className="right">
								<Spin size="large" spinning={loading}/>
								{this.renderMess()}
								{!messageListMoreLoading && page<last?
								<div className="finally">下拉加载更多</div>	
								:''}
								{!messageListMoreLoading && page===last?
									<div className="finally">已经到底喽</div>
								:''} 
								{messageListMoreLoading?
									<div className="finally"><Icon type="loading"  className="loadingIcon" />正在加载更多</div>
								:''}
							</ul>			
						</Col>
					</Row>
				</div>
	       </div>
		   </div>
		   </Modal>
		)
	}
}
