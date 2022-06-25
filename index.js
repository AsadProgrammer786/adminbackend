// Importing required modules

const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
require('dotenv').config();
const mongoose = require("mongoose");
const schemas = require("./Schema");
const cors = require('cors');
const path = require("path")
const fs = require("fs");
const xl = require('excel4node');
const wb = new xl.Workbook();
const ws = wb.addWorksheet('Student Data');
// Declaring Constants

const DB = "mongodb+srv://snips:snips@cluster0.hscsw.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
// const DB = 'mongodb://localhost:27017/schoolProject';
const jwtKey = process.env.SASTA_JWT;
const AUTHTOKEN = process.env.SASTA_KEY;
app = express();
const port = process.env.PORT || 8081;
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cors());
app.use(express.static('exports'))

// Connecting to Database

mongoose.connect(DB).then(() => {
	console.log("Connected to Database");
}).catch(err => console.log("Error while connecting - "+err));

mongoose.connection.on("error", err => console.log("Runtime Connection Error - "+err));

// Creating Models

const Admin = new mongoose.model("Admin", schemas.adminSchema);
const Message = new mongoose.model("Message", schemas.messageSchema);
const Notice = new mongoose.model("Notice", schemas.noticeSchema);
const student = new mongoose.model("student", schemas.studentSchema);
const Teacher = new mongoose.model("Teacher", schemas.teacherSchema);
const TeacherChat = new mongoose.model("adminchat", schemas.teacherIssueSchema);


// Parameters validation function

function validateParams(a){
	var valid = true;
	a.forEach(function(item){
		if(item==""||item==null){
			valid = false;
		}
	});
	return valid;
}



// Endpoints


// 0 - Normal Endpoint
app.get("/", (req,res) => {
	res.end("This is api not your personal website, so use navigate through proper endpoints else i will destroy ur pc");
});

// 1 - Admin Creation Endpoint

app.get("/api/createAdmin", async(req,res) => {
	var name = req.query.name;
	var password = req.query.password;
	if(req.query.token!=AUTHTOKEN){
		res.json({
			message:"Invalid Authtoken"
		});
	}else{
		var hashedPassword = bcrypt.hashSync(password, 10);
		const newAdmin = new Admin({
			name,
			password:hashedPassword,
			createdOn : `${new Date().getDate()}/${new Date().getMonth()}/${new Date().getFullYear()}`
		});
		try{
			var result = await newAdmin.save();
			console.log("Admin Creation - "+result);
			res.json({
				message:"Admin Created",
				data:result
			});
		}catch(err){
			console.log("Admin Creation Error - "+err);
			res.json({
				messgae:"Admin Not Created",
				error:err
			});
		}
	}
});

// 2 - Admin Login Endpoint

app.get("/api/loginAdmin", async(req,res) => {
	var name = req.query.name;
	var password = req.query.password;
	var p = [name,password];
	if(req.query.token!=AUTHTOKEN){
		res.json({
			message:"Invalid Authtoken"
		});
	}else{
		var Admins = await Admin.find({name});
		if(!Admins.length>0){
			res.json({
				message:"Account not found"
			});
		}else if(!bcrypt.compareSync(password, Admins[0].password)){
			res.json({
				message:"Wrong Password"
			});
		}else{
			var data = {
				name,
				role:"admin"
			};
			var token = jwt.sign(data, jwtKey);
			res.json({
				message:"Login Successful",
				token
			});
		}
	}
});

// 3 - Verify Session Endpoint

app.get("/api/verifySession", async(req,res) => {
	var name = req.query.name;
	var token = req.query.j;
	var p = [name,token];
	if(req.query.token!=AUTHTOKEN){
		res.json({
			message:"Invalid Authtoken"
		});
	}else{
		try{
			var td = jwt.verify(token, jwtKey);
			if(td.name==name){
				res.json({
					message:"Token Valid"
				});
			}else{
				res.json({
					message:"Token Invalid"
				});
			}
		}catch(err){
			res.json({
				message:"Token Invalid"
			});
		}
	}
});

// 4 - Contact Message Endpoint

app.get("/api/addMessage", async(req,res) => {
	var name = req.query.name;
	var email = req.query.email;
	var phone = req.query.phone;
	var msg = req.query.msg;
	var p = [name,email,phone, msg];
	console.log(p)
	if(req.query.token!=AUTHTOKEN){
		res.json({
			message:"Invalid Authtoken"
		});
	}else if(!validateParams(p)){
		res.json({
			message:"Invalid Parameters"
		});
	}else{
		var newMsg = new Message({
			name : name,
			email : email,
			phone : phone,
			msg : msg,
			date : (new Date().getDate())+"/"+(new Date().getMonth())+"/"+(new Date().getFullYear()),
			time : (new Date().getHours())+":"+(new Date().getMinutes()),
		});
		try{
			await newMsg.save();
			res.json({
				message:"Message Added"
			});
		}catch(err){
			res.json({
				message:"Error Occured",
				error:err
			});
		}
	}
});

