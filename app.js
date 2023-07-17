const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');
const _ = require("lodash");


const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/hospitalDB", {useNewUrlParser: true});

const patientSchema = {
    name: String,
    age: Number,
    history: String,
    phNo : String,
    email : String
  };

const Patient = mongoose.model("Patient", patientSchema);

const doctorSchema = {
    name: String,
    patients: [patientSchema]
  };
  
const Doctor = mongoose.model("Doctor", doctorSchema);

//HOME
app.get("/", function(req, res){
    res.render("home");
  });

app.post("/", function(req, res){
    const dName = req.body.doctorName
    res.redirect("/"+dName)
    
})

//DOCTOR
app.get("/:dName", function(req, res){
    const dName = req.params.dName;
    Doctor.findOne({name: dName},function(err,foundList){
      if(!err){
        if(!foundList){
          const doctor = new Doctor({
            name: dName,
            patients: []
            });
        
            doctor.save();
            res.redirect("/" +dName );
        }else{
          res.render("doctor",{docName: foundList.name, patientList: foundList.patients});
        }
      }
    })
       
  });

  app.post("/:dName", function(req,res){
    const dName = req.params.dName;
    const add = req.body.add_btn;
    const search = req.body.search_btn;
    if(add=="Add"){
      res.redirect("/"+dName+"/add")
    }else if(search=="Search"){
      const name = req.body.pName;
      Doctor.findOne({name:dName},function(err, foundList){
        if(!err){
          if(!foundList){
            res.redirect("/"+dName)
          }else{
            searchList=[]
            foundList.patients.forEach(function(patient){
              if(patient.name==name){
                searchList.push(patient)
              }
            })
            res.render("doctor",{docName: foundList.name, patientList: searchList});
            
            
          }
          
        }
      })
    }
  })
  
  //ADD
  app.get("/:dName/add", function(req, res){
    const dName = req.params.dName;
    res.render("add",{docName:dName});
  });

  
  
  app.post("/:dName/add",function(req,res){
    const dName = req.params.dName;
    const name = req.body.Name;
    const phNo = req.body.phNo;
    const email = req.body.email;
    const history = req.body.history;
    const age = req.body.age;
    
    const patient = new Patient({
      name: name,
      age: age,
      history: history,
      phNo : phNo,
      email : email
    });

    patient.save();
    Doctor.findOne({name:dName},function(err, foundList){
      foundList.patients.push(patient);
      foundList.save();
      res.render("doctor",{docName: foundList.name, patientList: foundList.patients});
    })

  })
//PATIENT
  app.get("/:dName/:pID", function(req,res){
    const dName = req.params.dName;
    const pID = req.params.pID;
    Patient.findOne({_id: pID}, function(err,patient){
      res.render("patient", {docName: dName, pName: patient.name, phNo: patient.phNo, email: patient.email, history: patient.history,pID: patient._id, age: patient.age})
    })
    
  })
//DELETE
  app.post("/:dName/:pID/delete", function(req,res){
    const dName = req.params.dName;
    const pID = req.params.pID;
    Patient.findByIdAndRemove(pID, function(err){
      if (!err) {
        console.log("Successfully deleted checked item.");
      }
    })
      Doctor.findOneAndUpdate({name: dName}, {$pull: {patients: {_id: pID}}}, function(err, foundList){
        if (!err){
          res.redirect("/" + dName);
        }
      });
      
  })

//UPDATE
  app.post("/:dName/:pID/update", function(req,res){
    const dName = req.params.dName;
    const pID = req.params.pID;
    const btn = req.body;
    let edit = ""
    if(btn.update_btn=="Update"){
      edit = "name"  
    }else if(btn.update_btn0=="Update"){
      edit = "age"  
    }else if(btn.update_btn1=="Update"){
      edit = "phNo"  
    }else if(btn.update_btn2=="Update"){
      edit = "email"  
    }else if(btn.update_btn3=="Update"){
      edit = "history"  
    }
    res.redirect("/"+dName+"/"+pID+"/"+edit)
      
    
    
    
    
  })

  app.get("/:dName/:pID/:edit",function(req,res){
    const dName = req.params.dName;
    const pID = req.params.pID;
    const edit = req.params.edit;
    res.render("update",{docName:dName, pID: pID, edit: edit})
    
  })

  app.post("/:dName/:pID/:edit",function(req,res){
    const dName = req.params.dName;
    const pID = req.params.pID;
    const Edit = req.params.edit;
    const update = req.body.updates;
    if(Edit=="name"){
      Patient.findOneAndUpdate({ _id: pID }, { name: update }, function(err, foundList) {
        if (!err) {
          Doctor.findOneAndUpdate(
            { name: dName, "patients._id": pID },
            { $set: { "patients.$.name": update } },
            function(err, foundList) {
              if (!err) {
                res.redirect("/" + dName + "/" + pID);
              }
            }
          );
        }
      });      
    }
    if(Edit=="history"){
      Patient.findOneAndUpdate({ _id: pID }, { history: update }, function(err, foundList) {
        if (!err) {
          Doctor.findOneAndUpdate(
            { name: dName, "patients._id": pID },
            { $set: { "patients.$.history": update } },
            function(err, foundList) {
              if (!err) {
                res.redirect("/" + dName + "/" + pID);
              }
            }
          );
        }
      });
      
    }
    if(Edit=="age"){
      Patient.findOneAndUpdate({ _id: pID }, { age: update }, function(err, foundList) {
        if (!err) {
          Doctor.findOneAndUpdate(
            { name: dName, "patients._id": pID },
            { $set: { "patients.$.age": update } },
            function(err, foundList) {
              if (!err) {
                res.redirect("/" + dName + "/" + pID);
              }
            }
          );
        }
      });
      
    }
    if(Edit=="phNo"){
      Patient.findOneAndUpdate({ _id: pID }, { phNo: update }, function(err, foundList) {
        if (!err) {
          Doctor.findOneAndUpdate(
            { name: dName, "patients._id": pID },
            { $set: { "patients.$.phNo": update } },
            function(err, foundList) {
              if (!err) {
                res.redirect("/" + dName + "/" + pID);
              }
            }
          );
        }
      });
      
    }
    if(Edit=="email"){
      Patient.findOneAndUpdate({ _id: pID }, { email: update }, function(err, foundList) {
        if (!err) {
          Doctor.findOneAndUpdate(
            { name: dName, "patients._id": pID },
            { $set: { "patients.$.email": update } },
            function(err, foundList) {
              if (!err) {
                res.redirect("/" + dName + "/" + pID);
              }
            }
          );
        }
      });
      
    }
       
  })


  


  app.listen(3000, function() {
    console.log("Server started on port 3000");
  });



