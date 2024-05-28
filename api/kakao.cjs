const express = require('express');
const router = express.Router();
const KakaoLoginAPI = require('../KakaoLoginAPI.cjs');
const config = require('../config.cjs');

//로그인 시 토큰요청
router.post('/requestToken',(req,res)=>{
	// console.log(req.body);
	KakaoLoginAPI.getToken(req.body,(response)=>{
		//로그인성공;
		console.log('성공맨'+response.data['access_token']);
		res.cookie('accessToken',response.data['access_token'],{
			domain:config.REDIRECT_URI,
			sameSite:'none',
			secure:true
		});
		res.cookie('refreshToken',response.data['refresh_token'],{
			domain:config.REDIRECT_URI,
			sameSite:'none',
			secure:true
		});
		res.send('good');
	},(error)=>{
		// console.log('실패맨');
		console.log(error);
	},()=>{

	})
	// res.send('카카오 로그인 리다이렉트');
})

module.exports = {
	router
}