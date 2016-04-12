ko.bindingHandlers.linechart = {
  init: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
    var data = ko.unwrap(valueAccessor());
    var bucket = allBindings.get('bucket');

    bucket.title = allBindings.get('title');
    bucket.groups = allBindings.get('groups');
    bucket.width = allBindings.get('width') || 750;
    bucket.height = allBindings.get('height') || 350;
    bucket.duration = allBindings.get('duration') || 1000;
    bucket.limit = 60;
    bucket.now = new Date(Date.now() - bucket.duration);

    bucket.x = d3.time.scale()
      .domain([bucket.now - (bucket.limit - 2), bucket.now - bucket.duration])
      .range([0, bucket.width]);

    bucket.maxY = 1;
    bucket.y = d3.scale.linear()
      .domain([0, bucket.maxY])
      .range([bucket.height, 0])

    bucket.line = d3.svg.line()
      .interpolate('basis')
      .x(function(d, i) {
        return bucket.x(bucket.now - (bucket.limit - 1 - i) * bucket.duration)
      })
      .y(function(d) {
        return bucket.y(d)
      })

    bucket.svg = d3.select(element).append('svg')
      .attr('class', 'chart')
      .attr('width', bucket.width)
      .attr('height', bucket.height + 50)

    bucket.axis = bucket.svg.append('g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(0,' + bucket.height + ')')
      .call(bucket.x.axis = d3.svg.axis().scale(bucket.x).orient('bottom'))

    bucket.paths = bucket.svg.append('g')
    bucket.labels = bucket.svg.append('g')

    for (var name in bucket.groups) {
      var group = bucket.groups[name]
      group.data.push(data[name]);
      group.path = bucket.paths.append('path')
      .data([group.data])
      .attr('class', name + ' group')
      .style('stroke', group.color);
    }
  },
  update: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
    var data = ko.unwrap(valueAccessor());
    var bucket = allBindings.get('bucket');
    bucket.now = new Date();

    // Add new values
    bucket.labels.selectAll('text').remove();
    var i = 0;
    for (var name in bucket.groups) {
      var group = bucket.groups[name]
      //group.data.push(group.value) // Real values arrive at irregular intervals
      if (data[name] > bucket.maxY) {
        bucket.maxY = data[name] * 1.25;
        bucket.y.domain([0, bucket.maxY]);
      }

      group.data.push(data[name])
      group.path.attr('d', bucket.line)
      group.name = bucket.labels.append('text')
      .attr("transform", "translate(20," + bucket.y(data[name]) + ")")
      .attr("x", bucket.width + 40)
      .attr("dy", "1.25em")
      .text(group.key + "(" + data[name] + ")")
      .style('color', group.color)
      i++;
    }

    // Shift domain
    bucket.x.domain([
      bucket.now - (bucket.limit - 2) * bucket.duration,
      bucket.now - bucket.duration
    ])

    // Slide x-axis left
    bucket.axis.transition()
      .duration(bucket.duration)
      .ease('linear')
      .call(bucket.x.axis)

    // Slide paths left
    bucket.paths.attr('transform', null)
      .transition()
      .duration(bucket.duration)
      .ease('linear')
      .attr('transform', 'translate(' + bucket.x(bucket.now - (bucket.limit - 1) * bucket.duration) + ')')

    // Remove oldest data point from each group
    for (var name in bucket.groups) {
      var group = bucket.groups[name]
      group.data.shift()
    }
  }
};
