import React from 'react';
import {Icon,Spin,Menu,Input,Button} from 'antd';
import stylesheet from 'styles/views/help.scss';
import Header from '../components/header';
import JSP from '../core/utils/dingJSApi';
import { findList,findTypeList,getDetail } from '../core/service/help.service';
import NullView from '../components/nullView';



export default class Help extends React.Component { 
	constructor() {
		super()
		this.state = {
				menuSelect: '',//类型列表
				detailShow:false,//是否显示详情
				selectId:'',//选择的id
				classDet:'help_right_box fadeInRight animated',
				searchTitle:'',//搜索标题
                helpCount:0,//问题数量
                typeList:[],
                list:[],
				details:{},
				showImgUrl:'', //显示大图url
		};
	}
   
	componentWillMount() {
		this.getHelpList();
	}
    componentWillReceiveProps(nextProps) {
	}
	
	componentWillUnmount() {    
        this.setState = (state,callback)=>{
            return;
        };  
    }

    //获取列表
    getHelpList(){
        findTypeList({},(data)=>{
			if(data.err){
                return false;
            }
            if(data && data.length >0){
                findList(-1,{type:''},(res)=>{
					if(res.err){
						return false;
					}
                    if(res){
                        this.setState({list:res.list});
                    }
                });
            }
            this.setState({typeList:data});
        });
    }
handleClick(thim) {
	console.log(thim,8989)
			findList(-1,{type:thim.key},(res)=>{
				if(res.err){
					return false;
				}
				if(res){
					this.setState({list:res.list});
				}
			});
}
// /**搜索 */
search=()=>{
	const {searchTitle}= this.state;
	findList('1', { title:searchTitle },(data)=>{
		if(data.err){
			return false;
		}
        this.setState({list:data.list});
    });
}	
showDeatil(id,e){
        if(id){
            getDetail(id,(data)=>{
				if(data.err){
					return false;
				}
                this.setState({detailShow:true,selectId:id,details:data,classDet:'help_right_box fadeInRight animated'});
            });
        }
}
onchangeName(e){
		this.setState({searchTitle:e.target.value});
	}
closeCall(closeState){
	this.setState({classDet:'help_right_box fadeOutRight animated'});
	setTimeout(()=>{
		this.setState({detailShow:false});
	},300)
	
}

showImgClick(e){
	if(e.target.nodeName=='IMG'){ 
		const img = {'fileUrlAbsolute':e.target.src};
		JSP.previewImage(img);
    } 		
}
render() {
	const {detailShow,selectId,searchTitle,helpCount,typeList,list,details} = this.state;
	return (
			<div className="help">
				<style dangerouslySetInnerHTML={{ __html: stylesheet }} />
                <Header/>
				<div className="box">
					<div className="left">
						{/* <Spin spinning={} /> */}
							<Menu onClick={(thim) => this.handleClick(thim)} selectedKeys={[this.state.menuSelect]}>
							{typeList && typeList.length > 0 ? (
									typeList.map((item, i) => {
										return <Menu.Item key={item.type}>{item.type} <span className="lab">{item.count}</span> <Icon type="right" /></Menu.Item>
									})
							) :''}
							</Menu>
					</div>
						<div className="right">
							<div className="top">
								<div className="search">
									<Input className="input"
									maxLength={25}
									value={searchTitle}
									onChange={(e)=>{this.onchangeName(e)}}	></Input>
									<div className="but" onClick={this.search}>搜索</div>
								</div>	
							</div>
							{/* <Spin spinning={} /> */}
								<table className="bottom">
										<tbody>
												<tr >
													<th width="25%">问题</th>
													<th width="40%">更新时间</th>
												</tr>
												{list && list.length > 0 ? (
														list.map((item, i) => {
																return <tr onClick={(e)=>this.showDeatil(item.id,e)} key={i}>
																					<td width="25%">{item.title}</td>
																					<td width="40%">{item.updateDate}</td>
																				</tr>
														})
												) : <tr><td colSpan={2}><NullView/> </td></tr>}
										</tbody>
								</table>
							</div>
						{detailShow?
                        <div className={this.state.classDet}>
                            <div className="user_box">
                                {/* <Spin spinning={loading}> */}
                                    <div className="title" >
                                        {details && details.title?details.title:''}
                                    </div>
                                    <div className="content">
                                        {details && details.content?
											<span onClick={(e)=>{e.stopPropagation();this.showImgClick(e)}} 
												  dangerouslySetInnerHTML={{__html:details.content}}>
											</span>				
										:''}
                                    </div>
                                    <div className="but"><Button type="primary" onClick={()=>this.setState({detailShow:false})}>关闭</Button></div>
                                {/* </Spin> */}
                            </div> 
                        </div>
                        :null}
					</div>
				</div>
		);
	}
}
