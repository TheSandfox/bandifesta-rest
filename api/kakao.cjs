const express = require('express');
const router = express.Router();
const KakaoLoginAPI = require('../KakaoLoginAPI.cjs');
const config = require('../config.cjs');
const domain = config.DEBUG
?'http://localhost:5173'
:'https://thesandfox.github.io'

//로그인 시 토큰요청
router.post('/requestToken',(req,res)=>{
	// console.log(req.body);
	KakaoLoginAPI.getToken(req.body,(response)=>{
		//로그인성공;
		console.log('성공맨'+response.data['access_token']);
		res.cookie('accessToken',response.data['access_token'],{
			domain,
			sameSite:false,
			secure:true,
			httpOnly:false,
		});
		res.cookie('refreshToken',response.data['refresh_token'],{
			domain,
			sameSite:false,
			secure:true,
			httpOnly:false,
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