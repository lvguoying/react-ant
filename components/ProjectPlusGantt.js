import React from 'react';

import { Spin,Popover  } from 'antd';

import stylesheet from '../styles/components/projectPlusGantt.scss';
import { getProjectChartData } from '../core/service/project.service';

/*
 * (必填) projectId:                                     // 项目ID
 * (选填) taskOnClickCallBack(taskId,projectId):         // 点击任务回调
 * */

export default class ProjectPlusGantt extends React.Component {
  	constructor() {
    	super()
    	this.state = {
    		gantt:'',
    		topTime:'月',
    		loading:true,
			taskId:''
    	}    
  	}
  	
  	componentWillMount(){}

  	componentDidMount() { 
		this.getChartData(this.props.projectId);
	}
 
  	componentWillReceiveProps(nextProps) {
		if(nextProps.projectId !== this.props.projectId){
			this.getChartData(nextProps.projectId);
		}
	} 
	
	componentWillUnmount() {
        this.setState = (state,callback)=>{
            return;
        };  
    }
	  
	getChartData(id){
		this.setState({loading:true});
		getProjectChartData(id,(res)=>{
			if(res.err){
                return false;
            }
			// 处理数据
			let list = res.mapList; 
			let data = [];
			list.map((item,i)=>{
				data.push({  
					'ID': i+1,
					'Number': item.number,
					'UID': item.UID,
				  'Name': item.Name,
				  'Duration': item.Duration,
				  'gongqi': item.Duration,
				  'Start': item.Start,
				  'Finish': item.Finish,
				  'Fzr': item.fzr,
				  'Shr': item.shr,
				  'State': item.PercentComplete,
				  "PercentComplete": 0,                     // 完成百分比，写死为0
				  "Summary": 1,                             // Number(0或1)。摘要任务。当一个任务下有子任务的时候，这个任务就是摘要任务，当Summary为1时，此任务会两端黑色箭头显示。
				  "Critical": 0,                            // Number(0或1)。关键任务。当Critical为1时，显示一个红色条形图。
				  "Milestone": item.Duration === "0"?1:0,   // Number(0或1)。当Milestone为1时，显示一个菱形图标，表示工期为0，原插件表示里程碑。
				  "PredecessorLink": [],	                  // 前置任务，写死不传
				  "ParentTaskUID": item.PID==="0"? -1 : item.PID,      // 父级任务ID
				  "ActStart": item.Start,
				  "ActFinish": item.Finish
				});
			}); 
			this.ganttRender(data);
			this.setState({loading:false});
		});
	}

  	ganttRender(data){
	  	var gantt = new CreateGantt();
	  	gantt.setStyle("width:100%;height:100%");
	  	let projectPlusGantt = document.getElementById('projectPlusGantt');
	  	projectPlusGantt.innerHTML = '';
		gantt.render(projectPlusGantt);
		this.setState({gantt:gantt});
		
		// 不允许拖拽整个图
		gantt.setAllowResize(false);
		
		// 设置只读
		gantt.setReadOnly(true);
		
		// 设置顶层时间刻度
		//gantt.setTopTimeScale('year');
		//gantt.setBottomTimeScale('month');
		this.changeTopTimeScale(this.state.topTime,gantt);
		
		// 设置表格宽度和行高
		gantt.setTableViewWidth(570);
		gantt.setRowHeight(30);
		
		this.loadList(gantt,data);  
		
		this.setCol(gantt);
		this.setBoxColor(gantt);
  	}
  	
	//加载列表数据
	loadList(gantt,chartData) {
	    /*gantt.loading();
	    $.ajax({
	        url: "../static/plusGantt/data/taskList.txt",        
	        cache: false,
	        success: function (text) {
	            var data = mini.decode(text);
	            //列表转树形
	            data = mini.arrayToTree(data, "children", "UID", "ParentTaskUID");
	            gantt.loadTasks(data);
	            gantt.unmask();
	        }
	    });*/
	    var data = mini.decode(chartData);
        //列表转树形
        data = mini.arrayToTree(data, "children", "UID", "ParentTaskUID");
        gantt.loadTasks(data);
        gantt.unmask();
        this.setState({loading:false});
	}
	