// 5 - Get Messages Endpoint

app.get("/api/getMessage", async(req,res) => {
	var date = req.query.date;
	if(req.query.token!=AUTHTOKEN){
		res.json({
			message:"Invalid Authtoken"
		});
	}else if(date!=null){
		try{
			var data = await Message.find({addedOn:date});
			res.json({
				message:"Success",
				total:data.length,
				data
			});
		}catch(err){
			res.json({
				message:"Error Occured",
				error:err
			});
		}
	}else{
		try{
			var data = await Message.find();
			res.json({
				message:"Success",
				total:data.length,
				data
			});
		}catch(err){
			res.json({
				message:"Error Occured",
				error:err
			});
		}
	}
});

// 6 - Add Notice Endpoint

app.get("/api/addNotice", async(req,res) => {
	var notice = req.query.notice;
	var p = [notice];
	var token = req.query.token;
	var tokenValid,role;
	try{
		var data = jwt.verify(token,jwtKey);
		tokenValid = true;
		role = data.role;
	}catch(err){
		tokenValid = false;
	}
	if(!tokenValid&&!role=="admin"){
		res.json({
			message:"Invalid Authtoken"
		});
	}else if(!validateParams(p)){
		res.json({
			message:"Invalid Parameters"
		});
	}else{
		var newNotice = new Notice({
			date : (new Date().getDate())+"/"+(new Date().getMonth())+"/"+(new Date().getFullYear()),
			time : (new Date().getHours())+":"+(new Date().getMinutes()),
			notice : notice
		});
		try{
			await newNotice.save();
			res.json({
				message:"Notice Added"
			});
		}catch(err){
			res.json({
				message:"Error Occured",
				error:err
			});
		}
	}
});

// 7 - Get Notice Endpoint

app.get("/api/getNotice", async(req,res) => {
	var token = req.query.token;
	var tokenValid,role;
	try{
		var data = jwt.verify(token,jwtKey);
		tokenValid = true;
		role = data.role;
	}catch(err){
		tokenValid = false;
	}
	if(!tokenValid){
		res.json({
			message:"Invalid Authtoken"
		});
	}else{
		try{
			var data = await Notice.find();
			res.json(
				data
			);
		}catch(err){
			res.json({
				message:"Error Occured",
				error:err
			});
		}
	}
});

// 8 - Delete Notice Endpoint

app.get("/api/deleteNotice", async(req,res) => {
	var id = req.query.id;
	var p = [id];
	var token = req.query.token;
	var tokenValid,role;
	try{
		var data = jwt.verify(token,jwtKey);
		tokenValid = true;
		role = data.role;
	}catch(err){
		tokenValid = false;
	}
	if(!tokenValid&&!role=="admin"){
		res.json({
			message:"Invalid Authtoken"
		});
	}else if(!validateParams(p)){
		res.json({
			message:"Invalid Parameters"
		});
	}else{
		try{
			var result = await Notice.deleteOne({_id:id});
			res.json({
				result
			});
		}catch(err){
			res.json({
				message:"Error Occured",
				error:err
			});
		}
	}
});


// 9 - Edit Notice Endpoint

app.get("/api/editNotice", async(req,res) => {
	var notice = req.query.notice;
	var id = req.query.id;
	var p = [notice,id];
	var token = req.query.token;
	var tokenValid,role;
	try{
		var data = jwt.verify(token,jwtKey);
		tokenValid = true;
		role = data.role;
	}catch(err){
		tokenValid = false;
	}
	if(!tokenValid&&!role=="admin"){
		res.json({
			message:"Invalid Authtoken"
		});
	}else if(!validateParams(p)){
		res.json({
			message:"Invalid Parameters"
		});
	}else{
		try{
			var result = await Notice.updateOne({_id:id}, {
				$set:{
					notice : notice
				}
			});
			res.json({
				result
			});
		}catch(err){
			res.json({
				message:"Error Occured",
				error:err
			});
		}
	}
});

// 10 - Get students Data

