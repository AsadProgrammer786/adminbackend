const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
	name: String,
	password: String,
	createdOn:String
});

const messageSchema = new mongoose.Schema({
	name:String,
	email:String,
	phone : String,
	msg:String,
	date:String,
	time:String
});

const noticeSchema = new mongoose.Schema({
	date: {
		type: String,
	},
	time: {
		type: String,
	},
	notice: {
		type: String,
		required: true
	}
});

const studentSchema = new mongoose.Schema({
	admNo:String,
	cls:String,
	sec:String,
	pass:String,
	sName:String,
	fName:String,
	mName:String,
	fNum:String,
	mNum:String,
	dob:String,
	doa:String,
	house:String,
	session: String,
	address:String,
	halfenglishRhymes:String,
	halfenglishConversation:String,
	halfenglishOral:String,
	halfenglishHandwriting:String,
	halfenglishWrittenOne:String,
	halfenglishWrittenTwo:String,
	halfhindiRhymes:String,
	halfhindiOral:String,
	halfhindiHandwriting:String,
	halfhindiWritten:String,
	halfsanskrit:String,
	halfmathsOral:String,
	halfmathsWritten:String,
	halfphysics:String,
	halfchemistry:String,
	halfbiology:String,
	halfhistory:String,
	halfgeography:String,
	halfgenScience:String,
	halfsocScience:String,
	halfcomputer:String,
	halfcommerce:String,
	halfdrawing:String,
	halfgenKnowledge:String,
	halfmoralScience:String,
	halfattendence:String,
	halfpercentage:String,
	halfmanners:{
		behaviour:String,
		neatnessOfWork:String,
		punctuality:String,
		coCirricular:String
	},
	annualenglishRhymes:String,
	annualenglishConversation:String,
	annualenglishOral:String,
	annualenglishHandwriting:String,
	annualenglishWrittenOne:String,
	annualenglishWrittenTwo:String,
	annualhindiRhymes:String,
	annualhindiOral:String,
	annualhindiHandwriting:String,
	annualhindiWritten:String,
	annualsanskrit:String,
	annualmathsOral:String,
	annualmathsWritten:String,
	annualphysics:String,
	annualchemistry:String,
	annualbiology:String,
	annualhistory:String,
	annualgeography:String,
	annualgenScience:String,
	annualsocScience:String,
	annualcomputer:String,
	annualcommerce:String,
	annualdrawing:String,
	annualgenKnowledge:String,
	annualmoralScience:String,
	annualattendence:String,
	annualpercentage:String,
	annualmanners:{
		behaviour:String,
		neatnessOfWork:String,
		punctuality:String,
		coCirricular:String
	},
	fee : String
})

// const studentSchema = new mongoose.Schema({
// 	admNo:{
// 		type: String,
// 		required: true,
// 		unique: true
// 	},
// 	cls:{
// 		type: String,
// 		required:true
// 	},
// 	section:{
// 		type: String,
// 		required:true
// 	},
// 	password:{
// 		type: String,
// 		default:String
// 	},
// 	details:{
// 		type:Object,
// 		required:true
// 	},
// 	halfYearlyResults:{
// 		type: Object,
// 		default:{
// 			halfenglishRhymes:String,
// 			halfenglishConversation:String,
// 			halfenglishOral:String,
// 			halfenglishHandwriting:String,
// 			halfenglishWrittenOne:String,
// 			halfenglishWrittenTwo:String,
// 			halfhindiRhymes:String,
// 			halfhindiOral:String,
// 			halfhindiHandwriting:String,
// 			halfhindiWritten:String,
// 			halfsanskrit:String,
// 			halfmathsOral:String,
// 			halfmathsWritten:String,
// 			halfphysics:String,
// 			halfchemistry:String,
// 			halfbiology:String,
// 			halfhistory:String,
// 			halfgeography:String,
// 			halfgenScience:String,
// 			halfsocScience:String,
// 			halfcomputer:String,
// 			halfcommerce:String,
// 			halfdrawing:String,
// 			halfgenKnowledge:String,
// 			halfmoralScience:String,
// 			halfattendence:String,
// 			halfpercentage:String,
// 			halfmanners:{
// 				behaviour:String,
// 				neatnessOfWork:String,
// 				neatnessOfAppearance:String,
// 				punctuality:String,
// 				coCirricular:String
// 			}
// 		}
// 	},
// 	annualResults:{
// 		type: Object,
// 		default:{
// 			annualenglishRhymes:String,
// 			annualenglishConversation:String,
// 			annualenglishOral:String,
// 			annualenglishHandwriting:String,
// 			annualenglishWrittenOne:String,
// 			annualenglishWrittenTwo:String,
// 			annualhindiRhymes:String,
// 			annualhindiOral:String,
// 			annualhindiHandwriting:String,
// 			annualhindiWritten:String,
// 			annualsanskrit:String,
// 			annualmathsOral:String,
// 			annualmathsWritten:String,
// 			annualphysics:String,
// 			annualchemistry:String,
// 			annualbiology:String,
// 			annualhistory:String,
// 			annualgeography:String,
// 			annualgenScience:String,
// 			annualsocScience:String,
// 			annualcomputer:String,
// 			annualcommerce:String,
// 			annualdrawing:String,
// 			annualgenKnowledge:String,
// 			annualmoralScience:String,
// 			annualattendence:String,
// 			annualpercentage:String,
// 			annualmanners:{
// 				behaviour:String,
// 				neatnessOfWork:String,
// 				neatnessOfAppearance:String,
// 				punctuality:String,
// 				coCirricular:String
// 			}
// 		}
// 	},
// 	feeDeatils:{
// 		type: Object,
// 		default:{
// 			january:false,
// 			february:false,
// 			march:false,
// 			april:false,
// 			may:false,
// 			june:false,
// 			july:false,
// 			august:false,
// 			september:false,
// 			october:false,
// 			november:false,
// 			december:false
// 		}
// 	}
// });
const teacherSchema = new mongoose.Schema({
	name:{
		type:String,
		required:true
	},
	imgLink:{
		type:String,
		required:true
	},
	cls:{
		type:String,
		required:true
	},
	sec:{
		type:String,
		required:true
	},
	clsess:{
		type:Array,
		required:true
	},
	subjects:{
		type:Array,
		required:true
	},
	addr:{
		type:String,
		required:true
	},
	phone:{
		type:String,
		required:true
	},
	adhar:{
		type:String,
		required:true
	},
	doj:{
		type:String,
		required:true
	},
	dob:{
		type:String,
		required:true
	}
});

const teacherIssueSchema = new mongoose.Schema({
	from : String,
	date : String,
	topic : String,
	message : String
});

const notifSchema = new mongoose.Schema({
	nId : String,
	uId : String,
	role : String,
	cls : String,
	name : String,
	updateDate : String,
});

module.exports = {
	adminSchema,
	messageSchema,
	noticeSchema,
	studentSchema,
	teacherSchema,
	teacherIssueSchema,
	notifSchema
};