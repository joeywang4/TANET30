const Rank = require("./Rank");
const TX = require("../models/transaction");
const User = require("../models/user");

class RichRank extends Rank {
  get = () => this.rank;

  sort = () => {
    // Calculate money
    const id_to_money = {};
    const balence = id => id_to_money[id] ? id_to_money[id] : 0;
    for (let tx of this.TXs) {
      const {_id: from, to, amount} = tx;
      // Calculate the max amount of money
      // id_to_money[from] = balence(from) - amount;
      id_to_money[to] = balence(to) + amount;
    }

    // Calculate ranking
    const newRank = [];
    for(let id in id_to_money) {
      if (!this.Users[id]) continue;
      newRank.push({'name': this.Users[id], 'amount': id_to_money[id]});
    }
    this.rank = newRank.sort((a, b) => b.amount - a.amount);
    this.running = false;
  }

  update = async () => {
    if (this.running) return;
    this.running = true;

    // Update data
    const TXs = await TX.find().then(TXs => TXs).catch(() => {
      this.logError("Get transactions error");
    })
    const Users = await User.find({'group': 'user'}, 'name').then(users => users).catch(() => {
      this.logError("Get users error");
    })
    if (!TXs || !Users) {
      this.running = false;
      return;
    }
    const id_to_username = {};
    Users.map(user => {id_to_username[user._id] = user.name;});
    this.TXs = TXs;
    this.Users = id_to_username;
    this.sort();
  }

  constructor() {
    super();
    this.rank = [];
  }
}

module.exports = RichRank;