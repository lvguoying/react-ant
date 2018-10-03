import React from 'react';
import { Modal,Button } from 'antd';
import Storage from '../core/utils/storage';

/*
 （选填） closeCallBack()    // 关闭回调
 */

export default class MoneyEnd extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            visible:true
        }
    }

    componentWillMount(){ 
    }

    componentWillReceiveProps() {
    }

    componentWillUnmount() {
        this.setState = (state,callback)=>{
            return;
        };  
    }

    closeModal(){        
        if(this.props.closeCallBack){
            this.props.closeCallBack();
        }else{
            Storage.setLocal('versionUpdateShow', false);
            this.setState({visible:false});
        }
    }

    render() { 
        const { visible } = this.state;
        return(
            <Modal
                title="V2.1.0 版本更新说明"
                visible={visible}
                width={850}
                closable={true}
                onCancel={()=>{this.closeModal()}}
                footer={[
                    <Button key="submit" icon="check-circle-o" type="primary" onClick={()=>{this.closeModal()}}>
                        知道了
                    </Button>
                ]}
            >    
                <div style={{fontSize:'13px'}}>
                    1、收费版本正式发布，目前分为基础版、专业版（详见续费说明中版本介绍）<br />
                    2、项目甘特图视图正式发布<br />
                    3、丰富项目相关设置及功能<br />
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;1）全新项目列表展示<br />
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;2）新增项目图标<br />
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;3）新增项目分类<br />
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;4）新增项目列表导航快速切换<br />
                    4、加入各页面筛选功能<br />
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;1）我的任务各页面筛选<br />
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;2）新增“全部任务”视图，对全部任务可筛选及批量修改<br />
                    5、新增隐藏已完成任务、隐藏任务包的快捷功能<br />
                    6、任务移动、复制可支持跨项目操作<br />
                    7、升级任务相关功能<br />
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;1）删除任务仅允许项目管理成员使用<br />
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;2）任务提交完成后加入撤回功能<br />
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;3）驳回、确认任务均可上传图片、附件<br />
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;4）计划工期默认为1<br />
                    8、升级统计功能<br />
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;1）新增任务趋势统计图表<br />
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;2）新增人员绩效分、任务数量统计图<br />
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;3）新增人员任务进展统计图<br />
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;4）新增登录人任务进展统计图<br />
                    9、升级批量修改功能及操作体验<br />
                    10、升级工作动态页面交互及体验<br />
                    11、对各页面UI体验全面进行升级<br />
                    12、修复已知原版本功能性BUG
                </div>
            </Modal>
        )
    }
}