app.get("/api/getstudent", async(req,res) => {
	var admNo = req.query.admNo;
	var cls = req.query.cls;
	var section = req.query.sec;
	section = section.toUpperCase();
	var house = req.query.house;
	var egl = req.query.egl;
	var halfPer = req.query.halfPercentage;
	var annualfPer = req.query.annualPercentage;
	var halfAtt = req.query.halfAtt;
	var annualAtt = req.query.annualAtt;
	var dob = req.query.dob;
	var doa = req.query.doa;
	var fee = req.query.fee;
	console.log(halfPer)
	student.find({admNo : {$regex : admNo}, cls : cls, sec : {$regex:section}, house : {$regex : house}, egl : {$regex : egl}, halfpercentage : {$gte : halfPer}, annualpercentage : {$gte : annualfPer}, halfattendence : {$gte : halfAtt}, annualattendence : {$gte : annualAtt},fee : {$gte : fee}, doa : {$regex : doa}, dob : {$regex : dob} },
		 (err, data) => {
			
		if(data.length>200) {
			data = data.slice(0, 200);
			res.send(data);
		}
		else {
			res.send(data);
		}
	})
});

app.get("/api/getStudentsDetails", async(req, res) => {
	var admNo = req.query.admNo;
	var cls = req.query.cls;
	var section = req.query.sec;
	if(section)
	section = section.toUpperCase();
	else section="";
	var house = req.query.house;
	var dob = req.query.dob;
	var doa = req.query.doa;
	var fee = req.query.fee;
	console.log("Normal cls = "+cls)
	var halfPercentage = req.query.halfPercentage;
	var annualPercentage = req.query.annualPercentage;
	var annualAtt = req.query.annualAtt;
	var halfAtt = req.query.halfAtt;
	if(halfPercentage=="") halfPercentage = 0;
	if(annualPercentage=="") annualPercentage = 0;
	if(annualAtt=="") annualAtt = 0;
	if(halfAtt=="") halfAtt = 0;
	if(fee!="") {
		if(fee.length>2) {
			if(fee[1]==" ") {
				fee = fee[0];
				fee = parseInt(fee)
			}
			else if(fee[2]==" ") {
				fee = fee.substring(0, 2);
				fee = parseInt(fee);
			}
		}
		else {
			fee = parseInt(fee);
		}
	}
	console.log(fee)
	if(cls==""&&fee=="") {
	student.find({
		admNo : {$regex : admNo},
		sec : {$regex : section},
		house : {$regex : house},
		dob : {$regex : dob},
		doa : {$regex : doa},
		annualpercentage : {$gte : annualPercentage},
		halfpercentage : {$gte : halfPercentage},
		annualattendence : {$gte : annualAtt},
		halfattendence : {$gte : halfAtt}
	},
		 (err, data) => {
			
		if(data.length>200) {
			data = data.slice(0, 200);
			res.send(data);
		}
		else {
			res.send(data);
		}
	})
} 
else if(cls==""&&fee!="") {
	student.find({
		admNo : {$regex : admNo},
		sec : {$regex : section},
		house : {$regex : house},
		dob : {$regex : dob},
		doa : {$regex : doa},
		annualpercentage : {$gte : annualPercentage},
		halfpercentage : {$gte : halfPercentage},
		fee : fee,
		annualattendence : {$gte : annualAtt},
		halfattendence : {$gte : halfAtt}

	},
		 (err, data) => {
			
		if(data.length>200) {
			data = data.slice(0, 200);
			res.send(data);
		}
		else {
			res.send(data);
		}
	})
}
else if(cls!=""&&fee=="") {
	student.find({
		admNo : {$regex : admNo},
		cls : cls,
		sec : {$regex : section},
		house : {$regex : house},
		dob : {$regex : dob},
		doa : {$regex : doa},
		annualpercentage : {$gte : annualPercentage},
		halfpercentage : {$gte : halfPercentage},
		annualattendence : {$gte : annualAtt},
		halfattendence : {$gte : halfAtt}

	},
		 (err, data) => {
			
		if(data.length>200) {
			data = data.slice(0, 200);
			res.send(data);
		}
		else {
			res.send(data);
		}
	})
}



	else {
		student.find({
		admNo : {$regex : admNo},
		cls : cls,
		sec : {$regex : section},
		house : {$regex : house},
		fee : fee,
		dob : {$regex : dob},
		doa : {$regex : doa},
		annualpercentage : {$gte : annualPercentage},
		halfpercentage : {$gte : halfPercentage},
		annualattendence : {$gte : annualAtt},
		halfattendence : {$gte : halfAtt}

	},
		 (err, data) => {
			
		if(data.length>200) {
			data = data.slice(0, 200);
			res.send(data);
		}
		else {
			res.send(data);
		}
	})
	}
})
















