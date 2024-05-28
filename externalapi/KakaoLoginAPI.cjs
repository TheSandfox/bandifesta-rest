const axios = require('axios');
const qs = require('qs')
const REST_KEY = 'c502c6ea782c2e1b700109d94cd8a0f8';
const config = require('../config.cjs');
const REDIRECT_URI = config.DEBUG
?'http://localhost:5173/bandifesta'
:'https://thesandfox.github.io/bandifesta'

const login = async(body,thenCallback,catchCallback,finallyCallback)=>{
	// console.log(body);
	await axios.post('https://kauth.kakao.com/oauth/token',qs.stringify({
		...body/*CODE ONLY*/,
		grant_type:'authorization_code',
		client_id:REST_KEY,
		redirect_uri:REDIRECT_URI,
	}),{
		headers:{
			'Content-type': 'application/x-www-form-urlencoded;charset=utf-8',
		},
		withCredentials: true
	})
	.then((response)=>{
		// 성공 핸들링
		thenCallback(response);
	})
	.catch((error)=>{
		// 에러 핸들링
		if(catchCallback) {catchCallback(error)}
	})
	.finally(()=>{
		if(finallyCallback) {finallyCallback()};
	});
}

const getKakaoUser = async(access_token,thenCallback,catchCallback,finallyCallback)=>{
	// console.log(body);
	await axios.post('https://kapi.kakao.com/v2/user/me',{},{
		headers:{
			Authorization: `Bearer ${access_token}`
		},
	})
	.then((response)=>{
		// 성공 핸들링
		thenCallback(response);
	})
	.catch((error)=>{
		// 에러 핸들링
		if(catchCallback) {catchCallback(error)}
	})
	.finally(()=>{
		if(finallyCallback) {finallyCallback()};
	});
}

const logout = async(access_token,thenCallback,catchCallback,finallyCallback)=>{
	await axios.post('https://kapi.kakao.com/v1/user/logout',{},{
		headers:{
			Authorization: `Bearer ${access_token}`
		},
	})
	.then((response)=>{
		// 성공 핸들링
		thenCallback(response);
	})
	.catch((error)=>{
		// 에러 핸들링
		if(catchCallback) {catchCallback(error)}
	})
	.finally(()=>{
		if(finallyCallback) {finallyCallback()};
	});
}

const unlink = async(access_token,thenCallback,catchCallback,finallyCallback)=>{
	await axios.post('https://kapi.kakao.com/v1/user/unlink',{},{
		headers:{
			Authorization: `Bearer ${access_token}`
		},
	})
	.then((response)=>{
		// 성공 핸들링
		thenCallback(response);
	})
	.catch((error)=>{
		// 에러 핸들링
		if(catchCallback) {catchCallback(error)}
	})
	.finally(()=>{
		if(finallyCallback) {finallyCallback()};
	});
}

module.exports = {
	getKakaoUser,
	login,
	logout,
	unlink,
	REDIRECT_URI
}