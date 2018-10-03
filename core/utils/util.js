import { message } from 'antd';

// 下拉加载
let flag = true;
export function listScroll(e) {    
    let scrollTop = Math.ceil(Math.round(e.target.scrollTop));
    let clientHeight = Math.ceil(Math.round(e.target.clientHeight));
    let scrollHeight = Math.ceil(Math.round(e.target.scrollHeight)); 
    if((scrollTop + clientHeight == scrollHeight)||(scrollTop + clientHeight == scrollHeight-1)||(scrollTop + clientHeight == scrollHeight+1)){
        if(flag){
            flag = false;
            setTimeout(function () {
                flag = true;
            }, 1000);
            return true;                // 滑到底了
        }
    } else { 
        return false;               // 没滑到底
    }
}

// 日期转字符串
export function dateToString(date, type) { 
    const year = date.getFullYear();
    const month = add0(date.getMonth() + 1);
    const day = add0(date.getDate());
    const hour = add0(date.getHours());
    const minute = add0(date.getMinutes());
    const second = add0(date.getSeconds());
    if (type === 'datetime') {
        return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
    } else if (type === 'date') {
        return `${year}-${month}-${day}`;
    }
}
function add0(No) {
    if (No < 10 && No > 0) {
        return '0' + No;
    } else {
        return No;
    }
}

// html5字符串转DOM元素
export function stringToText(string,returnType){   
    if (string){
        string.replace(/<!--.*-->/g, '');
        let dom = document.createElement('div');
        dom.innerHTML = string; 
        clearTag(dom, 'style');
        clearTag(dom, 'xml');
        clearTag(dom, 'script');
        if (returnType === 'innerText'){ 
            let text = dom.innerText; 
            return text;              //.replace(/\n/g, '');    
        }else if(returnType === 'img'){
            let imgs = dom.querySelectorAll('img');
            let imgList = []; 
            for(let i=0; i<imgs.length; i++){
                imgList.push(imgs[i].src);
            }
            return imgList;
        }  
    } else{
        if(returnType==='img'){
            return [];
        }else if(returnType === 'innerText'){
            return '';
        }
    }
}
export function clearTag(element, tagName){
	const elems = element.querySelectorAll(tagName)
	Array.from(elems).forEach(e => e.parentNode.removeChild(e))
}

// html5字符串 删除对应的IMG
export function htmlStringDellImgByUrl(string,url){   
    let dom = document.createElement('div');
    dom.innerHTML = string;
    var img = dom.querySelector(`img[src="${url}"]`);
    //dom.removeChild(img);
    const p = img.parentNode;
    p.removeChild(img)
    return dom.innerHTML;
}

// 粘贴图片 返回图片地址
export function pasteImg(e,callback){
    if ( !(e.clipboardData && e.clipboardData.items) ) {
        return '';
    }
    for (var i = 0, len = e.clipboardData.items.length; i < len; i++) {
        var item = e.clipboardData.items[i];
        if (item.kind === "file") {
            var f= item.getAsFile(); 
            var reader = new FileReader();
            reader.onload = function(e) {
                callback(e.target.result);
            }
            reader.readAsDataURL(f);
        }
    }
}

// 设置状态样式
export function stateColor(stateId,className){ 
    // 0未完成  1正常完成  2待确认  3未指派  4已终止 8逾期完成 9提前完成
    let classname = '';
    let name = '';
    if (stateId==='0'){
        classname = className + ' state_jxz';
        name='进行中';
    } else if (stateId==='1'){
        classname = className + ' state_ywc';
        name='正常完成';
    } else if (stateId==='2'){
        classname = className + ' state_dqr';
        name='待确认';
    } else if (stateId==='3'){
        classname = className + ' state_wzp';
        name='未指派';
    } else if (stateId==='4'){
        classname = className + ' state_yzz';
        name='已终止';
    } else if (stateId==='7'){
        classname = className + ' state_yyq';
        name='已逾期';
    } else if (stateId==='8'){
        classname = className + ' state_yqwc';
        name='逾期完成';
    } else if (stateId==='9'){
        classname = className + ' state_tqwc';
        name='提前完成';
    }
    return <div className={classname}>{name}</div>
}

// 设置状态样式
export function stateColorWithTime(stateId,endTime){ 
    // 0未完成  1正常完成  2待确认  3未指派  4已终止 7已逾期 8逾期完成 9提前完成
    let color = '';
    if (stateId==='7'){
        color='#f95a60';
    } else if((stateId==='0' || stateId==='2' || stateId==='3') && endTime){ 
        const endDate = new Date(endTime);
        const now = new Date();
        if(endDate.toDateString()===now.toDateString() || endDate<now){
            color='#f95a60';
        }
    }
    return color;
}

// 免登 里面处理字符的，原来的复制过来的
export function getQueryString(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");  
    var r = window.location.search.substr(1).match(reg);  
    if (r != null) return unescape(r[2]);  
    return null;  
}

