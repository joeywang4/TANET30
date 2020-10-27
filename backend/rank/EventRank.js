const Rank = require("./Rank");
const Event = require("../models/event");

class EventRank extends Rank {
  get = () => this.rank;
  getSeminar = () => this.seminarRank;
  getCompany = () => this.companyRank;
  getGame = () => this.gameRank;

  isCompany = user => user.group === "company" && !user.email.startsWith("game");
  isGame = user => user.group === "company" && user.email.startsWith("game");
  shortName = name => {
    const dayIdx = name.indexOf("_Day");
    return dayIdx === -1?name:name.substring(0, dayIdx);
  }
  today = () => {
    const d = new Date();
    const dtf = new Intl.DateTimeFormat('en', { year: 'numeric', month: '2-digit', day: '2-digit' });
    const [{ value: mm },,{ value: dd },,{ value: yy }] = dtf.formatToParts(d);
    return `${yy}-${mm}-${dd}`;
  }

  sort = () => {
    // Sort events
    this.rank = this.events.sort((eventA, eventB) => eventB.participant - eventA.participant);
    this.seminarRank = this.rank.filter(event => event.admin.group === 'seminarStaff').slice(0, 10);
    this.companyRank = this.rank.filter(event => this.isCompany(event.admin)).slice(0, 10);
    this.gameRank = this.rank.filter(event => this.isGame(event.admin)).slice(0, 10);
    if (Rank.io) {
      Rank.io.emit("new-event-rank", this.rank);
      Rank.io.emit("new-seminar-rank", this.seminarRank);
      Rank.io.emit("new-company-rank", this.companyRank);
      Rank.io.emit("new-game-rank", this.gameRank);
    }
    this.running = false;
  }

  update = async () => {
    if (this.running) return;
    this.running = true;

    // Update data
    const events = await Event.find()
    .populate('admin', "_id name email group sector")
    .then(events => events)
    .catch(() => {
      this.logError("EventRank: Get events error");
    })
    if (!events) {
      this.running = false;
      return;
    }
    this.events = events.map(event => ({ ...(event._doc), name: this.shortName(event.name), participant: event.participant.length }))
    .filter(event => event.participant !== 0)
    .filter(event => event.date === this.today());
   this.sort();
  }

  constructor() {
    super();
    this.rank = [];
    this.seminarRank = [];
    this.companyRank = [];
    this.gameRank = [];
  }
}

module.exports = EventRank; 
