const mysql      = require('mysql2');
const connection = mysql.createConnection({
	host		: 'gihoon.info',
	user		: 'bandifesta',
	password	: 'qkselvptmxk1!@A',
	database	: 'bandifesta',//schema이름임.
	dateStrings	: 'date'
});
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
	title:'title'
}

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
			insertQueries = 'INSERT into festival ('+customColumns.join(',')+') VALUES'
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
			console.log(newResult);
			callback({
				records:newResult[0],
				duplicates:newResult[1],
				warnings:newResult[2]
			});
	})
}

module.exports = {
	importFestivals
}
