// import * as express from 'express'
const db = require('./DB.cjs');
const TourAPI = require('./TourAPI.cjs');
const express = require('express');
const router = express.Router();
const config = {
	importFestivals:{
		pageNum:{
			Kor:1,
			Eng:1,
			Jpn:1
		},
		editDate:{
			Kor:0,
			Eng:0,
			Jpn:0
		},
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

const updateLatestEditDate = (language) => {
	//해당 일자를 db의 최신업데이트일자에 덮어씌움(더 클때만)
	db.getLatestEditDate(language,(dateTime)=>{
		config.importFestivals.editDate[language] = dateTimeFormat(new Date(dateTime));
		console.log(`최신화 일자 업데이트(${language}): `+config.importFestivals.editDate[language]);
	})
}

const initLatestEditDate = (language)=>{
	//db의 최신업데이트일자를 가져와서 application에 할당
	db.getLatestEditDate(language,(dateTime)=>{
		config.importFestivals.editDate[language] = dateTimeFormat(new Date(dateTime));
		console.log(`어플리케이션 축제목록 최신화일자(${language}): `+config.importFestivals.editDate[language]);
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

const importFestivals = (language)=>{
	TourAPI.getFestivals({
		language,
		itemsPerPage: '20',
		pageNum: String(config.importFestivals.pageNum[language]),
		sortMethod: 'Q',
	},(response)=>{
		//가져오기 성공
		if (!response.body.items.item||response.body.items.item.length<=0) {
			updateLatestEditDate(language);
			console.log('더이상 가져올 게시물이 없습니다..');
			return;
		}
		//가져온 내용물들의 수정일자들 중에서 가장 낮은 값을 가져온 뒤
		//어플리케이션의 editDate와 비교
		let executeOnce = false
		let lowestEditDate = getLowestEditDate(response.body.items.item)
		if (lowestEditDate<=parseInt(config.importFestivals.editDate[language])) {
			console.log(`최신화 완료(${language}) `+lowestEditDate+"/"+config.importFestivals.editDate[language]);
			executeOnce = true;
		}
		//내용물이 있어야만 db에 추가요청
		db.importFestivals(response.body.items.item.map((festival)=>{
			return {
				...festival,
				//EXTRA CONFIGURATION
				language
			}
		}),
			//한번만 실행하고 멈춰야하는지 판별
			executeOnce
			?()=>{}
			:(result)=>{
				console.log('다음 페이지를 탐색합니다..');
				config.importFestivals.pageNum[language]+=1;
				setTimeout(()=>{importFestivals(language),2000});
			}
		);
	},(error)=>{
		//가져오기 실패
		console.log(error);
	},()=>{
		//FINALLY
		
	})
}

//라우트 사용해서 수동임포트
router.get('/importFestivals',(req,res)=>{
	config.importFestivals.pageNum[req.query.language]=0;
	importFestivals(req.query.language);
	res.send('페스티발 임포트됨');
})

//진행중인 행사 가져오기
router.get('/getOngoingFestivals',(req,res)=>{
	// console.log(req.query);
	let {pageNum,itemsPerPage,language} = req.query;
	let today = new Date();
	let dateString = dateFormat(today);
	// console.log(dateString);
	db.getOngoingFestivals(dateString,(pageNum-1),itemsPerPage,language,(festivals)=>{
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