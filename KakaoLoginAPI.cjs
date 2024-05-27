const axios = require('axios');
const OAUTH_URL = 'https://kauth.kakao.com/oauth';
const REST_KEY = 'c502c6ea782c2e1b700109d94cd8a0f8';

const getToken = async(body,thenCallback,catchCallback,finallyCallback)=>{
	// console.log(body);
	await axios.post(OAUTH_URL+'/token',{
		...body/*CODE ONLY*/,
		grant_type:'authorization_code',
		client_id:REST_KEY,
		redirect_uri:'http://localhost:5173/bandifesta',
	},{
		headers:{
			'Content-type': 'application/x-www-form-urlencoded;charset=utf-8'
		}
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
		finallyCallback();
	});
}

module.exports = {
	getToken
}