// 2408234 - Get all queries

app.get("/api/getAllQueries", (req, res) => {
	var token = req.query.token;
	if(req.query.token==AUTHTOKEN){
		Message.find({}, (err, data) => {
			data = data.reverse();
			if(data.length>80) {
				data = data.slice(0, 60);
				res.send(data);
			}
			else {
				res.send(data);
			}
		});
	}
});


// 11 - Add student Endpoint

app.get("/api/addStudent", async(req,res) => {
	var admNo= req.query.admNo;
	var cls= req.query.cls;
	var sec= req.query.sec;
	var pass= req.query.pass;
	var token = req.query.token;	var sName= req.query.sName;
	var fName= req.query.fName;
	var mName= req.query.mName;
	var fNum= req.query.fNum;
	var mNum= req.query.mNum;
	var dob= req.query.dob;
	var doa= req.query.doa;
	var house= req.query.house;
	var session= JSON.stringify((new Date()).getFullYear);
	var address= req.query.address;
	var halfenglishRhymes= req.query.halfenglishRhymes;
	var halfenglishConversation= req.query.halfenglishConversation;
	var halfenglishOral= req.query.halfenglishOral;
	var halfenglishHandwriting= req.query.halfenglishHandwriting;
	var halfenglishWrittenOne= req.query.halfenglishWrittenOne;
	var halfenglishWrittenTwo= req.query.halfenglishWrittenTwo;
	var halfhindiRhymes= req.query.halfhindiRhymes;
	var halfhindiOral= req.query.halfhindiOral;
	var halfhindiHandwriting= req.query.halfhindiHandwriting;
	var halfhindiWritten= req.query.halfhindiWritten;
	var halfsanskrit= req.query.halfsanskrit;
	var halfmathsOral= req.query.halfmathsOral;
	var halfmathsWritten= req.query.halfmathsWritten;
	var halfphysics= req.query.halfphysics;
	var halfchemistry= req.query.halfchemistry;
	var halfbiology= req.query.halfbiology;
	var halfhistory= req.query.halfhistory;
	var halfgeography= req.query.halfgeography;
	var halfcomputer= req.query.halfcomputer;
	var halfdrawing= req.query.halfdrawing;
	var halfgenKnowledge= req.query.halfgenKnowledge;
	var halfmoralScience= req.query.halfmoralScience;
	var halfattendence= req.query.halfattendence;
	var halfpercentage= req.query.halfpercentage;
	var halfbehaviour= req.query.halfbehaviour;
	var halfneatnessOfWork= req.query.halfneatnessOfWork;
	var halfpunctuality= req.query.halfpunctuality;
	var halfcoCirricular= req.query.halfcoCirricular;
	var annualbehaviour= req.query.annualbehaviour;
	var annualneatnessOfWork= req.query.annualneatnessOfWork;
	var annualpunctuality= req.query.annualpunctuality;
	var annualcoCirricular= req.query.annualcoCirricular;
	var annualenglishRhymes= req.query.annualenglishRhymes;
	var annualenglishConversation= req.query.annualenglishConversation;
	var annualenglishOral= req.query.annualenglishOral;
	var annualenglishHandwriting= req.query.annualenglishHandwriting;
	var annualenglishWrittenOne= req.query.annualenglishWrittenOne;
	var annualenglishWrittenTwo= req.query.annualenglishWrittenTwo;
	var annualhindiRhymes= req.query.annualhindiRhymes;
	var annualhindiOral= req.query.annualhindiOral;
	var annualhindiHandwriting= req.query.annualhindiHandwriting;
	var annualhindiWritten= req.query.annualhindiWritten;
	var annualsanskrit= req.query.annualsanskrit;
	var annualmathsOral= req.query.annualmathsOral;
	var annualmathsWritten= req.query.annualmathsWritten;
	var annualphysics= req.query.annualphysics;
	var annualchemistry= req.query.annualchemistry;
	var annualbiology= req.query.annualbiology;
	var annualhistory= req.query.annualhistory;
	var annualgeography= req.query.annualgeography;
	var annualcomputer= req.query.annualcomputer;
	var annualdrawing= req.query.annualdrawing;
	var annualgenKnowledge= req.query.annualgenKnowledge;
	var annualmoralScience= req.query.annualmoralScience;
	var annualattendence= req.query.annualattendence;
	var annualpercentage= req.query.annualpercentage;
	var fee = req.query.fee;
	if(fee=="") {fee = 1;}
	else {
		if(fee.length>2) {
			if(fee[1]==" ") {
				fee = fee[0];
				fee = parseInt(fee)
			}
			else if(fee[2]==" ") {
				fee = fee.substring(0, 2);
				fee = parseInt(fee);
			}
		}
		else {
			fee = parseInt(fee);
		}
	}
	if(req.query.token!=AUTHTOKEN){
		res.json({
			message:"Invalid Authtoken"
		});
	}
	else{
		var newstudent = new student({
			admNo,cls,sec,pass,sName,fName,mName,fNum,mNum,dob,doa,house,session,address,halfenglishRhymes,halfenglishConversation,halfenglishOral,halfenglishHandwriting,halfenglishWrittenOne,halfenglishWrittenTwo,halfhindiRhymes,halfhindiOral,halfhindiHandwriting,halfhindiWritten,halfsanskrit,halfmathsOral,halfmathsWritten,halfphysics,halfchemistry,halfbiology,halfhistory,halfgeography,halfcomputer,halfdrawing,halfgenKnowledge,halfmoralScience,halfattendence,halfpercentage,halfbehaviour,halfneatnessOfWork,halfpunctuality,halfcoCirricular,annualbehaviour,annualneatnessOfWork,annualpunctuality,annualcoCirricular,annualenglishRhymes,annualenglishConversation,annualenglishOral,annualenglishHandwriting,annualenglishWrittenOne,annualenglishWrittenTwo,annualhindiRhymes,annualhindiOral,annualhindiHandwriting,annualhindiWritten,annualsanskrit,annualmathsOral,annualmathsWritten,annualphysics,annualchemistry,annualbiology,annualhistory,annualgeography,annualcomputer,annualdrawing,annualgenKnowledge,annualmoralScience,annualattendence,annualpercentage,fee,
                        halfmanners:{
                                behaviour:halfbehaviour,
                                neatnessOfWork:halfneatnessOfWork,
                                punctuality:halfpunctuality,
                                coCirricular:halfcoCirricular
                        },
                        annualmanners:{
                                behaviour:annualbehaviour,
                                neatnessOfWork:annualneatnessOfWork,
                                punctuality:annualpunctuality,
                                coCirricular:annualcoCirricular
                        }
		});
		try{
			student.find({admNo : admNo}, (err, data) => {
				if(data.length==0) {
			newstudent.save().then(() => {
			console.log(req.query.count + ". Student admNo : "+admNo);
			res.send("ok");
			});
				} else {
					res.send("no");
				}
		});
		}catch(err){
			console.log("can't save");
			res.json("no");
		}
	}
});

