// express 모듈 호출
const express = require('express');
const cors = require('cors');
const app = express();
const api = require('./routes/api.cjs');
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
    console.log(`Server run : http://localhost:${PORT}/`);
	//타이머 콜백 등록
	setInterval(()=>{api.config.import.count=0;api.importFestivals();}, 3600*2 * 1000);
})