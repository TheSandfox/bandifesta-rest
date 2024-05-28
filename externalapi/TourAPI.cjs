const axios =  require("axios");
const APPLICATION_NAME = 'bandifesta'
const BASE_URL = {
	Kor:'https://apis.data.go.kr/B551011/KorService1',
	Eng:'https://apis.data.go.kr/B551011/EngService1',
	Jpn:'https://apis.data.go.kr/B551011/JpnService1'
};
/*{
	language:Kor or Eng or Jpn,
	itemsPerPage: 페이지당 아이템갯수,
	pageNum: 페이지 번호,
	sortMethod: 정렬방식('')
}*/
const getFestivals = async(params,thenCallback,catchCallback,finallyCallback)=>{
	const today = new Date();
	const minDay = new Date(today.setFullYear(today.getFullYear()-1));
	const maxDay = new Date(today.setFullYear(today.getFullYear()+2));
	await axios.get(BASE_URL[params.language]+'/searchFestival1',{params:{
		numOfRows:String(parseInt(params.itemsPerPage)),
		pageNo:String(parseInt(params.pageNum||1)),
		MobileOS:'WIN',
		MobileApp:APPLICATION_NAME,
		_type:'json',
		arrange:(params.sortMethod||'D'),
		eventStartDate:
			String(minDay.getFullYear())+
			String(minDay.getMonth())+
			String(minDay.getDate()),
		eventEndDate:
			String(maxDay.getFullYear())+
			String(maxDay.getMonth())+
			String(maxDay.getDate()),
		serviceKey:process.env.TOUR_SURVICE_KEY
	}})
	.then((response)=>{
		// 성공 핸들링
		thenCallback(response.data.response);
	})
	.catch((error)=>{
		// 에러 핸들링
		if(catchCallback) {catchCallback(error)}
	})
	.finally(()=>{
		if(finallyCallback) {finallyCallback()};
	});
}

module.exports = {
	getFestivals
}