	// 设置列
	setCol(gantt){		
		var columns = [];
		
		var numberColumn = {
		    header: "WBS编号<br/>Number",
		    field: "Number",
		    width: 50
		};
		columns.push(numberColumn);
		
		var stringColumn = {
		    name: "name",
		    header: "任务名称<br/>String",
		    field: "Name",
		    width: 300
		};
		columns.push(stringColumn);
		
		var stateColumn = {
		    header: "任务状态<br/>String",
		    field: "State",
		    width: 60
		};
		columns.push(stateColumn);
		
		var jhgqColumn = {
		    header: "计划工期<br/>String",
		    field: "gongqi",
		    width: 60
		};
		columns.push(jhgqColumn);
		
		var finishColumn = {
		    header: "完成日期<br/>String",
		    field: "Finish",
		    width: 100
		};
		columns.push(finishColumn);		
		
		//将列集合数组设置给甘特图
		gantt.setColumns(columns);
		gantt.setTreeColumn("name");
	}
	
	// 设置条形图样式和提示信息
	setBoxColor(gantt){
		const that = this;
	    gantt.on("drawitem", function (e) {	    	
	    	// 条形图 右侧显示的文字
	    	const fzr = e.task["Fzr"];
	    	const shr = e.task["Shr"];
	    	if(fzr && shr){
	    		e.label = fzr+'/'+shr;
	    	}else if(fzr){
	    		e.label = fzr+'/无';
	    	}else if(shr){
	    		e.label = '无/'+shr;
	    	}else{
	    		e.label = '';
	    	}
        	e.labelAlign = "right";
	    	
	    	// 条形图样式
	        var item = e.item; 
	        var left = e.itemBox.left,
	        top = e.itemBox.top,
	        width = e.itemBox.width,
	        height = e.itemBox.height;
			let stateColor = '#94eab7';
			let stateBgColor_left = '';
			let stateBgColor_right = '';
			switch(item.State){
				case '未指派': 
					stateColor = '#9a89b9';
					stateBgColor_left = 'wzp_left';
					stateBgColor_right = 'wzp_right';
					break;
				case '进行中':
					stateColor = '#78c06e';
					stateBgColor_left = 'jxz_left';
					stateBgColor_right = 'jxz_right';
					break;
				case '待确认':
					stateColor = '#5ec9f6';
					stateBgColor_left = 'dqr_left';
					stateBgColor_right = 'dqr_right';
					break;
				case '已逾期':
					stateColor = '#ff943e';
					stateBgColor_left = 'yyq_left';
					stateBgColor_right = 'yyq_right';
					break;
				case '已终止':
					stateColor = '#999';
					stateBgColor_left = 'yzz_left';
					stateBgColor_right = 'yzz_right';
					break;
				case '提前完成':
					stateColor = '#38adff';
					stateBgColor_left = 'tqwc_left';
					stateBgColor_right = 'tqwc_right';
					break;
				case '正常完成':
					stateColor = '#5e97f6'; 
					stateBgColor_left = 'aqwc_left';
					stateBgColor_right = 'aqwc_right';
					break;
				case '逾期完成':
					stateColor = '#5c6bc0';
					stateBgColor_left = 'yqwc_left';
					stateBgColor_right = 'yqwc_right';
					break;
			} 
			
	        if (!item.Summary && !item.Milestone) {   // Summary 是否有子任务 Milestone 工期是否为0
	            if (e.baseline) {   
	            } else {	            	
					e.itemHtml = '<div id="'+item._id+'" class="mini-gantt-item" style="top:'+top+'px;left:'+left+'px;width:'+width+'px;height:'+height+'px;background:'+stateColor+';border:0;"></div>';
	            }
	        }else if(item.Summary){
	        	if (e.baseline) {    
	           } else {
					e.itemHtml = '<div id="'+item._id+'" class="mini-gantt-item  mini-gantt-summary" style="left:'+left+'px;top:'+top+'px;width:'+width+'px;background:'+stateColor+'"><div class="mini-gantt-summary-left '+stateBgColor_left+'"></div><div class="mini-gantt-summary-right '+stateBgColor_right+'"></div></div>';
	            }
	        }
	    });		
		
		gantt.on('itemtooltipneeded', function (e) {
	        var task = e.task;	
	        if (e.baseline) {    //区分比较基准
	        } else {
	        	// 时间转换字符串
	        	let start='',end='';
	        	if(task.Start){
	        		start = that.dateToString(task.Start);
	        	}
	        	if(task.Finish){
	        		end = that.dateToString(task.Finish);
	        	}
	            e.tooltip = "<div>任务：" + task.Name + '（'+ task.State +'）' + "</div>"
	                + "<div style='clear:both;'>负责人：" + task.Fzr + "</div>"
	                + "<div>确认人：" + task.Shr + "</div>"
	                + "<div>计划工期：" + task.gongqi + "</div>"
	                + "<div>开始时间：" + start + "</div>"
	                + "<div>完成时间：" + end + "</div>";
	        }
	    });
	    
	    gantt.on('taskclick', (e)=>{
	    	if(e.type === "cellclick" && e.field === "Name"){
				that.props.taskOnClickCallBack(e.task.UID,this.props.projectId);
	    	}
	    });
	}
	
