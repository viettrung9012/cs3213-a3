
var object = function 	(list) {
	var length= list.length;
	for (i=0; i<length;i++) {
		db.objects.save(list[i])
	}

}
module.exports=objectScript;