import React from 'react';
import { Icon, Dropdown, Menu, Button, Input, DatePicker, Tooltip, Popover, Checkbox, Spin, message, Modal, Upload } from 'antd';
import locale from 'antd/lib/date-picker/locale/zh_CN';
import moment from 'moment';

import stylesheet from '../styles/components/taskDetails.scss';
import {
	getTaskDetailsDataById,
	getChildTaskById,
	getCoopTaskById,
	getTaskFilesById,
	cancelAttentionWitchTask,
	addAttentionWitchTask,
	updateTaskById,
	updateTaskStateByCode,
	deleteTaskById,
	urgeTaskById,
	urgeSonTaskByTaskId,
	claimTaskById,
	deleteCoopTaskById,
	createTask,
	addTalkAtTask,
	deleteTalkById,
	getSonTask,
	attentionUsers
} from '../core/service/task.service';
import { deleteFileById, updateImgsInService,updateDingFileService } from '../core/service/file.service';
import { stringToText, pasteImg, stateColor,getTeamInfoWithMoney,onlyNumber,beforeUpload } from '../core/utils/util';
import TagComponent from '../components/tag';
import Storage from '../core/utils/storage';
import { baseURI } from '../core/api/HttpClient';
import TaskCopy from '../components/taskCopy';
import TaskMove from '../components/taskMove';
import TaskAddWithCoop from '../components/taskAddWithCoop';
import dingJS from '../core/utils/dingJSApi';
import MoneyEnd from '../components/moneyEnd';

const { TextArea } = Input;
const confirm = Modal.confirm;

/*
 * （必填）closeCallBack()            // 关闭回调
 * （必填）taskId:''                  // 详情页任务ID
 * （必填）projectId:''
 * （选填）updatedTaskCallBack()      // 当详情数据修改之后，返回修改的对应数据 局部刷新列表数据
 * （选填）isSmall:false              // 是否是小窗口，小窗口要屏蔽一些功能，默认false
 */

