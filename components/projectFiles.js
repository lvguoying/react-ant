import React from 'react';
import { Icon,Input,Spin } from 'antd';

import stylesheet from '../styles/components/projectFiles.scss';
import { getFileListByProjectId } from '../core/service/project.service';
import { listScroll } from '../core/utils/util';
import dingJS  from '../core/utils/dingJSApi';
import NullView from './nullView';

const Search = Input.Search;

/*
 * projectId:''                  // 项目ID
 */

export default class ProjectFiles extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            parentId:'',
            loading:false,
            loadingCount:0,
            fileBoxList: [],
            fileList: [],
            fileBread: [],
            fileNowPage: 1,
            fileAllPage: 0,
        }
    }

    componentWillMount(){
        this.getFileList(this.props.projectId,'',1);
    }

    componentWillReceiveProps(nextProps){ 
        if(nextProps.projectId !== this.props.projectId){ 
            this.setState({
                fileBoxList: [],
                fileList: [],
                fileBread: [],
                fileNowPage: 1,
                fileAllPage: 0,
                parentId:'0'
            });
            this.getFileList(nextProps.projectId,'重来',1);
        }
    }

    componentWillUnmount() {
        this.setState = (state,callback)=>{
            return;
        };  
    }

    getFileList(projectId,parentId,pageNo,searchTxt=''){
        this.setState({loading:true});
        if(!projectId){
            projectId = this.props.projectId;
        }
        if(parentId ===''){
            parentId = this.state.parentId;
            if(parentId === ''){
                parentId = '0'
            }
        }else if(parentId === '重来' || parentId===null){
            parentId = '0';
        }else{
            this.setState({parentId:parentId});
        }
        if(!pageNo){
            pageNo = 1;
        }
        getFileListByProjectId(projectId,parentId,50,pageNo,(res)=>{
            if(res.err){
                this.setState({loadingCount:'err',loading:false});
                return false;
            }

            if(res.treeData.list){
                if(res.treeData.pageNo === 1){
                    this.setState({fileBoxList:res.treeData.list});
                }else{
                    const { fileBoxList } = this.state;
                    res.treeData.list.map((item)=>{
                        if(fileBoxList.filter(val=>val.id === item.id).length === 0){
                            fileBoxList.push(item);
                        }                        
                    });
                    this.setState({fileBoxList:fileBoxList});
                }
                //this.setState({filesCount:res.treeData.count});
            }else{
                this.setState({fileBoxList:[]});
            }

            this.setState({
                fileBread:res.parentList?res.parentList:[],
                fileList:res.fileList?res.fileList:[],
                fileNowPage:res.treeData?res.treeData.pageNo:1,
                fileAllPage:res.treeData?res.treeData.last:0
            });

            //this.setState({filesCount:res.fileCount});

            if(this.state.loadingCount === 'err'){
                this.setState({loadingCount:0});
            }else{
                this.setState({loadingCount:this.state.loadingCount+1});
            }
            this.setState({loading:false});
        },searchTxt);
    }

    onScroll(e){
        const { fileNowPage,fileAllPage } = this.state;
        const isOnBottom = listScroll(e);
        if(isOnBottom && fileNowPage < fileAllPage){
            this.getFileList('','',1);
        }
    }

    render() {
        const {loading,fileBoxList,fileBread,fileList,searchTxt,loadingCount} = this.state;
        return (
            <div className="projectFiles">
                <style dangerouslySetInnerHTML={{ __html: stylesheet }} />
                <div className="filesTop">
                    <div className="filesBread">
                        {fileBread.map((item,i)=>{
                            if(i === fileBread.length-1){
                                return <span key={item.id} className="textMore">{item.taskname}</span>
                            }else{
                                return <label key={item.id}><span className="textMore" onClick={()=>{this.getFileList('',item.id,1)}}>{item.taskname}</span><Icon type="right" /></label>
                            }
                        })}
                        
                    </div>
                    <div className="filesSearch">
                    <Search
                        placeholder="文件搜索"
                        onSearch={value => {this.setState({parentId:''});this.getFileList('',null,1,value)}}
                        style={{ width: 200 }}
                    />
                    </div>
                </div>
                <div className="filesBottom">
                    <div className="table_tit">
                        <div className="table_tr">
                            <div className="table_td table_td_more">文件名</div>
                            <div className="table_td">文件类型</div>
                            <div className="table_td">上传人</div>
                            <div className="table_td">修改时间</div>
                        </div>
                    </div>
                    {/*<div className="p">
                        共计： {filesCount} 
                    </div>*/}
                    <div className="table_cont" onScroll={(e)=>{this.onScroll(e)}}>
                        <Spin spinning={loading} />
                        {fileList.map((item)=>{
                            return (
                                <div className="table_tr" key={item.id}>
                                    <div className="table_td table_td_Load table_td_more textMore" onClick={()=>{dingJS.previewImage(item)}} ><Icon type="download" className="download"/>{item.fileName}</div>
                                    <div className="table_td table_td_Load" onClick={()=>{dingJS.previewImage(item)}}>
                                        {item.type==='0'?'描述文件':''}
                                        {item.type==='1'?'讨论文件':''}
                                        {item.type==='3'?'成果文件':''}
                                        {item.type==='5'?'过程文件':''}
                                    </div>
                                    <div className="table_td">{item.createBy.name}</div>
                                    <div className="table_td">{item.createDate}</div>
                                </div>
                            )
                        })}
                        {fileBoxList.map((item)=>{
                            return (
                                <div className="table_tr" key={item.id}>
                                    <div className="table_td_more table_td textMore">
                                        <Icon type="folder" className="fileIcon" />
                                        <span onClick={()=>{this.getFileList('',item.id,1)}}>
                                            <span style={{margin:'0 3px 0 0'}}>{item.attstr02?item.attstr02:item.rank}</span>
                                            ——
                                            <span style={{margin:'0 0 0 3px'}}>{item.taskname}</span>
                                        </span>
                                    </div>
                                    <div className="table_td">---</div>
                                    <div className="table_td">---</div>
                                    <div className="table_td">{item.createDate}</div>
                                </div>
                            )
                        })}
                        {fileList.length ===0 && fileBoxList.length ===0 && loadingCount!=='err' &&
                            <NullView />
                        }  
                        {fileList.length ===0 && fileBoxList.length ===0 && loadingCount==='err' &&
                            <NullView isLoadingErr={true} restLoadingCallBack={()=>{this.getFileList(this.props.projectId,'',1)}} />
                        }                        
                    </div>
                </div>
            </div>
        );
    }
}