// 12 - Edit student Data


// 13 - Delete student

app.get("/api/deletestudent", async(req,res) => {
	var admNo = req.query.admNo;
	var p = [admNo];
	if(req.query.token!=AUTHTOKEN){
		res.json({
			message:"Invalid Authtoken"
		});
	}else if(!validateParams(p)){
		res.json({
			message:"Invalid Parameters"
		});
	}else{
		try{
			var result = await student.deleteOne({admNo});
			res.json({
				result
			});
		}catch(err){
			res.json({
				message:"Error Occured",
				error:err
			});
		}
	}
});

app.get("/api/deleteStudent", async(req,res) => {
	var admNo = req.query.admNo;
	var token = req.query.token;
	// Token Validation Here
	var tokenValid = true;
	if(token!=SASTA_KEY){
		res.json({
			message:"Invalid Authtoken"
		});
	}else{
		try{
			var result = await Student.deleteOne({admNo});
			res.json({
				result
			});
		}catch(err){
			res.json({
				message:"Error Occured",
				error:err
			});
		}
	}
});

// Update student Endpoint

app.get("/api/updateStudentData", async(req,res) => {
	var admNo= req.query.admNo;
	var cls= req.query.cls;
	var sec= req.query.sec;
	var pass= req.query.pass;
	var token = req.query.token;  var sName= req.query.sName;
	var fName= req.query.fName;
	var mName= req.query.mName;
	var fNum= req.query.fNum;
	var mNum= req.query.mNum;
	var dob= req.query.dob;
	var doa= req.query.doa;
	var house= req.query.house;
	var session= JSON.stringify((new Date()).getFullYear);
	var address= req.query.address;
	var halfenglishRhymes= req.query.halfenglishRhymes;
	var halfenglishConversation= req.query.halfenglishConversation;
	var halfenglishOral= req.query.halfenglishOral;
	var halfenglishHandwriting= req.query.halfenglishHandwriting;
	var halfenglishWrittenOne= req.query.halfenglishWrittenOne;
	var halfenglishWrittenTwo= req.query.halfenglishWrittenTwo;
	var halfhindiRhymes= req.query.halfhindiRhymes;
	var halfhindiOral= req.query.halfhindiOral;
	var halfhindiHandwriting= req.query.halfhindiHandwriting;
	var halfhindiWritten= req.query.halfhindiWritten;
	var halfsanskrit= req.query.halfsanskrit;
	var halfmathsOral= req.query.halfmathsOral;
	var halfmathsWritten= req.query.halfmathsWritten;
	var halfphysics= req.query.halfphysics;
	var halfchemistry= req.query.halfchemistry;
	var halfbiology= req.query.halfbiology;
	var halfhistory= req.query.halfhistory;
	var halfgeography= req.query.halfgeography;
	var halfcomputer= req.query.halfcomputer;
	var halfdrawing= req.query.halfdrawing;
	var halfgenKnowledge= req.query.halfgenKnowledge;
	var halfmoralScience= req.query.halfmoralScience;
	var halfattendence= req.query.halfattendence;
	var halfpercentage= req.query.halfpercentage;
	var halfbehaviour= req.query.halfbehaviour;
	var halfneatnessOfWork= req.query.halfneatnessOfWork;
	var halfpunctuality= req.query.halfpunctuality;
	var halfcoCirricular= req.query.halfcoCirricular;
	var annualbehaviour= req.query.annualbehaviour;
	var annualneatnessOfWork= req.query.annualneatnessOfWork;
	var annualpunctuality= req.query.annualpunctuality;
	var annualcoCirricular= req.query.annualcoCirricular;
	var annualenglishRhymes= req.query.annualenglishRhymes;
	var annualenglishConversation= req.query.annualenglishConversation;
	var annualenglishOral= req.query.annualenglishOral;
	var annualenglishHandwriting= req.query.annualenglishHandwriting;
	var annualenglishWrittenOne= req.query.annualenglishWrittenOne;
	var annualenglishWrittenTwo= req.query.annualenglishWrittenTwo;
	var annualhindiRhymes= req.query.annualhindiRhymes;
	var annualhindiOral= req.query.annualhindiOral;
	var annualhindiHandwriting= req.query.annualhindiHandwriting;
	var annualhindiWritten= req.query.annualhindiWritten;
	var annualsanskrit= req.query.annualsanskrit;
	var annualmathsOral= req.query.annualmathsOral;
	var annualmathsWritten= req.query.annualmathsWritten;
	var annualphysics= req.query.annualphysics;
	var annualchemistry= req.query.annualchemistry;
	var annualbiology= req.query.annualbiology;
	var annualhistory= req.query.annualhistory;
	var annualgeography= req.query.annualgeography;
	var annualcomputer= req.query.annualcomputer;
	var annualdrawing= req.query.annualdrawing;
	var annualgenKnowledge= req.query.annualgenKnowledge;
	var annualmoralScience= req.query.annualmoralScience;
	var annualattendence= req.query.annualattendence;
	var annualpercentage= req.query.annualpercentage;
	var fee = req.query.fee;
	if(fee=="") {fee = 1;}
	else {
	  if(fee.length>2) {
		if(fee[1]==" ") {
		  fee = fee[0];
		  fee = parseInt(fee)
		}
		else if(fee[2]==" ") {
		  fee = fee.substring(0, 2);
		  fee = parseInt(fee);
		}
	  }
	  else {
		fee = parseInt(fee);
	  }
	}
	if(req.query.token!=AUTHTOKEN){
	  res.json({
		message:"Invalid Authtoken"
	  });
	}
	else{
	  try{
	  	var d = await student.updateOne({admNo : admNo},{$set : {admNo,cls,sec,pass,sName,fName,mName,fNum,mNum,dob,doa,house,session,address,halfenglishRhymes,halfenglishConversation,halfenglishOral,halfenglishHandwriting,halfenglishWrittenOne,halfenglishWrittenTwo,halfhindiRhymes,halfhindiOral,halfhindiHandwriting,halfhindiWritten,halfsanskrit,halfmathsOral,halfmathsWritten,halfphysics,halfchemistry,halfbiology,halfhistory,halfgeography,halfcomputer,halfdrawing,halfgenKnowledge,halfmoralScience,halfattendence,halfpercentage,halfbehaviour,halfneatnessOfWork,halfpunctuality,halfcoCirricular,annualbehaviour,annualneatnessOfWork,annualpunctuality,annualcoCirricular,annualenglishRhymes,annualenglishConversation,annualenglishOral,annualenglishHandwriting,annualenglishWrittenOne,annualenglishWrittenTwo,annualhindiRhymes,annualhindiOral,annualhindiHandwriting,annualhindiWritten,annualsanskrit,annualmathsOral,annualmathsWritten,annualphysics,annualchemistry,annualbiology,annualhistory,annualgeography,annualcomputer,annualdrawing,annualgenKnowledge,annualmoralScience,annualattendence,annualpercentage,fee,
			halfmanners:{
					behaviour:halfbehaviour,
					neatnessOfWork:halfneatnessOfWork,
					punctuality:halfpunctuality,
					coCirricular:halfcoCirricular
			},
			annualmanners:{
					behaviour:annualbehaviour,
					neatnessOfWork:annualneatnessOfWork,
					punctuality:annualpunctuality,
					coCirricular:annualcoCirricular
			}}

})
var f = await student.find({admNo : admNo}); 
		console.log(f)
		res.json(
			{
				message: "yes",
				newData : f
			}
		)
	  }catch(err){
		console.log(err);
		res.json({message:"no"});
	  }
	}
  });

