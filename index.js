// express 모듈 호출
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const app = express();
const festivalApi = require('./api/festival.cjs');
const kakaoApi = require('./api/kakao.cjs');
const PORT = process.env.PORT || 3001;

app.use(cookieParser());
app.use(express.json());
app.use(cors({
		origin: "*", // 출처 허용 옵션
		credential: true, // 사용자 인증이 필요한 리소스(쿠키 ..등) 접근
  })
)
//
app.use(express.urlencoded({extended:false}));
//API 라우터 임포트
app.use('/api/festival',festivalApi.router);
app.use('/api/kakao',kakaoApi.router);
 
app.listen(PORT, () => {
	//APP LISTEN 성공
    console.log(`어플리케이션 구동 완료 : http://localhost:${PORT}/ (${new Date().toLocaleTimeString()})`);
	//타이머 콜백 등록
	setInterval(()=>{festivalApi.config.import.pageNum['Kor'] = 0;festivalApi.importFestivals('Kor');}, 3600*2 * 1000);
	setInterval(()=>{festivalApi.config.import.pageNum['Eng'] = 0;festivalApi.importFestivals('Eng');}, 3600*2 * 1000);
	setInterval(()=>{festivalApi.config.import.pageNum['Jpn'] = 0;festivalApi.importFestivals('Jpn');}, 3600*2 * 1000);
	//최신 임포트일자 가져오기
	festivalApi.initLatestEditDate('Kor');
	festivalApi.initLatestEditDate('Eng');
	festivalApi.initLatestEditDate('Jpn');
})