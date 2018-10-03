import React from 'react'
import {Icon ,Input,Button, Checkbox,Spin} from 'antd';
import Router from 'next/router'
import stylesheet from 'styles/components/projectSelect.scss'
import { getProListByType } from '../core/service/project.service';
import { listScroll,isLoadingErr } from '../core/utils/util';
import NullView from '../components/nullView';

/*********
 *（必填） title:''            //标题
 *（必填）closedCallBack();     //关闭回调
 *（选填）selectedProjects:([{id:'',name:'',......},])   //选中的项目，数组格式
 *（选填）selectedCallBack([{id:'',name:'',.....}]);     //选中回调
 * ********/
export default class ProjectSelect extends React.Component {	
	constructor(props) {
		super(props)
		this.state = {
			projectList: [],
            projectListNowPage: 1,    
            projectListAllPage: 0,   
            projectListLoading: false,
            projectSelecteds: [],
            searchTxt:'',
		}	
	}
	componentWillMount(){
        this.getProjectList();
        if(this.props.selectedProjects){
            this.setState({projectSelecteds:this.props.selectedProjects});
        }
	}
	componentWillReceiveProps(nextProps){
        if(nextProps.selectedProjects){
            this.setState({projectSelecteds:nextProps.selectedProjects});
        }
	}	
	componentWillUnmount() {
        this.setState = (state,callback)=>{
            return;
        };  
    }
     //获取项目列表
     getProjectList(pageNo,search='') {
        if(!pageNo){
            pageNo = 1;
        }
        if(pageNo === 1){
            this.setState({projectListLoading:true});
        }else{
            this.setState({projectListMoreLoading:true});
        }
        getProListByType('1',pageNo,(data)=>{
            if(data.err){
                return false;
            }
            if(data.pageNo === 1){
                this.setState({projectList:data.projects});
            }else{
                const projectList = this.state.projectList;                
                data.projects.map((item)=>{
                    if(projectList.filter(val=>val.id === item.id).length === 0){
                        projectList.push(item);
                    }
                });
                this.setState({projectList:projectList});
            }
            this.setState({projectListAllPage:data.last, projectListNowPage:data.pageNo});
            this.setState({projectListLoading:false,projectListMoreLoading:false});
        },40,[],search);
    }
	scrollOnBottom(e) {
        const isOnButtom = listScroll(e);
        const { projectListAllPage, projectListNowPage } = this.state;
        if(isOnButtom && projectListNowPage<projectListAllPage) {
            this.getProjectList(projectListNowPage+1);
        }
    }
	selectedProject(id,name){
        const {projectSelecteds} =this.state;
        if(projectSelecteds.filter(val=>val.id === id).length === 0){
            projectSelecteds.push({
                'id':id,
                'name':name,
            });
        }else{
            projectSelecteds.map((item,index)=>{
                if(item.id === id){
                    projectSelecteds.splice(index,1);
                    return false;
                }
            });
        }
        this.setState({projectSelecteds:projectSelecteds});
    }
    deleteProject(id){
        const {projectSelecteds} =this.state;
        projectSelecteds.map((tim,index)=>{
            if(tim.id === id){
                projectSelecteds.splice(index,1);
            }
            this.setState({projectSelecteds:projectSelecteds});
        });
    }
    changeSearch(e){
        this.setState({searchTxt:e.target.value});
    }
    okChange(){
        const {projectSelecteds} =this.state;
        this.props.selectedCallBack(projectSelecteds);
        this.props.closedCallBack();
    }
    searchList(){
        const {searchTxt} =this.state;
        this.getProjectList('',searchTxt?searchTxt:'');
    }
	render() {	
		const {projectList,projectListAllPage,projectListNowPage,projectListLoading,projectListMoreLoading,projectSelecteds,searchTxt} =this.state;
        
        return (
			<div className="projectSelect">
            <style dangerouslySetInnerHTML={{ __html: stylesheet }}/>
                <div className="contentBox">
                    <div className="top">
                        <div className="select-title">{this.props.title}</div>
                        <div className="select-close"><Icon type="close" onClick={()=>{this.props.closedCallBack();}}/></div>
                    </div>
                    <div className="selectContent">
                        <div className="contentLeft">
                            <div className="search">
                                <Icon type="search" className="searchIcon" onClick={()=>{this.searchList();}}/>
                                <Input className="input" 
                                placeholder="项目名称" 
                                value={searchTxt} 
                                onChange={(e)=>{this.changeSearch(e);}}
                                onPressEnter={()=>{this.searchList();}}/>
                            </div>
                            <div className="contentList">
                                <ul>
                                    {projectSelecteds && projectSelecteds.length>0?projectSelecteds.map((tim,index)=>{
                                        return(
                                            <li key={tim.id} className="textMore">
                                                {tim.name}
                                            </li>
                                        )
                                    }):''}
                                </ul>
                            </div>
                            <div className="buttonBox">
                                <Button type="primary" className="primary" onClick={()=>{this.okChange();}}>确定</Button>
                                <Button type="back" className="cancel" onClick={()=>{this.props.closedCallBack();}}>取消</Button>
                            </div>
                        </div>
                        <div className="contentRight" onScroll={(e)=>{this.scrollOnBottom(e)}}>
                        <Spin spinning={projectListLoading}/>
                        {projectList && projectList.length>0?projectList.map((item,i)=>{
                            return(
                                <div className="project" key={item.id}>
                                    <div className="check" onClick={()=>{this.selectedProject(item.id,item.proname);}}>
                                        <Checkbox checked={projectSelecteds.filter(val=>val.id === item.id).length>0?true:false}></Checkbox>
                                    </div>
                                    <div className="proName" onClick={()=>{this.selectedProject(item.id,item.proname);}}>
                                        <span className="projectIcon">
                                            <svg aria-hidden="true" className="svgIcon">
                                            {item.attstr04 ?
                                                <use xlinkHref={item.attstr04}></use>
                                                :
                                                <use xlinkHref="#pro-myfg-1000"></use>
                                            }
                                            </svg>
                                        </span>
                                        <span className="textMore">{item.proname}</span>
                                    </div>
                                </div>
                            )
                        }):''}
                        {!projectListMoreLoading && projectListNowPage < projectListAllPage?
                            <div className="rowLoading">下拉加载更多</div>
                        :''}
                        {!projectListMoreLoading && projectListNowPage === projectListAllPage?
                            <div className="rowLoading">已经到底喽</div>
                        :''}
                        {projectListMoreLoading?
                            <div className="rowLoading"><Icon type="loading" className="loading"/>正在加载中</div>
                        :''}
                        </div>
                    </div>
                </div>
                <div className="cen"></div>
            </div>
		)
	}
}
