function doGet(e){
  var id_token = e.parameter.id_token;
//  var response = getUserDetails(id_token);
  
  var userdetails = {
    "exists": false
  };

  var JSONString = JSON.stringify(userdetails);
  var JSONOutput = ContentService.createTextOutput(JSONString);
  JSONOutput.setMimeType(ContentService.MimeType.JSON);
 
  return JSONOutput
  
 
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


function doPost(e){
  
  Logger.log(e.paramters);
  var sheet = initialize();
  var result = createUser(sheet,JSON.parse(e.postData.contents));
  
  
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function initialize() {
  var sheet=SpreadsheetApp.openByUrl("https://docs.google.com/spreadsheets/d/1by_ZVkDaarGrEnVQTYvPWZ-it3ug43UHUW8ENCPjhMA/edit#gid=0").getSheetByName("UserDetails");
  return sheet
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function checkifuserexist(sheet,id_token)
{
  
  var id = getUserId(id_token);
  var user_ids = sheet.getRange(1, 1,sheet.getLastRow());
  var finder = user_ids.createTextFinder(id).matchEntireCell(true).findNext();
  try{
    var row = finder.getRow();
  }catch(err){
    var row = "not_found";
  }
  return row
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  
function getUserId(id_token)
{
  var url = "https://oauth2.googleapis.com/tokeninfo";
  var get_Request = url+"?id_token="+id_token;
  var response = UrlFetchApp.fetch(get_Request);
  var results = response.getContentText();
  var data = JSON.parse(results);  
  return (data.sub);
  }

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function check(){
  var a = {"id_token": "dfjhwaxkj"};
  var b = "id_token";
  var names = [];

  var details = ["google_ID","name","email","rollnumber","bday","phone","gender","hostel","institute","branch","course","year","skills","interests","superhero","sub_clubs","achievements","notifications","meassages"];
  for (var key in 
       a)
  {
   Logger.log(key);
  }
  Logger.log(names);
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function createUserTable(sheet)
{
  sheet = initialize();
  var details = ["google_ID","name","email","rollnumber","bday","phone","gender","hostel","institute","branch","course","year","skills","interests","superhero","sub_clubs","achievements","notifications","meassages"];
  sheet.appendRow(details);

  sheet.deleteRows(1,sheet.getLastRow()-1);
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function createUser(sheet, user_details)
{
  var google_id = getUserId(user_details["id_token"]);
  var entry = [google_id];
//  var entry = [];
  var header = sheet.getRange(1, 1, 1,sheet.getLastColumn()).getValues()[0];
  for (var key in user_details)
  {
    for (var head in header)
    {    
      if(header[head] == key)
      {
        entry[head] = user_details[key];
        break;
      }
    }
  }
  sheet.appendRow(entry);
}


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

 

function calling()
{
  var sheet = initialize();
  var user_details = {"name": "Amrtanshu",
                      "year": "1st",
                      "college": "IIT BHU",
                      "skills": "sjhbgxsadj",
                      "roll_number": "ckhdscfas"
                     };
  createUser(sheet,user_details);
  
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


function getUserData(row,sheet)
{
  var userDetails = sheet.getRange(row, 1, 1, sheet.getLastColumn());
}


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