// 根据颜色代码返回样式名字 标签组名
export function getTagTitColorByColorCode(colorCode){
    let code = '';
    switch (colorCode){
        case 'fdbb78':
            code = 'tag_tit01_fdbb78';
            break;
        case 'f29b76':
            code = 'tag_tit02_f29b76';
            break;
        case '75ccff':
            code = 'tag_tit03_75ccff';
            break;
        case '89c997':
            code = 'tag_tit04_89c997';
            break;
        case 'c8c4fc':
            code = 'tag_tit05_c8c4fc';
            break;
        case 'f5222d':
            code = 'tag_tit06_F5222D';
            break;
        case '795548':
            code = 'tag_tit07_795548';
            break;
        case '666666':
            code = 'tag_tit08_666666';
            break;
        default:
            code = 'tag_tit01_fdbb78';
            break;
    }
    return code;
}

// 根据颜色代码返回样式名字   /* type: 2 公共标签，1个人标签 */
export function getTagColorByColorCode(type,colorCode){
    let code = '';
    switch (colorCode){
        case 'fdbb78':
            code = (type === '1' ? 'tag_my01_fdbb78' : 'tag_all01_fdbb78');
            break;
        case 'f29b76':
            code = (type === '1' ? 'tag_my02_f29b76' : 'tag_all02_f29b76');
            break;
        case '75ccff':
            code = (type === '1' ? 'tag_my03_75ccff' : 'tag_all03_75ccff');
            break;
        case '89c997':
            code = (type === '1' ? 'tag_my04_89c997' : 'tag_all04_89c997');
            break;
        case 'c8c4fc':
            code = (type === '1' ? 'tag_my05_c8c4fc' : 'tag_all05_c8c4fc');
            break;
        case 'f5222d':
            code = (type === '1' ? 'tag_my06_f5222d' : 'tag_all06_f5222d');
            break;
        case '795548':
            code = (type === '1' ? 'tag_my07_795548' : 'tag_all07_795548');
            break;
        case '666666':
            code = (type === '1' ? 'tag_my08_666666' : 'tag_all08_666666');
            break;
        default:
            code = (type === '1' ? 'tag_my01_fdbb78' : 'tag_all01_fdbb78');
            break;
    }
    return code;
}

//返回标签分类颜色
export function getStringTagColor(item) {
    if(item && item.color){
        return '#'+item.color
    }
    let color= '#7265e6';
    if(item && item.id){
        if(item.type!='1'){
            if(item){
                let pids =item.id.charAt(item.id.length-1);
                if(isNaN(pids)){
                    color= '#fdbb78';
                }else{
                    if(parseInt(pids)>4){
                         color= '#c8c4fc';
                    }else{
                        color= '#89c997';
                    }
                }
            }else{
                color= '#75ccff';

            }
        }
     }
    return color;                    
}

