/////////////////////////////////////////////////////////////////REST API - GET/////////////////////////////////////////////////////////////////////////////////////////

function doGet(e){
  var action = e.parameter.action;
  if (action == "getstudent")
  {
    
    var id_token = e.parameter.id_token;    
    var userdetails = {
      "exists": false
    };
    var userdetails = getUser(id_token);
  }
  
  if (action == "getAllStudents")
  {
    var id_token = e.parameter.id_token;    
    var userdetails = getAllUsers();
  }
  var log = SpreadsheetApp.openByUrl("https://docs.google.com/spreadsheets/d/1by_ZVkDaarGrEnVQTYvPWZ-it3ug43UHUW8ENCPjhMA/edit#gid=0").getSheetByName("logsheet");
  log.appendRow(["GET" ,action, userdetails]);
  
  
  var JSONString = JSON.stringify(userdetails);
  var JSONOutput = ContentService.createTextOutput(JSONString);
  JSONOutput.setMimeType(ContentService.MimeType.JSON);
 
  return JSONOutput
  
 
}

///////////////////////////////////////////////////////////////////////REST API - POST///////////////////////////////////////////////////////////////////////////////////


function doPost(e){
  
  
  var action = e.parameter.action;
  var sheet = initialize();

  if (action == "updateprofile")
  {
    var userdetails = updateUser(sheet,JSON.parse(e.postData.contents));
  }
  
  if (action == "createuser")
  {
  var userdetails = createUser(sheet,JSON.parse(e.postData.contents));
  }
    
  
  var log = SpreadsheetApp.openByUrl("https://docs.google.com/spreadsheets/d/1by_ZVkDaarGrEnVQTYvPWZ-it3ug43UHUW8ENCPjhMA/edit#gid=0").getSheetByName("logsheet");
  log.appendRow(["POST" ,action, userdetails]);

  var JSONString = JSON.stringify(userdetails);
  var JSONOutput = ContentService.createTextOutput(JSONString);
  JSONOutput.setMimeType(ContentService.MimeType.JSON);
 
  return JSONOutput
   
  }

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function initialize() {
  var sheet=SpreadsheetApp.openByUrl("https://docs.google.com/spreadsheets/d/1by_ZVkDaarGrEnVQTYvPWZ-it3ug43UHUW8ENCPjhMA/edit#gid=0").getSheetByName("UserDetails");
  return sheet
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function checkUser(sheet,id_token)
{
  
  var id = getUserId(id_token);
  var user_ids = sheet.getRange(1, 1,sheet.getLastRow());
  var finder = user_ids.createTextFinder(id).matchEntireCell(true).findNext();
  try{
    var row = finder.getRow();
  }catch(err){
    var row = -1;
  }
  return row
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  
function getUserId(id_token)
{
  var url = "https://oauth2.googleapis.com/tokeninfo";
  var get_Request = url+"?id_token="+id_token;
  try{
    var response = UrlFetchApp.fetch(get_Request);
  }catch(err){
    return ("invalid token_id");
  }
  var results = response.getContentText();
  var data = JSON.parse(results);  
  return (data.sub);
  }

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


function getUserData(sheet,row)
{
  var userDetails = sheet.getRange(row, 2, 1, sheet.getLastColumn()).getValues()[0];
  var headers = sheet.getRange(1,2,1,sheet.getLastColumn()).getValues()[0];
  var dict_data = {};
  dict_data["exists"] = true;
  for (var keys in headers)
  {
    var key = headers[keys];
    dict_data[key] = userDetails[keys];
  }
    
  return dict_data;
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function getUser(id_token){
  var sheet = initialize();
  var row = checkUser(sheet, id_token);
  if( row == -1)
  {
    var details = {exists:false};
  }
  else
  {
    var details = getUserData(sheet,row);
  }
return details  
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
  var row = sheet.getLastRow();
  var saved_Data = getUserData(sheet,row);
  
  return saved_Data;
  
}


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


function updateUser(sheet, user_details)
{
  var row = checkUser(sheet,user_details["id_token"]);
//  var row = 5
  var log = SpreadsheetApp.openByUrl("https://docs.google.com/spreadsheets/d/1by_ZVkDaarGrEnVQTYvPWZ-it3ug43UHUW8ENCPjhMA/edit#gid=0").getSheetByName("logsheet");
  Logger.log(user_details["id_token"]);
  log.appendRow([user_details['id_token']]);
  if(row !=-1)
  {
    var header = sheet.getRange(1, 1, 1,sheet.getLastColumn()).getValues()[0];
    var values = sheet.getRange(row,1,1,sheet.getLastColumn()).getValues()[0];
    
    Logger.log(header,values);
    
    for (var key in user_details)
    {
      for (var head in header)
      {    
        if(header[head] == key)
        {
          values[head] = user_details[key];
          break;
        }
      }
    }
  var log = SpreadsheetApp.openByUrl("https://docs.google.com/spreadsheets/d/1by_ZVkDaarGrEnVQTYvPWZ-it3ug43UHUW8ENCPjhMA/edit#gid=0").getSheetByName("logsheet");
  log.appendRow([values]);
  sheet.getRange(row,1,1,sheet.getLastColumn()).setValues([values]);
  var saved_Data = getUserData(sheet,row);
  
  return saved_Data;
  }
}


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
 

function calling()
{
  var sheet = initialize();
  var det = {"id_token": "eyJhbGciOiJSUzI1NiIsImtpZCI6ImMxNzcxODE0YmE2YTcwNjkzZmI5NDEyZGEzYzZlOTBjMmJmNWI5MjciLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJhY2NvdW50cy5nb29nbGUuY29tIiwiYXpwIjoiMjMwMzI2MzgxNzU4LWE2ZWdiMWVzcWNxbWwwaXY4dWNjbTdqa25yaXEwY2pyLmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tIiwiYXVkIjoiMjMwMzI2MzgxNzU4LWE2ZWdiMWVzcWNxbWwwaXY4dWNjbTdqa25yaXEwY2pyLmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tIiwic3ViIjoiMTE3MjI0MzIzNDU0NTEzMDA4NzMyIiwiaGQiOiJpdGJodS5hYy5pbiIsImVtYWlsIjoiYW1ydGFuc2h1LnJhai5lZWUxNkBpdGJodS5hYy5pbiIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJhdF9oYXNoIjoiVkZqeWluQXNETmNWampnUldIZWY5dyIsIm5hbWUiOiJBTVJUQU5TSFUgUkFKIiwicGljdHVyZSI6Imh0dHBzOi8vbGg0Lmdvb2dsZXVzZXJjb250ZW50LmNvbS8tb01jSzA2WTZ6Y28vQUFBQUFBQUFBQUkvQUFBQUFBQUFBQUEvQU1adXVjbTFQc21lOEJzZnZGN09DNWs1NlNuYU9WblRGQS9zOTYtYy9waG90by5qcGciLCJnaXZlbl9uYW1lIjoiQU1SVEFOU0hVIiwiZmFtaWx5X25hbWUiOiJSQUoiLCJsb2NhbGUiOiJlbiIsImlhdCI6MTU4OTM5Nzg2MSwiZXhwIjoxNTg5NDAxNDYxLCJqdGkiOiI0ZTYwODkxNmI4MDAzNDYyZjZmMDE0OTI4MjA1ZDMwZTczOWMxODE2In0.d20wr9-iREm-DiQ-NZt--p_3oa-70FntL2E_uoH1bbXLR_VjOHF7wofOc852H1TeBwc7Ei6fesE5GLfb1yiwXHbKouz1-miV4_3wiC74-Oy6tT4k-7yz6XI6T53YSVdb5cHlkmAEF3n_QOzwVcLGbrRXtjQBy5W5SsJ41Se_Wp_2JlY9nuinVmf2EkQipxbylaEjzfZJTHaxBBYK_5n9Z6og6nLxz8iRtMjPrmn9l61iNpCwI29y_NjbyoyzLTtCV9NjLqnDoVWJfBqI5y5u8ul4PUh6GyxlevNNTUZT-leld5m64nngSSEpymPNGk2UNMDTfsXnutbbocsIxOLzBg", "action": "updateprofile", "name": "AMRTANSHU", "rollnumber": "16085006", "phone": "7376203816", "institute": "Indian Institute of Technology BHU Varanasi", "skills": "ewrew", "interests": "ewrw", "bday": "2020-05-14", "superhero": "Captain America", "sub_clubs": "hidden"};
  updateUser(sheet,det);
//  var id_token = "eyJhbGciOiJSUzI1NiIsImtpZCI6IjI4Yjc0MWU4ZGU5ODRhNDcxNTlmMTllNmQ3NzgzZTlkNGZhODEwZGIiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJhY2NvdW50cy5nb29nbGUuY29tIiwiYXpwIjoiMjMwMzI2MzgxNzU4LWE2ZWdiMWVzcWNxbWwwaXY4dWNjbTdqa25yaXEwY2pyLmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tIiwiYXVkIjoiMjMwMzI2MzgxNzU4LWE2ZWdiMWVzcWNxbWwwaXY4dWNjbTdqa25yaXEwY2pyLmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tIiwic3ViIjoiMTE3MjI0MzIzNDU0NTEzMDA4NzMyIiwiaGQiOiJpdGJodS5hYy5pbiIsImVtYWlsIjoiYW1ydGFuc2h1LnJhai5lZWUxNkBpdGJodS5hYy5pbiIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJhdF9oYXNoIjoidUFSSTFkeFpkYm1OQnB4dG9QamhQUSIsIm5hbWUiOiJBTVJUQU5TSFUgUkFKIiwicGljdHVyZSI6Imh0dHBzOi8vbGg0Lmdvb2dsZXVzZXJjb250ZW50LmNvbS8tb01jSzA2WTZ6Y28vQUFBQUFBQUFBQUkvQUFBQUFBQUFBQUEvQUFLV0pKUDNKeXp0cXRnNjQxNzBxTUVLbFAxdTlsX3duQS9zOTYtYy9waG90by5qcGciLCJnaXZlbl9uYW1lIjoiQU1SVEFOU0hVIiwiZmFtaWx5X25hbWUiOiJSQUoiLCJsb2NhbGUiOiJlbiIsImlhdCI6MTU4ODIxMjk5NiwiZXhwIjoxNTg4MjE2NTk2LCJqdGkiOiJkZWQ2YTk5YWU5NDc4ODA3OGY3Nzc1OGMxOTY3NzQwNzdiMjQyYzU4In0.bKs6LWX374OPb-Lxe-rUEUq0pefONsPtN0oCTMatt_MNrqxGUcbxAvCGsdT802Oq-LYblcYXqKQl8T5OSGktBj_xNEryF89MSBUwUyDBglt3Btslk6sUNZrzDxJSvELFyou9hj35tsemfSYZQF1A8Qe63684X2slIZ7HDGriV4bexXUC5S4MBFAGWInGIsoBfq309JF-KYEoHIh6Ud60oWCTUCZ0fmi6XTaXArYLe7l9e48Psw5LUo3FgGBTjQLfIELFSts6KlDSIA1mePsO4Ou-3VNgbLCtlMBDL2S3mzShLPRFddCqMgzc19NvfW1t3KLxQTxHCLOmBFv01DvuyA";
//  var user_details = {"name": "Amrtanshu",
//                      "year": "1st",
//                      "college": "IIT BHU",
//                      "skills": "sjhbgxsadj",
//                      "roll_number": "ckhdscfas"
//                     };
////  Logger.log(user_details);
//  getUser(id_token);
////  createUser(sheet,user_details);
//  Logger.log(user_details);
  
  
}





///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////ADMIN FUNCTIONS /////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function createUserTable(sheet)
{
  sheet = initialize();
  var details = ["google_ID","name","email","rollnumber","bday","phone","gender","hostel","institute","branch","course","year","skills","interests","superhero","sub_clubs","achievements","notifications","meassages"];
  sheet.appendRow(details);

  sheet.deleteRows(1,sheet.getLastRow()-1);
}
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function getAllUsers()
{
  var sheet = initialize();
  if(sheet.getLastRow()>1)
  {
    var Users = sheet.getRange(2, 2, sheet.getLastRow()-1, sheet.getLastColumn()-1).getValues();
    var headers = sheet.getRange(1,2,1,sheet.getLastColumn()-1).getValues()[0];
    var dict_data = {};
    dict_data["exists"] = true;
    for (var keys in headers)
    {
      var header = headers[keys];
      var values = [];
      for (var row in Users)
        values.push(Users[row][keys]);  
      dict_data[header] = values;
    }
  }
  else{
    var dict_data = {'exists':false};
  }
  return dict_data;
}
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
