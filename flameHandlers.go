package goprofui

import (
	"bytes"
	"net/http"
	"runtime/pprof"

	"github.com/code.wirelessregistry.com/goprofui/internal/profile"
)

var cpuProfileBuffer bytes.Buffer // the lock is in pprof

func reply(w http.ResponseWriter, status int, bytes []byte) {
	w.WriteHeader(status)
	w.Write(bytes)
}

func StartCPUProfHandler(w http.ResponseWriter, r *http.Request) {
	err := pprof.StartCPUProfile(&cpuProfileBuffer)
	if err != nil {
		reply(w, 400, []byte(err.Error()))
		return
	}

	w.Header().Set("Access-Control-Allow-Origin", "*")
	reply(w, 202, []byte("CPU profiling started."))
}

func StopCPUProfHandler(w http.ResponseWriter, r *http.Request) {
	pprof.StopCPUProfile()

	p, err := profile.Parse(&cpuProfileBuffer)
	if err != nil {
		reply(w, 400, []byte(err.Error()))
		return
	}
	w.Header().Set("Access-Control-Allow-Origin", "*")

	fp := NewProfile(p)

	var buf bytes.Buffer
	err = fp.ParseForD3FlameGraph(&buf)
	if err != nil {
		reply(w, 400, []byte(err.Error()))
		return
	}

	reply(w, 200, buf.Bytes())
}
