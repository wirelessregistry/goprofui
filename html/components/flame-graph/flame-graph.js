import ko from "knockout"
import d3 from "d3"
import "goprofui/bindings/flame/"
import Template from "./flame-graph.html!system-text"

class ViewModel {
  constructor(params) {
    this.monitorIp = params.monitorIp || ko.observable('');
    this.profiling = params.profiling || ko.observable(false);
    this.flameData = ko.observableArray([]);
    this.profilingSub = this.profiling.subscribe(this.setupProfiling.bind(this));
  }

  handleResponse(req) {
    return (e)=>{
      if (req.readyState === XMLHttpRequest.DONE) {
        if (this.profiling()===false) {
          this.flameData(JSON.parse(req.responseText));
        }
      }
    }
  }

  setupProfiling(profiling) {
    let req = new XMLHttpRequest();
    req.onreadystatechange = this.handleResponse(req);

    if (profiling === true) {
      req.open('GET', '//' + this.monitorIp() + '/cpuprofile/start');
    } else {
      req.open('GET', '//' + this.monitorIp() + '/cpuprofile/stop');
    }

    req.send(null);
  }

  dispose () {
    this.profilingSub.dispose()
  }
}

export { Template, ViewModel }