// Delete Contact Message Endpoint

app.get("/api/deleteMessage", async(req,res) => {
	var id = req.query.id;
	var p = [id];
	var token = req.query.token;
	var tokenValid,role;
	try{
		var data = jwt.verify(token,jwtKey);
		tokenValid = true;
		role = data.role;
	}catch(err){
		tokenValid = false;
	}
	if(!tokenValid&&!role=="admin"){
		res.json({
		message:"Invalid Authtoken"
		});
	}else if(!validateParams(p)){
		res.json({
		message:"Invalid Parameters"
		});
	}else{
		try{
		var result = await Message.deleteOne({_id:id});
		res.json({
		result
		});
		}catch(err){
		res.json({
		message:"Error Occured",
		error:err
		});
		}
	}
});


// 1 - Add Teachers Endpoint

app.get("/api/addTeacher", async(req,res)=>{
	var token = req.query.token;
	var name = req.query.name;
	var imgLink = req.query.imgLink;
	var cls = req.query.cls;
	var sec = req.query.sec;
	var adhar = req.query.adhaar;
	var addr = req.query.address;
	var phone = req.query.phone;
	var subjects = req.query.subject.split(",");
	var dob = req.query.dob;
	var doj = req.query.doj;
	var tcls = req.query.tcls.split(",");
	var tokenValid,role;
	try{
		var d = jwt.verify(token, jwtKey);
		tokenValid = true;
		role = d.role;
	}catch(err){
		tokenValid = false;
	}
	if(!tokenValid&&!role=="admin"){
		re.json({
			message:"Token Invalid"
		});
	}else{
		try{
			var newTeacher = new Teacher({
				name : name,
				cls : cls,
				clsess : tcls,
				dob : dob,
				doj : doj,
				sec : sec,
				adhar : adhar,
				addr : addr,
				subjects : subjects,
				phone : phone,
				imgLink : imgLink
			});
			await newTeacher.save();
			res.send("ok");
		}catch(err){
			res.json({
				message:"Error Occured",
				error:err
			});
		}
	}
});


