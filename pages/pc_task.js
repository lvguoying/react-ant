import React from 'react';
import withRedux from 'next-redux-wrapper';
import { initStore } from '../store';
import { Layout, Menu, Icon, Button, Checkbox, Select, Radio, Spin, Dropdown, DatePicker, Input, message } from 'antd';
import moment from 'moment';
import { LocaleProvider } from 'antd';
import zh_CN from 'antd/lib/locale-provider/zh_CN';

import stylesheet from 'styles/views/task.scss';
import Head from '../components/header';
import TaskList from '../components/taskList';
import TaskDetail from '../components/taskDetails';
import MoreTaskEdit from '../components/moreTaskEdit';
import TagComponent from '../components/tag';
import TaskCreate from '../components/taskCreate';
import { getTaskListByCondition, getDictsByTypes } from '../core/service/task.service';
import { getProListByType } from '../core/service/project.service';
import { listScroll, dateToString, getTeamInfoWithMoney, onlyNumber, isLoadingErr } from '../core/utils/util';
import Storage from '../core/utils/storage';
import UserTag from '../components/userTag';
import dingJS from '../core/utils/dingJSApi';
import MoneyEnd from '../components/moneyEnd';
import NullView from '../components/nullView';
import VersionUpdate from '../components/versionUpdate';

const { Content } = Layout;
const SubMenu = Menu.SubMenu;
const { Option } = Select;
const { RangePicker } = DatePicker;
const InputGroup = Input.Group;
const Search = Input.Search;

