# goprofui

A simple package for profiling _deployed_ binaries.

Key features:
 * Does not require running any other scripts/tools, only the binary under monitoring.
 * Flame graphs for stack trace profiling.
 * Memory, GC pauses and goroutines line charts.


### Related Packages
 * go-torch. _https://github.com/uber/go-torch_. go-torch does cpu profiling and represents it as a flame graph.
We were directly inspired by this package. In contrast to goprofui, go-torch requires the go pprof tool and an external Perl script.

 * profile. _https://github.com/pkg/profile_. profile does cpu and memory profiling, and saves them into a file. It is easy to setup and use. However, the cpu profiles would have to be further parsed for a flame graph.

 * flame graphs. _http://www.brendangregg.com/flamegraphs.html_. Created by Brendan Gregg. An extremely succinct way to summarize stack traces. 

### Installation

```
go get github.com/wirelessregistry/goprofui
```

### Dependencies

1. Requires the net web-socket library _https://godoc.org/golang.org/x/net/websocket_.

2. The flame graph JS library is https://github.com/spiermar/d3-flame-graph.

3. The line chart JS library is D3's.

4. goprofui's internal package is forked from pprof's internal package. It is covered by the BSD-license in
LICENSE_internal_pkg.


### Usage and Code Structure

The quickest way to get started is to copy the handlers' setup from _examples/web/web.go_. Build the web.go application, and then serve the index.html file using a web server (_https://github.com/indexzero/http-server_ for example).

When you visit the example using your web browser, you will see some graphs:

* ![Alt text](images/memory.png?raw=true "Memory tracking")
* ![Alt text](images/go-gc.png?raw=true "Garbage collection tracking")
* ![Alt text](images/go-flame.png?raw=true "CPU profiling")

The cpu profiling code is in _cpu.go_. The memory, GC latency and goroutines stats are obtained in tickerHandlers.go.