app.get("/api/getTeacher", async(req,res) => {
	var token = req.query.token;
	var id = req.query.id;
	var cls = req.query.cls;
	var sec = req.query.sec;
	var tokenValid,role;
	if(cls=="") cls="10";
	try{
	 var d = jwt.verify(token, jwtKey);
	 tokenValid = true;
	 role = d.role;
	}catch(err){
	 tokenValid = false;
	}
	if(!tokenValid){
	 res.json({
	  message:"Invalid Token"
	 });
	}else{
	 try{
	  if(id)
	   var data = await Teacher.find({__id:id});
	  else if(cls&&sec)
	   var data = await Teacher.find({cls,sec : {$regex : sec}});
	  else
	   var data = await Teacher.find();
	  res.json({
	   message:"Done",
	   data
	  });
	 }catch(err){
	  res.json({
	   message: "Error Occured",
	   error:err
	  });
	 }
	}
   });

app.get("/api/deleteTeacher", async(req, res) => {
	var id = req.query.id;
	var p = [id];
	var token = req.query.token;
	var tokenValid,role;
	try{
		var data = jwt.verify(token,jwtKey);
		tokenValid = true;
		role = data.role;
	}catch(err){
		tokenValid = false;
	}
	if(!tokenValid&&!role=="admin"){
		res.json({
		message:"Invalid Authtoken"
		});
	}else{
		try{
		var result = await Teacher.deleteOne({_id:id});
		res.json({
		result
		});
		}catch(err){
		res.json({
		message:"Error Occured",
		error:err
		});
		}
	}
});