// 版本到期判断
import Storage from './storage'; 
export function getTeamInfoWithMoney(type){  
    const user = Storage.get('user'); 
    let data = {
        buyUserCount:100,
        synUserCount:100,
        buyDate:'2017-08-30',
        endDate:'2018-10-30',
        remainderDays:100,
        buyVersion:'JCB',
        ordercreatesource:''
    };  
    if(user && user.antIsvCorpSuite){
        data = user.antIsvCorpSuite; 
    } 
    /*const data = {
        buyUserCount:100,
        synUserCount:910,
        buyDate:'2017-08-30',
        endDate:'2018-08-30',
        remainderDays:10,
        buyVersion:'JCB',
        ordercreatesource:''
    };*/
    let returnTxt = '';

    /*
     * buyUserCount: 购买人数
     * synUserCount: syn同步人数
     * endDate: 到期日期
     * buyDate: 购买日期
     * remainderDays: 剩余天数
     * buyVersion: 购买版本
     * ordercreatesource: 订单渠道 DRP钉钉订单 非DRP就是运营订单
     */

    switch(type){
        case "是否钉钉订单":
            returnTxt = (data.ordercreatesource==='DRP'?true:false);
            break;
        case "购买日期":
            returnTxt = data.buyDate;
            break;
        case "到期日期":
            returnTxt = data.endDate;
            break;
        case "是否超限":              // 表示人数是否超限
            if(data.synUserCount > data.buyUserCount){
                returnTxt = [true,data.buyUserCount,data.synUserCount];
            }else{
                returnTxt = [false,data.buyUserCount,data.synUserCount];
            } 
            break;
        case "是否可用":              // 表示高级功能是否可用
            switch(data.buyVersion){
                case 'SYB':
                    returnTxt=true;     
                break;
                case 'JCB':
                    returnTxt=false; 
                break;
                case 'ZYB':
                    returnTxt=true; 
                break;
            }
            break;
        case "版本名称":
            switch(data.buyVersion){
                case 'SYB':
                    returnTxt='试用版';     
                break;
                case 'JCB':
                    returnTxt='基础版'; 
                break;
                case 'ZYB':
                    returnTxt='专业版'; 
                break;
            }
            break;
        case "剩余天数":
            returnTxt = data.remainderDays;
            break;
        case "专业版提示":
            returnTxt = [
                '专业版功能',
                '图表化项目管理、批量便捷操作、多维度数据统计、WBS文件系统等都为专业版功能，同时还有更多高级功能将陆续开放。您可以通过以下方式来升级到专业版。'
            ];
            break;
        case "续费提示":
            let name = '';
            switch(data.buyVersion){
                case 'SYB':
                    name='试用版';     
                break;
                case 'JCB':
                    name='基础版'; 
                break;
                case 'ZYB':
                    name='专业版'; 
                break;
            }
            returnTxt = [
                '续费升级',
                `您公司当前使用的是蚂蚁分工<b>${name}</b>，授权有效期截止于<b>${data.endDate}</b>。您可以通过以下方式来进行提前续费，或升级到更高版本。`
            ];
            break;
        case "人数超限提示":
            returnTxt = [
                '使用人数超限',
                `您公司管理员授权的使用人数已经超出了版本限制，为了不影响您公司的日常使用，请管理员及时在钉钉后台进行团队的授权管理，或通过以下方式升级到可容纳更多人员的版本。`
            ];
            break;
        case "人数超限提示":
            returnTxt = [
                '使用人数超限',
                `您公司管理员授权的使用人数已经超出了版本限制，为了不影响您公司的日常使用，请管理员及时在钉钉后台进行团队的授权管理，或通过以下方式升级到可容纳更多人员的版本。`
            ];
            break;
        case "即将到期提示":
            if(data.buyVersion==='ZYB'){
                returnTxt = [
                    '专业版即将到期',
                    `您公司于<b>${data.buyDate}</b>开始使用的蚂蚁分工专业版将在<b>${data.remainderDays}</b>天后到期，感谢您的支持和信任，我们将持续升级，为您提供更优质的服务。现在您可以通过以下方式进行专业版的续费或升级。`
                ];
            }else if(data.buyVersion==='JCB'){
                returnTxt = [
                    '基础版即将到期',
                    `您公司于<b>${data.buyDate}</b>开始使用的蚂蚁分工基础版将在<b>${data.remainderDays}</b>天后到期，您可以通过续费来继续使用<b>基础版</b>，也可以升级到我们的<b>专业版</b>来享受更多高级功能。我们提供以下购买方式：`
                ];
            }else if(data.buyVersion==='SYB'){
                returnTxt = [
                    '专业版试用即将到期',
                    `您公司于<b>${data.buyDate}</b>开始使用的蚂蚁分工专业版将在<b>${data.remainderDays}</b>天后到期，届时所有功能将无法再使用，请您及时购买升级。您可以通过以下方式来立即获得<b>基础版</b>或<b>专业版</b>。`
                ];
            }            
            break;
        case "已到期提示":
            if(data.buyVersion==='ZYB'){
                returnTxt = [
                    '专业版已到期',
                    `您公司于<b>${data.buyDate}</b>购买的蚂蚁分工<b>专业版</b>已到期，感谢您的支持和信任，我们将持续升级，为您提供更优质的服务。现在您可以通过以下方式进行专业版的续费或升级。`
                ];
            }else if(data.buyVersion==='JCB'){
                returnTxt = [
                    '基础版已到期',
                    `您公司于<b>${data.buyDate}</b>购买的蚂蚁分工<b>基础版</b>已到期，您可以通过续费来继续使用<b>基础版</b>，也可以升级到我们的<b>专业版</b>来享受更多高级功能。我们提供以下购买方式：`
                ];
            }else if(data.buyVersion==='SYB'){
                returnTxt = [
                    '专业版试用已到期',
                    `您公司于<b>${data.buyDate}</b>开始试用的蚂蚁分工<b>专业版</b>已到期，我们分别提供了经济实惠的<b>基础版</b>和功能强大的<b>专业版</b>，您可以根据您的需求来选择适合的版本，我们提供以下购买方式：`
                ];
            }            
            break;
    }
    return returnTxt;
}

// 只允许输入正整数和浮点数
export function onlyNumber(obj){ 
    obj.value = obj.value.replace(/[^\d\.]/g, '').replace('.', 'a').replace(/\./g, '').replace('a', '.');
    if(obj.value[0] === '.'){
        obj.value = '0' + obj.value;
    }
}

// 网络错误提示
export function isLoadingErr(){
    return '网络错误，请重试';
}

// 本地上传 图片大小和格式限制
export function beforeUpload(file) { 
    const isJPG = (file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/bmp' || file.type === 'image/gif') || !file.type;
    if (!isJPG) {
      message.error('只能上传图片（jpg,png,bmp,gif）!');
    }
    const isLt2M = (file.size / 1024 / 1024 < 2) || !file.size;
    if (!isLt2M) {
      message.error('图片不能大于2M!');
    }
    return isJPG && isLt2M;
}

// 返回中文字符长度
export function getByteLen(val) {
    if(val){
        var len = 0;
        for (var i = 0; i < val.length; i++) {
            var a = val.charAt(i);
            a.match(/[^\x00-\xff]/ig);
            len += 2;
        }
        return Math.round(len/2);
    }else{
        return 0;
    }			
}

// 计算屏幕根字大小
/*export function setHtmlFontSize(){
    //document.documentElement.style.fontSize = window.screen.width / 100 + 'px';
    document.documentElement.style.fontSize = document.documentElement.clientWidth / 100 + 'px';
}*/

