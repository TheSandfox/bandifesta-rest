const express = require('express');
const db = require('../db/DB.cjs');
const router = express.Router();
const KakaoLoginAPI = require('../externalapi/KakaoLoginAPI.cjs');

//로그인 시 토큰요청
router.post('/login',(req,res)=>{
	// console.log(req.body);
	KakaoLoginAPI.login(req.body,(response)=>{
		//로그인성공;
		console.log('성공맨'+response.data['access_token']);
		//DB에 회원정보 추가요청
		KakaoLoginAPI.getKakaoUser(response.data['access_token'],(response)=>{
			//db에 있는지 조회
			db.getUser(response.data['id'],(result)=>{
				// console.log(result);
				if(result.length<=0) {
					console.log(response.data['id'])
					db.registerUser(response.data['id'],()=>{});
				}
			});
		})
		res.send({
			...response.data
		});
	},(error)=>{
		// console.log('실패맨');
		console.log(error);
		res.status(500).json({status:500});
	},()=>{

	})
	// res.send('카카오 로그인 리다이렉트');
})

//카카오에서 유저정보가져오깅
router.post('/getKakaoUser',(req,res)=>{
	KakaoLoginAPI.getKakaoUser(req.body.access_token,(response)=>{
		console.log(response.data);
		res.send({
			id:response.data['id'],
			nickname:response.data.properties.nickname
				||'',
			profile:response.data.properties.profile_image
				||'',
			thumbnail:response.data.properties.thumbnail_image
				||'',
		});
	},(error)=>{
		res.status(500).json({status:500});
	},()=>{

	})
})

//로그아웃시키기
router.post('/logout',(req,res)=>{
	KakaoLoginAPI.logout(req.body.access_token,(response)=>{
		res.send(response.data);
	},(error)=>{
		res.status(500).json({status:500});
	},()=>{

	})
})

//연결끊기!
router.post('/unlink',(req,res)=>{
	KakaoLoginAPI.unlink(req.body.access_token,(response)=>{
		db.unregisterUser(response.data.id);
		res.send(response.data);
	},(error)=>{
		res.status(500).json({status:500});
	},()=>{

	})
})

//리프레시 토큰
router.post('/refreshToken',(req,res)=>{
	KakaoLoginAPI.refreshToken(req.body,(response)=>{
		res.send({
			...response.data
		});
	},(error)=>{
		console.log(error);
		res.status(500).json({status:500});
	},()=>{

	})
	// res.send('카카오 로그인 리다이렉트');
})

module.exports = {
	router
}