class Task extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      taskSearch: {                                                                          // 任务查询
        'group': "evolve",
        'labelId': [],
        'menuType': "sub1",
        'panelId': ['0'],
        'projectIds': [],
        'search': "",
        'planTimeSear': {
          'start': '',
          'end': ''
        },
        'worktimeSear': {
          'min': '',
          'max': ''
        },
        'flowContenSear': {
          'min': '',
          'max': ''
        },
        'userSear': {
          'type': '0',                                                                        /* 负责人0 确认人1 关注人2 指派人3 创建人4          */
          'userIds': []
        }
      },
      selectedUsers: [],
      taskSearchStateAct: '0',                                                                /* 默认选中未完成 */
      dicts: {},                                                                              /* 字典数据 */
      dictsLoading: false,

      taskListNowPage: 1,                                                                    // 任务列表    
      taskListAllPage: 0,
      taskList: [],
      taskCount: '',                                                                          //当前任务数                      
      taskListLoading: false,
      taskListLoadingCount: 0,
      taskListMoreLoading: false,
      taskListHideOpt: ['user'],                                                             /* 因为默认是选中我负责的，所以任务列表不显示负责人名字 */
      showOkTask: false,
      showTaskBox: false,
      hideTaskIds:[],

      taskDetailShow: false,                                                                 // 详情页
      animateClass:'',
      detailPageTaskId: '',
      detailPageProjectId: '',

      projectList: [],                                                                       // 项目
      projectListNowPage: 1,
      projectListAllPage: 0,
      projectListLoading: false,
      projectListMoreLoading: false,
      projectSelecteds: [],

      tagSelecteds: [],                                                                      // 标签 

      topSearchOptions: ['项目', '标签', '角色', '完成时间', '计划工期', '任务绩效'],                // 顶部 自定义选项
      topSearchDownMenuShow: false,

      moreTaskEditShow: false,
      allSearchBoxShow: false,
      checkTaskIds: [],

      taskCreateShow: false,

      versionAlert: false,            // 是否显示专业版提示
      versionUpdateShow: false,       // 是否显示版本更新说明
      buyDay15Show: false,            // 是否显示15天到期提醒
    }
  }

  componentWillMount() {
    this.getDicts();
    this.getProjectList(1);
    this.getTaskList();    
  }

  componentDidMount() {
    dingJS.authDingJsApi();
    this.getSearchOptByStorage();

    const buyDay15AlertDate = Storage.getLocal('buyDay15AlertDate');
    if(buyDay15AlertDate!==dateToString(new Date(),'date') && getTeamInfoWithMoney('剩余天数')<16 && getTeamInfoWithMoney('剩余天数')>-1){
      this.setState({buyDay15Show:true});
    }else{
      this.setState({buyDay15Show:false});
    }

    const versionUpdateShow = Storage.getLocal('versionUpdateShow');
    if (versionUpdateShow == true || versionUpdateShow == false) {
      this.setState({ versionUpdateShow: versionUpdateShow });
    } else {
      this.setState({ versionUpdateShow: true });
    }
  }

  componentWillUnmount() {
    this.setState = (state, callback) => {
      return;
    };
  }

  // 获取公共字典数据
  getDicts() {
    this.setState({ dictsLoading: true });
    const dictNames = 'ant_taskinfo_flow,ant_taskinfo_state,ant_taskinfo_coefficienttype,ant_task_home_planTime,ant_task_home_workTime';
    getDictsByTypes(dictNames, (data) => {
      if(data.err){
        return false;
      }
      this.setState({ dicts: data });
      this.setState({ dictsLoading: false });
    });
  }

  // 获取缓存的自定义选项
  getSearchOptByStorage() {
    const storageOpt = Storage.getLocal('searchOpt');
    if (storageOpt) {
      this.setState({ topSearchOptions: storageOpt });
    }
  }

  getTaskList(pageNo, pageSize = 30, search) { 
    this.setState({hideTaskIds:[]});

    if (!pageNo) {
      pageNo = 1;
    }
    if (!search) {
      search = this.state.taskSearch;
    }
    if (pageNo === 1) {
      this.setState({ taskListLoading: true });
    } else {
      this.setState({ taskListMoreLoading: true });
    }
    if (search.menuType === 'all') {
      search.menuType = '';
    }

    getTaskListByCondition(pageNo, pageSize, search, (data) => {      
      if (data.err) {
        this.setState({ taskListLoadingCount: 'err' });
        this.setState({ taskListLoading: false, taskListMoreLoading: false });

        if (pageNo > 1) {
          message.error(isLoadingErr());
        }
        return false;
      }
      if (data.taskinfos) {
        if (data.taskinfos.pageNo === 1) {
          if (data.taskinfos.list) {
            this.setState({ taskList: data.taskinfos.list });
          } else {
            this.setState({ taskList: [] });
          }
        } else {
          let newPageTasks = JSON.parse(JSON.stringify(this.state.taskList));
          if (data.taskinfos.list) {
            data.taskinfos.list.map((item, i) => {
              newPageTasks.push(item);
            });
          }
          this.setState({ taskList: newPageTasks });
        }
        let taskCount = data.taskinfos.count ? data.taskinfos.count : '0';
        this.setState({ taskListNowPage: data.taskinfos.pageNo, taskListAllPage: data.taskinfos.last, taskCount: taskCount });
      } else {
        this.setState({ taskList: [], taskListNowPage: 1, taskListAllPage: 0, taskCount: '0' });
      }
      this.setState({ taskListLoading: false, taskListMoreLoading: false });
      if (this.state.taskListLoadingCount === 'err') {
        this.setState({ taskListLoadingCount: 1 });
      } else {
        this.setState({ taskListLoadingCount: this.state.taskListLoadingCount + 1 });
      }
    });
  }

  getProjectList(pageNo) {
    if (pageNo === 1) {
      this.setState({ projectListLoading: true });
    } else {
      this.setState({ projectListMoreLoading: true });
    }
    getProListByType('1', pageNo, (data) => {
      if(data.err){
        return false;
      }
      if (data.pageNo === 1) {
        this.setState({ projectList: data.projects });
      } else {
        let projectList = JSON.parse(JSON.stringify(this.state.projectList));
        data.projects.map((item) => {
          projectList.push(item);
        });
        this.setState({ projectList: projectList });
      }
      this.setState({ projectListAllPage: data.last, projectListNowPage: data.pageNo });
      this.setState({ projectListLoading: false, projectListMoreLoading: false });
    });
  }

  projectSelectedOnChange(val) {
    this.setState({ projectSelecteds: val });
    let { taskSearch } = this.state;
    taskSearch.projectIds = val;
    this.setState({ taskSearch: taskSearch });
    if (taskSearch.menuType !== '') {
      this.getTaskList(1, 30, taskSearch);
      this.refs.bottomBox.scrollTop = 0;
    }
  }

  searchAllTask() {
    let { taskSearch } = this.state;
    //taskSearch.group = '';
    //taskSearch.panelId = [];
    //this.setState({ taskSearch: taskSearch });
    this.getTaskList(1, 30, taskSearch);
  }

  allChecked(e) {
    let checkTaskIds = [];
    if (e.target.checked) {
      this.state.taskList.map((item, i) => {
        if (item.taskinfo.state !== '1' && item.taskinfo.state !== '4' && item.taskinfo.state !== '2') {
          checkTaskIds.push(item.taskinfo.id);
        }
      });
    }
    this.setState({ checkTaskIds: checkTaskIds });
  }

  selectedUsersOnchange(users) {
    this.setState({ selectedUsers: JSON.parse(JSON.stringify(users)) });
    let { taskSearch } = this.state;
    taskSearch.userSear.userIds = [];
    users.map((item) => {
      taskSearch.userSear.userIds.push(item.id);
    });
    this.setState({ taskSearch: taskSearch });
  }

  allSearchBoxSet() {
    let { allSearchBoxShow } = this.state;
    if (allSearchBoxShow) {
      this.setState({ allSearchBoxShow: false });
    } else {
      this.setState({ allSearchBoxShow: true });
    }
  }

  cancelMoreEdit() {
    this.setState({ moreTaskEditShow: false, moreTaskEditShow: false, checkTaskIds: [] });
  }
  //显示右上内容
  contentChange(val){
    if(val =='sub1'){
      return '我负责的'
    }else if(val == 'my_add'){
      return '我创建的'
    }else if(val == 'my_be'){
      return '我指派的'
    }else if(val == 'my_succeed'){
      return '我确认的'
    }else if(val == 'my_attention'){
      return '我关注的'
    }
  }

  // 右边上部分 筛选内容渲染
  right_top_render() {
    const { taskSearch, taskList, taskCount, allSearchBoxShow, showOkTask, showTaskBox, moreTaskEditShow, topSearchDownMenuShow, checkTaskIds, selectedUsers, projectList, projectSelecteds, dictsLoading, projectListMoreLoading, projectListLoading, taskSearchStateAct, projectListAllPage, projectListNowPage, tagSelecteds, topSearchOptions, dicts } = this.state;

    const userType = (
      <Menu>
        <Menu.Item>
          <a onClick={() => { this.valChange('userType', '0') }}>负责人</a>
        </Menu.Item>
        <Menu.Item>
          <a onClick={() => { this.valChange('userType', '1') }}>确认人</a>
        </Menu.Item>
        {/*
        <Menu.Item>
          <a onClick={()=>{this.valChange('userType','2')}}>关注人</a>
        </Menu.Item>
        */}
        <Menu.Item>
          <a onClick={() => { this.valChange('userType', '3') }}>指派人</a>
        </Menu.Item>
        <Menu.Item>
          <a onClick={() => { this.valChange('userType', '4') }}>创建人</a>
        </Menu.Item>
      </Menu>
    );
    let actUserType = '请选择';
    if (taskSearch.userSear.type === '0') {
      actUserType = '负责人';
    } else if (taskSearch.userSear.type === '1') {
      actUserType = '确认人';
    } else if (taskSearch.userSear.type === '3') {
      actUserType = '指派人';
    } else if (taskSearch.userSear.type === '4') {
      actUserType = '创建人';
    } else {
      actUserType = '负责人';
    }
    const groupOpt = (
      <Menu>
        <Menu.Item key='evolve'>
          <a onClick={() => { this.valChange('searGroupOpt', 'evolve') }}>任务进展</a>
        </Menu.Item>
        <Menu.Item key='planTime'>
          <a onClick={() => { this.valChange('searGroupOpt', 'planTime') }}>截止日期</a>
        </Menu.Item>
        <Menu.Item key='coefficienttype'>
          <a onClick={() => { this.valChange('searGroupOpt', 'coefficienttype') }}>优先级</a>
        </Menu.Item>
        <Menu.Item key='flowConten'>
          <a onClick={() => { this.valChange('searGroupOpt', 'flowConten') }}>任务绩效</a>
        </Menu.Item>
        <Menu.Item key='worktime'>
          <a onClick={() => { this.valChange('searGroupOpt', 'worktime') }}>计划工期</a>
        </Menu.Item>
      </Menu>
    );
    let groupActName = '';
    let groupOptDict = [];
    switch (taskSearch.group) {
      case 'evolve':
        groupActName = '任务进展';
        if (dicts.antTaskinfoStateList) {
          groupOptDict = JSON.parse(JSON.stringify(dicts.antTaskinfoStateList));
          /*if (showOkTask) {
            groupOptDict = groupOptDict.filter(val => (val.value !== '1' && val.value !== '4'));
          }*/
          if (taskSearch.menuType === 'sub1' || taskSearch.menuType === 'my_be') {
            groupOptDict = groupOptDict.filter(val => (val.value !== '3'));
          }
        }
        break;
      case 'planTime':
        groupActName = '截止日期';
        if (dicts.antTaskinfoStateList) {
          groupOptDict = JSON.parse(JSON.stringify(dicts.antTaskHomePlantimeList));
        }
        break;
      case 'coefficienttype':
        groupActName = '优先级';
        if (dicts.antTaskinfoStateList) {
          groupOptDict = JSON.parse(JSON.stringify(dicts.antTaskinfoCoefficienttypeList));
        }
        break;
      case 'flowConten':
        groupActName = '任务绩效';
        if (dicts.antTaskinfoStateList) {
          groupOptDict = JSON.parse(JSON.stringify(dicts.antTaskinfoFlowList));
        }
        break;
      case 'worktime':
        groupActName = '计划工期';
        if (dicts.antTaskinfoStateList) {
          groupOptDict = JSON.parse(JSON.stringify(dicts.antTaskHomeWorktimeList));
        }
        break;
    }
    groupOptDict.unshift({ 'id': 'groupOptAll', 'value': 'all', 'label': '全部' });
    const initTopSearchOpts = ['角色', '完成时间', '计划工期', '任务绩效']; // '项目', '标签'
    //let initTopSearchOpts_new = initTopSearchOpts.filter((val)=>topSearchOptions.indexOf(val)==-1); 
    const searchOpt = <Menu>
      {initTopSearchOpts.map((item, i) => {
        return <Menu.Item key={'searOpt' + i} onClick={() => { this.valChange('searOptAdd', item) }}>
          <Checkbox checked={topSearchOptions.indexOf(item) !== -1 ? true : false} style={{ margin: '0 7px 0 0' }}></Checkbox>
          {item}
        </Menu.Item>
      })}
    </Menu>;
    const select_pro_data = [];
    projectList.map((item, i) => {
      select_pro_data.push(
        <Option key={item.id}>
          <svg className="pro-icon" aria-hidden="true">
            {item.attstr04 ?
              <use xlinkHref={item.attstr04}></use>
              :
              <use xlinkHref="#pro-myfg-1000"></use>
            }
          </svg>
          {item.proname}
        </Option>
      );
    });
    return (
      <div className="topBox" onClick={()=>{this.setState({taskDetailShow:false})}}>
        <div className="titRow">
          <h1>
            <span>{taskSearch.menuType === '' ? '全部任务' : this.contentChange(taskSearch.menuType)}</span>
            {taskSearch.search &&
              <span className="searchClose"
                onClick={() => { let { taskSearch } = this.state; taskSearch.search = ''; this.setState({ taskSearch: taskSearch }); this.getTaskList(1, '', taskSearch) }}
              >
                取消
              </span>
            }
            <Search
              placeholder="任务搜索"
              value={taskSearch.search}
              onFocus={() => { this.cancelMoreEdit() }}
              onChange={e => { let { taskSearch } = this.state; taskSearch.search = e.target.value; this.setState({ taskSearch: taskSearch }); }}
              onSearch={value => { this.getTaskList(1, '', taskSearch) }}
              style={{ width: 200 }}
            />
            <div className="line" >
              <div className="lin"></div>
              <Icon type={allSearchBoxShow ? "up-circle-o" : "down-circle-o"}                    
                    onClick={() => { this.allSearchBoxSet() }} 
              />
              <span onClick={() => { this.allSearchBoxSet() }}
              >筛选</span>
            </div>
            <div style={{ clear: 'both' }}></div>
          </h1>
        </div>
        {allSearchBoxShow &&
          <div className="searchbb">
            <div className="searchbb_l">

            </div>
            <div className="searchbb_r">
              {(topSearchOptions.indexOf('项目') !== -1 && allSearchBoxShow) || (taskSearch.menuType !== '' && allSearchBoxShow) ?
                <div className="searchRow">
                  {taskSearch.menuType === '' && allSearchBoxShow ?
                    <div className="clear_icon">
                      <Dropdown overlay={searchOpt}
                        visible={topSearchDownMenuShow}
                      >
                        <i className="icon iconfont icon-shaixuan"
                          style={{ fontSize: '20px' }}
                          onClick={(e) => { if (topSearchDownMenuShow) { this.setState({ topSearchDownMenuShow: false }) } else { this.setState({ topSearchDownMenuShow: true }); e.stopPropagation(); e.preventDefault(); } }}
                        ></i>
                      </Dropdown>
                    </div>
                  : ''}
                  <div className="tit">所属项目</div>
                  <div className="cont">
                    {projectListLoading ?
                      <span style={{ float: 'left', margin: '5px 0 0 0' }}><Icon type="loading" /><span style={{ margin: '0 0 0 10px', fontSize: '12px' }}>项目加载中</span></span>
                      :
                      <Select
                        mode="multiple"
                        optionFilterProp={'children'}
                        style={{ maxWidth: '100%', minWidth: '250px' }}
                        placeholder="请选择项目"
                        value={projectSelecteds}
                        onChange={(val) => { this.projectSelectedOnChange(val) }}
                        onPopupScroll={(e) => { this.scrollOnBottom('projectList', e) }}
                      >
                        {select_pro_data}
                        {!projectListMoreLoading && projectListNowPage === projectListAllPage ?
                          <Option value="disabled" disabled>已经到底喽</Option>
                          : ''}
                        {!projectListMoreLoading && projectListNowPage < projectListAllPage ?
                          <Option value="disabled" disabled>下拉加载更多</Option>
                          : ''}
                        {projectListMoreLoading ?
                          <Option value="disabled" disabled><Icon type="loading" style={{ margin: '0 7px 0 0' }} />正在加载更多</Option>
                          : ''}
                      </Select>
                    }
                  </div>                  
                  {/*taskSearch.menuType === '' ?
                <div className="clear_icon">
                  <Icon type="close-circle-o" onClick={() => { this.valChange('searOpt', '项目') }} />
                </div>
              : ''*/}
                </div>
                : ''}
                {(topSearchOptions.indexOf('标签') !== -1 && allSearchBoxShow) || (taskSearch.menuType !== '' && allSearchBoxShow) ?
                <div className="searchRow">
                  <div className="tit" style={taskSearch.menuType === '' && allSearchBoxShow?{margin:'0 15px 0 40px'}:{}}>分类标签</div>
                  <div className="cont">
                    <TagComponent tagSelecteds={tagSelecteds}
                      tagChangeCallBack={(val) => { this.valChange('tagChange', val) }}
                    />
                  </div>
                  {/*taskSearch.menuType === '' ?
                <div className="clear_icon">
                  <Icon type="close-circle-o" onClick={() => { this.valChange('searOpt', '标签') }} />
                </div>
              : ''*/}
                </div>
                : ''}
                {(taskSearch.menuType === '' && topSearchOptions.indexOf('角色') !== -1) && allSearchBoxShow ?
                <div className="searchRow">
                  <div className="clear_icon">
                    <Icon type="close-circle-o" onClick={() => { this.valChange('searOpt', '角色') }} />
                  </div>
                  <div className="tit">人员角色</div>
                  <div className="juese">
                    <Dropdown overlay={userType}>
                      <Button className="ant-dropdown-link" href="#">
                        {actUserType} <Icon type="down" />
                      </Button>
                    </Dropdown>
                  </div>
                  <div className="cont">
                    <UserTag selectUserTitle={actUserType} selectedUsers={selectedUsers} selectedUsersOnchange={(val) => { this.selectedUsersOnchange(val) }} />
                  </div>                  
                </div>
                : ''}
              {(taskSearch.menuType === '' && topSearchOptions.indexOf('完成时间') !== -1) && allSearchBoxShow ?
                <div className="searchRow">
                  <div className="clear_icon">
                    <Icon type="close-circle-o" onClick={() => { this.valChange('searOpt', '完成时间') }} />
                  </div>
                  <div className="tit">完成日期</div>
                  <div className="cont">
                    {taskSearch.planTimeSear.start || taskSearch.planTimeSear.end ?
                      <div>
                        <RangePicker value={[moment(taskSearch.planTimeSear.start, 'YYYY-MM-DD'), moment(taskSearch.planTimeSear.end, 'YYYY-MM-DD')]}
                          onChange={(val) => { this.valChange('endTime', val) }}
                        />
                      </div>
                      :
                      <div>
                        <RangePicker value={[]} onChange={(val) => { this.valChange('endTime', val) }}
                        />
                      </div>
                    }
                  </div>                  
                </div>
                : ''}
              {(taskSearch.menuType === '' && topSearchOptions.indexOf('计划工期') !== -1) && allSearchBoxShow ?
                <div className="searchRow">
                  <div className="clear_icon">
                    <Icon type="close-circle-o" onClick={() => { this.valChange('searOpt', '计划工期') }} />
                  </div>
                  <div className="tit">计划工期</div>
                  <div className="cont">
                    <InputGroup compact>
                      <Input style={{ width: 110, textAlign: 'center' }} placeholder="0"
                        onChange={(e) => { onlyNumber(e.target); this.valChange('worktimeMin', e.target.value) }}
                        value={taskSearch.worktimeSear.min}
                      />
                      <Input style={{ width: 30, borderLeft: 0, pointerEvents: 'none', backgroundColor: '#fff' }} placeholder="~" disabled />
                      <Input style={{ width: 110, textAlign: 'center', borderLeft: 0 }} placeholder="500"
                        onChange={(e) => { onlyNumber(e.target); this.valChange('worktimeMax', e.target.value) }}
                        value={taskSearch.worktimeSear.max}
                      />
                    </InputGroup>
                    <span className="dw">天</span>
                  </div>                  
                </div>
                : ''}
              {(taskSearch.menuType === '' && topSearchOptions.indexOf('任务绩效') !== -1) && allSearchBoxShow ?
                <div className="searchRow">
                  <div className="clear_icon">
                    <Icon type="close-circle-o" onClick={() => { this.valChange('searOpt', '任务绩效') }} />
                  </div>
                  <div className="tit">任务绩效</div>
                  <div className="cont">
                    <InputGroup compact>
                      <Input style={{ width: 110, textAlign: 'center' }} placeholder="0"
                        onChange={(e) => { onlyNumber(e.target); this.valChange('flowContenMin', e.target.value) }}
                        value={taskSearch.flowContenSear.min}
                      />
                      <Input style={{ width: 30, borderLeft: 0, pointerEvents: 'none', backgroundColor: '#fff' }} placeholder="~" disabled />
                      <Input style={{ width: 110, textAlign: 'center', borderLeft: 0 }} placeholder="10000"
                        onChange={(e) => { onlyNumber(e.target); this.valChange('flowContenMax', e.target.value) }}
                        value={taskSearch.flowContenSear.max}
                      />
                    </InputGroup>
                  </div>                  
                </div>
                : ''}
              {taskSearch.menuType === '' && allSearchBoxShow ?
                <div className="allBtnRow" style={{ background: '#fff', padding: '15px 15px 15px 120px' }}>
                  <Button type="primary" size="large" onClick={() => { this.searchAllTask() }}>查询</Button>
                  <Button size="large" onClick={() => { this.clearSearchByType('all') }}>重置</Button>
                </div>
                : ''}
            </div>
          </div>
        }
        <div className="listHeaderRow">
          <div className="listHeader" style={{ border: '0', padding: '15px 0' }}>
            {dictsLoading && taskSearch.menuType !== '' ? <Icon type="loading" className="loadingIcon" style={{ float: 'right', margin: '5px 0 0 15px' }} /> : ''}
            <div className="radioGroup">
              {taskSearch.menuType !== '' ?
                <Dropdown overlay={groupOpt}>
                  <a className="ant-dropdown-link" href="#">
                    {/*'按'+groupActName*/} <Icon type="caret-down" />
                  </a>
                </Dropdown>
                :
                <div className="rad radOne"></div>
              }
              {groupOptDict.length > 0 && groupOptDict.map((item, i) => {
                return (
                  <div className={item.value === taskSearchStateAct ? "rad act" : "rad"} key={item.id} onClick={() => { this.valChange('topRadio', item.value) }}>
                    {item.label}
                  </div>
                )
              })}
              <Checkbox style={{ margin: '0 0 0 15px' }} checked={showOkTask} onChange={(e) => { this.setState({ showOkTask: e.target.checked }) }}>隐藏已完成</Checkbox>
              <Checkbox checked={showTaskBox} onChange={(e) => { this.setState({ showTaskBox: e.target.checked }) }}>隐藏任务包</Checkbox>
              {taskList.length > 0 && !moreTaskEditShow && getTeamInfoWithMoney('是否可用') ?
                <Button onClick={() => { this.setState({ moreTaskEditShow: true }) }}>
                  {getTeamInfoWithMoney('版本名称')!=='专业版'?
                    <svg className="pro-icon zuanshi" aria-hidden="true">
                        <use xlinkHref={"#pro-myfg-zuanshi"}></use>
                    </svg>
                  :''}
                  批量修改
                </Button>
                : ''}
              {taskList.length > 0 && !moreTaskEditShow && !getTeamInfoWithMoney('是否可用') ?
                <Button onClick={() => { this.setState({ versionAlert: true }) }}>
                  {getTeamInfoWithMoney('版本名称')!=='专业版'?
                    <svg className="pro-icon zuanshi" aria-hidden="true">
                        <use xlinkHref={"#pro-myfg-zuanshi"}></use>
                    </svg>
                  :''}
                  批量修改
                </Button>
                : ''}
            </div>
          </div>
          {moreTaskEditShow ?
            <div className="listHeader" style={{ display: 'flex' }}>
              <Checkbox checked={checkTaskIds.length === taskList.length ? true : false}
                onChange={(e) => { this.allChecked(e) }}>
                全选
              </Checkbox>
              <span>已选择：{checkTaskIds.length}条</span>
              {/*<span>当前任务数：{taskCount}</span>*/}
              <div className="allBtnRow" style={{ flex: '1' }}>
                <MoreTaskEdit editType="标签" checkTaskIds={checkTaskIds} updateCallBack={() => { this.getTaskList(1, 30) }} />
                <MoreTaskEdit editType="负责人" checkTaskIds={checkTaskIds} updateCallBack={() => { this.getTaskList(1, 30) }} />
                <MoreTaskEdit editType="确认人" checkTaskIds={checkTaskIds} updateCallBack={() => { this.getTaskList(1, 30) }} />
                <Button type="primary" style={{ float: 'right', margin: '0' }} onClick={() => { this.cancelMoreEdit() }}>取消</Button>
                <Select placeholder="更多修改" style={{ width: 100, fontSize: '13px' }} value={'更多修改'}>
                  <Option value="more1">
                    <MoreTaskEdit editType="完成时间" checkTaskIds={checkTaskIds} updateCallBack={() => { this.getTaskList(1, 30) }} />
                  </Option>
                  <Option value="more2">
                    <MoreTaskEdit editType="计划工期" checkTaskIds={checkTaskIds} updateCallBack={() => { this.getTaskList(1, 30) }} />
                  </Option>
                  <Option value="more4">
                    <MoreTaskEdit editType="任务绩效" checkTaskIds={checkTaskIds} updateCallBack={() => { this.getTaskList(1, 30) }} />
                  </Option>
                  <Option value="more3">
                    <MoreTaskEdit editType="优先级" checkTaskIds={checkTaskIds} updateCallBack={() => { this.getTaskList(1, 30) }} />
                  </Option>
                </Select>
              </div>
            </div>
            : ''}
        </div>
      </div>
    )
  }

  valChange(type, val) {
    let { taskSearch, topSearchOptions, taskListHideOpt } = this.state;
    switch (type) {
      case 'checkTask':
        const checkTaskIds = JSON.parse(JSON.stringify(val));
        this.setState({ checkTaskIds: checkTaskIds });
        break;
      case 'leftMenu':
        this.cancelMoreEdit();
        // sub1我负责的,my_succeed我确认的,my_add我创建的,my_be我指派的,my_attention我关注的   
        
        /*if (val === 'my_be' || val === 'sub1' || taskSearch.panelId[0] === '3' || val === 'my_succeed' || val === 'my_add' || val === 'my_attention') {
          taskSearch.panelId = [];
          this.setState({ taskSearch: taskSearch, taskSearchStateAct: 'all' });
        }*/

        //选中默认规则 我负责的---未完成  我确认的---待确认  我创建的---待指派  我指派的---未完成  我关注的---未完成
        if (val === 'sub1'){
          taskSearch.panelId = ['0'];
          this.setState({  taskSearchStateAct:'0' });
        }else if(val === 'my_succeed'){
          taskSearch.panelId = ['2'];
          this.setState({  taskSearchStateAct:'2' });
        }else if(val === 'my_add'){
          taskSearch.panelId = ['3'];
          this.setState({  taskSearchStateAct:'3' });
        }else if(val === 'my_be'){
          taskSearch.panelId = ['0'];
          this.setState({  taskSearchStateAct:'0' });
        }else if(val === 'my_attention'){
          taskSearch.panelId = ['0'];
          this.setState({  taskSearchStateAct:'0' });
        }        

        if (val === 'all') {
          taskSearch.menuType = '';
          taskSearch.group = 'evolve';  // 只能按任务进展筛选
          taskListHideOpt = [];
          this.setState({  taskSearchStateAct:'all' });
        } else {
          taskSearch.menuType = val;
          if (val === 'sub1') {
            taskListHideOpt = ['user'];
          } else {
            taskListHideOpt = [];
          }
          // 清空除项目和标签以外的筛选值
          taskSearch.planTimeSear = {
            'start': '',
            'end': ''
          };
          taskSearch.worktimeSear = {
            'min': '',
            'max': ''
          };
          taskSearch.flowContenSear = {
            'min': '',
            'max': ''
          };
          taskSearch.userSear = {
            'type': '0',                                                                        /* 负责人0 确认人1 关注人2 指派人3 创建人4          */
            'userIds': []
          };
        }
        this.setState({ taskSearch: taskSearch, taskListHideOpt: taskListHideOpt });
        this.getTaskList(1, 30, taskSearch);
        this.refs.bottomBox.scrollTop = 0;
        break;
      case 'searGroupOpt':
        taskSearch.group = val;
        taskSearch.panelId = [];
        this.setState({ taskSearch: taskSearch, taskSearchStateAct: 'all' });
        this.getTaskList(1, 30, taskSearch);
        this.refs.bottomBox.scrollTop = 0;
        break;
      case 'endTime':
        if (val.length > 0 && val[0]._d) {
          let start = dateToString(val[0]._d, 'date');
          let end = dateToString(val[1]._d, 'date');
          taskSearch.planTimeSear = {
            'start': start,
            'end': end
          };
        } else {
          taskSearch.planTimeSear = {
            'start': '',
            'end': ''
          };
        }
        this.setState({ taskSearch: taskSearch });
        break;
      case 'worktimeMin':
        taskSearch.worktimeSear.min = val;
        this.setState({ taskSearch: taskSearch });
        break;
      case 'worktimeMax':
        taskSearch.worktimeSear.max = val;
        this.setState({ taskSearch: taskSearch });
        break;
      case 'flowContenMin':
        taskSearch.flowContenSear.min = val;
        this.setState({ taskSearch: taskSearch });
        break;
      case 'flowContenMax':
        taskSearch.flowContenSear.max = val;
        this.setState({ taskSearch: taskSearch });
        break;
      case 'userType':
        taskSearch.userSear.type = val;
        this.setState({ taskSearch: taskSearch });
        break;
      case 'topRadio':
        this.cancelMoreEdit();
        if (val === 'all') {
          taskSearch.panelId = [];
        } else {
          taskSearch.panelId = [val];
        }
        this.setState({ taskSearch: taskSearch, taskSearchStateAct: val });
        this.getTaskList(1, 30, taskSearch);
        this.refs.bottomBox.scrollTop = 0;
        break;
      case 'searOpt':
        topSearchOptions.splice(topSearchOptions.indexOf(val), 1);
        this.setState({ topSearchOptions: topSearchOptions });
        Storage.setLocal('searchOpt', topSearchOptions);
        this.clearSearchByType(val);
        break;
      case 'searOptAdd':
        if (topSearchOptions.indexOf(val) === -1) {
          topSearchOptions.push(val);
        } else {
          topSearchOptions.splice(topSearchOptions.indexOf(val), 1);
        }
        this.setState({ topSearchOptions: topSearchOptions });
        Storage.setLocal('searchOpt', topSearchOptions);
        break;
      case 'tagChange':
        taskSearch.labelId = [];
        val.map((item) => {
          taskSearch.labelId.push(item.id);
        });
        this.setState({ tagSelecteds: val, taskSearch: taskSearch });
        if (taskSearch.menuType !== '') {
          this.getTaskList(1, 30, taskSearch);
          this.refs.bottomBox.scrollTop = 0;
        }
        break;
    }
  }

  scrollOnBottom(type, e) {
    const isOnButtom = listScroll(e);
    switch (type) {
      case 'projectList':
        const { projectListAllPage, projectListNowPage } = this.state;
        if (isOnButtom && projectListNowPage < projectListAllPage) {
          this.getProjectList(projectListNowPage + 1);
        }
        break;
      case 'taskList':
        const { taskListAllPage, taskListNowPage } = this.state;
        if (isOnButtom && taskListNowPage < taskListAllPage) {
          this.getTaskList(taskListNowPage + 1, 30);
        }
        break;
    }
  }

  taskClickCallBack(taskId, proId) {    
    this.setState({ detailPageTaskId: taskId, detailPageProjectId: proId });
    if(!this.state.taskDetailShow){
      this.setState({taskDetailShow:true,animateClass:'animated_05s fadeInRightBig'});
    }
    const _this = this;
    setTimeout(function(){
      _this.setState({animateClass:''});
    }, 500);
  }

  clearSearchByType(type) {
    let { taskSearch } = this.state;
    const taskSearchInitVal = {
      'group': "evolve",
      'labelId': [],
      'menuType': taskSearch.menuType,
      'panelId': [],
      'projectIds': [],
      'search': "",
      'planTimeSear': {
        'start': '',
        'end': ''
      },
      'worktimeSear': {
        'min': '',
        'max': ''
      },
      'flowContenSear': {
        'min': '',
        'max': ''
      },
      'userSear': {
        'type': '0',
        'userIds': []
      }
    }
    switch (type) {
      case 'all':
        taskSearch = taskSearchInitVal;
        this.setState({ projectSelecteds: [], selectedUsers: [] });
        this.setState({ tagSelecteds: [] });
        break;
      case '项目':
        taskSearch.projectIds = [];
        this.setState({ projectSelecteds: [] });
        break;
      case '标签':
        taskSearch.labelId = [];
        this.setState({ tagSelecteds: [] });
        break;
      case '计划工期':
        taskSearch.worktimeSear = taskSearchInitVal.worktimeSear;
        break;
      case '任务绩效':
        taskSearch.flowContenSear = taskSearchInitVal.flowContenSear;
        break;
      case '完成时间':
        taskSearch.planTimeSear = taskSearchInitVal.planTimeSear;
        break;
      case '角色':
        taskSearch.userSear = taskSearchInitVal.userSear;
        break;
    }
    this.setState({ taskSearch: taskSearch });
  }

  taskUpdate(task) {  
    let { taskList,hideTaskIds,taskSearch } = this.state;
    taskList.map((item, i) => {
      if (item.taskinfo.id === task.id) {
        if (task.delTask){
          taskList.splice(i,1);
          this.setState({taskList:taskList});
          return false;
        }
        if (task.name) {
          taskList[i].taskinfo.taskname = task.name;
        }
        if (task.tags) {
          const labs = [];
          task.tags.map((lab,index) => {
            labs.push({
              'id': lab.id,
              'labelname': lab.name,
              'color': lab.color,
              'type':'1',
            })
          });
          taskList[i].labels = labs;
        }
        if (task.attention === true || task.attention === false) {
          taskList[i].taskinfo.collect = task.attention;
        }        
        if (task.planEndTime!==undefined) {
          taskList[i].taskinfo.planEndTime = task.planEndTime;
        }
        if (task.realityEndTime!==undefined) {
          taskList[i].taskinfo.realityEndTime = task.realityEndTime;
        }
        if (task.milestone === '0' || task.milestone === '1') {
          taskList[i].taskinfo.milestone = task.milestone;
        }
        if (task.childSuccess > 0 || task.childSuccess == 0 || task.childCount > 0 || task.childCount == 0) {
          taskList[i].taskinfo.childSuccess = task.childSuccess;
          taskList[i].taskinfo.childCount = task.childCount;
        }
        if (task.talkCount > 0 || task.talkCount === 0) {
          taskList[i].taskinfo.leaveCount = task.talkCount;
        }
        if (task.state) { 
          // 更新数据
          taskList[i].taskinfo.stateName = task.state;
          // 按任务进展
          if(taskSearch.group === "evolve"){
            // 未完成            
            if(taskSearch.panelId[0]==="0"){
              if(task.state !== '0' && task.state !== '7'){
                this.hideTask(task,hideTaskIds);
              }else{
                this.showTask(task,hideTaskIds);
              }
            // 待确认
            }else if(taskSearch.panelId[0]==="2"){
              if(task.state !== '2'){
                this.hideTask(task,hideTaskIds);
              }else{
                this.showTask(task,hideTaskIds);
              }
            // 已完成
            }else if(taskSearch.panelId[0]==="1"){
              if(task.state !== '1' && task.state !== '8' && task.state !== '9'){
                this.hideTask(task,hideTaskIds);
              }else{
                this.showTask(task,hideTaskIds);
              }
            // 已终止
            }else if(taskSearch.panelId[0]==="4"){
              if(task.state !== '4'){
                this.hideTask(task,hideTaskIds);
              }else{
                this.showTask(task,hideTaskIds);
              }
            // 未指派
            }else if(taskSearch.panelId[0]==="3"){
              if(task.state !== '3'){
                this.hideTask(task,hideTaskIds);
              }else{
                this.showTask(task,hideTaskIds);
              }
            }
          }
        }
        // 删除/修改负责人
        if(task.fzr || task.fzr===''){
          // 更新数据
          if(taskList[i].taskinfo.userResponse){
            taskList[i].taskinfo.userResponse.name = task.fzr;
          }else{
            taskList[i].taskinfo.userResponse={};
            taskList[i].taskinfo.userResponse.name = task.fzr;
          }
          // 我指派的
          if(taskSearch.menuType === 'my_be'){
            if(task.fzr===''){
              this.hideTask(task,hideTaskIds);
            }else{
              this.showTask(task,hideTaskIds);
            }
          }
          // 我负责的
          if(taskSearch.menuType === 'sub1'){
            if(task.fzr===''){
              this.hideTask(task,hideTaskIds);
            }else if(taskList[i].taskinfo.userResponse && task.fzr===taskList[i].taskinfo.userResponse.name){
              this.showTask(task,hideTaskIds);
            }
          }
        }
        // 我确认的
        if(taskSearch.menuType==="my_succeed" && (task.qrr === '' || (item.taskinfo.userFlow && task.qrr !== undefined && task.qrr!== item.taskinfo.userFlow.name))){
          this.hideTask(task,hideTaskIds);
        }else if(taskSearch.menuType==="my_succeed" && item.taskinfo.userFlow && task.qrr !== undefined && task.qrr=== item.taskinfo.userFlow.name){
          this.showTask(task,hideTaskIds);          
        }
        // 我关注的
        if(taskSearch.menuType === "my_attention" && task.attention === false){
          this.hideTask(task,hideTaskIds);
        }else if(taskSearch.menuType === "my_attention" && task.attention === true){
          this.showTask(task,hideTaskIds);
        }
        return false;
      }
    });
    this.setState({ taskList: taskList });
  }

  showTask(task,hideTaskIds){
    const index = hideTaskIds.indexOf(task.id);
    if(index!==-1){
      hideTaskIds.splice(index,1);
      this.setState({hideTaskIds:hideTaskIds});
    }
  }

  hideTask(task,hideTaskIds){
    hideTaskIds.push(task.id);
    this.setState({hideTaskIds:hideTaskIds});
  }

  render() {
    const { taskList, taskListLoading, versionUpdateShow, hideTaskIds, versionAlert, buyDay15Show, showOkTask, showTaskBox, taskListLoadingCount, detailPageTaskId, taskCreateShow,animateClass, detailPageProjectId, checkTaskIds, moreTaskEditShow, taskSearch, taskDetailShow, taskListHideOpt, taskListMoreLoading, taskListAllPage, taskListNowPage } = this.state;
    let actType = '';
    if (taskSearch.menuType === '') {
      actType = ['all'];
    } else {
      actType = [taskSearch.menuType];
    }
 
    return (
      <LocaleProvider locale={zh_CN}>
        <Layout>
          <style dangerouslySetInnerHTML={{ __html: stylesheet }} />
          <Head menuClickCallBack={(val) => { this.valChange('leftMenu', val) }} selectKey={taskSearch.menuType} />
          <Content onClick={(e) => { this.setState({ topSearchDownMenuShow: false }) }}>            
            {taskDetailShow ?
              <div className={"taskDetailBox "+animateClass}>
                <TaskDetail taskId={detailPageTaskId}
                  projectId={detailPageProjectId}
                  closeCallBack={() => { this.setState({ taskDetailShow: false }) }}
                  updatedTaskCallBack={(val) => { if (val === '刷新' || val.taskCopyId || val.moveTaskId) { this.getTaskList() } else {this.taskUpdate(val); } }}
                />
              </div>
              : ''}
            {taskCreateShow ?
              <TaskCreate closedCallBack={() => { this.setState({ taskCreateShow: false }) }} successCallBack={() => { let search = this.state.taskSearch; search.menuType = 'my_add'; this.getTaskList(1, '', search) }} />
              : ''}
            {versionUpdateShow && !buyDay15Show && !getTeamInfoWithMoney('是否超限')[0] && (getTeamInfoWithMoney('剩余天数')>0 || getTeamInfoWithMoney('剩余天数') === 0) ? <VersionUpdate /> : ''}
            {getTeamInfoWithMoney('是否超限')[0]?
              <MoneyEnd alertText={getTeamInfoWithMoney('人数超限提示')} canClosed={false} />
            :''} 
            {versionAlert?
              <MoneyEnd alertText={getTeamInfoWithMoney('专业版提示')} closeCallBack={() => { this.setState({ versionAlert: false }) }} />
            :''}
            {getTeamInfoWithMoney('剩余天数')<0 ?
              <MoneyEnd alertText={getTeamInfoWithMoney('已到期提示')} canClosed={false} />
            :''}
            {!getTeamInfoWithMoney('是否超限')[0] && buyDay15Show?
              <MoneyEnd alertText={getTeamInfoWithMoney('即将到期提示')} closeCallBack={()=>{this.setState({buyDay15Show:false});Storage.setLocal('buyDay15AlertDate',dateToString(new Date(),'date'))}} />
            :''} 
            
            <div className="left_menu" onClick={()=>{this.setState({taskDetailShow:false})}}>
              <Button type="primary" size="large" icon="plus-circle-o" onClick={() => { this.cancelMoreEdit(); this.setState({ taskCreateShow: true }) }}>创建任务</Button>
              <Menu
                defaultSelectedKeys={actType}
                selectedKeys={actType}
                openKeys={['wdrw']}
                mode="inline"
              >
                <SubMenu key="wdrw" title={<span><Icon type="idcard" /><span>我的任务</span></span>}>
                  <Menu.Item key="sub1" onClick={() => { this.valChange('leftMenu', 'sub1') }}>我负责的</Menu.Item>
                  <Menu.Item key="my_add" onClick={() => { this.valChange('leftMenu', 'my_add') }}>我创建的</Menu.Item>
                  <Menu.Item key="my_be" onClick={() => { this.valChange('leftMenu', 'my_be') }}>我指派的</Menu.Item>
                  <Menu.Item key="my_succeed" onClick={() => { this.valChange('leftMenu', 'my_succeed') }}>我确认的</Menu.Item>
                  <Menu.Item key="my_attention" onClick={() => { this.valChange('leftMenu', 'my_attention') }}>我关注的</Menu.Item>
                </SubMenu>
                {getTeamInfoWithMoney('是否可用') && <Menu.Item key="all" onClick={() => { this.valChange('leftMenu', 'all') }}>
                  {getTeamInfoWithMoney('版本名称')==='专业版'?
                    <Icon type="profile" />
                  :''}
                  {getTeamInfoWithMoney('版本名称')!=='专业版'?
                    <svg className="pro-icon zuanshi" aria-hidden="true">
                        <use xlinkHref={"#pro-myfg-zuanshi"}></use>
                    </svg>
                  :''}
                  全部任务
                </Menu.Item>}
                {!getTeamInfoWithMoney('是否可用') && 
                  <Menu.Item key="all" onClick={() => { this.setState({ versionAlert: true }) }}>
                    {getTeamInfoWithMoney('版本名称')!=='专业版'?
                      <svg className="pro-icon zuanshi" aria-hidden="true">
                          <use xlinkHref={"#pro-myfg-zuanshi"}></use>
                      </svg>
                    :''}
                    全部任务
                  </Menu.Item>
                }
              </Menu>
            </div>
            <div className="contBox">
              {this.right_top_render()}
              <div className="bottomBox" onScroll={(e) => { this.scrollOnBottom('taskList', e) }} ref="bottomBox">
                <Spin spinning={taskListLoading} />
                {taskList && taskList.length > 0 ?
                  <TaskList
                    taskList={taskList}
                    hideOpt={taskListHideOpt}
                    taskClickCallBack={(taskId, proId) => { this.cancelMoreEdit(); this.taskClickCallBack(taskId, proId) }}
                    taskAttentionCallBack={(task) => { this.taskUpdate(task) }}
                    taskCheckedShow={moreTaskEditShow}
                    checkTaskIds={checkTaskIds}
                    checkingTaskCallBack={(val) => { this.valChange('checkTask', val) }}
                    hideOkTask={showOkTask}
                    hideTaskBox={showTaskBox}
                    hideTaskIds={hideTaskIds}
                  />
                  : ''}
                {taskList.length === 0 && taskListLoadingCount > 0 &&
                  <NullView />
                }
                {taskList.length === 0 && taskListLoadingCount === 'err' &&
                  <NullView isLoadingErr={true} restLoadingCallBack={() => { this.getTaskList() }} />
                }
                {!taskListMoreLoading && taskListNowPage < taskListAllPage && taskListLoadingCount !== 'err'?                  
                  (showOkTask && taskSearch.panelId[0]==='1'?
                    ''
                  :
                    <div className="moreLoadingRow">下拉加载更多</div>
                  )                  
                : ''}
                {!taskListMoreLoading && taskListNowPage === taskListAllPage && taskListLoadingCount !== 'err' ?
                  <div className="moreLoadingRow">已经到底喽</div>
                  : ''}
                {taskListMoreLoading ?
                  <div className="moreLoadingRow"><Icon type="loading" className="loadingIcon" />正在加载更多</div>
                  : ''}
              </div>
            </div>
          </Content>
        </Layout>
      </LocaleProvider>
    )
  }
}

function mapStateToProps(state) {
  return {
  };
}
const mapDispatchToProps = (dispatch) => {
  return {
  }
}

export default withRedux(initStore, mapStateToProps, mapDispatchToProps)(Task)