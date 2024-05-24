// express 모듈 호출
const express = require('express');
const cors = require('cors');
const app = express();
const api = require('./api.cjs');
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(cors({
		origin: "*", // 출처 허용 옵션
		credential: true, // 사용자 인증이 필요한 리소스(쿠키 ..등) 접근
  })
)
//
app.use(express.urlencoded({extended:false}));
app.use('/api',api.router);
 
app.listen(PORT, () => {
	//APP LISTEN 성공
    console.log(`어플리케이션 구동 완료 : http://localhost:${PORT}/ (${new Date().toLocaleTimeString()})`);
	//타이머 콜백 등록
	setInterval(()=>{api.config.importFestivals.pageNum['Kor'] = 0;api.importFestivals('Kor');}, 3600*2 * 1000);
	setInterval(()=>{api.config.importFestivals.pageNum['Eng'] = 0;api.importFestivals('Eng');}, 3600*2 * 1000);
	setInterval(()=>{api.config.importFestivals.pageNum['Jpn'] = 0;api.importFestivals('Jpn');}, 3600*2 * 1000);
	//최신 임포트일자 가져오기
	api.initLatestEditDate('Kor');
	api.initLatestEditDate('Eng');
	api.initLatestEditDate('Jpn');
})