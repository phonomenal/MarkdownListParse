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

var jsonString = "";

for(i = 0; i < rootChildren.length; i++)
{
  if (rootChildren[i].tagName == "h4")
  {
  jsonString+= "Label: " + rootChildren[i].innerHTML;
  }
  else if(rootChildren[i].tagName == "ol")
  {
    for(j = 0; j < rootChildren[i].childNodes.length; j++)
    {
      if(rootChildren[i].childNodes[j].tagName == "li")
      {
        jsonString += "\n" + rootChildren[i].childNodes[j].innerHTML;
    
      }
    }

  }  
}