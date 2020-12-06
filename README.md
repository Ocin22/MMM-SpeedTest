# MMM-SpeedTest

## sample config:

```
    {
      module: 'MMM-SpeedTest',
      position: 'top_center',
      configDeepMerge: true,
      disabled : false,
      config: {
        debug: false,
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
        ping: {
          display: true,
          title: "Ping",
          scale: 100
        },
        informations: true,
        server: {
          preferedId: null,
          acceptLicense: true,
          acceptGdpr: true
        }
      }
    },
