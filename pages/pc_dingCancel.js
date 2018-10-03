import React from 'react';


import stylesheet from 'styles/views/dingCancel.scss';
import dingJS from '../core/utils/dingJSApi';

export default class DingCancel extends React.Component {
    constructor(props) {
      super(props)
      this.state = {}
    }

    componentDidMount() {    
        dingJS.authDingJsApi();
    }

    render(){
        const {taskId,projectId} = this.props.url.query;
        return (
            <div className="dingCancel">
                <style dangerouslySetInnerHTML={{ __html: stylesheet }} />
                <div className="cancelBox">
                    <div className="iconBox">
                        <i className="iconfont icon-forbidden"></i>
                    </div>
                    <div className="info">
                        <span>该任务已经被删除，无法查看任务详情</span>
                    </div>
                </div>
            </div>
        )
    }
}