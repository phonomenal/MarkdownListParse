#! /usr/bin/env node

const core = require('@actions/core');
const github = require('@actions/github');
const { Octokit } = require("@octokit/action");


const HTMLParser = require('node-html-parser');

const fs = require('fs');

//inputs
//Set of header titles to use for issue and label creation
var headerStringInput = 'Security,B. CI,D. DevOps'; 

var headersToUse = headerStringInput.split(',');

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
  else if(headerTypes.indexOf(tagName) != 0)
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

const octokit = new Octokit();
const [owner, repo] = process.env.GITHUB_REPOSITORY.split("/");

//Iterate and create issues for header titles inputted
for(i = 0; i < itemList.length; i++)
{
  if(headersToUse.indexOf(itemList[i].label) >= 0)
  {
    for (j= 0; j < itemList[i].children.length; j++)
    {
      listItemValue = itemList[i].children[j].item;

      (async function () {
        await myAsyncMethodIssue(listItemValue).catch((e) => { console.error(e); process.exit(1) })
        console.log('This will not be printed.');
        })()
      console.log("Issue created for: " + listItemValue)
  
    }
  }

}


async function myAsyncMethodIssue (titleText) {
// See https://developer.github.com/v3/issues/#create-an-issue
  const { data } = await octokit.request("POST /repos/:owner/:repo/issues", {
    owner,
    repo,
    title: titleText,
    body: ""
  });

  console.log("Issue created: %d", data.html_url);
}


/* TO-DO: smart label creation 

(async function () {
  await myAsyncMethodLabel().catch((e) => { console.error(e); process.exit(1) })
  console.log('This will not be printed.');
  })()

async function myAsyncMethodLabel () {
  // See https://developer.github.com/v3/issues/#create-an-issue
    const { data } = await octokit.request("POST /repos/:owner/:repo/labels", {
      owner,
      repo,
      name: "label test async",
      description: "Something isn't working",
      color: "f29200"
    });
  
    console.log("Issue created: %d", data.html_url);
}

*/


console.log('New Issue and Label created!');