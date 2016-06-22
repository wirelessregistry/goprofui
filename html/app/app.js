import ko from "knockout"
import $ from "jquery"
import "bootstrap/dist/js/bootstrap"
import "bootstrap/dist/css/bootstrap.css!"
import "goprofui/less/styles.less!"
import template from "./app.html!system-text"

import ViewModel from "goprofui/app/app-state"
import * as GcPause from "goprofui/components/gc-pause/"
import * as GoRoutines from "goprofui/components/go-routines/"
import * as MemoryAllocation from "goprofui/components/memory-allocation/"
import * as FlameGraph from "goprofui/components/flame-graph/"

ko.components.register('memory-allocation', { viewModel: MemoryAllocation.ViewModel, template: MemoryAllocation.Template });
ko.components.register('gc-pause', { viewModel: GcPause.ViewModel, template: GcPause.Template });
ko.components.register('go-routines', { viewModel: GoRoutines.ViewModel, template: GoRoutines.Template });
ko.components.register('flame-graph', { viewModel: FlameGraph.ViewModel, template: FlameGraph.Template });

$(document).ready(()=>{

  $('body').html(template);

  $('.controls').affix({
    offset: {
      top: 10
    }
  });

  let appState = new ViewModel();
  ko.applyBindings(appState);

});