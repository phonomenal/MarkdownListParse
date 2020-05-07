#! /usr/bin/env node

const HTMLParser = require('node-html-parser');

const fs = require('fs');

var headerList = ['h2', 'h3', 'h4'];

try {
    var readMe = fs.readFileSync('demo.md', 'utf8')
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

var jsonString = "";

var itemList = [];

var headerJson = {};  
headerJson.children=[];

for(i = 0; i < rootChildren.length; i++)
{
  var tagName = rootChildren[i].tagName;

  //If tag is within our headerlist
  if (headerList.indexOf(tagName) >=0)
  {
    jsonString+= "\n Label: " + rootChildren[i].innerHTML; 
    itemNum = i.toString();
    headerJson['label'] = rootChildren[i].innerHTML;
  }
  //Parse through items inside <ol> tag
  else if(headerList.indexOf(tagName) != 0 && rootChildren[i].tagName == "ol")
  {
    var childList = rootChildren[i].childNodes;

    for(j = 0; j < rootChildren[i].childNodes.length; j++)
    {
      if(childList[j].tagName == "li")
      {
        jsonString += "\n" + childList[j].innerHTML;

        headerJson.children.push({item: rootChildren[i].childNodes[j].innerHTML})
    
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

console.log("MarkDown Parsing Finished...");
//Markdown Items placed into list of objects
console.log("Number of Headers Parsed: " + itemList.length);