class Rank {
  get() {
    // Get ranking
    console.error("[!] Calling abstract method");
  }

  sort() {
    // Sort ranking
    console.error("[!] Calling abstract method");
  }

  update() {
    // Update data
    console.error("[!] Calling abstract method");
  }

  log = (args) => {
    console.log(args);
  }

  logError = (args) => {
    console.error(args);
  }

  constructor() {
    this.lastUpdate = 0;
    this.timeUsage = 0;
    this.running = false;
  }
}


module.exports = Rank; 
