import ko from 'knockout'
import SocketManager from "goprofui/util/socket-manager"

class ViewModel {
  constructor() {
    this.monitorIp = ko.observable('');
    this.monitoring = ko.observable(false);
    this.profiling = ko.observable(false);
    this.monitorCounter = ko.observable('');
    this.profileCounter = ko.observable('');

    this.profilingStatus = ko.pureComputed(function() {
      return this.profiling() ? 'Stop Profiling': 'Profile';
    }, this);
    this.monitoringStatus = ko.pureComputed(function() {
      return this.monitoring() ? 'Stop Monitor': 'Monitor';
    }, this);
  }

  toggleMonitor(){
    clearInterval(this.monitorInterval)
    this.monitoring(!this.monitoring())
    if(this.monitoring()) {
      let tick = 0;
      this.monitorInterval = setInterval(()=>{
        this.monitorCounter(tick+=1);
      },1000);
    }
  }

  toggleProfiling(){
    clearInterval(this.profileInterval)
    this.profiling(!this.profiling())
    if(this.profiling()) {
      let tick = 0;
      this.profileInterval = setInterval(()=>{
        this.profileCounter(tick+=1);
      },1000);
    }
  }

}

export default ViewModel