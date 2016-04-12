package goprofui

import (
	"bytes"
	"errors"
	"io"
	"runtime"
	"runtime/pprof"
	"time"

	"github.com/code.wirelessregistry.com/goprofui/internal/profile"
)

var ErrProfileFailed = errors.New("Could not start profiler")

type Profile struct {
	TotalSamples        uint32 // count of samples
	TotalFuncCalls      uint32 // count of all funcs in all sample
	FuncFrequency       map[string]uint32
	UniqueFuncFrequency map[string]uint32
	FuncDict            map[uint64]string
	Prof                *profile.Profile
}

func EmptyProfile(prof *profile.Profile) *Profile {
	return &Profile{
		TotalSamples:        0,
		TotalFuncCalls:      0,
		FuncFrequency:       make(map[string]uint32),
		UniqueFuncFrequency: make(map[string]uint32),
		FuncDict:            nil,
		Prof:                prof,
	}
}

func NewProfile(p *profile.Profile) *Profile {
	fp := EmptyProfile(p)

	fp.FuncDict = LocationsToFuncNames(p.Location)

	for _, sample := range p.Sample {
		nSamples := uint32(sample.Value[0])
		fp.TotalSamples += nSamples
		fp.TotalFuncCalls += nSamples * uint32(len(sample.Location))

		seenFunc := make(map[string]bool)

		for _, loc := range sample.Location {
			fp.FuncFrequency[fp.FuncDict[loc.ID]] += nSamples

			if seenFunc[fp.FuncDict[loc.ID]] == false {
				fp.UniqueFuncFrequency[fp.FuncDict[loc.ID]] += 1
				seenFunc[fp.FuncDict[loc.ID]] = true
			}
		}
	}

	return fp
}

func LocationsToFuncNames(locations []*profile.Location) map[uint64]string {
	funcs := make(map[uint64]string)

	for _, loc := range locations {
		funcs[loc.ID] = runtime.FuncForPC(uintptr(loc.Address)).Name()
	}

	return funcs
}

/*
	The D3 Flame Graph is at: https://github.com/spiermar/d3-flame-graph

	The D3 lib expects the following tree struct:
	1) root --> *children
	2) child --> *children

	Invariant:
	If a Func name appears at the same stack level in two samples and
	the call stack prefix is also the same, then
	there is exactly one node at that level in the tree to denote Func.
*/
func (p *Profile) ParseForD3FlameGraph(w io.Writer) error {
	root := &Node{
		Name:     "root",
		Value:    int64(0),
		Children: make(map[string]*Node),
	}

	for _, sample := range p.Prof.Sample {
		frames := make([]string, len(sample.Location))
		for i, loc := range sample.Location {
			frames[i] = p.FuncDict[loc.ID]
		}

		reverse(frames)
		root.Add(frames, sample.Value[0])
	}

	out, err := root.MarshalText()
	if err != nil {
		return err
	}

	w.Write(out)
	return nil
}

func reverse(words []string) {
	for i, j := 0, len(words)-1; i < j; i, j = i+1, j-1 {
		words[i], words[j] = words[j], words[i]
	}
}

// Non-blocking function to get a profile
func CPUProfile(duration time.Duration) chan *Profile {
	var buf bytes.Buffer
	ch := make(chan *Profile, 1)

	go func() {
		err := pprof.StartCPUProfile(&buf)
		if err != nil {
			// StartCPUProfile failed, so no writes yet.
			// Can change header back to text content
			// and send error code.
			ch <- nil
		}

		time.Sleep(duration)
		pprof.StopCPUProfile()
		p, _ := profile.Parse(&buf)
		ch <- NewProfile(p)
	}()

	return ch
}
