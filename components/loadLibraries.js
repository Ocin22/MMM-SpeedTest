/** Load sensible library without black screen **/
var log = (...args) => { /* do nothing */ }

function libraries(that) {
  if (that.config.debug) log = (...args) => { console.log("[SPEED] [LIB]", ...args) }
  let libraries= [
    // { "library to load" : "store library name" }
    { "speedtest-net": "speedtest" }
  ]
  let errors = 0
  return new Promise(resolve => {
    libraries.forEach(library => {
      for (const [name, configValues] of Object.entries(library)) {
        let libraryToLoad = name
        let libraryName = configValues

        try {
          if (!that.lib[libraryName]) {
            that.lib[libraryName] = require(libraryToLoad)
            log("Loaded:", libraryToLoad, "->", "this.lib."+libraryName)
          }
        } catch (e) {
          console.error("[SPEED] [LIB]", libraryToLoad, "Loading error!" , e.toString())
          that.sendSocketNotification("WARNING" , {library: libraryToLoad }) // <-- display warning if library not loaded
          errors++
          that.lib.error = errors
        }
      }
    })
    resolve(errors) // <-- return number of errors
    if (!errors) console.log("[SPEED] [LIB] All libraries loaded!")
  })
}

async function load(that) {
  let bugsounet = await libraries(that) // <-- load library and store errors number
  if (bugsounet) { // if errors => display console error
    console.error("[SPEED] [LIB] Warning:", bugsounet, "needed library not loaded !")
    console.error("[SPEED] [LIB] Try to solve it with `npm run rebuild` in MMM-SpeedTest directory")
  }
}

exports.libraries = libraries
exports.load = load
