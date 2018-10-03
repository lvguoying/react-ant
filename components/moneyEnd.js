import React from 'react';
import { Icon } from 'antd';

import stylesheet from 'styles/components/moneyEnd.scss';
import { getTeamInfoWithMoney } from '../core/utils/util';

/*
 * （必填）closeCallBack()         // 关闭回调
 * （选填）canClosed:true,         // 是否可关闭 默认可关闭
 */

export default class MoneyEnd extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            versionShow: false
        }
    }

    componentWillMount() { 
    }

    componentWillReceiveProps(nextProps) {
    }

    componentWillUnmount() {
        this.setState = (state,callback)=>{
            return;
        };  
    }

    render() { 
        let { alertText,canClosed } = this.props;
        const { versionShow } = this.state;
        if(canClosed === undefined){
            canClosed = true;
        }
        return(
            <div className="moneyEnd"> 
                <style dangerouslySetInnerHTML={{ __html: stylesheet }} />
                {versionShow?
                    <div className="imgBox">
                        <Icon type="close" onClick={()=>{this.setState({versionShow:false})}} />
                        <p>基础版&专业版功能对比</p>
                        <div className="img">                            
                            <img src="../static/react-static/pcvip/imgs/versionTable1.png" />
                            <img src="../static/react-static/pcvip/imgs/versionTable2.jpg" />
                        </div>
                    </div>
                :''}
                <div className="writeBox" style={versionShow?{display:'none'}:{}}>
                    <p>
                        {alertText[0]}
                        <span onClick={()=>{this.setState({versionShow:true})}}>版本介绍</span>
                        {canClosed?<Icon type="close" onClick={()=>{if(this.props.closeCallBack){this.props.closeCallBack()}}} />:""}
                    </p>
                    <div className="text" dangerouslySetInnerHTML={{__html:alertText[1]}}></div>
                    {getTeamInfoWithMoney('是否钉钉订单')?
                        <div className="imgs">
                            <img src="../static/react-static/pcvip/imgs/ewmDing.png" style={{float:'left'}} />
                            <img src="../static/react-static/pcvip/imgs/ewmMaYi.png" style={{float:'right'}} />
                        </div>
                    :
                        <div className="imgs">
                            <img src="../static/react-static/pcvip/imgs/ewmMaYi.png" />
                        </div>
                    }
                </div>
            </div>
        )
    }
}