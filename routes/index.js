var fs = require("fs");
var path = require("path");
var address = require('../address');
var path = require('path');

exports.index = function(req, res){
	for(key in address){
		res.redirect('/'+key);
	}
};

exports.project = function(req, res){
	if(req.params && req.params.project){
		var Path = address[req.params.project];
		if(!Path){
			res.render('error', {
				curPath :'',
				allPath : address
			});
		}
		fs.exists(Path,function(exists){
			if(!exists){
				res.render('error', {
					curPath :'',
					allPath : address
				});
			}
		});
	}
	
	var dict = {};
	var getAllFiles = function(root){
		var tree = [];
		var files = fs.readdirSync(root);
		files.forEach(function(file) {
			var pathname = root+ "/" + file;
			var stat = fs.lstatSync(pathname)
			if (stat === undefined) return
			 
			 // 不是文件夹就是文件
			var pathKey = pathname.split(Path)[1];
			 if (!stat.isDirectory()) {
				if(pathKey.split('/'+file)[0] === ''){
					dict[ file ] = file;
				}else{
					dict[ pathKey.split('/'+file)[0] ] = fs.readdirSync(root);
				}
				
				tree.push( pathKey );
			 // 递归自身
			  } else {
				var child = {};
				child[ file ] = getAllFiles( pathname );
				tree.push(child);
			  }
		});
		
		return tree;
	};
	var fileListTree = getAllFiles(Path)
	

	res.render('index', { 
		curPath:req.params.project,
	  	file:dict,
	  	allPath : address
	});
};

exports.read= function(req, res){
	var url = req.params.file;
	var pathArr = url.split('$');
	var relativePath = '';
	for(var i=1;i<pathArr.length;i++){
		relativePath +='/'+pathArr[i];
	}
	var realAddress = address[ pathArr[0] ] + relativePath;
	fs.readFile(realAddress,function(err,data){
		
		if(data === undefined){
			data = "木有找到文件，路径出错啦- - #！本地地址："+realAddress;
		}
		res.render('read', { 
			curPath:pathArr[0],
		  	file:data,
		  	allPath : address
		});
	});
};

exports.addProject= function(req, res){
	var data = req.body;
	address[ data.name ] = data.ad;
	// write address.js
	var content = 'module.exports = {';

	for(key in address){
		content += key + ': "' +address[key]+'",';
	}
	content.slice(0, -1);
	content+='}'

	fs.writeFile(__dirname+'/../address.js',content,function(err){
		console.log(err)
	});
	return res.json({'success':1});
};

exports.delProject= function(req, res){
	var data = req.body;
	delete address[ data.name ];
	// write address.js
	var content = 'module.exports = {';

	for(key in address){
		content += key + ': "' +address[key]+'",';
	}
	content.slice(0, -1);
	content+='}'

	fs.writeFile(__dirname+'/../address.js',content,function(err){
		console.log(err)
	});
	return res.json({'success':1});
};