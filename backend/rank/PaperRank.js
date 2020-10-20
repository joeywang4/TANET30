const Rank = require("./Rank");
const Paper = require("../models/paper");
const Like = require("../models/like");

class PaperRank extends Rank {
  get = () => this.rank;

  sort = () => {
    // Calculate score
    for(let like of this.likes) {
      const { state: score, paper: paperId } = like;
      this.papers[paperId].score += score;
    }
    // Group papers
    const group_to_papers = {};
    for(let paper of Object.values(this.papers)) {
      if(!(paper.group in group_to_papers)) {
        group_to_papers[paper.group] = [];
      }
      group_to_papers[paper.group].push(paper);
    }
    // Sort papers
    for(let group in group_to_papers) {
      this.rank[group] = group_to_papers[group].sort((paperA, paperB) => paperB.score - paperA.score).slice(0, 10);
    }
    if (Rank.io) Rank.io.emit("new-paper-rank", this.rank);
    this.running = false;
  }

  update = async () => {
    if (this.running) return;
    this.running = true;

    // Update data
    const papers = await Paper.find().then(papers => papers).catch(() => {
      this.logError("Get papers error");
    })
    const likes = await Like.find().then(likes => likes).catch(() => {
      this.logError("Get likes error");
    })
    if (!papers || !likes) {
      this.running = false;
      return;
    }
    const id_to_paper = {};
    papers.map(paper => {id_to_paper[paper._id] = {...(paper._doc), score: 0 };});
    this.papers = id_to_paper;
    this.likes = likes;
    this.sort();
  }

  constructor() {
    super();
    this.rank = {};
  }
}

module.exports = PaperRank;