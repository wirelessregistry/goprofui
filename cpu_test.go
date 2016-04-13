package goprofui

import (
	"runtime"
	"strings"
	"testing"
	"time"

	"github.com/wirelessregistry/goprofui/internal/profile"
)

func getCaller() uintptr {
	pc, _, _, _ := runtime.Caller(1)
	return pc
}

func func1() uintptr {
	return getCaller()
}

func func2() uintptr {
	return getCaller()
}

func func3() uintptr {
	return getCaller()
}

func TestLocationsToFuncnames(t *testing.T) {
	locOne := profile.Location{
		ID:      1,
		Address: uint64(func1()),
	}

	locTwo := profile.Location{
		ID:      2,
		Address: uint64(func2()),
	}

	locThree := profile.Location{
		ID:      3,
		Address: uint64(func3()),
	}

	locations := []*profile.Location{&locOne, &locTwo, &locThree}
	locationMap := LocationsToFuncNames(locations)

	if strings.HasSuffix(locationMap[1], "func1") == false {
		t.Error("Looking for func1, not found in", locationMap[1])
	}

	if strings.HasSuffix(locationMap[2], "func2") == false {
		t.Error("Looking for func2, not found in", locationMap[2])
	}

	if strings.HasSuffix(locationMap[3], "func3") == false {
		t.Error("Looking for func3, not found in", locationMap[3])
	}
}

func TestCPUProfile(t *testing.T) {
	res := <-CPUProfile(1 * time.Second)
	if res == nil {
		t.Error("Failed to start CPUProfile.")
	}

}
