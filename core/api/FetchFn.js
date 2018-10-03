import 'isomorphic-fetch'
import React from 'react'
import { message } from 'antd';
export default class FetchFn extends React.Component {

	static fetchFn(opt, cb, error) {
		let type = opt.type;
		let option = { method: 'get', credentials: 'include' };
		option.headers = {
			'Accept': 'application/json,text/plain, */*',
			'Content-Type': 'application/json; charset=utf-8',
		};
		if (type == 'post') {
			option.method = 'post';
			option.body = JSON.stringify(opt.data);
		}
		if (type == 'file') {
			option.method = 'post';
			option.body = opt.data;
		}
		fetch(opt.url, option)
			.then(function (response) { 
				if (!response.ok || (response.url && response.url.indexOf('/antvip/login') != -1)) {
					error(response.status)					
				} else {
					let data = response.json();
					return data;					
				}

			}).then(function (json) { 
				if (json && json.success) {
					if (cb){
						if(json.data){
							cb(json.data);
						}else{
							cb(true);
						}
					}	
				} else {
					if(json){
						message.info(json.errmsg);
						cb({'err':true});        // 后台报错
					}else{ 
						cb({'err':true});        // 网络报错
					}
				}
			}).catch(function (ex) {  
				if (ex.description == '无效字符') {
					error(ex)
				}
				if (opt.type == 'get') {
					error(ex)
				} else {
					//message.info('网络好像断喽');
					console.log('通信失败', ex);
				}
			});
	}
}