app.get("/api/editTeacher", async(req, res) => {
	var token = req.query.token;
	var name = req.query.name;
	var imgLink = req.query.imgLink;
	var cls = req.query.cls;
	var sec = req.query.sec;
	var adhar = req.query.adhaar;
	var addr = req.query.address;
	var phone = req.query.phone;
	var subjects = req.query.subject.split(",");
	var dob = req.query.dob;
	var doj = req.query.doj;
	var tcls = req.query.tcls.split(",");
	var tokenValid,role;
	try{
		var d = jwt.verify(token, jwtKey);
		tokenValid = true;
		role = d.role;
	}catch(err){
		tokenValid = false;
	}
	if(!tokenValid&&!role=="admin"){
		re.json({
			message:"Token Invalid"
		});
	}else{
		try{
			var newTeacher = Teacher.updateOne({_id:id}, {$set : {
				name : name,
				imgLink : imgLink,
				cls : cls,
				sec : sec,
				clsess : tcls,
				subjects : subjects,
				addr : addr,
				phone : phone,
				adhar : adhar,
				doj : doj,
				dob : dob
			}});
			console.log(newTeacher);
			res.send("ok");
		}catch(err){
			res.json({
				message:"Error Occured",
				error:err
			});
		}
	}
});

app.get("/api/export", async(req,res)=>{
	var token = req.query.token;
	var tokenValid,role;
	try{
		var d = jwt.verify(token,jwtKey);
		tokenValid = true;
		role = d.role;
	}catch(err){
		tokenValid = false;
	}
	if(!tokenValid || !role=="admin"){
		res.json({
			message:"Invalid Token"
		});
	}else{
		var fPath = `exports/${new Date().getTime()}.xlsx`;
		const fileExists = async path => (await fs.promises.stat(path).catch(e => false));
		if(await fileExists(fPath)){
			fs.unlinkSync(fPath);
		}
		try{
			var d = await student.find({});
			var data = [];
			d.forEach(function(st){
				data.push({
					admNo:st.admNo,
					sName:st.sName,
					cls:st.cls,
					sec:st.sec,
					fName:st.fName,
					mName:st.mName,
					fNum:st.fNum,
					mNum:st.mNum,
					dob:st.dob,
					doa:st.doa,
					house:st.house,
					address:st.address,
					halfpercentage:st.halfpercentage,
					halfrank:st.halfrank,
					annualpercentage:st.annualpercentage,
					annualrank:st.annualrank
				});
			});
			var headingColumnNames = ["admNo","sName","cls","sec","fName","mName","fNum","mNum","dob","doa","house","address","halfpercentage","halfrank","annualpercentage","annualrank"];
			let headingColumnIndex = 1;
			headingColumnNames.forEach(heading => {
			    ws.cell(1, headingColumnIndex++)
 			       .string(heading)
			});
			let rowIndex = 2;
			data.forEach( record => {
		    let columnIndex = 1;
		    Object.keys(record ).forEach(columnName =>{
 		       ws.cell(rowIndex,columnIndex++)
  		          .string(record [columnName])
 	 		  });
  			  rowIndex++;
			}); 
			wb.write(fPath);
			var link = fPath;
			res.json({
				message:"Done",
				link
			});
		}catch(err){
			res.json({
				message:"Error Occured",
				error:err
			});
		}
	}
});

app.get("/exports", async(req,res)=>{
	var a = req.query.fileName;
	res.sendFile(__dirname+'/exports/'+a);
});

app.get("/api/getAllTQuery", async(req, res) => {
	var token = req.query.token;
		try{
			var td = jwt.verify(token, jwtKey);
			var q = await TeacherChat.find({});
			res.json({
				message:"yes",
				data : q.reverse()
			});
		}catch(err){
			res.json({
				message:"no"
			});
		}
});


app.get("/api/deleteTQuery", async(req, res) => {
	var token = req.query.token;
	var id = req.query.id;
	try{
		var td = jwt.verify(token, jwtKey);
		var q = await TeacherChat.deleteOne({_id : id});
		res.json({
			message:"yes",
			data : q
		});
	}catch(err){
		res.json({
			message:"no"
		});
	}
});

// Starting the server

app.listen(port, function(){
        console.log(`Server running on port ${port}`);
});