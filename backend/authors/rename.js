const express = require("express");
const fs = require('fs');
const Event = require("../models/event");
const User = require("../models/user");
const TX = require("../models/transaction");
const Like = require("../models/like");
const { listeners } = require("process");
const { copy } = require("../routes/api");
const { fail } = require("assert");

const rename = async () => {
  const failedAry = [];

  async function copyAndRename(orgPath, eventId, authorId) {
    const desPath = `./authors/filesInId/${eventId}`
    console.log(`desPath: ${desPath}`);
    fs.exists(desPath, (exists) => {
      if(!exists) {
        fs.mkdir(desPath, { recursive: false }, (err) => {
          if (err) throw err;
          fs.copyFile(orgPath, `${desPath}/${eventId}${authorId}.txt`, (err) => {
            if(err) throw err;
          })
        });
        return;
      }
      fs.copyFile(orgPath, `${desPath}/${eventId}${authorId}.txt`, (err) => {
        if(err) throw err;
      })
    });
    
  }

  async function nameToId(path, event=null) {
    const dir = await fs.promises.opendir(path);
    for await (const dirent of dir) {
      if(dirent.isDirectory()){
        Event.findOne({name: dirent.name})
          .populate({
            path: 'author',
            select: '_id name email',
            populate: {
              path: 'author'
            }
          })
          .then(event => {
            console.log(event._id);
            nameToId(`${path}/${dirent.name}`, event);
          })
          .catch(err => {
            console.log({event: dirent.name, name: null, type: 'event not found'})
            failedAry.push({event: dirent.name, name: null, type: 'event not found'});
            console.log(err);
          });
      }
      else {
        if(!event) {
          console.log({event: null, name: dirent.name, type: 'unsorted'});
          failedAry.push({event: null, name: dirent.name, type: 'unsorted'});
          return;
        }
        const authors = [...event.author];
        authors.map( (author) => {
          fs.promises.readFile(`${path}/${dirent.name}`)
          .then((data) => {
            const lines = data.toString().split('\n');
            // console.log(lines, lines[0].slice(13).trim(), lines[1].slice(12).trim(), lines[2].slice(11).trim());
            if (lines[0].slice(13).trim() === author.email) {
              if(lines[1].slice(12).trim() !== author.name) {
                console.log({event: event.name, name: dirent.name, type: 'wrong author name'});
                failedAry.push({event: event.name, name: dirent.name, type: 'wrong author name'});
                return;
              }
              if (lines[2].slice(11).trim() !== event.name) {
                console.log({event: event.name, name: dirent.name, type: 'wrong event name'});
                failedAry.push({event: event.name, name: dirent.name, type: 'wrong event name'});
                return;
              }
              copyAndRename(`${path}/${dirent.name}`, event._id, author._id);
            }
          })
          .catch((err)=> {
            console.log(err);
          })
        });
      }
    }
    return true;
  }

  await nameToId('./authors/filesInName')
  console.log(failedAry);
  return failedAry;
}



module.exports = rename;