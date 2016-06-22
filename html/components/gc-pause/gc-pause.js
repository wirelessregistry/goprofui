import ko from "knockout"
import d3 from "d3"
import SocketManager from "goprofui/util/socket-manager"
import Template from "./gc-pause.html!system-text"
import ListFactory from "goprofui/util/list-factory"
import "./gc-pause.less!"

class ViewModel {
  constructor(params) {

    this.monitorIp = params.monitorIp || ko.observable('');
    this.manager = new SocketManager();
    this.monitoring = params.monitoring || ko.observable(false);
    this.showCharts = ko.observable(true);

    this.gcHistory = ko.observable(new ListFactory(10));
    this.gcTimeHistory = ko.observable(new ListFactory(10));

    this.gcBucket = {};
    this.gcGroups = {
        'gc': {
          key: 'GC Pause',
          value: 0,
          color: 'blue',
          data: d3.range(60).map(function() {
            return 0
          })
        }
      }
    this.gcData = ko.observable({'gc': 0});

    this.monitoringWatch = this.monitoring.subscribe((monitoring)=>{
      
      if (!monitoring) {
        this.manager.DisconnectAll();
        this.gcGroups['gc'].data = d3.range(60).map(function() {
          return 0
        });
        return;
      }

      this.showCharts(false);
      this.gcHistory().clear();
      this.gcTimeHistory().clear();

      let lastNotableGc = 0;
      let start = new Date().getTime();
      let end = false;

      this.manager.Connect(`ws://${this.monitorIp()}/gc`, (e)=>{
        let store = this.gcHistory().store;
        let splitData = e.data.split(',');
        let obj = {
          'gc': parseInt(splitData[0])/1000
        }

        //if we get the same gc pause length
        //render a flat line
        if (obj.gc == lastNotableGc) {
          obj.gc = 0;

        //Otherwise render the new data point
        } else {
          lastNotableGc = obj.gc;
          this.gcHistory().push(obj.gc);

          if(!end) {
            end = new Date().getTime();
            this.gcTimeHistory().push('--');
          } else {
            end = new Date().getTime();
            this.gcTimeHistory().push(end - start);
          }

          this.gcHistory.valueHasMutated();
          this.gcTimeHistory.valueHasMutated();

          start = new Date().getTime();
        }

        this.gcData(obj);
      });

      setTimeout(()=>this.showCharts(true), 100)
    });
  }

  dispose() {
    this.monitoringWatch.dispose();
  }
}

export { Template, ViewModel }
