const mysql      = require('mysql2');
const connection = mysql.createConnection({
	host		: 'gihoon.info',
	user		: 'bandifesta',
	password	: process.env.DB_PASSWORD,
	database	: 'bandifesta',//schema이름임.
	dateStrings	: 'date'
});
//테이블이름
const tableNames = {
	festival:'festival',
	user:'user',
	festival_like:'festival_like',
	notice:'notice'
}

//축제 임포트 시 컬럼이름 매핑
const columnNames = {
	contentid:'festival_id',
	addr1:'address1',
	addr2:'address2',
	areacode:'area_code',
	booktour:'book_tour',
	cat1:'category1',
	cat2:'category2',
	cat3:'category3',
	contenttypeid:'festival_type',
	createdtime:'create_date',
	eventstartdate:'start_date',
	eventenddate:'end_date',
	firstimage:'image1',
	firstimage2:'image2',
	cpyrhtDivCd:'copyright_type',
	mapx:'map_x',
	mapy:'map_y',
	mlevel:'map_level',
	modifiedtime:'edit_date',
	sigungucode:'sigungu_code',
	tel:'tel',
	title:'title',
	//EXTRA CONFIGURATION
	language:'language'
}

//이스케이프 오작동 방지
function replaceEscape(raw) {
	let rs = raw.replaceAll(`\\`,`\\\\`);
	rs = rs.replaceAll(`\'`,`\\'`);
	return rs;
}

//축제 오브젝트 하나를 쿼리문으로 변경합니다.
function convertFestivalQuery(festival) {
	let newValues = []
	Object.values(festival).forEach((value)=>{
		let newValue = value==''?null:value;
		newValues.push(newValue);
	})
	// console.log(newValues);
	return '('+newValues.map(val=>{return (val==null?'DEFAULT':"\'"+replaceEscape(val)+"\'").replaceAll('<br>',',')}).join(',')+')'
	;
}

//최신 업뎃일자 가져오기
function getLatestEditDate(language,callback) {
	connection.query(`
		SELECT edit_date FROM ${tableNames['festival']}
		WHERE language = '${replaceEscape(language)}'
		ORDER BY edit_date DESC LIMIT 1
	`,(err,result)=>{
		if(err) throw err;
		//축제 리스트 중에서 최신화일자가 가장 큰 것을 가져옴
		if(result.length>0) {
			//있으면
			callback(result[0].edit_date);
		} else {
			//없으면 디폴트 날짜 주기
			return '2023-05-05 00:00:00';
		}
	})
}

//축제 게시물 수집!
function importFestivals(festivals,callback) {
	let insertQueries = ''
	let customColumns = []
	//축제리스트가 유효하지 않거나 크기가 0이하일 경우 무시
	if(!festivals||festivals.length<=0) {return;}
	festivals.forEach((festival,index)=>{
		if(index==0) {
			//쿼리문 헤더
			customColumns = Object.keys(festival).map(fieldName=>columnNames[fieldName])
			insertQueries = 'INSERT into '+tableNames['festival']+' ('+customColumns.join(',')+') VALUES'
			//축제 오브젝트를 쿼리문으로 변환해서 최종 쿼리문에 연결합니다.
			insertQueries += convertFestivalQuery(festival);
		} else {
			//첫 번째 요소가 아닐 경우에는 쉼표(,)를 포함해야합니다.
			insertQueries += ',\n'+convertFestivalQuery(festival);
		}
	})
	//DUPLICATE문 추가
	insertQueries += '\n ON DUPLICATE KEY UPDATE '
		+ customColumns.map((columnName,index)=>{
			if(index==0) {
				return ` ${columnName} = VALUES(${columnName})`
			} else {
				return ` ${columnName} = VALUES(${columnName})`
			}
		}).join(',');
	//쿼리문 실행
	connection.query(
		insertQueries
		,(err,result)=>{
			if(err) {throw err}
			//db에 insert하는 역할만 하지 프론트 응답용은 아니기 때문에
			//result를 활용할 일은 없을 것 같습니다.
			//result의 info값을 파싱해서 Duplicates값을 확인합니다.
			let newResult = result.info.split(' ').map(val=>val.trim()).filter(val=>!isNaN(parseInt(val)));
			// console.log(newResult);
			callback({
				records:newResult[0],
				duplicates:newResult[1],
				warnings:newResult[2]
			});
	})
}

//진행중인 축제들
function getOngoingFestivals(dateString,pageNum,itemsPerPage,language,callback) {
	console.log("진행중인 축제 가져오기, 날짜 = "+dateString+", 언어 = "+language);
	//페이지값 클램핑
	if(!pageNum||pageNum<=0){pageNum=0}
	//셀렉트문
	connection.query(
		`
		SELECT * FROM ${tableNames['festival']}
		WHERE end_date > '${dateString}' AND start_date < '${dateString}' AND language = '${language}'
		ORDER BY start_date DESC
		LIMIT ${pageNum*itemsPerPage},${(pageNum+1)*itemsPerPage}
		`
		,(err,result)=>{
			if(err) throw err;
			callback(result);
		}
	);
}

//축제 행 한개 가져오기
function getFestival(festivalId,callback){
	connection.query(`
		SELECT * FROM ${tableNames['festival']}
		WHERE festival_id = '${festivalId}'
	`,(err,result)=>{
		if(err) throw err;
		callback(result);
	})
}

//유저 정보(1개)
function getUser(kakaoId,callback) {
	connection.query(
		`
		SELECT kakao_id from ${tableNames['user']}
		WHERE kakao_id = '${kakaoId}'
		`
		,(err,result)=>{
			if(err) throw err;
			callback(result);
		}
	)
}

//유저정보 등록(최초)
function registerUser(kakaoId,callback) {
	connection.query(
		`
		INSERT INTO ${tableNames['user']}(kakao_id,name)
		VALUES(${kakaoId},'무명씨')
		`
	,(err)=>{
		if(err) throw err;
	})
}

//유저정보 말소
function unregisterUser(kakaoId,callback) {
	connection.query(`
		DELETE FROM ${tableNames['user']}
		WHERE kakao_id = ${kakaoId};
	`,(err,result)=>{
		if(err) throw err;
	})
}

module.exports = {
	getLatestEditDate,
	importFestivals,
	getFestival,
	getOngoingFestivals,
	getUser,
	registerUser,
	unregisterUser
}
