import React from 'react';

import TaskDetail from '../components/taskDetails';
import stylesheet from 'styles/views/dingMessage.scss';
import dingJS from '../core/utils/dingJSApi';

export default class DingMessage extends React.Component {
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
            <div className="dingmessage">
                <style dangerouslySetInnerHTML={{ __html: stylesheet }} />
                <TaskDetail taskId={taskId} projectId={projectId}
                            closeCallBack={()=>{}}
                            updatedTaskCallBack={()=>{}}
                            isSmall={true}
                />
            </div>
        )
    }
}