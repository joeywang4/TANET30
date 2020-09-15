const fs = require('fs');
const Event = require("../models/event");

const rename = async () => {
  const failedAry = [];
  const solvedEvent = {};

  async function copyAndRename(orgPath, eventId, authorId) {
    const desPath = `./authors/filesInId/${eventId}`
    return await fs.promises.mkdir(desPath, { recursive: false })
      .then( () => {
        fs.copyFile(orgPath, `${desPath}/${eventId}${authorId}.txt`, (err) => {
          if(err) throw err;
        })
        return true;
      })
      .catch(err => {
        if(err.errno === -4075) {
          fs.copyFile(orgPath, `${desPath}/${eventId}${authorId}.txt`, (err) => {
            if(err) throw err;
          })
          return true;
        }
        return false;
      })
  }

  async function nameToId(path, event=null) {
    const dir = await fs.promises.opendir(path);
    for await (const dirent of dir) {
      // console.log(dirent.name);
      if(dirent.isDirectory()){
        await Event.findOne({name: dirent.name})
          .populate({
            path: 'author',
            select: '_id name email',
            populate: {
              path: 'author'
            }
          })
          .then(async event => {
            await nameToId(`${path}/${dirent.name}`, event);
          })
          .catch(err => {
            failedAry.push({event: dirent.name, name: null, type: 'event not found'});
            console.log(err);
          });
      }
      else {
        if(!event) {
          failedAry.push({event: null, name: dirent.name, type: 'unsorted'});
          continue;
        }
        const authors = [...event.author];
        const response = await Promise.all( authors.map( async (author) => {
          try {
            const data = await fs.promises.readFile(`${path}/${dirent.name}`);
            const lines = data.toString().split('\n');
            if (lines[0].trim() === author.email) {
              if (lines[1].trim() !== event.name) {
                failedAry.push({event: event.name, name: dirent.name, type: 'wrong event name'});
                return 0;
              }
              const status = await copyAndRename(`${path}/${dirent.name}`, event._id, author._id);
              return status ? 1 : -1;
            }
            return null;
          } catch (error) {
            throw (error);
          }
        }) );
        if(response.filter( val => val !== null ).length === 0) {
          failedAry.push({event: event.name, name: dirent.name, type: 'wrong author email or not in the event'});
        }
        else {
          solvedEvent[event.name] = solvedEvent[event.name] ? solvedEvent[event.name].map( (val, idx) => (val===null ? response[idx] : val) ) : response;
        }
      }  
    }
  }

  await nameToId('./authors/filesInName')
  console.log(failedAry);
  console.log(solvedEvent);
  return failedAry;
}


module.exports = rename;