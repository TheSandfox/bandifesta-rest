// import * as express from 'express'
const db = require('../DB.cjs');
const TourAPI = require('../TourAPI.cjs');
const express = require('express');
const router = express.Router();
const config = {
	import:{
		pageNum:1
	}
}

const importFestivals = (params)=>{
	TourAPI.getFestivals({
		language:'Kor',
		itemsPerPage: '20',
		pageNum: String(config.import.pageNum),
		sortMethod: 'Q'
	},(response)=>{
		//가져오기 성공
		if (!response.body.items.item||response.body.items.item.length<=0) {
			console.log('더이상 가져올 게시물이 없습니다..');
			return;
		}
		//내용물이 있어야만 db에 추가요청
		db.importFestivals(response.body.items.item,(result)=>{
			console.log('컨티뉴');
			config.import.pageNum+=1;
			setTimeout(()=>{importFestivals(params),2000});
		});
	},(error)=>{
		//가져오기 실패
		console.log(error);
	},()=>{
		//FINALLY
		
	})
}

//라우트 사용해서 수동임포트
router.get('/import',(req,res)=>{
	config.import.count=0;
	importFestivals(req.params);
	res.send('페스티발 임포트됨');
})

router.get('/test',(req,res)=>{
	res.send('Hello World!');
})

module.exports = {router, importFestivals, config};