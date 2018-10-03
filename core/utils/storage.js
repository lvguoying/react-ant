
import React from 'react'
import cookie from 'react-cookie';

export default class Storage extends React.Component {

	static setSession(key, value) {
		// cookie过期时间 1天
		const curDate = new Date();   
		let expire = new Date(new Date(curDate).getTime() + 3*24*60*60*1000);
		cookie.save(key, value, { path: '/' ,expires:expire});
	}

	static set(key, value) {
		if(key && cookie){
			cookie.save(key, value, { path: '/' ,maxAge:1297000});
		}
	}

	static get(key) {
		if(key && cookie){
			let cookieData = cookie.load(key);
			return cookieData?cookieData:'';
		}
	}

	static setLocal(key, value) {
		try {
            localStorage.setItem(key,JSON.stringify(value));
        } catch(e) {
			localStorage.setItem(key,value);
        }

		
	}

	static getLocal(key) {
		if(key){
			try {
				return JSON.parse(localStorage.getItem(key));
			} catch(e) {
				return localStorage.getItem(key)
			}
		}
	}

	static remove(key) {
		cookie.remove(key, { path: '/' });
	}
}