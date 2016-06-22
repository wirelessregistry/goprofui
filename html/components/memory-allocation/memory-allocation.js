import ko from "knockout"
import d3 from "d3"
import ListFactory from "goprofui/util/list-factory"
import SocketManager from "goprofui/util/socket-manager"
import "goprofui/bindings/ko.linechart"
import Template from "./memory-allocation.html!system-text"
import "./memory-allocation.less!"

class ViewModel {
  constructor(params) {
    this.monitorIp = params.monitorIp || ko.observable('');
    this.manager = new SocketManager();
    this.monitoring = params.monitoring || ko.observable(false);
    this.showCharts = ko.observable(true);
    this.memHistory = ko.observable({
      'system': new ListFactory(6),
      'allocated': new ListFactory(6),
      'idle': new ListFactory(6),
      'released': new ListFactory(6)
    });

    this.memoryBucket = {};
    this.memoryGroups = {
      'system': {
        key: 'Requested',
        value: 0,
        color: 'blue',
        data: d3.range(60).map(function() {
          return 0
        })
      },
      'allocated': {
        key: 'In Use',
        value: 0,
        color: 'red',
        data: d3.range(60).map(function() {
          return 0
        })
      },
      'idle': {
        key: 'Idle',
        value: 0,
        color: 'grey',
        data: d3.range(60).map(function() {
          return 0
        })
      },
      'released': {
        key: 'Released',
        value: 0,
        color: 'green',
        data: d3.range(60).map(function() {
          return 0
        })
      }
    };
    this.memoryData = ko.observable({
      'system': 0,
      'allocated': 0,
      'idle': 0,
      'released': 0
    });

    this.monitoringWatch = this.monitoring.subscribe((monitoring)=>{
      if (!monitoring) {
        this.manager.DisconnectAll();
        for (var k in this.memoryGroups) {
          this.memoryGroups[k].data = d3.range(60).map(function() {
            return 0
          })
          this.memoryGroups[k].value = 0;
        }
        return;
      }

      this.showCharts(false);
      this.memHistory().system.clear();
      this.memHistory().allocated.clear();
      this.memHistory().idle.clear();
      this.memHistory().released.clear();

      
      this.manager.Connect(`ws://${this.monitorIp()}/memory`, (e)=>{
        var splitData = e.data.split(',');
        var obj = {
          'system': splitData[0]/1000,
          'allocated': splitData[1]/1000,
          'idle': splitData[2]/1000,
          'released': splitData[3]/1000
        }
        this.memHistory().system.push(obj.system);
        this.memHistory().allocated.push(obj.allocated);
        this.memHistory().idle.push(obj.idle);
        this.memHistory().released.push(obj.released);
        this.memHistory.valueHasMutated();
        this.memoryData(obj);
      });

      setTimeout(()=>this.showCharts(true), 100)
    });

  }

  dispose () {
    this.monitoringWatch.dispose();
  }
}

export { Template, ViewModel }