export default class TaskDetails extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			taskInfo: {
				'id': '',
				'name': '',
				'number': '',
				'state': '',
				'stateButton': '',
				'flowButton': '',
				'beginButton': '',
				'bread': [],
				'desc': '',
				'descFiles': [],
				'tags': [],
				'attention': '',
				'fzr': '',
				'qrr': '',
				'realityEndTime': '',
				'planEndTime':'',
				'workTime': '',
				'taskMoney': '',
				'lev': '',
				'childCount': '',
				'childSuccess': '',
				'coopTaskCount': '',
				'filesCount': '',
				'talk': [],
				'parentIds':'',
				'collectList':[],
				'projectJurisdiction':false
			},
			taskInfoCopy: {},
			taskInfoLoading: false,
			jurisdiction: false,
			detailTxtEdit:false,

			dict_lev: [],                        // 重要程度 字典
			switchAct: [],
			showLog: true,
			saveShow: false,

			childList: [],
			childListLoading: false,

			coopList: [],
			coopListLoading: false,

			filesList: [],
			filesListLoading: false,

			taskCompleteModalShow: false,
			taskCompletDesc: '',
			taskCompletLoading: false,
			taskCompletFiles: [],

			taskCheckModalShow: false,
			taskCheckModalTitle:'',
			taskCheckDesc: '',
			taskCheckLoading_x: false,
			taskCheckLoading_v: false,

			user: {},

			createTask: false,
			newTaskFzr: {},
			newTaskEndTime: '',
			newTaskName: '',

			addTalk: false,
			newTalkPromptTxt: '请输入讨论内容',
			newTalkDesc: '',
			newTalkReplyUserId: '',
			newTalkFiles: [],

			previewVisible: false,                // 本地放大图片
			previewImage: '',

			uploadList_desc: [],
			uploadList_talk: [],
			uploadList_state:[],

			taskCopyShow:false,
			taskMoveShow:false,
			addCoopTaskShow:false,
			coopAddType:'',

			teamMoneyEnd:false,

			childTaskModalShow:false, //未完成子任务弹层
			sonTaskinfoList:[],//未完成的子任务
		}
	}	

	componentWillMount() {
		this.getTaskDetail(this.props.taskId, this.props.projectId);
		let user = Storage.get('user');
		this.setState({ user: user });
	}

	componentWillReceiveProps(nextProps) { 
		if(nextProps.taskId !== this.props.taskId){
			this.setState({detailTxtEdit:false,saveShow:false,createTask: false});
			this.getTaskDetail(nextProps.taskId, nextProps.projectId);
		}
	}

	componentWillUnmount() {
        this.setState = (state,callback)=>{
            return;
        };  
    }

	getTaskDetail(taskId, proId) {
		this.setState({ taskInfoLoading: true });
		getTaskDetailsDataById(taskId, proId, (data) => {
			if(data.err){
                return false;
            }

			let { taskInfo } = this.state;

			if (this.props.updatedTaskCallBack && (taskInfo.childCount != data.antTaskinfo.childCount || taskInfo.childSuccess != data.antTaskinfo.childSuccess)) {
				const task = {
					'id': data.antTaskinfo.id,
					'childCount': data.antTaskinfo.childCount,
					'childSuccess': data.antTaskinfo.childSuccess
				}
				this.props.updatedTaskCallBack(task);
			}
			if (this.props.updatedTaskCallBack && data.leaveList.length !== taskInfo.talk.length) {
				const talkList = data.leaveList.filter(val=>val.type==='0');
				const taskUp = {
					'id': data.antTaskinfo.id,
					'talkCount': talkList.length
				}
				this.props.updatedTaskCallBack(taskUp);
			}
			if (this.props.updatedTaskCallBack && data.antTaskinfo.stateName !== taskInfo.state) {
				const taskUp = {
					'id': data.antTaskinfo.id,
					'state': data.antTaskinfo.stateName
				}
				this.props.updatedTaskCallBack(taskUp);
			}
			if (this.props.updatedTaskCallBack && data.antTaskinfo.realityEndTime !== taskInfo.realityEndTime) {
				const taskUp = {
					'id': data.antTaskinfo.id,
					'realityEndTime': data.antTaskinfo.realityEndTime?data.antTaskinfo.realityEndTime:''
				}
				this.props.updatedTaskCallBack(taskUp);
			}
			if (this.props.updatedTaskCallBack && data.antTaskinfo.planEndTime !== taskInfo.planEndTime) {
				const taskUp = {
					'id': data.antTaskinfo.id,
					'planEndTime': data.antTaskinfo.planEndTime?data.antTaskinfo.planEndTime:''
				}
				this.props.updatedTaskCallBack(taskUp);
			}


			if(data.antTaskinfo.state == 0 || data.antTaskinfo.state == 3 ){
				this.setState({jurisdiction:true});
			}else{
				this.setState({jurisdiction:false});
			}

			taskInfo.id = data.antTaskinfo.id;
			taskInfo.project = {'id':data.project.id,'name':data.project.proname};
			taskInfo.name = data.antTaskinfo.taskname;
			let numberS = '';
			if (data.antTaskinfo.taskinfoNumber) {
				numberS = data.antTaskinfo.taskinfoNumber.numberS + '.';
			}
			taskInfo.number = numberS + data.antTaskinfo.rank;
			taskInfo.state = data.antTaskinfo.stateName;
			taskInfo.stateButton = data.antTaskinfo.stateButton;
			taskInfo.flowButton = data.antTaskinfo.flowButton;
			taskInfo.beginButton = data.antTaskinfo.beginButton;
			taskInfo.attention = data.antTaskinfo.collect ? true : false;
			taskInfo.bread = data.parentList;
			taskInfo.desc = stringToText(data.antTaskinfo.description, 'innerText'); 
			let descImgs = stringToText(data.antTaskinfo.description, 'img');
			taskInfo.descFiles = JSON.parse(JSON.stringify(data.taskinfoFiles));
			descImgs.map((item,i)=>{
				taskInfo.descFiles.push({
					'fileUrlAbsolute':item,
					'id': 'descStrImg'+i,
					'name': 'descStrImg'+i
				})
			});
			taskInfo.tags = [];
			data.label.map((item, i) => {
				taskInfo.tags.push({
					'id': item.label.id,
					'name': item.label.labelname,
					'color': item.label.color,
					'type': item.label.type,
					'recordId': item.id
				})
			});
			taskInfo.fzr = data.antTaskinfo.userResponse ? data.antTaskinfo.userResponse : '';
			taskInfo.qrr = data.antTaskinfo.userFlow ? data.antTaskinfo.userFlow : '';
			// realityEndTime 实际完成时间  planEndTime 计划完成时间
			taskInfo.realityEndTime = data.antTaskinfo.realityEndTime ? data.antTaskinfo.realityEndTime : '';
			taskInfo.planEndTime = data.antTaskinfo.planEndTime ? data.antTaskinfo.planEndTime : '';
			taskInfo.workTime = data.antTaskinfo.workTime;
			taskInfo.taskMoney = data.antTaskinfo.flowConten;
			taskInfo.lev = data.antTaskinfo.coefficienttype;
			taskInfo.childCount = data.antTaskinfo.childCount;
			taskInfo.childSuccess = data.antTaskinfo.childSuccess;
			taskInfo.coopTaskCount = data.taskrRelationCount;
			taskInfo.filesCount = data.filesCount;
			taskInfo.talk = data.leaveList;
			taskInfo.parentIds = data.antTaskinfo.parentIds;
			taskInfo.parentId = data.antTaskinfo.parent?data.antTaskinfo.parent.id:'0';
			taskInfo.projectJurisdiction = data.project.jurisdiction;
			const collectList = [];
			if(data.collectList){
				data.collectList.map((item)=>{
					collectList.push(item.user);
				});
			}
			taskInfo.collectList = collectList;
			this.setState({ taskInfo: taskInfo });

			this.setUploadListWithDescFile(taskInfo);

			let taskInfoCopy = JSON.parse(JSON.stringify(taskInfo));
			this.setState({ taskInfoCopy: taskInfoCopy });

			const dict_lev = data.coefficienttype;
			this.setState({ dict_lev: dict_lev });

			this.setState({ taskInfoLoading: false });

			this.state.switchAct.map((item, i) => {
				if (item === '子任务') {
					this.getChildList(taskInfo.id);
				} else if (item === '协作任务') {
					this.getCoopList(taskInfo.id);
				} else if (item === '文件') {
					this.getFilesList(taskInfo.id);
				}
			});
		},this.props.isSmall);
	}

	getChildList(id) {
		this.setState({ childListLoading: true });
		getChildTaskById(id, (data) => {
			if(data.err){
                return false;
            }
			this.setState({ childList: data });
			this.setState({ childListLoading: false });
		},this.props.isSmall);
	}

	getCoopList(id) {
		this.setState({ coopListLoading: true });
		getCoopTaskById(id, (data) => {
			if(data.err){
                return false;
            }
			this.setState({ coopList: data });
			this.setState({ coopListLoading: false });
		},this.props.isSmall);
	}

	getFilesList(id) {
		this.setState({ filesListLoading: true });
		getTaskFilesById(id, (data) => {
			if(data.err){
                return false;
            }
			this.setState({ filesList: data });
			this.setState({ filesListLoading: false });
		},this.props.isSmall);
	}

	handlePreview = (file) => { 
		this.setState({
			previewImage: file.url || file.thumbUrl,
			previewVisible: true,
		});
	}

	setUploadListWithDescFile(taskInfo) {
		if (!taskInfo) {
			taskInfo = this.state.taskInfo;
		}
		let uploadList_desc = [];
		taskInfo.descFiles.map((item, i) => {
			if (!item.type) {
				uploadList_desc.push({
					uid: item.id,
					name: item.fileName?item.fileName:item.name,
					status: 'done',
					url: item.fileUrlAbsolute,
					typeSet: item.fileName?'DescFile':'DescStrFile'
				})
			}
		});
		this.setState({ uploadList_desc: uploadList_desc });
	}

	switchOnChange(type) {
		let { switchAct } = this.state;
		const index = switchAct.indexOf(type);
		if (index === -1) {
			switchAct.push(type);
			switch (type) {
				case '子任务':
					this.getChildList(this.state.taskInfo.id);
					break;
				case '协作任务':
					this.getCoopList(this.state.taskInfo.id);
					break;
				case '文件':
					this.getFilesList(this.state.taskInfo.id);
					break;
			}
		} else {
			switchAct.splice(index, 1);
		}
		this.setState(({ switchAct: switchAct }));
	}

	uploadListOnChange_talk(list) {
		this.setState({ uploadList_talk: list.fileList });
		let newTalkFiles = this.state.newTalkFiles;
		if (list.file.status === 'done') {
			newTalkFiles.push(list.file.response.data);
			this.setState({ newTalkFiles: newTalkFiles });
		} else if (list.file.status === 'removed') {
			newTalkFiles.map((item, i) => {
				if (item.id === list.file.response.data.id) {
					newTalkFiles.splice(i, 1);
					this.setState({ newTalkFiles: newTalkFiles });
					return false;
				}
			});
		}
	}

	uploadListOnChange_desc(list) {
		this.setState({ uploadList_desc: list.fileList });
		let { taskInfo } = this.state;
		if (list.file.status === 'done') {
			taskInfo.descFiles.push({
				'id': list.file.response.data.id,
				'uid': list.file.uid
			});
			this.setState({ taskInfo: taskInfo, saveShow: true });
		} else if (list.file.status === 'removed') {
			const { taskInfo } = this.state;
			switch(list.file.typeSet){
				case 'DescFile':
					taskInfo.descFiles.map((item, i) => {
						if (item.id === list.file.uid) {
							taskInfo.descFiles[i].type = 'DELL';
							this.setState({ taskInfo: taskInfo, saveShow: true });
							return false;
						}
					});
				break;
				default: 
					taskInfo.descFiles.map((item, i) => {
						if (item.id === list.file.uid) {
							taskInfo.descFiles.splice(i,1);
							this.setState({ taskInfo: taskInfo, saveShow: true });
							return false;
						}
					});
				break;
			}			
		}
	}

	updateImg(type) {
		dingJS.uploadImage((res) => {
			const data = res.data;
			if (type === '描述附件') {
				let { taskInfo } = this.state;
				let descFiles = taskInfo.descFiles?taskInfo.descFiles:[];
				data.map((item, i) => {
					descFiles.push(item);
				});
				taskInfo.descFiles = descFiles;
				this.setState({ taskInfo: taskInfo });
				this.setState({ saveShow: true });
			} else if (type === '成果文件') {
				let { filesList,taskInfo } = this.state;
				data.map((item, i) => {
					filesList.taskinfoFiles.push(item);
				});
				this.setState({ filesList: filesList });
				updateDingFileService(taskInfo.id,'3',data,(resData)=>{
					if(resData.err){
						return false;
					}
					this.getTaskDetail(taskInfo.id, this.props.projectId);
				},this.props.isSmall)
			} else if (type === '讨论附件') {
				let { newTalkFiles } = this.state;
				data.map((item, i) => {
					newTalkFiles.push(item);
				});
				this.setState({ newTalkFiles: newTalkFiles });
			} else if (type === '标记完成'){ 
				let { taskCompletFiles } = this.state; 
				data.map((item,i)=>{
					taskCompletFiles.push(item);
				});
				this.setState({taskCompletFiles:taskCompletFiles});
			}
		}, true);
	}

	selUser(title,jurisdiction) {
		if(!jurisdiction){
			return;
		}
		let selectedUsers = [];
		let { taskInfo, newTaskFzr } = this.state;
		if (title === '负责人') {
			selectedUsers.push(taskInfo.fzr);
		} else if (title === '确认人') {
			selectedUsers.push(taskInfo.qrr);
		} else if (title === '新建子任务负责人') {
			selectedUsers.push(newTaskFzr);
		}
		const that = this;
		dingJS.selectUser(selectedUsers, '请选择'+title, (data) => {
			const user = data[0];
			if (title === '负责人') {				
				if (user.emplId !== taskInfo.fzr.userid) {
					taskInfo.fzr = { ...user };
					that.setState({taskInfo:taskInfo});
					that.setState({ saveShow: true });
				}
			} else if (title === '确认人') {				
				if (user.emplId !== taskInfo.qrr.userid) {
					taskInfo.qrr = { ...user };
					that.setState({taskInfo:taskInfo});
					that.setState({ saveShow: true });
				}
			} else if (title === '新建子任务负责人') {
				that.setState({ newTaskFzr: user });console.log(user,newTaskFzr,4545);
			}
		}, false,this.props.isSmall);
	}
	getNickNameByName(name){
        let str = name.replace(/[^\u4e00-\u9fa5]/gi,"");
        let nickname = str.substr(str.length-2);  
        return nickname;
    }
	pasteingImg(type, e) {
		pasteImg(e, (url) => {
			updateImgsInService(url, (data) => {
				if(data.err){
					return false;
				}
				const fileObj = data;
				if (type === '描述附件') {
					fileObj.type = '';
					let { taskInfo } = this.state;
					taskInfo.descFiles.push(fileObj);
					this.setUploadListWithDescFile(taskInfo);
					this.setState({ saveShow: true, taskInfo: taskInfo });
				} else if (type === '讨论附件') {
					let img = {
						uid: fileObj.id,
						thumbUrl: fileObj.fileUrlAbsolute,
						status:'done'
					}
					let { uploadList_talk } = this.state;
					uploadList_talk.push(img);

					let newTalkFiles = this.state.newTalkFiles;
					newTalkFiles.push(fileObj);

					this.setState({ uploadList_talk: uploadList_talk, newTalkFiles:newTalkFiles});
				} else if (type === '标记完成') {
					fileObj.type = '';
					fileObj.uid = fileObj.id;
					fileObj.name = fileObj.fileName;
					fileObj.status = 'done';
					fileObj.thumbUrl = fileObj.fileUrlAbsolute;
					let { taskCompletFiles } = this.state; 
					taskCompletFiles.push(fileObj); 
					this.setState({ taskCompletFiles: taskCompletFiles });
				}
			},this.props.isSmall);
		});
	}

	expitMore(taskids,type){
		const taskInfo = this.state.taskInfo;
		if(taskids && taskids.length>0){
			urgeTaskById(taskids,taskInfo.id,type,(data)=>{
				if(data.err){
					return false;
				}
				message.success("催办成功");
			},this.props.isSmall)
		}
	}

	switchListRender() {
		const { switchAct, createTask, childList, childListLoading, coopList, coopListLoading, filesList, filesListLoading, newTaskFzr, taskInfo, user } = this.state;
		let { isSmall } = this.props;
		if(!isSmall){
			isSmall = false;
		}
		let childCuibanTask = [];
		let frontCuibanTask = [];
		if(childList && childList.length>0){
			childList.map((item)=>{
				if(item.state=='0' || item.state=='2'){
					childCuibanTask.push(item.id);
				}
			})
		}
		if(coopList && coopList.frontTaskinfo && coopList.frontTaskinfo.length>0){
			coopList.frontTaskinfo.map((item)=>{
				if(item.antTaskrelation.state=='0' || item.antTaskrelation.state=='2'){
					console.log(item,123)
					frontCuibanTask.push(item.antTaskrelation.id);
				}
			})
		}
		let listDom = [];
		for (let i = switchAct.length - 1; i >= 0; i--) {
			if (switchAct[i] === '子任务') {
				listDom.push(
					<ul className="list animated slideInDown" key="swtich_zrw">
						<Spin spinning={childListLoading} />
						<li className="titBlock">
							<div className="line"></div>
							<div className="titTxt">子任务</div>
							{taskInfo.state!=='4' && taskInfo.state!=='9' && taskInfo.state!=='8' && taskInfo.state!=='1' &&
								<Icon type="plus-circle" onClick={() => { this.setState({ newTaskFzr: user, createTask: true }) }} />
							}
							{childCuibanTask && childCuibanTask.length>0?<span className="cuibanMore textMore" onClick={()=>{this.expitMore(childCuibanTask,'1')}}>全部催办</span>:''}
						</li>
						{childList.map((item) => {
							return (
								<li key={'zrw' + item.id}>
									<span className="txt textMore">
										{/*<Icon type="delete"  />*/}
										<font onClick={()=>{this.getTaskDetail(item.id,this.props.projectId)}}>{item.taskname}</font>
									</span>
									{stateColor(item.stateName, 'type')}
									<span className="fuzeren textMore">
										{item.userResponse ? item.userResponse.name : '未指派'}
									</span>
									<span className="date">{item.state != '1'?item.planEndTime:item.realityEndTime}</span>
									<span className="cuiban textMore" onClick={()=>{this.expitMore([item.id],'1')}}>
										{item.state == '0'|| item.state == '2'?'催办':''}
									</span>
								</li>
							)
						})}
						{createTask ?
							<li className="addChildLi">
								<div className="addChild">
									<div className="href" onClick={() => { this.createChildTask() }}>创建</div>
									<div className="href" onClick={() => { this.setState({ createTask: false }) }}>取消</div>
									<div className="txt">
										<input type="text" autoFocus placeholder="请输入子任务标题" onChange={(e) => { this.setState({ newTaskName: e.target.value }) }} />
									</div>
						<div className="user" 
						onClick={() => { this.selUser('新建子任务负责人',true) }}>{newTaskFzr.avatar||newTaskFzr.photo?(newTaskFzr && newTaskFzr.photo?<img src={newTaskFzr.photo}/>:<img src={newTaskFzr.avatar}/>):<span>{this.getNickNameByName(newTaskFzr.name)}</span>}</div>
									<div className="datePacker">
										<DatePicker locale={locale} onChange={(date, dateString) => { this.setState({ newTaskEndTime: dateString }) }} />
									</div>
								</div>
							</li>
							: ""}
					</ul>
				);
			} else if (switchAct[i] === '协作任务') {
				listDom.push(
					<ul className="list animated slideInDown" key="swtich_xzrw">
						<Spin spinning={coopListLoading} />
						<li className="titBlock">
							<div className="line"></div>
							<div className="titTxt">前序任务</div>
							{!isSmall && <Icon type="plus-circle" onClick={()=>{this.setState({coopAddType:'前序任务',addCoopTaskShow:true})}} />}
							{frontCuibanTask && frontCuibanTask.length>0?<span className="cuibanMore textMore" onClick={()=>{this.expitMore(frontCuibanTask,'2')}}>全部催办</span>:''}
						</li>
						{coopList.frontTaskinfo ? coopList.frontTaskinfo.map((item, i) => {
							return (
								<li key={'qxrw' + item.id}>
									<span className="txt textMore">
										<svg className="icon" aria-hidden="true" onClick={() => { this.deleteCoopTask(item.id) }}>
											<use xlinkHref="#pro-myfg-yichu"></use>
										</svg>
										<font onClick={()=>{this.getTaskDetail(item.antTaskrelation.id,this.props.projectId)}}>{item.antTaskrelation.taskname}</font>
									</span>
									{stateColor(item.antTaskrelation.stateName, 'type')}
									<span className="fuzeren textMore">
										{item.antTaskrelation.userResponse ? item.antTaskrelation.userResponse.name : '未指派'}
									</span>
									<span className="date">
										{item.antTaskrelation.planEndTime ? item.antTaskrelation.planEndTime : ''}
									</span>
									<span className="cuiban textMore" onClick={()=>{this.expitMore([item.antTaskrelation.id],'2')}}>
										{item.antTaskrelation.state == '0'||item.antTaskrelation.state == '2'?'催办':''}
									</span>
								</li>
							)
						}) : ''}
						<li className="titBlock" style={{ padding: '15px 0 0 0' }}>
							<div className="line"></div>
							<div className="titTxt">后序任务</div>
							{!isSmall && <Icon type="plus-circle" onClick={()=>{this.setState({coopAddType:'后序任务',addCoopTaskShow:true})}} />}
						</li>
						{coopList.nextTaskinfo ? coopList.nextTaskinfo.map((item, i) => {
							return (
								<li key={'hxrw' + item.id}>
									<span className="txt textMore">
										<svg className="icon" aria-hidden="true" onClick={() => { this.deleteCoopTask(item.id) }}>
											<use xlinkHref="#pro-myfg-yichu"></use>
										</svg>
										<font onClick={()=>{this.getTaskDetail(item.antTaskrelation.id,this.props.projectId)}}>{item.antTaskrelation.taskname}</font>
									</span>
									{stateColor(item.antTaskrelation.stateName, 'type')}
									<span className="fuzeren textMore">
										{item.antTaskrelation.userResponse ? item.antTaskrelation.userResponse.name : '未指派'}
									</span>
									<span className="date">
										{item.antTaskrelation.planEndTime ? item.antTaskrelation.planEndTime : ''}
									</span>
									<span className="cuiban textMore">
									</span>
								</li>
							)
						}) : ''}
					</ul>
				);
			} else if (switchAct[i] === '文件') {
				listDom.push(
					<ul className="list animated slideInDown" key="swtich_wj">
						<Spin spinning={filesListLoading} />
						<li className="titBlock">
							<div className="line"></div>
							<div className="titTxt">成果文件</div>
							<div className="cont"><Icon type="plus-circle" onClick={() => { this.updateImg('成果文件') }} /></div>
						</li>
						{filesList.taskinfoFiles ? filesList.taskinfoFiles.map((item, i) => {
							return (
								<li key={'cgwj' + item.id}>
									<Icon type="paper-clip" className="fileIcon" />
									<div className="txtName">
										<span className="txt txtMore" onClick={() => { dingJS.previewImage(item) }}>{item.fileName}</span>
									</div>
									<a onClick={() => { dingJS.previewImage(item) }}><Icon type="download" className="downLoad" /></a>
									<Icon type="delete" className="delete" onClick={() => { this.deleteFile(item.id) }} />
								</li>
							)
						}) : ''}
						{/*<li className="fileContLi fileShow">
							<Progress type="circle" width={16} className="fileIcon" />
							<div className="txtName">5966966</div>
							<span className="cuiban delete">
								<Icon type="close" />
							</span>
						</li>*/}
						<li className="titBlock" style={{ padding: '15px 0 0 0' }}>
							<div className="line"></div>
							<div className="titTxt">前序成果文件</div>
						</li>
						{filesList.frontFileList ? filesList.frontFileList.map((item, i) => {
							return (
								<li key={'qxcgwj' + item.id}>
									<Icon type="paper-clip" className="fileIcon" />
									<div className="txtName">
										<span className="txt txtMore" onClick={() => { dingJS.previewImage(item) }}>{item.fileName}</span>
									</div>
									<a onClick={() => { dingJS.previewImage(item) }}><Icon type="download" className="delete" /></a>
								</li>
							)
						}) : ''}
						<div style={{ clear: 'both' }}></div>
					</ul>
				);
			}
		}
		return listDom;
	}

	createChildTask() {
		const { newTaskName, newTaskFzr, newTaskEndTime,taskInfo} = this.state;
		if (newTaskName === '') {
			message.info('请填写任务名称');
		} else {
			const data = {
				'planEndTimeString': newTaskEndTime,
				'taskname': newTaskName,
				'userResponse': {
					userid: newTaskFzr&&newTaskFzr.userid?newTaskFzr.userid:newTaskFzr.emplId
				}
			}
			createTask(this.props.projectId, taskInfo.id, data, (res) => {
				if(res.err){
					return false;
				}
				message.success('创建成功！');
				this.setState({ createTask: false });
				this.getTaskDetail(this.state.taskInfo.id, this.props.projectId);
			},this.props.isSmall);
		}
	}

	attentionClick() {
		let { taskInfo } = this.state;
		if (taskInfo.attention) {
			cancelAttentionWitchTask(taskInfo.id, (data) => {
				if(data.err){
					return false;
				}
				message.success('取消成功');
				const task = {
					'id': taskInfo.id,
					'attention': false
				}
				this.props.updatedTaskCallBack(task);

				taskInfo.attention = false;				

				let user = Storage.get('user');
				taskInfo.collectList.map((ite,i)=>{
					if(ite.id === user.id){
						taskInfo.collectList.splice(i,1);
						return false;
					}
				});

				this.setState({taskInfo:taskInfo});
			},this.props.isSmall);
		} else {
			addAttentionWitchTask(taskInfo.id, (data) => {
				if(data.err){
					return false;
				}
				message.success('关注成功');
				const task = {
					'id': taskInfo.id,
					'attention': true
				}
				this.props.updatedTaskCallBack(task);

				taskInfo.attention = true;				

				let user = Storage.get('user');
				taskInfo.collectList.push(user);

				this.setState({taskInfo:taskInfo});
			},this.props.isSmall);
		}
	}

	valChange(type, val) {
		let { taskInfo } = this.state;
		if (type === 'fzr') {
			taskInfo.fzr.userid = val;
			taskInfo.fzr.name = '';
		} else if (type === 'qrr') {
			taskInfo.qrr.userid = val;
			taskInfo.qrr.name = '';
		} else {
			taskInfo[type] = val;
		}
		this.setState({ taskInfo: taskInfo });
		this.valOnChange(type);
	}

	valOnChange(type) {
		const { taskInfo, taskInfoCopy } = this.state;
		if (taskInfo[type] !== taskInfoCopy[type]) {
			this.setState({ saveShow: true });
		}
	}

	save() {
		const { taskInfo } = this.state; 
		let tag = [];
		taskInfo.tags.map((item, i) => {
			tag.push({
				'label': {id:item.id,labelname:item.name,color:item.color},
				'rtype':'c'
			});
		});
		let newTask = {
			'id': taskInfo.id,
			'taskname': taskInfo.name,
			'description': taskInfo.desc,
			'labelrelations': tag,
			'userResponse': {
				'userid': (taskInfo.fzr.userid ? taskInfo.fzr.userid : taskInfo.fzr.emplId)
			},
			'userFlow': {
				'userid': (taskInfo.qrr.userid ? taskInfo.qrr.userid : taskInfo.qrr.emplId)
			},
			'planEndTimeString': taskInfo.planEndTime ? taskInfo.planEndTime : 'DELL',
			'flowConten': taskInfo.taskMoney,
			'workTime': taskInfo.workTime,
			'coefficienttype': taskInfo.lev,
			'fileList': taskInfo.descFiles
		};
		updateTaskById(newTask, (data) => {
			if(data.err){
                return false;
            }

			const { taskInfo } = this.state;

			this.getTaskDetail(taskInfo.id, this.props.projectId);
			this.setState({ saveShow: false });

			const task = {
				'id': taskInfo.id,
				'name': taskInfo.name,
				'tags': taskInfo.tags,
				'fzr': taskInfo.fzr.name,
				'qrr': taskInfo.qrr.name,
				'planEndTime': taskInfo.planEndTime ? taskInfo.planEndTime : '',
				'realityEndTime': taskInfo.realityEndTime ? taskInfo.realityEndTime : ''
			};
			this.props.updatedTaskCallBack(task);
		},this.props.isSmall);
	}

	cancelChange() {
		let { taskInfo, taskInfoCopy } = this.state;
		taskInfo = JSON.parse(JSON.stringify(taskInfoCopy));
		this.setState({ taskInfo: taskInfo });
		this.setUploadListWithDescFile(taskInfo);
		this.setState({ saveShow: false });
	}

	dellDescFileById(id) {
		let { taskInfo } = this.state;
		taskInfo.descFiles.map((item, i) => {
			if (item.fileId === id) {
				taskInfo.descFiles[i].type = 'DELL';
				this.setState({ taskInfo: taskInfo });
				this.setState({ saveShow: true });
				return false;
			}
		});
	}

	dellTalkFile(id) {
		let { newTalkFiles } = this.state;
		newTalkFiles.map((item, i) => {
			if (item.fileId === id) {
				newTalkFiles.splice(i, 1);
				this.setState({ newTalkFiles: newTalkFiles });
				return false;
			}
		});
	}

	dellTaskOkFile(id) {
		let { taskCompletFiles } = this.state;
		taskCompletFiles.map((item, i) => {
			if (item.fileId === id) {
				taskCompletFiles.splice(i, 1);
				this.setState({ taskCompletFiles: taskCompletFiles });
				return false;
			}
		});
	}

	tagChange(tag) {
		// // 设置删除的
		// const tagIds = [];
		// tag.map((item) => {
		// 	tagIds.push(item.id);
		// });
		
		// let delledTags = taskInfo.tags.filter(val => tagIds.indexOf(val.id) === -1);
		// let dellIds = [];
		// delledTags.map((item) => {
		// 	dellIds.push(item.id);
		// });
		// taskInfo.tags.map((item, i) => {
		// 	if (dellIds.indexOf(item.id) !== -1) {
		// 		taskInfo.tags[i].state = 'DELL';
		// 		this.setState({ saveShow: true });
		// 	} else if (tagIds.indexOf(item.id) !== -1 && item.type === 'DELL') {
		// 		taskInfo.tags[i].state = 'ADD';
		// 		this.setState({ saveShow: true });
		// 	}
		// });

		// // 提取添加的
		// tag.map((item, i) => {
		// 	if (!item.id || taskInfo.tags.filter(val => item.id === val.id).length === 0) {
		// 		taskInfo.tags.push({ ...item, 'state': 'ADD','labelname':item.name });
		// 		this.setState({ saveShow: true });
		// 	}
		// });
		
		let { taskInfo } = this.state;
		let oldTags = taskInfo.tags;
		let tags = [];
		let showFlag = true;
		tag.map((item) => {tags.push(item)});
		if(oldTags && oldTags.length == tags.length){
			tags.map((item) => {
				let bb = true;
				oldTags.map((it) => {
					if(it.id == item.id){
						bb = false;
					}
				});
				if(bb){
					showFlag = false;
				}
			});
		}
		if(tags.length === 0 && oldTags.length === 0){
			showFlag = false;
		}
		taskInfo.tags = tags;
		this.setState({ taskInfo: taskInfo,saveShow: showFlag });
	}

	setTask(type, state, txt = '') {
		if (type === '删除任务') {
			this.setState({ taskInfoLoading: true });
			deleteTaskById(this.state.taskInfo.id, this.props.projectId, (data) => {
				if(data.err){
					return false;
				}
				message.success(type + '成功！');
				this.setState({ taskInfoLoading: false });
				this.props.closeCallBack();
				if (this.props.updatedTaskCallBack) { 
					const {state,parentId,id} = this.state.taskInfo;
					this.props.updatedTaskCallBack({'id':id, 'delTask':true, 'parentId':parentId, 'state':state});
				}
			},this.props.isSmall);
		} else {
			let taskCompletFiles = [];
			this.state.taskCompletFiles.map((item)=>{
				if(item.response){
					taskCompletFiles.push(item.response.data);
				}else{
					taskCompletFiles.push(item);
				}
			});
			let upStateCode = {
				id: this.state.taskInfo.id,
				projectId: this.props.projectId,
				state: state,               // 0重启 1完成 1审核通过 0驳回 4终止
				taskSignRemarks: txt,       // 审核说明 完成说明
				fileList: taskCompletFiles
			};
			this.setState({ taskInfoLoading: true });
			updateTaskStateByCode(upStateCode, (data) => {
				if(data.err){
					return false;
				}
				message.success(type + '成功！');
				this.getTaskDetail(this.state.taskInfo.id, this.props.projectId);
				if (type === '标记完成') {
					this.setState({ taskCompleteModalShow: false, taskCompletLoading: false });
				} else if (type === '任务驳回' || type === '任务通过') {
					this.setState({ taskCheckModalShow: false, taskCheckLoading_x: false, taskCheckLoading_v: false });
				}
				this.setState({taskCompletFiles:[]});
			},this.props.isSmall);
			this.setState({ taskInfoLoading: false ,uploadList_state:[]});
		}
	}

	showConfirm(type, state, msg) {
		const that = this;
		confirm({
			title: msg,
			okText: '确定',
			cancelText: '取消',
			onOk() {
				that.setTask(type, state);
			},
			onCancel() { },
		});
	}

	urgeTask(type) {
		let ids = [];
		let urgeType = '';
		if (type === '本任务') {
			ids = [this.state.taskInfo.id];
		}
		urgeTaskById(ids, this.state.taskInfo.id, urgeType, (data) => {
			if(data.err){
                return false;
            }
			message.success('催办成功！');
		},this.props.isSmall);
	}

	claimTask() {
		claimTaskById([this.state.taskInfo.id], (data) => {
			if(data.err){
                return false;
            }
			message.success('认领成功！');
			this.getTaskDetail(this.state.taskInfo.id, this.props.projectId);
		},this.props.isSmall);
	}

	deleteCoopTask(id) {
		const that = this;
		confirm({
			title: '您是否确认移除此协作任务？',
			okText: '确定',
			cancelText: '取消',
			onOk() {
				deleteCoopTaskById(id, that.state.taskInfo.id, (data) => {
					if(data.err){
						return false;
					}
					message.success('删除成功！');
					that.getTaskDetail(that.props.taskId, that.props.projectId);
				},that.props.isSmall);
			},
			onCancel() { },
		});
	}

	deleteFile(id) {
		const that = this;
		confirm({
			title: '您是否确认删除此文件？',
			okText: '确定',
			cancelText: '取消',
			onOk() {
				deleteFileById(id, (data) => {
					if(data.err){
						return false;
					}
					message.success('删除成功！');
					that.getTaskDetail(that.state.taskInfo.id, that.props.projectId);
				},that.props.isSmall);
			},
			onCancel() { },
		});
	}

	deleteTalk(id) {
		const that = this;
		confirm({
			title: '您是否确认删除？',
			okText: '确定',
			cancelText: '取消',
			onOk() {
				deleteTalkById(id, (data) => {
					if(data && data.err){
						return false;
					}
					message.success('删除成功！');
					that.getTaskDetail(that.props.taskId, that.props.projectId);
				},that.props.isSmall);
			},
			onCancel() { },
		});
	}

	addTalk() {
		const { newTalkDesc, newTalkFiles, newTalkReplyUserId } = this.state;
		if(!newTalkDesc && (!newTalkFiles || newTalkFiles.length<=0)){
			message.info('请输入发布的内容！');
			return;
		}
		const data = {
			'description': newTalkDesc,
			'taskinfo': {
				'id': this.state.taskInfo.id
			},
			'reply': {
				'id': newTalkReplyUserId
			},
			'files': newTalkFiles
		}
		addTalkAtTask(data, (res) => {
			if(res.err){
                return false;
            }
			this.setState({ addTalk: false });
			this.getTaskDetail(this.state.taskInfo.id, this.props.projectId);
		},this.props.isSmall);
	}

	completTask(){
		let taskId = this.state.taskInfo.id;
		getSonTask(taskId, (res) => {
			if(res.err){
                return false;
            }
			if(res.isSonTask == 'true'){
				this.setState({ childTaskModalShow: true, sonTaskinfoList: res.antTaskinfoList, taskCompletFiles:[] });
			}else{
				this.setState({ taskCompleteModalShow: true, taskCompletDesc: '', taskCompletFiles:[] });
			}	
		},this.props.isSmall);
	}

	urgeChildTasks() {
		urgeSonTaskByTaskId(this.state.taskInfo.id, (data) => {
			if(data.err){
                return false;
            }
			message.success('催办成功！');
		},this.props.isSmall);
	}

	complateChildTasks(){
		const { sonTaskinfoList}=this.state;
		var ids = [];
		sonTaskinfoList.forEach(element => {
			ids.push(element.id);
		});
		let upStateCode = {
			id: this.state.taskInfo.id,
			projectId: this.props.projectId,
			state: '1',              // 0重启 1完成 1审核通过 0驳回 4终止
			taskSignRemarks: '',      // 审核说明 完成说明
			taskIds:ids
		};
		updateTaskStateByCode(upStateCode, (data) => {
			if(data.err){
                return false;
            }
			this.getTaskDetail(this.state.taskInfo.id, this.props.projectId);
		},this.props.isSmall);
	}
	
	getNotCheckIdsCoop(){
		let returnIds = [];
		const {coopList,taskInfo} = this.state;
		if(taskInfo){
			returnIds.push(taskInfo.id);
			let parentIds = taskInfo.parentIds;
			if(parentIds){
				let parentIdArr = parentIds.split(",");
				parentIdArr.map((item)=>{
					if(item && item != '0'){
						returnIds.push(item);
					}
				})
			}
		}
		if(coopList){
			const {frontTaskinfo,nextTaskinfo} = coopList;
			if(frontTaskinfo && frontTaskinfo.length > 0){
				frontTaskinfo.map((item)=>{
					returnIds.push(item.antTaskrelation.id);
				});
			}
			if(nextTaskinfo && nextTaskinfo.length > 0){
				nextTaskinfo.map((item)=>{
					returnIds.push(item.antTaskrelation.id);
				});
			}
		}
		return returnIds;
	}	

	addAttention(){
		const { taskInfo } = this.state;
		let selectUser = taskInfo.collectList?taskInfo.collectList:[];
		dingJS.selectUser(selectUser,'邀请关注',(res)=>{
			const selected = [];
			if(res){				
				res.map((item)=>{
					selected.push(item.emplId);
				});
				attentionUsers(taskInfo.id,selected,(data)=>{
					if(data.err){
						return false;
					}
					message.success('设置关注人成功！');
					this.getTaskDetail(taskInfo.id,taskInfo.projectId);
				},this.props.isSmall);
			}
		},true,this.props.isSmall);
	}
	uploadListOnChange_updateState(list){
		this.setState({uploadList_state:list.fileList})
		let {taskCompletFiles } = this.state;
		
		if (list.file.status === 'done') {
			taskCompletFiles.push(list.file.response.data);
			this.setState({taskCompletFiles:taskCompletFiles})
		} else if (list.file.status === 'removed') {
			taskCompletFiles.map((item, i) => {
				if (item.id === list.file.response.data.id) {
					taskCompletFiles = taskCompletFiles.splice(i, 1);
					this.setState({ taskCompletFiles: taskCompletFiles });
					return false;
				}
			});
		}
		
	}
	updateCollectUsers(userid){
		const { taskInfo } = this.state;
		const userids = [];
		taskInfo.collectList.map((item,i)=>{
			if(item.userid !== userid){
				userids.push(item.userid);
				return false;
			}
		});
		attentionUsers(taskInfo.id,userids,(data)=>{
			if(data.err){
				return false;
			}
			message.success('删除关注人成功！');
			this.getTaskDetail(taskInfo.id,taskInfo.projectId);
		},this.props.isSmall);

	}

	render() {
		const { previewVisible, previewImage, uploadList_desc, uploadList_talk,uploadList_state,detailTxtEdit, taskCompletFiles, taskCopyShow, jurisdiction, taskMoveShow, addCoopTaskShow, coopAddType,teamMoneyEnd } = this.state;
		const { taskInfo, user, addTalk, newTalkPromptTxt, newTalkFiles, dict_lev, taskInfoLoading, switchAct, showLog, saveShow, taskCompleteModalShow, taskCompletDesc, taskCompletLoading, taskCheckModalShow,taskCheckModalTitle, taskCheckDesc, taskCheckLoading_x, taskCheckLoading_v,childTaskModalShow,sonTaskinfoList } = this.state;
		let { isSmall } = this.props;
		if(!isSmall){
			isSmall = false;
		}
		const that = this; 
		const uploadButton = (
			<div>
				<Icon type="plus" />
				<div className="ant-upload-text">图片</div>
			</div>
		);

		const menu = (
			<Menu>
				{!isSmall &&
					<Menu.Item>						
						<a onClick={()=>{if(getTeamInfoWithMoney('是否可用')){this.setState({taskMoveShow:true})}else{this.setState({teamMoneyEnd:true})}}}>
							{getTeamInfoWithMoney('版本名称')!=='专业版'?
								<svg className="pro-icon zuanshi" aria-hidden="true">
									<use xlinkHref={"#pro-myfg-zuanshi"}></use>
								</svg>
							:''}
							移动任务
						</a>
					</Menu.Item>
				}
				{!isSmall &&
					<Menu.Item>						
						<a onClick={()=>{if(getTeamInfoWithMoney('是否可用')){this.setState({taskCopyShow:true})}else{this.setState({teamMoneyEnd:true})}}}>
							{getTeamInfoWithMoney('版本名称')!=='专业版'?
								<svg className="pro-icon zuanshi" aria-hidden="true">
									<use xlinkHref={"#pro-myfg-zuanshi"}></use>
								</svg>
							:''}
							复制任务
						</a>
					</Menu.Item>
				}
				{!isSmall && taskInfo.projectJurisdiction && 
					<Menu.Item>
						<a onClick={() => { this.showConfirm('删除任务', '', taskInfo.coopTaskCount>0?'该任务存在其它前后工序关联任务，删除后将解除协作关系，确定继续删除吗？':'您是否确认删除此任务？') }} style={!getTeamInfoWithMoney('是否可用')?{paddingLeft:'30px'}:{}}>删除任务</a>
					</Menu.Item>
				}
				<Menu.Item>
					<a onClick={() => { this.showConfirm('终止任务', '4', '您是否确认终止此任务？') }} style={!getTeamInfoWithMoney('是否可用')?{paddingLeft:'30px'}:{}}>终止任务</a>
				</Menu.Item>
			</Menu>
		);

		let tags = [];
		taskInfo.tags.map((item, i) => {
			if (item.state !== 'DELL') {
				tags.push({'id':item.id,'name':item.name,'color':item.color,'type':'1'});
			}
		});

		let levTxt = '未设定';
		const levOpt = (
			<Menu>
				{dict_lev.map((item) => {
					if (item.value === taskInfo.lev) {
						levTxt = item.label;
					}
					return <Menu.Item key={item.value} value={item.value}>
						<a onClick={() => { this.valChange('lev', item.value) }}>{item.label}</a>
					</Menu.Item>
				})}
			</Menu>
		);

		let collectUsers = '';
		if(taskInfo.collectList){
			collectUsers = taskInfo.collectList.map((item,i)=>{
				return <div className="user" key={item.id+'more'}>{item.nickname}</div>;
			});
		}

		let goButton = '';
		let goButtonAnd = '';
		if (!taskInfo.fzr && taskInfo.state != '4') {
			goButton = <Button size="large" type="primary" onClick={() => { this.claimTask() }}>认领任务</Button>;
		} else if (taskInfo.stateButton) {
			goButton = <Button size="large" type="primary" onClick={() => { this.completTask() }}>标记完成</Button>;
		} else if (taskInfo.flowButton) {
			goButtonAnd = <Button size="large" onClick={() => { this.setState({ taskCheckModalShow: true, taskCheckDesc: '', taskCheckModalTitle:'驳回任务', taskCompletFiles:[] }) }}>驳回</Button>;
			goButton = <Button size="large" type="primary" onClick={() => { this.setState({ taskCheckModalShow: true, taskCheckDesc: '',taskCheckModalTitle:'确认完成', taskCompletFiles:[] }) }}>确认完成</Button>;
		} else if (taskInfo.beginButton) {
			goButton = <Button size="large" type="primary" onClick={() => { this.showConfirm('重启任务', '0', '您是否确认重启此任务？') }}>重启任务</Button>;
		} else if (taskInfo.state != '1' && taskInfo.state != '4' && taskInfo.state != '8' && taskInfo.state != '9') {
			goButton = <Button size="large" type="primary" onClick={() => { this.urgeTask('本任务') }}>催办</Button>;
		}
		if(taskInfo.state == '2' && taskInfo.fzr && taskInfo.fzr.userid === user.userid){
			goButtonAnd = <Button size="large" onClick={() => { this.setTask('任务撤回', '0', '');}}>撤回</Button>;
		}
		
		let notCheckIds = this.getNotCheckIdsCoop(taskInfo.id);
		return (
			<div className="taskDetails">
				<style dangerouslySetInnerHTML={{ __html: stylesheet }} />
				<Spin spinning={taskInfoLoading} />
				{teamMoneyEnd && <MoneyEnd alertText={getTeamInfoWithMoney('专业版提示')} closeCallBack={()=>{this.setState({teamMoneyEnd:false})}} />}
				{/*关闭按钮*/}
				<div className="closeIcon" onClick={() => { this.props.closeCallBack() }}>
					<Icon type="caret-right" />
				</div>
				{/*复制任务*/}
				{taskCopyShow?
					<TaskCopy task={{'id':taskInfo.id,'name':taskInfo.name,'parentId':'0','projectId':taskInfo.project.id,'projectName':taskInfo.project.name}} 
							  closedCallback={()=>{this.setState({taskCopyShow:false})}} 
							  successCallBack={(copyObj)=>{if(this.props.updatedTaskCallBack){this.props.updatedTaskCallBack(copyObj)}}}
					/>
				:''}
				{/*移动任务*/}
				{taskMoveShow?
					<TaskMove task={{'id':taskInfo.id,'name':taskInfo.name,'projectId':taskInfo.project.id,'projectName':taskInfo.project.name}} 
							  closedCallback={()=>{this.setState({taskMoveShow:false})}}
							  successCallBack={(moveObj)=>{if(this.props.updatedTaskCallBack){this.getTaskDetail(taskInfo.id,taskInfo.project.id);this.props.updatedTaskCallBack(moveObj)}}}
					/>
				:''}
				{/*前后续任务添加*/}
				{addCoopTaskShow?
					<TaskAddWithCoop task={{'id':taskInfo.id,'projectId':taskInfo.project.id}} notCheckIds={notCheckIds} title={coopAddType} closedCallback={()=>{this.setState({addCoopTaskShow:false})}} successCallback={() => { this.getTaskDetail(taskInfo.id) }}/>
				:''}
				{/*标记完成*/}
				<Modal
					title="标记完成"
					visible={taskCompleteModalShow}
					onCancel={(e) => {this.setState({taskCompleteModalShow: false})}}
					footer={[
						<Button key="back" onClick={() => { this.setState({ taskCompleteModalShow: false }) }}>取消</Button>,
						<Button key="submit" type="primary" loading={taskCompletLoading} onClick={() => { this.setTask('标记完成', '1', taskCompletDesc); this.setState({ taskCompletLoading: true }); }}>
							确定
						</Button>
					]}
				>
					<TextArea placeholder="完成说明" 
							  autosize={{ minRows: 2, maxRows: 6 }} 
							  value={taskCompletDesc} 
							  onChange={(e) => { this.setState({ taskCompletDesc: e.target.value }) }} 
							  style={{margin:'0 0 10px 0'}}
							  onPaste={(e)=>{this.pasteingImg('标记完成',e)}}
					/>
					<Upload
						action={baseURI + "/files/upload"}
						listType="picture-card"
						fileList={uploadList_state}
						onPreview={this.handlePreview}
						multiple={true}
						onChange={(val) => { if(beforeUpload(val.file)){this.uploadListOnChange_updateState(val)} }}
					>
						{uploadButton}
					</Upload> 
					<h4 className="filesTit" >成果文件 <Icon className="add" type="paper-clip" onClick={() => { this.updateImg('标记完成') }} /></h4>
					<ul className="accessory" style={{ margin: '0' }}>
						{taskCompletFiles.map((item, i) => { 
							if (item.fileId) {
								return (
									<li key={"taskCompletFilesNew"+i}>
										<Icon type="paper-clip" className="icon" />
										<span className="textMore" onClick={() => { dingJS.previewImage(item) }}>{item.fileName}</span>
										<Icon type="delete" className="downLoad" onClick={() => { this.dellTaskOkFile(item.fileId) }} />
									</li>
								)
							}
						})}
					</ul>
				</Modal>
				{/*审核任务*/}
				<Modal
					title={taskCheckModalTitle}
					visible={taskCheckModalShow}
					onCancel={(e) => {this.setState({taskCheckModalShow: false})}}
					footer={[
						<Button key="quxiao" onClick={() => {this.setState({taskCheckModalShow: false})}}>
							取消
						</Button>,
						(taskCheckModalTitle==='驳回任务'?
							<Button key="back" type="primary" loading={taskCheckLoading_x} onClick={() => { this.setTask('任务驳回', '0', taskCheckDesc); this.setState({ taskCheckLoading: true }); }}>驳回</Button>
						:''),
						(taskCheckModalTitle==='确认完成'?
							<Button key="submit" type="primary" loading={taskCheckLoading_v} onClick={() => { this.setTask('任务通过', '1', taskCheckDesc); this.setState({ taskCheckLoading: true }); }}>
								通过
							</Button>
						:'')
					]}
				>
					<TextArea style={{margin:'0 0 10px 0'}} 
							  placeholder={taskCheckModalTitle==='驳回任务'?'驳回原因':'完成说明'} 
							  value={taskCheckDesc} autosize={{ minRows: 2, maxRows: 6 }} 
							  onChange={(e) => { this.setState({ taskCheckDesc: e.target.value }) }} 
							  onPaste={(e)=>{this.pasteingImg('标记完成',e)}}
					/>
					<Upload
						action={baseURI + "/files/upload"}
						listType="picture-card"
						fileList={uploadList_state}
						onPreview={this.handlePreview}
						multiple={true}
						onChange={(val) => {if(beforeUpload(val.file)){this.uploadListOnChange_updateState(val)} }}
					>
						{uploadButton}
					</Upload>
					<h4 className="filesTit" >成果文件 <Icon className="add" type="paper-clip" onClick={() => { this.updateImg('标记完成') }} /></h4>
					<ul className="accessory" style={{ margin: '0' }}>
						{taskCompletFiles.map((item, i) => {
							if (item.fileId) {
								return (
									<li key={item.fileId}>
										<Icon type="paper-clip" className="icon" />
										<span className="textMore" onClick={() => { dingJS.previewImage(item) }}>{item.fileName}</span>
										<Icon type="delete" className="downLoad" onClick={() => { this.dellTaskOkFile(item.fileId) }} />
									</li>
								)
							}
						})}
					</ul>
				</Modal>
				{/*包含未完成的子任务*/}
				<Modal
					title="包含未完成的子任务"
					visible={childTaskModalShow}
					onCancel={(e) => {this.setState({childTaskModalShow: false})}}
					footer={[
						<Button key="back" onClick={(e) => {this.setState({childTaskModalShow: false})}} >取消</Button>,
						<Button type="primary" loading={this.state.childTaskLoading} onClick={(e)=>{this.urgeChildTasks();this.setState({childTaskModalShow: false})}}>催办子任务</Button>,
						<Button type="primary1" loading={this.state.childTaskLoading} onClick={()=>{this.complateChildTasks();this.setState({childTaskModalShow: false,taskCompleteModalShow:true})}}>完成子任务，并继续</Button>
					]}	
				>
					<div className="childTaskModal">
						<h3>共有<span style={{color:'#f77575'}}>{sonTaskinfoList?sonTaskinfoList.length:'0'}</span>条未完成的子任务</h3>
						<div>
							{sonTaskinfoList && sonTaskinfoList.length>0?
							 sonTaskinfoList.map((item,i)=>{
								 return(
									<p className="taskList" key={item.id}>
										<span className="taskWbs">{item.taskinfoNumber.numberS?item.taskinfoNumber.numberS+'.'+item.rank:item.rank}</span>
										<font className="taskName">{item.taskname}</font>
									</p>
								 )
							 })
							:''}
						</div>
					</div>
				</Modal>
				{/*讨论小层*/}
				<div className="talkBox" onClick={()=>{this.setState({detailTxtEdit:false})}}>
					<div className="text" onClick={() => { this.setState({ addTalk: true, newTalkDesc: '', newTalkFiles: [], newTalkReplyUserId: '',uploadList_talk:[]}) }}>参与讨论</div>
					<div className="users">
						{taskInfo.collectList && taskInfo.collectList.map((item,i)=>{
							if((!isSmall && i<8) || (isSmall && i<5)){
								return (
									<div className="user" key={item.id}>
										<svg aria-hidden="true" className="pro-icon" onClick={()=>{this.updateCollectUsers(item.userid)}}>
											<use xlinkHref="#pro-myfg-yichu"></use>
										</svg>
										{item.nickname}
									</div>
								);
							}
						})}							
						<Tooltip title="邀请关注">
							<div className="user add" onClick={()=>{this.addAttention()}}><Icon type="plus" /></div>
  						</Tooltip>
						{taskInfo.collectList && taskInfo.collectList.length>7?
							<Popover content={collectUsers} title="已关注人员" placement="topRight">
								<Icon type="ellipsis" />
						    </Popover>							
						:''}	
					</div>
				</div>
				{addTalk ?
				<div className="talkBigBox">
					<div className="talkBox_div">
						<div className="talkBox_tmc" onClick={() => { this.setState({ addTalk: false }) }}></div>
						<div className="talkBox_max">{/*onClick={(e)=>{e.preventDefault();e.stopPropagation();}}*/}
							<div className="talkBox">
								<div className="text">参与讨论</div>
								<div className="users">
									{taskInfo.collectList && taskInfo.collectList.map((item,i)=>{
											console.log(item)

										if((!isSmall && i<8) || (isSmall && i<5)){

											return (
												
												<div className="user" key={item.id}>
													<svg aria-hidden="true" className="pro-icon" onClick={()=>{this.updateCollectUsers(item.userid)}}>
														<use xlinkHref="#pro-myfg-yichu"></use>
													</svg>
													{item.nickname}
													
												</div>
											);
										}
									})}							
									<Tooltip title="邀请关注">
										<div className="user add" onClick={()=>{this.addAttention()}}><Icon type="plus" /></div>
									</Tooltip>
									{taskInfo.collectList && taskInfo.collectList.length>7?
										<Popover content={collectUsers} title="已关注人员" placement="topRight">
											<Icon type="ellipsis" />
										</Popover>							
									:''}	
								</div>
							</div>
							<div className="inputBigBox">
								<div className="inputBox">
									<TextArea placeholder={newTalkPromptTxt} autoFocus autosize={{ minRows: 3, maxRows: 3 }}
										onChange={(e) => { this.setState({ newTalkDesc: e.target.value }) }}
										onPaste={(e) => { this.pasteingImg('讨论附件', e) }}
									/>
									<div className="clearfix">
										<Upload
											action={baseURI + "/files/upload"}
											listType="picture-card"
											fileList={uploadList_talk}
											onPreview={this.handlePreview}
											multiple={true}
											onChange={(val) => { if(beforeUpload(val.file)){this.uploadListOnChange_talk(val)} }}
										>
											{uploadButton}
										</Upload>
									</div>
									<h3 className="filesTit">附件<Icon className="add" type="paper-clip" onClick={() => { this.updateImg('讨论附件') }} /></h3>
									<ul className="accessory" style={{ margin: '0' }}>
										{newTalkFiles.map((item, i) => {
											if (item.fileId) {
												return (
													<li key={item.fileId}>
														<Icon type="paper-clip" className="icon" />
														<span className="textMore" onClick={() => { dingJS.previewImage(item) }}>{item.fileName}</span>
														<Icon type="delete" className="downLoad" onClick={() => { this.dellTalkFile(item.fileId) }} />
													</li>
												)
											}
										})}
									</ul>
								</div>
								<div className="buttonBox">
									<Button type="primary" onClick={() => { this.addTalk() }}>发布</Button>
								</div>
							</div>
						</div>
					</div>
				</div>
					: ''}
				{/*面包屑*/}
				<div className="bread" onClick={()=>{this.setState({detailTxtEdit:false})}}>
					<div className="objName">
						{taskInfo.bread.length > 0 ? <span className="textMore">{taskInfo.bread[0].taskname}</span> : ''}
						{taskInfo.bread.length > 1 && <Icon className="icon" type="right" />}
					</div>
					<div className="breadList">
						{taskInfo.bread.map((item, i) => {
							if (i !== 0) {
								if (i === taskInfo.bread.length - 1) {
									return (
										<span className="taskName textMore" key={item.id} onClick={()=>{this.getTaskDetail(item.id,this.props.projectId)}}>{item.taskname}</span>
									)
								} else if(taskInfo.bread.length > 5){
									if(i === 5){
										return (
											<div key={"sandian"}>
												<span className="taskName">......</span>
												<Icon className="icon" type="right" />
											</div>
										)
									}else if(i<6){
										return (
											<div key={item.id}>
												<span className="taskName textMore" onClick={()=>{this.getTaskDetail(item.id,this.props.projectId)}}>{item.taskname}</span>
												<Icon className="icon" type="right" />
											</div>
										)
									}
								} else {
									return (
										<div key={item.id}>
											<span className="taskName textMore" onClick={()=>{this.getTaskDetail(item.id,this.props.projectId)}}>{item.taskname}</span>
											<Icon className="icon" type="right" />
										</div>
									)
								}
							}
						})}
					</div>
					<div className="more">
						<Icon className="attention" type={taskInfo.attention ? "star" : "star-o"}
							onClick={() => { this.attentionClick() }}
						/>
						<span>关注</span>
						<Dropdown overlay={menu}
								  placement={"bottomRight"}
						>
							<a className="ant-dropdown-link" href="#">								
								<Icon type="down" style={{margin:'2px 3px 0 6px'}} />
								更多
							</a>
						</Dropdown>
					</div>
				</div>
				{/*标题*/}
				<div className="title" style={{ top: '47px' }} onClick={()=>{this.setState({detailTxtEdit:false})}}>
					<div className="left">
						{stateColor(taskInfo.state, 'tag')}
						<div className="No textMore">
							{taskInfo.number}
						</div>
						<div className="titTxt textMore">
							{jurisdiction?
								<Input className="show textMore"
									placeholder="请输入标题"
									value={taskInfo.name}
									onChange={(e) => { this.valChange('name', e.target.value) }}
								/>
							:
								<div className="show textMore">{taskInfo.name}</div>
							}
						</div>
					</div>
					<div className="right">
						{goButtonAnd}
						{goButton}
					</div>
				</div>
				{/*保存按钮*/}
				{saveShow ?
					<div className="absltTit" style={{ top: '115px', width: '100%' }}>
						<div className="saveBox saveShow">
							<Button className="save" onClick={() => { this.save() }}>保存</Button>
							<Button className="qx" onClick={() => { this.cancelChange() }}>取消</Button>
						</div>
					</div>
					: ''}
				<div className="taskDetailsScroll" ref="taskDetailsScroll">
					<div className="taskContBox">
						<div className="taskCont" style={detailTxtEdit?{boxShadow:'0 0 3px #c6dcf9',border:'1px solid #bad4f5'}:{}}>
							{jurisdiction?
								<TextArea placeholder="请输入任务描述（tips：截图可Ctr+V快速上传~）"
									autosize={{ minRows: 1, maxRows: 6 }}
									onPaste={(e) => { this.pasteingImg('描述附件', e) }}
									onChange={(e) => { this.valChange('desc', e.target.value) }}
									value={taskInfo.desc}
									style={{padding:'4px 0',border:'0'}}
									onFocus={()=>{this.setState({detailTxtEdit:true})}}																		
								/>
							:
								<div>{taskInfo.desc?taskInfo.desc:'该任务未填写描述'}</div>
							}
							<div className={jurisdiction && detailTxtEdit ?"clearfix":"clearfix noQuanXian"}>
								<Upload
									action={baseURI + "/files/upload"}
									listType="picture-card"
									fileList={uploadList_desc}
									multiple={true}
									onPreview={this.handlePreview}
									onChange={(val) => { if(beforeUpload(val.file)){this.uploadListOnChange_desc(val)} }}
									disabled={!jurisdiction}									
								>
									{uploadButton}
								</Upload>
								<Modal visible={previewVisible} footer={null} onCancel={() => { this.setState({ previewVisible: false }) }}>
									<img alt="example" style={{ width: '100%' }} src={previewImage} />
								</Modal>
							</div>
							{/*<ul className="imgUpload">
								{taskInfo.descImgs.map((item,i)=>{
									return (
										<li key={'descImg'+i}><img src={item} /><Icon type="delete" className="dell" /></li>
									)
								})}
								<li className="add">
									<Icon type="plus" />
									<p>图片</p>
								</li>
								<div style={{clear:'both'}}></div>
							</ul>*/}
							{jurisdiction && detailTxtEdit?
								<h3 className="filesTit"><Icon style={{margin:'0'}} className="add" type="paper-clip" onClick={() => { this.updateImg('描述附件') }} /></h3>
							:''}
							<ul className="accessory">
								{taskInfo.descFiles.map((item, i) => {
									if (item.fileId && item.type !== 'DELL') {
										return (
											<li key={item.fileId}>
												<Icon type="paper-clip" className="icon" />
												<span className="textMore"  onClick={() => { dingJS.previewImage(item) }}>{item.fileName}</span>
												<a onClick={() => { dingJS.previewImage(item) }}><Icon type="download" className="downLoad" /></a>
												{detailTxtEdit?<Icon type="delete" className="downLoad" onClick={() => { this.dellDescFileById(item.fileId) }} />:''}
											</li>
										)
									}
								})}
							</ul>
						</div>
					</div>
					{/*任务要求细节*/}
					<ul className="bottomDetail" onClick={()=>{this.setState({detailTxtEdit:false})}}>
						<li className="tagList">
							<i className="icon iconfont icon-biaoqian1 icon"></i>
							<div className="tit">标签</div>
							<div className="valBox" style={{ margin: '0', padding: '0 10px 0 0' }}>
								<TagComponent tagSelecteds={tags}
									canAdd={true}
									canEdit={jurisdiction}
									tagChangeCallBack={(val) => { this.tagChange(val) }}
									maxHeight='200px'
									isSmall={this.props.isSmall}
								/>
							</div>
						</li>
						<li>
							<i className="icon iconfont icon-fuzeren1 icon"></i>
							<div className="tit">负责人</div>
							<div className="valBox" onClick={() => { this.selUser('负责人',jurisdiction) }}>
								<span className="val textMore" style={{ flex: '0 0 auto' }}>
									{taskInfo.fzr.name?taskInfo.fzr.name:'未指派'}
								</span>
								{taskInfo.fzr.name && jurisdiction ? <Icon type="close-circle" className="close" onClick={(e) => { e.stopPropagation();e.preventDefault();this.valChange('fzr', 'DELL') }} /> : ''}
								<div className="selUser" style={{ flex: '1', textAlign: 'right' }}>
									{jurisdiction && <i className="icon iconfont icon-chengyuan1 valIcon selUserIcon-show"></i>}
								</div>
							</div>
						</li>
						<li>
							<i className="icon iconfont icon-shenheren1 icon"></i>
							<div className="tit">确认人</div>
							<div className="valBox"  onClick={() => { this.selUser('确认人',jurisdiction) }}>
								<span className="val textMore" style={{ flex: '0 0 auto' }}>
									{taskInfo.qrr.name?taskInfo.qrr.name:'未指派'}
								</span>
								{taskInfo.qrr.name && jurisdiction ? <Icon type="close-circle" className="close" onClick={(e) => {e.stopPropagation();e.preventDefault(); this.valChange('qrr', 'DELL') }} /> : ''}
								<div className="selUser" style={{ flex: '1', textAlign: 'right' }}>
									{jurisdiction && <i className="icon iconfont icon-chengyuan1 valIcon selUserIcon-show"></i>}
								</div>
							</div>
						</li>
						<li>
							<i className="icon iconfont icon-riqi1 icon"></i>
							<div className="tit">
								{taskInfo.state==='1' || taskInfo.state==='8' || taskInfo.state==='9' ?
									'完成日期'
								:
									'截止日期'
								}							
							</div>
							<div className="valBox"> 
								{taskInfo.planEndTime && jurisdiction?
									<DatePicker locale={locale} value={moment(taskInfo.planEndTime, 'YYYY-MM-DD')}
										onChange={(date, dateString) => { this.valChange('planEndTime', dateString) }}
									/>
								:''}
								{!taskInfo.planEndTime && jurisdiction?
									<div style={{ width: '100%' }}>
										<DatePicker locale={locale} onChange={(date, dateString) => { this.valChange('planEndTime', dateString) }} />
									</div>
								:''}
								{!jurisdiction?
									<span className="val textMore" style={{ flex: '0 0 auto' }}>
										{taskInfo.state === '1' || taskInfo.state === '8' || taskInfo.state === '9'?
											(taskInfo.realityEndTime?taskInfo.realityEndTime:'未设置')
										:
											(taskInfo.planEndTime?taskInfo.planEndTime:'未设置')
										}										
									</span>
								:''}
							</div>
						</li>
						<li>
							<i className="icon iconfont icon-renwujixiao icon"></i>
							<div className="tit">任务绩效</div>
							<div className="valBox">
								<span className="val">
									<div className="val textMore">
										{jurisdiction ?
											<Input value={taskInfo.taskMoney?taskInfo.taskMoney:''}
												   placeholder="未设定"
												   onChange={(e) => { onlyNumber(e.target); this.valChange('taskMoney', e.target.value) }} 
											/>
										:''}
										{!jurisdiction?
											<span>{taskInfo.taskMoney?taskInfo.taskMoney:'未设定'}</span>
										:''}
									</div>
								</span>
								{jurisdiction && <i className="icon iconfont icon-bianji valIcon" ></i>}
							</div>
						</li>
						<li>
							<i className="icon iconfont icon-yujigongqi icon"></i>
							<div className="tit">计划工期</div>
							<div className="valBox">
								<span className="val">
									<div className="val textMore">
										{jurisdiction?
											<Input value={taskInfo.workTime?taskInfo.workTime:''} 
												   placeholder="未设定"
												   onChange={(e) => { onlyNumber(e.target); this.valChange('workTime', e.target.value) }} 
											/>
										:''}
										{!jurisdiction?
											<span>{taskInfo.workTime?taskInfo.workTime:'未设定'}</span>
										:''}
									</div>
								</span>
								{jurisdiction && <i className="icon iconfont icon-bianji valIcon" ></i>}
							</div>
						</li>
						<li>
							<i className="icon iconfont icon-zhongyaochengdu icon"></i>
							<div className="tit">优先级</div>
							<div className="valBox">
								{jurisdiction?
									<Dropdown overlay={levOpt}>
										<a className="ant-dropdown-link" href="#">
											{levTxt?levTxt:'未选择'} <Icon type="down" />
										</a>
									</Dropdown>
								:
									<span>{levTxt?levTxt:'未选择'}</span>
								}
							</div>
						</li>
						<div style={{ clear: 'both' }}></div>
					</ul>
					{/*切换按钮*/}
					<div className="switch" onClick={()=>{this.setState({detailTxtEdit:false})}}>
						{/*选项卡切换按钮*/}
						<div className="buttons">
							<Button type={switchAct.indexOf('子任务') !== -1 ? 'primary' : ''}
								onClick={() => { this.switchOnChange('子任务') }}
							>
								子任务
								<span>{taskInfo.childSuccess}/{taskInfo.childCount}</span>
								<div className={switchAct.indexOf('子任务') !== -1 ? 'img act' : 'img'}></div>
							</Button>
							<Button type={switchAct.indexOf('协作任务') !== -1 ? 'primary' : ''}
								onClick={() => { if(getTeamInfoWithMoney('是否可用')){ this.switchOnChange('协作任务') }else{ this.setState({teamMoneyEnd:true}) } }}
							>
								{getTeamInfoWithMoney('版本名称')!=='专业版'?
									<svg className="pro-icon zuanshi" aria-hidden="true">
										<use xlinkHref={"#pro-myfg-zuanshi"}></use>
									</svg>
								:''}
								协作任务
								<span>{taskInfo.coopTaskCount}</span>
								<div className={switchAct.indexOf('协作任务') !== -1 ? 'img act' : 'img'}></div>
							</Button>
							<Button type={switchAct.indexOf('文件') !== -1 ? 'primary' : ''}
								onClick={() => { this.switchOnChange('文件') }}
							>
								文件
								<span>{taskInfo.filesCount}</span>
								<div className={switchAct.indexOf('文件') !== -1 ? 'img act' : 'img'}></div>
							</Button>
						</div>
						{this.switchListRender()}
						{/*动态标题*/}
						<div className="discuss">
							<div className="disIcon">
							<i className="icon iconfont icon-discuss"></i>
							</div>
							<div className="tit">讨论动态</div>
							<div className="check">
								<Checkbox checked={showLog} onChange={(e) => { this.setState({ showLog: e.target.checked }) }}>
									显示日志
								</Checkbox>
							</div>
						</div>
						{/*动态列表*/}
						<ul className="disList">
							{taskInfo.talk.map((item, i) => {
								if (item.type === "1") {
									if (showLog) {
										if(!item.files){
											return (
												<li key={'taskLog' + i}>
													<Icon type="caret-right" />
													<label>{item.createDate}</label>
													<span>{item.description}</span>
												</li>
											)
										}else{
											return (
												<li key={'taskLog' + i} className="logFileLi">
													<div className="logRow">
														<Icon type="caret-right" />
														<label>{item.createDate}</label>
														<span>{item.description}</span>
													</div>
													{item.files.length>0 ?
														<div className="logRow">
															<Icon type="paper-clip" />
															<label>相关文件：</label>
														</div>							
													:''}
													{item.files.length>0 &&
														<div style={{padding:'0 0 5px 37px'}}>
															{item.files.map((file)=>{
																if(file.fileUrlAbsolute){
																	return (
																		<img className="logImg" key={file.id+'logfile'}
																		     onClick={()=>{that.setState({previewImage:file.fileUrlAbsolute ,previewVisible: true});}}
																			src={file.fileUrlAbsolute}
																		/>
																	)
																}else{
																	return (
																		<div className="li" key={file.id+'logfile'}>
																			<Icon type="paper-clip" />
																			<div className="name textMore">{file.fileName}</div>
																			<div className="del">
																				<a onClick={()=>dingJS.previewImage(file)}><Icon type="xiazai"/>查看</a>
																			</div>
																		</div>
																	)
																}
															})}
														</div>
													}
												</li>
											)
										}
									}
								} else {
									let replyName = '';
									if (item.reply && item.reply.id) {
										replyName = '<div class="reply"><div class="txt">回复</div><div class="replyName textMore">' + item.reply.name + '</div><div class="txt">：</div></div>';
									}
									return (
										<li className="chat" key={item.id}>
											<div className="photo">{item.createBy.photo ? (
												<img src={item.createBy.photo} />
											) : (
													<label>{item.createBy.nickname}</label>
												)}</div>
											<div className="cont">
												<div className="top">
													{item.createBy.name}
													{'   '}
													{item.createDate}
													<i className="icon iconfont icon-discuss" onClick={() => { this.setState({ newTalkReplyUserId: item.createBy.id, addTalk: true, newTalkDesc: '', newTalkFiles: [], newTalkPromptTxt: '@' + item.createBy.name }) }}></i>
													{user.id === item.createBy.id ? <Icon type="delete" onClick={() => { this.deleteTalk(item.id) }} /> : ''}
												</div>
												<div className="bottom" dangerouslySetInnerHTML={{ __html: replyName + item.description }}
													 onClick={(e)=>{if(e.target.tagName==='IMG'){that.setState({previewImage:e.target.src,previewVisible: true});}}}
												></div>
												{item.files && item.files.length > 0 ?
													<div className="center">
														{
															item.files.map(function (value) {
																if (value.type) {
																	return <div className="li" key={value.id}>
																		<Icon type="paper-clip" />
																		<div className="name textMore">{value.fileName}</div>
																		<div className="del">
																			<a onClick={()=>dingJS.previewImage(value)}><Icon type="xiazai"/>查看</a>
																		</div>
																	</div>
																} else {
																	return <img src={value.fileUrlAbsolute} key={value.id} onClick={()=>{that.setState({previewImage:value.fileUrlAbsolute ,previewVisible: true});}} />
																}
															})
														}
														<div className="clear"></div>
													</div>
													: ''}
											</div>
										</li>
									)
								}
							})}
						</ul>
					</div>
				</div>
			</div>
		)
	}
}