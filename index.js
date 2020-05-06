var HTMLParser = require('node-html-parser');

const fs = require('fs');

try {
    var readMe = fs.readFileSync('demo.md', 'utf8')
    console.log(data)
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

var headerJson = {};  
headerJson.children=[];

for(i = 0; i < rootChildren.length; i++)
{

  if (rootChildren[i].tagName == "h4" || rootChildren[i].tagName == "h3")
  {
    jsonString+= "\n Label: " + rootChildren[i].innerHTML; 
    itemNum = i.toString();
    headerJson['label'] = rootChildren[i].innerHTML;
  }
  //Parse through items inside <ol> tag
  else if(rootChildren[i].tagName == "ol")
  {
    for(j = 0; j < rootChildren[i].childNodes.length; j++)
    {
      if(rootChildren[i].childNodes[j].tagName == "li")
      {
        jsonString += "\n" + rootChildren[i].childNodes[j].innerHTML;

        headerJson.children.push({item: rootChildren[i].childNodes[j].innerHTML})
    
      }
    }

  }  
}

var jsonCompiled = JSON.stringify(headerJson);

console.log(jsonCompiled);