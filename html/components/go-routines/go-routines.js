import ko from "knockout"
import d3 from "d3"
import SocketManager from "goprofui/util/socket-manager"
import ListFactory from "goprofui/util/list-factory"
import Template from "./go-routines.html!system-text"
import "./go-routines.less!"

class ViewModel {
  constructor(params) {
    this.monitorIp = params.monitorIp || ko.observable('');
    this.manager = new SocketManager();
    this.monitoring = params.monitoring || ko.observable(false);
    this.showCharts = ko.observable(true);
    this.goHistory = ko.observable(new ListFactory(6));
    this.goRoutineBucket = {};
    this.goRoutineGroups = {
        'go': {
          key: 'Go Routines',
          value: 0,
          color: 'blue',
          data: d3.range(60).map(function() {
            return 0
          })
        }
      }
    this.goRoutineData = ko.observable({'go': 0});

    this.monitoringWatch = this.monitoring.subscribe((monitoring)=>{
      if (!monitoring) {
        this.manager.DisconnectAll();
        
        this.goRoutineGroups['go'].data = d3.range(60).map(function() {
          return 0
        });

        return;
      }

      this.showCharts(false);
      this.goHistory().clear();

      this.manager.Connect(`ws://${this.monitorIp()}/goroutines`, (e)=>{
        let splitData = e.data.split(',');
        let obj = {
          'go': parseInt(splitData[0])
        }
        this.goHistory().push(obj.go);
        this.goHistory.valueHasMutated();
        this.goRoutineData(obj);
      });

      setTimeout(()=>this.showCharts(true), 100)
    });
  }

  dispose() {
    this.monitoringWatch.dispose();
  }
}

export { Template, ViewModel }
