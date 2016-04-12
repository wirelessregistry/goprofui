ko.bindingHandlers.flame = {
    init: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
        var height = allBindings.get('height') || 740;
        var width = allBindings.get('width') || 960;
        var title = allBindings.get('title') || 'Flame Graph';
        var transitionDuration = allBindings.get('transitionDuration') || 750;
        var data = ko.unwrap(valueAccessor());

        bindingContext.flameGraph = d3.flameGraph()
          .height(height)
          .width(width)
          .cellHeight(18)
          .transitionDuration(transitionDuration)
          .transitionEase('cubic-in-out')
          .sort(true)
          .title("")

        var tip = d3.tip()
          .direction("s")
          .offset([8, 0])
          .attr('class', 'd3-flame-graph-tip')
          .html(function(d) { return "name: " + d.name + ", value: " + d.value; });

        bindingContext.flameGraph.tooltip(tip);
    },
    update: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
      var data = ko.unwrap(valueAccessor());

      d3.select(element).select('*').remove();
      d3.select(element)
        .datum(data)
        .call(bindingContext.flameGraph);
    }
}
