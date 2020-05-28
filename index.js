#! /usr/bin/env node

const core = require('@actions/core');
const github = require('@actions/github');

const HTMLParser = require('node-html-parser');

const fs = require('fs');

//inputs
//Set of header titles to use for issue and label creation
var headersToUse = ['Security']; 

const mdFileName = core.getInput('markdown-file');
//var mdFileName = 'demo.md';

var headerTypes = ['h2', 'h3', 'h4'];
var listTypes = ['ol', 'ul'];


try {
    var readMe = fs.readFileSync(mdFileName, 'utf8')
  } catch (err) {
    console.error(err)
}

var MarkdownIt = require('markdown-it'),
    md = new MarkdownIt();
var result = md.render(readMe);

const root = HTMLParser.parse(result);

var rootChildren = root.childNodes;

//Splice out any parsed whitespace
for (var i = rootChildren.length - 1; i >= 0; --i) {
    if (rootChildren[i].isWhitespace == true) {
        rootChildren.splice(i,1);
    }
}

var itemList = [];

var headerJson = {};  
headerJson.children=[];

for(i = 0; i < rootChildren.length; i++)
{
  var tagName = rootChildren[i].tagName;

  //If tag is within our headerTypes
  if (headerTypes.indexOf(tagName) >=0)
  {
    itemNum = i.toString();
    headerJson['label'] = rootChildren[i].innerHTML;
  }
  //Parse through items inside <ol> tag
  else if(headerTypes.indexOf(tagName) != 0 && listTypes.indexOf(tagName) >= 0)
  {
    var childList = rootChildren[i].childNodes;

    for(j = 0; j < rootChildren[i].childNodes.length; j++)
    {
      if(childList[j].tagName == "li")
      {

        headerJson.children.push({item: rootChildren[i].childNodes[j].structuredText})
    
      }
      else if(j == childList.length - 1)
      {
          //Push current header and list items
          itemList.push(headerJson);

          //Clear object for next section
          headerJson = {};
          headerJson.children=[];

      }
    }
  }
}
console.log(" ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
console.log("| ...MarkDown Parsing Finished... |");
console.log(" ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
console.log("");

//Markdown Items placed into list of objects
console.log("Number of tag sets Parsed: " + itemList.length);
console.log("----------------------------");
console.log("");



for(i = 0; i < itemList.length; i++)
{
  console.log(itemList[i].label);

  for (j= 0; j < itemList[i].children.length; j++)
  {
    console.log("   " + itemList[i].children[j].item)

  }
}

const githubToken = core.getInput('repo-token');

var client = github.client(githubToken);

client.get('/user', {}, function (err, status, body, headers) {
  console.log(body); //json object
})

var ghrepo = client.repo('/James-LeHa/MarkdownListParse');

ghrepo.issue({
  "title": "Found a bug",
  "body": "I'm having a problem with this.",
  "assignee": "octocat",
  "milestone": 1,
  "labels": ["Label1", "Label2"]
}, callback); //issue

console.log('New Issue created!')