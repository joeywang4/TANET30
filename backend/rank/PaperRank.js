const Rank = require("./Rank");

class PaperRank extends Rank {
  get() {
    // Get ranking
    console.error("[!] Calling abstract method");
  }

  sort() {
    // Sort ranking
    console.error("[!] Calling abstract method");
  }

  update = () => {
    // Update data
    // console.error("[*] Paper updates");
  }

  constructor() {
    super();
  }
}

module.exports = PaperRank;