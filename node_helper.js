/*
 * Module: MMM-SpeedTest
 * 
 * @bugsounet
 */

var NodeHelper = require('node_helper');
var speedtest = require('speedtest-net');

let log = (...args) => { /* do nothing */ }

module.exports = NodeHelper.create({
  start: function(){
    console.log("[SPEED] MMM-SpeedTest Version:", require('./package.json').version)
    this.config = null
    this.interval = null
  },

  socketNotificationReceived : function(notification, payload){
    if (notification == "INIT") {
      this.config= payload
      this.config.update= this.getUpdateTime(this.config.update)
      if (this.config.debug) log = (...args) => { console.log("[SPEED]", ...args) }
    }
    if (notification == 'CHECK') this.check()
  },

  check() {
    console.log("[SPEED] Check SpeedTest")
    var st = speedtest({maxTime: this.config.maxTime})
    st.on("downloadspeedprogress", speed => {
      this.sendSocketNotification("DOWNLOAD", speed.toFixed(2))
      log("Upload:", speed.toFixed(2))
    })

    st.on("uploadspeedprogress", speed => {
      this.sendSocketNotification("UPLOAD", speed.toFixed(2))
      log("Download:", speed.toFixed(2))
    })

    st.on("data", data => {
      this.sendSocketNotification("DATA",data)
    })

    st.on("error", error => {
      console.log("[SPEED] error " + error)
    })

    this.scheduleUpdate()
  },

  /** update process **/
  scheduleUpdate: function() {
    if (this.config.update < 60*1000) this.config.update = 60*1000
    clearInterval(this.interval)
    log("Update Programmed")
    this.interval = setInterval(() => {
      log("Update...")
      this.check()
    }, this.config.update)
  },

  /** convert h m s to ms **/
  getUpdateTime: function(str) {
    let ms = 0, time, type, value
    let time_list = ('' + str).split(' ').filter(v => v != '' && /^(\d{1,}\.)?\d{1,}([wdhms])?$/i.test(v))

    for(let i = 0, len = time_list.length; i < len; i++){
      time = time_list[i]
      type = time.match(/[wdhms]$/i)

      if(type){
        value = Number(time.replace(type[0], ''))

        switch(type[0].toLowerCase()){
          case 'w':
            ms += value * 604800000
            break
          case 'd':
            ms += value * 86400000
            break
          case 'h':
            ms += value * 3600000
            break
          case 'm':
            ms += value * 60000
            break
          case 's':
            ms += value * 1000
          break
        }
      } else if(!isNaN(parseFloat(time)) && isFinite(time)){
        ms += parseFloat(time)
      }
    }
    return ms
  },

});

