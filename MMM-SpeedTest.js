/*
 * Module: MMM-SpeedTest
 * 
 * @bugsounet
 */

Module.register("MMM-SpeedTest",{
  defaults : {
    debug: false,
    maxTime: "20s",
    update: "1h",
    colored: true,
    download: {
      title: "Download Speed",
      scale: 100
    },
    upload: {
      display: true,
      title: "Upload Speed",
      scale: 100
    },
    informations: true
  },

  start : function(){
    this.download = null
    this.updload = null
    this.ping = null
    this.config.maxTime = this.getUpdateTime(this.config.maxTime)
    this.sendSocketNotification("INIT", this.config)
  },

  getScripts: function(){
      return [this.file("resources/justgage.js"),this.file("resources/raphael-2.1.4.min.js"),this.file("resources/jquery.js")]
  },

  getStyles: function(){
      return ["MMM-SpeedTest.css"]
  },

  notificationReceived: function (noti, payload) {
    if (noti == "DOM_OBJECTS_CREATED") {
      this.PrepareDisplay()
      this.sendSocketNotification('CHECK',this.config)
    }
  },

  socketNotificationReceived: function(notification, payload) {
    if (notification == "DOWNLOAD") {
      console.log("DOWNLOAD", payload, "Mbps")
      this.DisplayReset()
      this.download.refresh(payload)
    }
    if (notification == "UPLOAD") {
      console.log("UPLOAD", payload, "Mbps")
      if (this.config.upload.display) this.upload.refresh(payload)
    }
    if (notification == 'DATA') {
      console.log("DATA:", payload)
      if (this.config.informations) this.DisplayData(payload)
      this.DisplayFooter()
    }
  },

  getDom: function(){
    var wrapper = document.createElement("div")
    wrapper.id = "ST_Contener"
    
    var download = document.createElement("div")
    download.id = 'ST_Download'
    wrapper.appendChild(download)

    if (this.config.informations) {
      var upload = document.createElement("div")
      upload.id = 'ST_Upload'
      wrapper.appendChild(upload)
    }

    if (this.config.informations) {
      var data = document.createElement("div")
      data.id = "ST_Data"
      data.classList.add("hidden")
      
      var ISP = document.createElement("div")
      ISP.id = "ST_ISP"
      var ISP_MARK = document.createElement("div")
      ISP_MARK.id = "ST_ISP_MARK"
      ISP_MARK.textContent = "ISP:"
      var ISP_CONTENT = document.createElement("div")
      ISP_CONTENT.id = "ST_ISP_CONTENT"
      ISP.appendChild(ISP_MARK)
      ISP.appendChild(ISP_CONTENT)
  
      var Server = document.createElement("div")
      Server.id = "ST_Server"
      var Server_MARK = document.createElement("div")
      Server_MARK.id = "ST_Server_MARK"
      Server_MARK.textContent = "Server:"
      var Server_CONTENT = document.createElement("div")
      Server_CONTENT.id = "ST_Server_CONTENT"
      Server.appendChild(Server_MARK)
      Server.appendChild(Server_CONTENT)
  
      var Location = document.createElement("div")
      Location.id = "ST_Location"
      var Location_MARK = document.createElement("div")
      Location_MARK.id = "ST_Location_MARK"
      Location_MARK.textContent = "Location:"
      var Location_CONTENT = document.createElement("div")
      Location_CONTENT.id = "ST_Location_CONTENT"
      Location.appendChild(Location_MARK)
      Location.appendChild(Location_CONTENT)
  
      var Distance = document.createElement("div")
      Distance.id = "ST_Distance"
      var Distance_MARK = document.createElement("div")
      Distance_MARK.id = "ST_Distance_MARK"
      Distance_MARK.textContent = "Distance:"
      var Distance_CONTENT = document.createElement("div")
      Distance_CONTENT.id = "ST_Distance_CONTENT"
      Distance.appendChild(Distance_MARK)
      Distance.appendChild(Distance_CONTENT)
  
      data.appendChild(ISP)
      data.appendChild(Server)
      data.appendChild(Location)
      data.appendChild(Distance)
      wrapper.appendChild(data)
    }

    var LastTest = document.createElement("div")
    LastTest.id = "ST_LastTest"
    LastTest.className= "date"
    wrapper.appendChild(LastTest)

    return wrapper
  },

  PrepareDisplay: function(){
    let opts = {
      value: 0,
      min: 0,
      refreshAnimationType: "linear",
      gaugeWidthScale: "0.8",
      valueFontColor: "#fff",
      valueFontFamily: "Roboto Condensed",
      titleFontFamily: "Roboto Condensed",
      titleFontColor: "#aaa",
      symbol: " Mbps"
    }

    let downOpts = {
      id: "ST_Download",
      max: this.config.download.scale,
      title: this.config.download.title
    }

    let upOpts = {
      id: "ST_Upload",
      max: this.config.upload.scale,
      title: this.config.upload.title
    }

    let noColor = {
      hideMinMax: true,
      gaugeColor: "#000",
      levelColors: ["#fff"],
      hideInnerShadow: true
    }

    if (!this.config.colored) opts = Object.assign({}, noColor, opts)
    downOpts = Object.assign({}, opts, downOpts)
    this.download = new JustGage(downOpts)

    if (this.config.upload.display) {
      upOpts = Object.assign({}, opts, upOpts)
      this.upload =new JustGage(upOpts)
    }
  },

  DisplayData: function(payload) {
    var data = document.getElementById("ST_Data")
    var ISP = document.getElementById("ST_ISP_CONTENT")
    var Server = document.getElementById("ST_Server_CONTENT")
    var Location = document.getElementById("ST_Location_CONTENT")
    var Distance = document.getElementById("ST_Distance_CONTENT")

    data.classList.remove("hidden")
    ISP.textContent = payload.client.isp
    Server.textContent = payload.server.host
    Location.textContent = payload.server.location  + " (" + payload.server.country + ")"
    if (config.units == "metric") Distance.textContent =  payload.server.distance + " km"
    else Distance.textContent =  payload.server.distanceMi + " miles"
  },

  DisplayReset: function() {
    if (this.config.informations) {
      var data = document.getElementById("ST_Data")
      var ISP = document.getElementById("ST_ISP_CONTENT")
      var Server = document.getElementById("ST_Server_CONTENT")
      var Location = document.getElementById("ST_Location_CONTENT")
      var Distance = document.getElementById("ST_Distance_CONTENT")
  
      data.classList.add("hidden")
      ISP.textContent = ""
      Server.textContent = ""
      Location.textContent = ""
      Distance.textContent = ""
    }
    var TestDate = document.getElementById("ST_LastTest")
    TestDate.textContent = "Checking..."
    if (this.config.upload.display) this.upload.refresh("0")
  },

  DisplayFooter() {
    var TestDate = document.getElementById("ST_LastTest")
    TestDate.textContent = "Last Update: " + new Date().toLocaleDateString(config.language, {year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" })
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
