import React from 'react';
import Router from 'next/router';

import FetchFn from './FetchFn';
import Storage from '../utils/storage';


export const visitUrl = 'http://localhost:3001';
export const baseURI = visitUrl + '/antvip/ant-cgi';

let flag = true;
const isISV = false;
const version = '2.1.0'

export default class HttpClient extends React.Component {
	
	
	static getVersion(){
		return version;
	}

	static cutCorp(isSamall,fn){
		const corpidMsg = Storage.get('corpIdMsg');
		const corpidWork = Storage.get('corpIdWork');
		let corpid = Storage.get('corpId');
		if(corpidWork && corpid != corpidWork && !isSamall){
			let opt = {
				type: 'post',
				url: baseURI + '/user/cutCorp?corpid='+corpidWork,
				data: {}
			};
			FetchFn.fetchFn(opt, (list)=>{
				Storage.set('corpIdWork', list);
				Storage.set('corpId',list);
				if(fn){
					fn();
				}
			}, (err) => {
				console.log(err);
			});
		}else if(corpidMsg && corpid != corpidMsg && isSamall){
			let opt = {
				type: 'post',
				url: baseURI + '/user/cutCorp?corpid='+corpidMsg,
				data: {}
			};
			FetchFn.fetchFn(opt, (list)=>{
				Storage.set('corpIdMsg', list);
				Storage.set('corpId',list);
				if(fn){
					fn();
				}
			}, (err) => {
				console.log(err);
			});
		}else{
			if(fn){
				fn();
			}
		}
	}

	static AjaxGet(url, cb, err) {
		let opt = {
			type: 'get',
			url: baseURI + url
		};
		FetchFn.fetchFn(opt, cb, err);
	}
	static AjaxPost(url, data, cb ,isSamall) {
		this.cutCorp(isSamall,()=>{
			let opt = {
				type: 'post',
				url: baseURI + url,
				data: data
			};
			FetchFn.fetchFn(opt, cb, (err) => {
				console.log(err, '**********AjaxPost**err***********');
				Router.push('/pc_login');

				if (err == '404') {
					console.log(Storage, '**********AjaxPost**Storage***********');
					const corpId = Storage.get('corpId')
					console.log(corpId, '**********AjaxPost**corpId***********');
					this.httpPostError(corpId).then(() => {
						console.log(corpId, '**********httpPostError**corpId***********');
						FetchFn.fetchFn(opt, cb, (err) => {
							Router.push('/pc_login');
						})
					}, () => {
						//再次请求失败后 从新登陆
						Router.push('/pc_login');
					})
				}
			});
		});	
	}
	//登陆失败再次登陆
	static httpPostError(corpId) {
		const p = new Promise(function (resolve, reject) {        //做一些异步操作
			DingTalkPC.runtime.permission.requestAuthCode({
				corpId: corpId,
				onSuccess: function (result) {
					let opt = {
						type: 'post',
						url: baseURI + '/user/dingtalkCodeLogin?code=' + result.code + '&corpid=' + corpId,
						data: ''
					};
					FetchFn.fetchFn(opt, (data) => {
						console.log(data, 'httpPostError')
						Storage.set('user',JSON.stringify(data.data));
						resolve();
					}, (err) => {
						console.log(err, '---------------getLoginCode-error------');
						reject(err)
						//Router.push('/pc_login')
					})
				},
				onFail: function (err) {
					console.log(err, '---------------getAgainLogin-error------');
					reject(err)
				}
			})
		});
		return p;
	}
	static AjaxPostSync(url, data, cb ,isSamall) {
		this.cutCorp(isSamall,()=>{
			if (flag) {
				flag = false;
				setTimeout(function () {
					flag = true;
				}, 1000);
				let opt = {
					type: 'post',
					url: baseURI + url,
					data: data
				};
				FetchFn.fetchFn(opt, cb, (err) => {
					console.log(err);
				});
			}
		});
	}
}
