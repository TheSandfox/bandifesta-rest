// import * as express from 'express'
const db = require('./DB.cjs');
const TourAPI = require('./TourAPI.cjs');
const express = require('express');
const router = express.Router();
const config = {
	importFestivals:{
		pageNum:1,
		editDate:0,
		biggestEditDate:0,
	}
}

const twoDigits = (intVal)=>{
	if (intVal<10) {
		return '0'+String(intVal);
	} else {
		return String(intVal);
	}
}

const dateFormat = (date) => {
	let newString = ''
	newString += date.getFullYear();
	newString += twoDigits(date.getMonth()+1);
	newString += twoDigits(date.getDate());
	return newString;
}

const dateTimeFormat = (date) => {
	let newString = ''
	newString += date.getFullYear();
	newString += twoDigits(date.getMonth()+1);
	newString += twoDigits(date.getDate());
	newString += twoDigits(date.getHours());
	newString += twoDigits(date.getMinutes());
	newString += twoDigits(date.getSeconds());
	return newString;
}

const updateLatestEditDate = () => {
	console.log();
	//해당 일자를 db의 최신업데이트일자에 덮어씌움(더 클때만)
	db.getLatestEditDate((dateTime)=>{
		config.importFestivals.editDate = dateTimeFormat(new Date(dateTime));
		console.log('최신화 일자 업데이트: '+config.importFestivals.editDate);
	})
}

const initLatestEditDate = ()=>{
	//db의 최신업데이트일자를 가져와서 application에 할당
	db.getLatestEditDate((dateTime)=>{
		config.importFestivals.editDate = dateTimeFormat(new Date(dateTime));
		console.log('어플리케이션 축제목록 최신화일자(마지막): '+config.importFestivals.editDate);
	})
}

const getLowestEditDate = (items)=>{
	let result = items[0].modifiedtime;
	items.forEach((item)=>{
		if(item.modifiedtime<result) {
			result = parseInt(item.modifiedtime);
		}
	})
	return result;
}

const importFestivals = (query)=>{
	config.importFestivals.biggestEditDate = 0;
	TourAPI.getFestivals({
		language:'Kor',
		itemsPerPage: '20',
		pageNum: String(config.importFestivals.pageNum),
		sortMethod: 'Q',
	},(response)=>{
		//가져오기 성공
		if (!response.body.items.item||response.body.items.item.length<=0) {
			updateLatestEditDate();
			console.log('더이상 가져올 게시물이 없습니다..');
			return;
		}
		//가져온 내용물들의 수정일자들 중에서 가장 낮은 값을 가져온 뒤
		//어플리케이션의 editDate와 비교
		let lowestEditDate = getLowestEditDate(response.body.items.item)
		if (lowestEditDate<=parseInt(config.importFestivals.editDate)) {
			console.log('이미 최신화된 컨텐츠 '+lowestEditDate+"/"+config.importFestivals.editDate);
			return;
		}
		//내용물이 있어야만 db에 추가요청
		db.importFestivals(response.body.items.item,(result)=>{
			console.log('컨티뉴');
			config.importFestivals.pageNum+=1;
			setTimeout(()=>{importFestivals(query),2000});
		});
	},(error)=>{
		//가져오기 실패
		console.log(error);
	},()=>{
		//FINALLY
		
	})
}

//라우트 사용해서 수동임포트
router.get('/importFestivals',(req,res)=>{
	config.importFestivals.pageNum=0;
	importFestivals(req.query);
	res.send('페스티발 임포트됨');
})

//진행중인 행사 가져오기
router.get('/getOngoingFestivals',(req,res)=>{
	// console.log(req.query);
	let {pageNum,itemsPerPage} = req.query;
	let today = new Date();
	let dateString = dateFormat(today);
	// console.log(dateString);
	db.getOngoingFestivals(dateString,(pageNum-1),itemsPerPage,(festivals)=>{
		res.send(festivals)
	})
})

//테스트
router.get('/test',(req,res)=>{
	res.send('Hello World!');
})

module.exports = {
	router, 
	config, 
	importFestivals, 
	updateLatestEditDate,
	initLatestEditDate
};