	dateToString(date){
		const d = new Date(date);
		const year = d.getFullYear();
		const month = this.add0(d.getMonth()+1);
		const day = this.add0(d.getDate());
		const hour = this.add0(d.getHours());
		const minute = this.add0(d.getMinutes());
		const second = this.add0(d.getSeconds());
		return `${year}-${month}-${day}`;
	}	
	add0(No){
		if(No<10 && No > 0){
			return '0'+No;
		}else{
			return No;
		}
	}
	
	changeTopTimeScale(val,gantt){ 
		this.setState({topTime:val});	
		if (!gantt){
			gantt = this.state.gantt;
		}
		if(val === '年'){
			gantt.setTopTimeScale('year');
			gantt.setBottomTimeScale('halfyear');
		}else if(val === '季'){
			gantt.setTopTimeScale('year');
			gantt.setBottomTimeScale('quarter');
		}else if(val === '月'){
			gantt.setTopTimeScale('year');
			gantt.setBottomTimeScale('month');
		}else if(val === '周'){			
			gantt.setBottomTimeScale('week');
			gantt.setTopTimeScale('month');
		}else if(val === '日'){
			gantt.setTopTimeScale('month');
			gantt.setBottomTimeScale('day');
		}		
	}
	
  	render() {
		const {topTime,loading,taskId} = this.state; 
		const content=(
			<div className="taskState">
				<h3>图例</h3>
				<ul>
					<li>
						<span style={{background:'#78c06e'}}></span>
						<font>进行中</font>
					</li>
					<li>
						<span style={{background:'#ff943e'}}></span>
						<font>已逾期</font>
					</li>
					<li>
						<span style={{background:'#5ec9f6'}}></span>
						<font>待确认</font>
					</li>
					<li>
						<span style={{background:'#38adff'}}></span>
						<font>提前完成</font>
					</li>
					<li>
						<span style={{background:'#5e97f6'}}></span>
						<font>正常完成</font>
					</li>
					<li>
						<span style={{background:'#5c6bc0 '}}></span>
						<font>逾期完成</font>
					</li>
					<li>
						<span style={{background:'#9a89b9'}}></span>
						<font>未指派</font>
					</li>
					<li>
						<span style={{background:'#000'}}></span>
						<font>已完成(工期为0)</font>
					</li>
				</ul>
				<div className="childTask">
					<div className="colorSquare">
						<div className="left"></div>
						<div className="right"></div>
					</div>
					<span>包含子任务的任务</span>
				</div>
			</div>
		);
	    return (
	    	<div className="projectPlusGanttBox">
	    		<style dangerouslySetInnerHTML={{ __html: stylesheet }} />
	    		<Spin spinning={loading} />
		    	<div className="projectPlusGantt">		      		
		      		<div className="top">
					    {/*<Radio.Group value={topTime} size="small" onChange={(e)=>{console.log(e.target.value,8989898);this.changeTopTimeScale(e.target.value)}}>
					        <Radio.Button value="日" >日</Radio.Button>
					        <Radio.Button value="周">周</Radio.Button>
					        <Radio.Button value="月">月</Radio.Button>
					        <Radio.Button value="季">季</Radio.Button>
					        <Radio.Button value="年">年</Radio.Button>
						</Radio.Group>
						*/}
						<div className="RadioGroup">
					        <label onClick={()=>{this.changeTopTimeScale('日')}} className={topTime==='日'?'act':''}>日</label>
							<label onClick={()=>{this.changeTopTimeScale('周')}} className={topTime==='周'?'act':''}>周</label>
							<label onClick={()=>{this.changeTopTimeScale('月')}} className={topTime==='月'?'act':''}>月</label>
							<label onClick={()=>{this.changeTopTimeScale('季')}} className={topTime==='季'?'act':''}>季</label>
							<label onClick={()=>{this.changeTopTimeScale('年')}} className={topTime==='年'?'act':''}>年</label>
					    </div>
						<div className="topIcon">
							<Popover trigger="click" content={content} placement="bottomLeft">
								<i className="iconfont icon-xinxitishi"></i>
							</Popover >
						</div>
		      		</div>
		      		<div className="bottom" id="projectPlusGantt"></div>
		    	</div>
		    </div>
	    )
  	}
}