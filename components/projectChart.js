import React from 'react';
import { Spin, Modal, Button, Input, Icon, Popover,message,DatePicker,Radio } from 'antd';
import echarts from 'echarts/lib/echarts';
import 'echarts/lib/chart/bar';
import 'echarts/lib/chart/pie';
import 'echarts/lib/chart/line';
import 'echarts/lib/component/tooltip';
import 'echarts/lib/component/title';
import 'echarts/lib/component/legend';
import moment from 'moment';

import stylesheet from '../styles/components/projectChart.scss';
import { getChartByUserTask, getChartByUserMoney, getChartByTaskSituation, getChartByProjectProgress } from '../core/service/project.service';
import { getFormulaById, updateFormula } from '../core/service/task.service';
import { dateToString,onlyNumber } from '../core/utils/util';
import { baseURI } from '../core/api/HttpClient';
import NullView from '../components/nullView';

const {RangePicker} = DatePicker;
const dateFormat = 'YYYY/MM/DD';

/*
 * （必填）projectId:''                   // 项目ID
 * （选填）jurisdiction: false            // 默认无权限
 */

export default class ProjectChart extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
        	chart1DataInfo:[],
            chart1Loading: false,
            chart2Loading: false,
            chart3Loading: false,
            chart4Loading: false,
            chart3Start:'',
            chart3End:'',
            chart4Start:'',
            chart4End:'',
            chart4searchType:'1',
            chart1Render:true,
            chart2Render:true,
            chart3Render:true,
            chart4Render:true,
            chart3BigLoading: false,
            chart4BigLoading: false,

            calculationModel: false,
            FormulaList: {
                id: "",              //计算公式id
                // delFlag:'0',          //
                projectId: '',        //项目id
                createPerf: '10',     //创建任务绩效占比
                assignPerf: '5',      //指派任务绩效占比
                confirmPerf: '15',    //确认任务绩效占比
                finishPerf: '70',     //完成任务绩效占比
                finishZcPerf: '100',  //正常完成任务绩效占比
                finishTqPerf: '110',  //提前完成任务绩效占比
                finishYqPerf: '90',   //逾期完成任务绩效占比
                // hyPerf: '3'           //合计绩效
            },

            projectId:'',

            bigCharShow:false,
            bigCharTitle:'',
            bigCharHeight:500,
        }
    }

    componentWillMount() { 
        if (this.props.projectId) {
            this.setState({ projectId: this.props.projectId });
        }
    }

    componentDidMount() {
        if (this.props.projectId) {
            this.chart1(this.props.projectId);
            this.chart2(this.props.projectId);
            this.chart3(this.props.projectId);
            this.chart4(this.props.projectId);
            
        }
        //window.addEventListener('resize', this.resize.bind(this)); 
        const that = this;
        window.onresize = ()=>{
            that.resize();
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.projectId !== this.props.projectId) {
            this.setState({ projectId: nextProps.projectId,chart4Start:'',chart4End:'',chart3Start:'',chart3End:'',chart4searchType:'1' });
            this.chart1(nextProps.projectId);
            this.chart2(nextProps.projectId);
            this.chart3(nextProps.projectId);
            this.chart4(nextProps.projectId);
        }
    }

    componentWillUnmount() {    
        //window.removeEventListener('resize',this.resize);
        window.onresize=null;
        //重写组件的setState方法，直接返回空
        this.setState = (state,callback)=>{
            return;
        };  
    }

    resize(){ 
        this.chart1('','重绘');
        this.chart2('','重绘');
        this.chart3('','','','重绘');
        this.chart4('','','','重绘');
    }

    chart1(id,isDraw) {
        var chart1 = echarts.init(document.getElementById('main1'));
        if(isDraw==='重绘'){
            chart1.resize(); 
            return false;
        }
        this.setState({ chart1Loading: true });
        getChartByTaskSituation(id, (res) => {  
            if(res.err){
                return false;
            }
            if(res.count.count === 0){
                this.setState({chart1Render:false});
            }else{
                this.setState({chart1Render:true});
            
                const chart1Datas = [];
                let chart1DataInfo = []; 
                if(res.data.pieData && res.data.pieData.length>0){
                    res.data.pieData.map((item) => {
                        let color = '';
                        switch (item.name) {
                            case '未指派':
                                color = '#722ED1';
                                break;
                            case '进行中':
                                color = '#78c06e';
                                break;
                            case '待确认':
                                color = '#5ec9f6';
                                break;
                            case '提前完成':
                                color = '#38adff';
                                break;
                            case '正常完成':
                                color = '#5e97f6';
                                break;
                            case '逾期完成':
                                color = '#5c6bc0';
                                break;
                            case '已终止':
                                color = '#999999';
                                break;
                        }
                        chart1Datas.push({
                            value: item.value,
                            name: item.name,
                            itemStyle: {
                                color: color
                            }
                        });
                        chart1DataInfo.push({
                            'all':item.value,
                            'bfb':item.percent,
                            'type':item.name,
                            'color':color
                        });
                        this.setState({chart1DataInfo:chart1DataInfo});
                    });
                }else{
                    this.setState({chart1DataInfo:[]});
                }
                var option1 = {
                    tooltip: {
                        trigger: 'item',
                        formatter: "{a} <br/>{b}: {c} ({d}%)"
                    },
                    series: [
                        {
                            name: '任务概述',
                            type: 'pie',
                            radius: ['50%', '70%'],
                            avoidLabelOverlap: false,
                            label: {
                                normal: {
                                    show: false,
                                    position: 'center'
                                },
                                emphasis: {
                                    show: false,
                                    textStyle: {
                                        fontSize: '30',
                                        fontWeight: 'bold'
                                    }
                                }
                            },
                            labelLine: {
                                normal: {
                                    show: false
                                }
                            },
                            data: chart1Datas
                        }
                    ]
                };
                chart1.setOption(option1);
            }
            this.setState({ chart1Loading: false });
        });
    }

    chart2(id,isDraw) {
        var chart2 = echarts.init(document.getElementById('main2'));
        if(isDraw === '重绘'){
            chart2.resize();
            return false;
        }
        this.setState({ chart2Loading: true });
        const data = { 'projectId': id };
        getChartByProjectProgress(data, (res) => { 
            if(res.err){
                return false;
            }
            if(res.length === 0){
                this.setState({chart2Render:false});
            }else{
                this.setState({chart2Render:true});
                const dates = [];
                const data_wwc = [];
                const data_dqr = [];
                const data_wzp = [];
                const data_ywc = [];
                res.map((item) => {
                    dates.push(item.date);
                    data_wwc.push(item.wwcCount);
                    data_dqr.push(item.dqrCount);
                    data_wzp.push(item.wzpCount);
                    data_ywc.push(item.ywcCount);
                });

                var option2 = {
                    tooltip: {
                        trigger: 'axis',
                        axisPointer: {
                            type: 'cross',
                            label: {
                                backgroundColor: '#6a7985'
                            }
                        }
                    },
                    legend: {
                        data: [
                            {
                                name:'未指派',
                                icon:'roundRect'
                            },{
                                name:'进行中',
                                icon:'roundRect'
                            },{
                                name:'待确认',
                                icon:'roundRect'
                            },{
                                name:'已完成',
                                icon:'roundRect'
                            }],
                        bottom:0,
                    },
                    toolbox: {
                        feature: {
                            saveAsImage: {}
                        }
                    },
                    grid: {
                        left: '10',
                        right: '40',
                        bottom: '30',
                        top: '0',
                        containLabel: true
                    },
                    xAxis: [
                        {
                            type: 'category',
                            boundaryGap: false,
                            data: dates,
                            axisLine:{
                                lineStyle:{
                                    color:'#C1BFBF',
                                    
                                }
                            } 
                        }
                    ],
                    yAxis: [
                        {
                            type: 'value',
                            axisLine:{
                                lineStyle:{
                                    color:'#C1BFBF',
                                    
                                }
                            },
                            splitLine:{
                                show:true,
                                lineStyle:{
                                    type:'dotted',
                                    color:'#f5f5f5'
                                }
                            }
                        }
                    ],
                    series: [
                        {
                            name: '已完成',
                            type: 'line',
                            stack: '总量',
                            itemStyle: {
                                color: '#5e97f6'
                            },
                            areaStyle: { normal: {} },
                            data: data_ywc
                        },
                        {
                            name: '待确认',
                            type: 'line',
                            stack: '总量',
                            itemStyle: {
                                color: '#5ec9f6'
                            },
                            areaStyle: { normal: {} },
                            data: data_dqr
                        },
                        {
                            name: '进行中',
                            type: 'line',
                            stack: '总量',
                            itemStyle: {
                                color: '#78c06e'
                            },
                            areaStyle: { normal: {} },
                            data: data_wwc
                        },
                        {
                            name: '未指派',
                            type: 'line',
                            stack: '总量',
                            itemStyle: {
                                color: '#722ED1'
                            },
                            areaStyle: { normal: {} },
                            data: data_wzp
                        }
                    ]
                };
                chart2.setOption(option2);
                chart2.resize();
            }

            this.setState({ chart2Loading: false });
        });
    }

    chart3(id,start,end,isDraw,isBigChart=false) {
        if(isBigChart){   
            if(isDraw !== '重绘'){
                this.setState({chart3BigLoading:true});      
            }   
            var chart3 = echarts.init(document.getElementById('bigChart')); 
        }else{
            if(isDraw !== '重绘'){
                this.setState({ chart3Loading: true });
            }
            var chart3 = echarts.init(document.getElementById('main3'));
        }
        if(isDraw === '重绘'){
            chart3.resize();
            return false;
        }   
        const data = {
             'projectId': id,
             'attdate01':start?start:'',
             'attdate02':end?end:'',
             };
        getChartByUserTask(data, (res) => { 
            if(res.err){
                return false;
            }
            if(isBigChart){ 
                this.setState({bigCharShow:true,bigCharTitle:'人员任务统计'});
            }
            if(res.tasktableData.length === 0){
                this.setState({chart3Render:false});
            }else{
                this.setState({chart3Render:true});
                const chart3names = [];
                const chart3Datas_zcwc = [];
                const chart3Datas_tqwc = [];
                const chart3Datas_yqwc = [];
                const chart3Datas_zprw = [];
                const chart3Datas_qrrw = [];
                const chart3Datas_cjrw = [];

                if(res.tasktableData.length>10){
                    this.setState({bigCharHeight:res.tasktableData.length*20+100});
                }else{
                    this.setState({bigCharHeight:300});
                }

                res.tasktableData.map((item, i) => {
                    chart3names.push(item.name);
                    chart3Datas_zprw.push(item.dzprw);
                    chart3Datas_cjrw.push(item.dwcrw);
                    chart3Datas_qrrw.push(item.dqrrw);
                    // chart3Datas_tqwc.push(item.tqwc);
                    // chart3Datas_zcwc.push(item.zcwc);
                    // chart3Datas_yqwc.push(item.yqwc);
                });          
                var option3 = {
                    tooltip: {
                        trigger: 'axis',
                        axisPointer: {            // 坐标轴指示器，坐标轴触发有效
                            type: 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
                        }
                    },
                    legend: {                 
                        data: ['待指派', '待完成', '待确认'],
                        bottom:0,
                    },
                    grid: {
                        left: '0',
                        right: '30',
                        bottom: '60',
                        top: '0',
                        containLabel: true
                    },
                    xAxis: {
                        type: 'value',
                        // show: false,
                        axisLine:{
                            lineStyle:{
                                color:'#C1BFBF',
                                
                            }
                        } 
                    },
                    yAxis: {
                        type: 'category',
                        data: chart3names,
                        axisLine:{
                            lineStyle:{
                                color:'#C1BFBF',
                            }
                        } 
                    },
                    series: [
                        {
                            name: '待指派',
                            type: 'bar',
                            stack: '总量',
                            label: {
                                show: false
                            },
                            itemStyle: {
                                color: '#722ED1'
                            },
                            data: chart3Datas_zprw
                        },
                        {
                            name: '待完成',
                            type: 'bar',
                            stack: '总量',
                            label: {
                                show: false
                            },
                            itemStyle: {
                                color: '#78c06e'
                            },
                            data: chart3Datas_cjrw
                        },
                        {
                            name: '待确认',
                            type: 'bar',
                            stack: '总量',
                            label: {
                                show: false
                            },
                            itemStyle: {
                                color: '#5ec9f6'
                            },
                            data: chart3Datas_qrrw                
                        }
                    ]
                };
                chart3.setOption(option3);
                chart3.resize();
            }
            this.setState({ chart3Loading: false, chart3BigLoading: false });
        });
    }
    
    chart4(id,start,end,isDraw,search='1',isBigChart=false) {
        if(isBigChart){
            if(isDraw !== '重绘'){
                this.setState({chart4BigLoading:true});
            }
            var chart4 = echarts.init(document.getElementById('bigChart'));
        }else{
            if(isDraw !== '重绘'){
                this.setState({ chart4Loading: true });
            }
            var chart4 = echarts.init(document.getElementById('main4'));
        }
        if(isDraw === '重绘'){
            chart4.resize();
            return false;
        }        
        const data = { 
            'projectId': id,
            'attdate01': start?start:'',
            'attdate02': end?end:'',
            'type':search?search:'1',
        };
        getChartByUserMoney(data, (res) => { 
            if(res.err){
                return false;
            }
            if(isBigChart){
                this.setState({bigCharShow:true,bigCharTitle:'人员绩效统计'});
            }
            if((res.contenTableData && res.contenTableData.length === 0) || (res.tasktableData && res.tasktableData.length === 0)){
                this.setState({chart4Render:false});
            }else{
                this.setState({chart4Render:true});
            
                const chart4names = [];
                const chart4data_yqwc = [];
                const chart4data_zcwc = [];
                const chart4data_zprw = [];
                const chart4data_qrrw = [];
                const chart4data_tqwc = [];
                const chart4data_cjrw = [];            

                if(search == '1'){
                    if(res.contenTableData.length>10){
                        this.setState({bigCharHeight:res.contenTableData.length*20+100});
                    }else{
                        this.setState({bigCharHeight:300});
                    }
                    res.contenTableData.map((item,i) => {
                        chart4names.push(item.name);
                        chart4data_yqwc.push(item.yqwcjx);
                        chart4data_zcwc.push(item.zcwcjx);
                        chart4data_zprw.push(item.zprwjx);
                        chart4data_qrrw.push(item.qrrwjx);
                        chart4data_tqwc.push(item.tqwcjx);
                        chart4data_cjrw.push(item.cjrwjx);
                    });
                }else if(search == '2'){
                    if(res.tasktableData.length>10){
                        this.setState({bigCharHeight:res.tasktableData.length*20+100});
                    }else{
                        this.setState({bigCharHeight:300});
                    }
                    res.tasktableData.map((item,i) => {
                        chart4names.push(item.name);
                        chart4data_yqwc.push(item.yqwc);
                        chart4data_zcwc.push(item.zcwc);
                        chart4data_zprw.push(item.zprw);
                        chart4data_qrrw.push(item.qrrw);
                        chart4data_tqwc.push(item.tqwc);
                        chart4data_cjrw.push(item.cjrw);
                    });
                } 
                var option4 = {
                    tooltip: {
                        trigger: 'axis',
                        axisPointer: {            // 坐标轴指示器，坐标轴触发有效
                            type: 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
                        }
                    },
                    legend: {
                        data: ['创建任务','指派任务','确认任务', '提前完成', '正常完成','逾期完成'],
                        bottom:0,
                        
                    },
                    grid: {
                        top: '0',
                        left: '0',
                        right: '30',
                        bottom: '60',
                        containLabel: true
                    },
                    xAxis: {
                        type: 'value',
                        axisLine:{
                            lineStyle:{
                                color:'#C1BFBF',
                                
                            }
                        } 
                    },
                    yAxis: {
                        type: 'category',
                        data: chart4names,
                        axisLine:{
                            lineStyle:{
                                color:'#C1BFBF',
                                
                            }
                        } 
                    },
                    series: [
                        {
                            name: '创建任务',
                            type: 'bar',
                            stack: '总量',
                            label: {
                                show: false
                            },
                            itemStyle: {
                                color: '#FFCC66'
                            },
                            data: chart4data_cjrw
                        },
                        {
                            name: '指派任务',
                            type: 'bar',
                            stack: '总量',
                            label: {
                                show: false
                            },
                            itemStyle: {
                                color: '#722ED1'
                            },
                            data: chart4data_zprw
                        },
                        {
                            name: '确认任务',
                            type: 'bar',
                            stack: '总量',
                            label: {
                                show: false
                            },
                            itemStyle: {
                                color: '#5ec9f6'
                            },
                            data: chart4data_qrrw
                        },
                        {
                            name: '提前完成',
                            type: 'bar',
                            stack: '总量',
                            label: {
                                show: false
                            },
                            itemStyle: {
                                color: '#38adff'
                            },
                            data: chart4data_tqwc
                        },
                        {
                            name: '正常完成',
                            type: 'bar',
                            stack: '总量',
                            label: {
                                show: false
                            },
                            itemStyle: {
                                color: '#5e97f6'
                            },
                            data: chart4data_zcwc
                        },
                        {
                            name: '逾期完成',
                            type: 'bar',
                            stack: '总量',
                            label: {
                                show: false
                            },
                            itemStyle: {
                                color: '#5c6bc0'
                            },
                            data: chart4data_yqwc
                        }
                    ]
                };
                chart4.setOption(option4);
                chart4.resize();
            }
            this.setState({ chart4Loading: false, chart4BigLoading: false });
        });
    }
    // 查询计算公式
    getFormula(id) {
        this.setState({ calculationModel: true })
        let { FormulaList } = this.state;
        getFormulaById(id, (data) => {
            if(data.err){
                return false;
            }
            if (data == true) {
                FormulaList.id='';
                FormulaList.projectId=id;
                FormulaList.createPerf =10,
                FormulaList.assignPerf = 5;
                FormulaList.confirmPerf = 15;
                FormulaList.finishPerf=100-FormulaList.createPerf-FormulaList.assignPerf-FormulaList.confirmPerf;
                FormulaList.finishZcPerf =100;
                FormulaList.finishTqPerf = 110;
                FormulaList.finishYqPerf = 90;
                 this.setState({ FormulaList: FormulaList});
            }else{
                FormulaList.id=data.id;
                FormulaList.projectId=id;
                FormulaList.createPerf = data.createPerf;
                FormulaList.assignPerf = data.assignPerf;
                FormulaList.confirmPerf = data.confirmPerf;
                FormulaList.finishPerf=data.finishPerf;
                FormulaList.finishZcPerf = data.finishZcPerf;
                FormulaList.finishTqPerf = data.finishTqPerf;
                FormulaList.finishYqPerf = data.finishYqPerf;
                this.setState({ FormulaList: FormulaList });
            }
        })
    }
    // 添加、修改计算公式
    updataFormula(e, type) {
        const { FormulaList } = this.state;
        onlyNumber(e.target);
        if (type === 'createPerf') {
            if(e.target.value >=0 && e.target.value<=100-FormulaList.assignPerf-FormulaList.confirmPerf){
                FormulaList.createPerf = e.target.value;
                FormulaList.finishPerf = 100-FormulaList.createPerf-FormulaList.assignPerf-FormulaList.confirmPerf;
            }
        } else if (type === 'assignPerf') {
            if(e.target.value >= 0 && e.target.value <= 100-FormulaList.createPerf-FormulaList.confirmPerf){
                FormulaList.assignPerf = e.target.value;
                FormulaList.finishPerf = 100-FormulaList.createPerf-FormulaList.assignPerf-FormulaList.confirmPerf;
            }
        } else if (type === 'confirmPerf') {
            if(e.target.value >= 0 && e.target.value <= 100-FormulaList.createPerf-FormulaList.assignPerf){
                FormulaList.confirmPerf = e.target.value;
                FormulaList.finishPerf = 100-FormulaList.createPerf-FormulaList.assignPerf-FormulaList.confirmPerf;
            }
        } else if (type === 'finishZcPerf') {
            FormulaList.finishZcPerf = e.target.value;
        } else if (type === 'finishTqPerf') {
            FormulaList.finishTqPerf = e.target.value;
        } else if (type === 'finishYqPerf') {
            FormulaList.finishYqPerf = e.target.value;
        } 
        this.setState({ FormulaList: FormulaList });
    }
    // 保存
    saveFormula(){
        const { FormulaList,chart4searchType } = this.state;
        updateFormula(FormulaList, (data) => {
            if(data.err){
                return false;
            }
            if(data){
                message.success('保存成功');
                this.setState({calculationModel:false});
                this.selectType(chart4searchType);
            }
            
        });
    }
    // 人员任务和人员绩效筛选
    selectTime(type,date){        
        const {chart4searchType}=this.state;
        if(type==='ryjx'){   
            let start = '';
            let end = '';
            if(date && date.length > 0){
                start = dateToString(date[0]._d,'date');
                end = dateToString(date[1]._d,'date');
            }
            this.setState({chart4Start:start,chart4End:end});
            this.chart4(this.props.projectId,start,end,'',chart4searchType); 
        }else if(type==='ryrw'){
            let start = '';
            let end = '';
            if(date && date.length > 0){
               start =dateToString(date[0]._d,'date');
               end =dateToString(date[1]._d,'date');
            }
            this.setState({chart3Start:start,chart3End:end});
            this.chart3(this.props.projectId,start,end);
        }
    }
    //人员绩效按类型筛选
    selectType(type){
        const {chart4Start,chart4End}=this.state;
        this.setState({chart4searchType:type});
        this.chart4(this.props.projectId,chart4Start,chart4End,'',type);
    }

    bigChartRender(){
        const { bigCharShow,bigCharTitle,bigCharHeight} = this.state; 
        return(
            <div className="bigChartBox" style={bigCharShow ?{}:{display:'none'}}>
                <div className="bigChartDiv">
                    <h3>
                        <span>{bigCharTitle}</span>
                        <Icon type="close" onClick={()=>{this.setState({bigCharShow:false})}} />
                    </h3>
                    <div className="bigChart">
                        <div className="chart" id="bigChart" style={{height:bigCharHeight+'px'}}></div>
                    </div>
                </div>
            </div>
        )
    }

    render() { 
        const {chart1Loading,chart2Loading,chart3Loading,chart4Loading,chart1DataInfo,FormulaList,chart3Start,chart3End,chart4Start,chart4End,chart4searchType,
               chart1Render,chart2Render,chart3Render,chart4Render,chart3BigLoading,chart4BigLoading
        } = this.state;
        const { jurisdiction } = this.props;
        const content1 = (<div>占任务总绩效的百分比</div>);
        const content2 = (<div>占任务总绩效的百分比</div>);
        const content3 = (<div>占任务总绩效的百分比</div>);
        const content4 = (<div>占完成任务绩效的百分比</div>);  
    
        return (
            <div className="projectChart">
                <style dangerouslySetInnerHTML={{ __html: stylesheet }} />
                {this.bigChartRender()}
                <div className="projectChart_row">
                    <div className="chartBox" style={{paddingBottom:10}}>
                        <div className="chart_title">任务概述</div>
                        <div className="chart">
                            <Spin spinning={chart1Loading}/>
                            <div id="main1" style={{width:'50%',left:'0',position:'absolute',top:'0',bottom:'0',display:(chart1Render?'':'none')}}></div>
                            {!chart1Render?<NullView icon={'Warning'} showTit={'当前还没有可统计的数据'} />:''}
                            {chart1Render?
                                <div className="datalist">
                                    {chart1DataInfo && chart1DataInfo.length>0 ? chart1DataInfo.map((item,i)=>{
                                        return  <div className="li" key={i+'chart1DataInfo'}>
                                                    <div className="dian" style={{background:item.color}}></div>
                                                    <div className="charType">{item.type}</div>
                                                    <div className="baifenbi">{item.all}</div>
                                                </div>
                                    }):''}
                                </div>
                            :''}
                        </div>
                    </div>
                    <div className="chartBox" style={{paddingBottom:10}}>
                        <div className="chart_title">项目进展</div>
                        <Spin spinning={chart2Loading} />
                        <div className="chart" id="main2" style={chart2Render?{}:{display:'none'}}></div>
                        {!chart2Render?
                            <NullView icon={'Warning'} showTit={'当前还没有可统计的数据'} />
                        :''}
                    </div>
                </div>
                <div className="projectChart_row">
                    <div className="chartBox" >
                        <div className="chart_title">
                            人员待办统计
                            {!chart3Loading && chart3Render?
                                <i className="icon iconfont icon-open" 
                                onClick={()=>{this.chart3(this.props.projectId,chart3Start,chart3End,'',true)}}
                                ></i>
                            :''}
                            {chart3BigLoading?<Icon style={{right:'43px'}} type="loading"/>:''}
                        </div>
                        {chart3Render?
                            <div className="chart_search">
                                {chart3Start && chart3End?
                                    <RangePicker size="small" value={[moment(chart3Start, dateFormat), moment(chart3End, dateFormat)]} onChange={(e)=>this.selectTime('ryrw',e)}/>
                                :
                                    <div>
                                        <RangePicker size="small" onChange={(e)=>this.selectTime('ryrw',e)}/>    
                                    </div>
                                }                                
                                <a href={baseURI+'/calculate/downLoadTaskCalculate?projectId='+this.props.projectId+'&attdate01='+chart3Start+'&attdate02='+chart3End} download target="_blank"><span className="download">导出</span></a>
                            </div>
                        :''}
                        <Spin spinning={chart3Loading} />
                        <div className="chart" id="main3" style={chart3Render?{}:{display:'none'}}></div>
                        {!chart3Render?
                            <NullView icon={'Warning'} showTit={'当前还没有可统计的数据'} />
                        :''}
                    </div>
                    <div className="chartBox">
                        <div className="chart_title">人员绩效统计
                            <span className="more" style={chart4BigLoading?{margin:'0 50px 0 0'}:{}} onClick={() => this.getFormula(this.props.projectId)}>查看计算公式</span>
                            {chart4Render?
                                <i className="icon iconfont icon-open" 
                                onClick={()=>{this.chart4(this.props.projectId,chart4Start,chart4End,'',chart4searchType,true)}}
                                ></i>
                            :''}
                            {chart4BigLoading?<Icon style={{right:'43px'}} type="loading"/>:''}
                        </div>                        
                        <div className="chart_search4">                            
                            <Radio.Group className="group" defaultValue="1" buttonStyle="solid" value={chart4searchType} onChange={(e)=>{this.selectType(e.target.value);this.setState({chart4searchType:e.target.value,chart4Loading:true});}}>
                                <Radio.Button value="1">按绩效值</Radio.Button>
                                <Radio.Button value="2">按任务数</Radio.Button>
                            </Radio.Group>
                            {chart4Render?
                                <div className="time">
                                {chart4Start && chart4End?
                                    <RangePicker size="small" value={[moment(chart4Start, dateFormat), moment(chart4End, dateFormat)]} onChange={(e)=>this.selectTime('ryjx',e)}/>
                                :
                                    <div>
                                        <RangePicker size="small" onChange={(e)=>this.selectTime('ryjx',e)}/>
                                    </div>
                                }
                                </div>                           
                            :''}
                            <a href={baseURI+'/calculate/downLoadFlowContenCalculate?projectId='+this.props.projectId+'&attdate01='+chart4Start+'&attdate02='+chart4End+'&type='+chart4searchType} download target="_blank"><span className="download">导出</span></a>
                        </div>
                        <Spin spinning={chart4Loading} />
                        <div className="chart" id="main4" style={chart4Render?{}:{display:'none'}}></div>
                        {!chart4Render?
                            <NullView icon={'Warning'} showTit={'当前还没有可统计的数据'} />
                        :""}
                    </div>
                </div>
                {/* 查看计算公式弹框 */}
                <Modal
                    title="绩效计算公式"
                    visible={this.state.calculationModel}
                    onCancel={() => { this.setState({ calculationModel: false }) }}
                    footer={jurisdiction?
                        [
                            <Button key="back" type="back" onClick={() => { this.setState({ calculationModel: false }) }}>取消</Button>,
                            <Button key='submit' type="primary" onClick={() => this.saveFormula()}>保存</Button>
                        ]
                        :''
                    }
                >
                    <div className="calculationModel-list">
                        <span className="title">创建任务绩效</span>
                        <div className="other">
                            {jurisdiction?
                            <Popover 
                            placement="bottomRight"
                            content={'最大可输入'+(100-FormulaList.assignPerf-FormulaList.confirmPerf)}
                            trigger='click'>
                                <Input placeholder="请输入" addonAfter="%" value={FormulaList.createPerf} onChange={(e) => this.updataFormula(e, 'createPerf')} />
                            </Popover>
                            :
                                <span style={{padding:'0 0 0 10px'}}>{FormulaList.createPerf} %</span>
                            }
                        </div>
                        <span className="help">
                            <Popover content={content1}>
                                <Icon type="question-circle-o" />
                            </Popover>
                        </span>
                    </div>
                    <div className="calculationModel-list">
                        <span className="title">指派任务绩效</span>
                        <div className="other">
                            {jurisdiction?
                            <Popover 
                            placement="bottomRight"
                            content={'最大可输入'+(100-FormulaList.createPerf-FormulaList.confirmPerf)}
                            trigger='click'>
                                <Input placeholder="请输入" addonAfter="%" value={FormulaList.assignPerf} onChange={(e) => this.updataFormula(e, 'assignPerf')} />
                            </Popover>
                            :
                                <span style={{padding:'0 0 0 10px'}}>{FormulaList.assignPerf} %</span>
                            }
                        </div>
                        <span className="help">
                            <Popover content={content2}>
                                <Icon type="question-circle-o" />
                            </Popover>
                        </span>
                    </div>
                    <div className="calculationModel-list">
                        <span className="title">确认任务绩效</span>
                        <div className="other">
                            {jurisdiction?
                            <Popover 
                            placement="bottomRight"
                            content={'最大可输入'+(100-FormulaList.createPerf-FormulaList.assignPerf)}
                            trigger='click'>
                                <Input placeholder="请输入" addonAfter="%" value={FormulaList.confirmPerf} onChange={(e) => this.updataFormula(e, 'confirmPerf')} />
                            </Popover>
                            :
                                <span style={{padding:'0 0 0 10px'}}>{FormulaList.confirmPerf} %</span>
                            }
                        </div>
                        <span className="help">
                            <Popover content={content3}>
                                <Icon type="question-circle-o" />
                            </Popover>
                        </span>
                    </div>
                    <div className="calculationModel-line"></div>
                    <div className="calculationModel-list">
                        <span className="title">完成任务绩效</span>
                        <div className="other">
                            {/* <span className="jxNum">{FormulaList.finishPerf}%</span> */}
                            <span className="jxNum">{100-FormulaList.createPerf-FormulaList.assignPerf-FormulaList.confirmPerf}%</span>
                            <span className="qz">其中</span>
                        </div>
                        <span className="help">
                            <Popover content={content4}>
                                <Icon type="question-circle-o" />
                            </Popover>
                        </span>
                    </div>
                    <div className="calculationModel-list">
                        <span className="title">按时完成</span>
                        <div className="other">
                            {jurisdiction?
                                <Input placeholder="请输入" addonAfter="%" value={FormulaList.finishZcPerf} onChange={(e) => this.updataFormula(e, 'finishZcPerf')} />
                            :
                                <span style={{padding:'0 0 0 10px'}}>{FormulaList.finishZcPerf} %</span>
                            }
                        </div>
                        <span className="help"></span>
                    </div>
                    <div className="calculationModel-list">
                        <span className="title">提前完成</span>
                        <div className="other">
                            {jurisdiction?
                                <Input placeholder="请输入" addonAfter="%" value={FormulaList.finishTqPerf } onChange={(e) => this.updataFormula(e, 'finishTqPerf')} />
                            :
                                <span style={{padding:'0 0 0 10px'}}>{FormulaList.finishTqPerf} %</span>
                            }
                        </div>
                        <span className="help"></span>
                    </div>
                    <div className="calculationModel-list">
                        <span className="title">逾期完成</span>
                        <div className="other">
                            {jurisdiction?
                                <Input placeholder="请输入" addonAfter="%" value={FormulaList.finishYqPerf} onChange={(e) => this.updataFormula(e, 'finishYqPerf')} />
                            :
                                <span style={{padding:'0 0 0 10px'}}>{FormulaList.finishYqPerf} %</span>
                            }
                        </div>
                        <span className="help"></span>
                    </div>
                    {/* <div className="calculationModel-line"></div>
                    <div className="calculationModel-list">
                        <span className="title">活跃奖励绩效</span>
                        <div className="other">
                        </div>
                        <span className="help"><span className="add">添加</span></span>
                    </div>
                    <div className="calculationModel-list">
                        <span className="title">参与讨论</span>
                        <div className="other">
                            <div className="jx-box">
                                <Input placeholder="条" value="50条" />
                                <span>奖励</span>
                                <Input placeholder="条" value="50条" />
                            </div>
                        </div>
                        <span className="help"><span className="del">删除</span></span>
                    </div>
                    <div className="calculationModel-list">
                        <span className="title">参与讨论</span>
                        <div className="other">
                            <div className="jx-box">
                                <Input placeholder="条" value="50条" />
                                <span>奖励</span>
                                <Input placeholder="条" value="50条" />
                            </div>
                        </div>
                        <span className="help"><span className="del">删除</span></span>
                    </div> */}

                </Modal>
            </div>
        );
    }
}