package goprofui

import (
	"testing"
	"time"
)

func TestCollectStats(t *testing.T) {
	reader := func() []byte {
		return []byte("hello")
	}

	c := CollectStats(reader)

	rCh := c(1*time.Millisecond, nil)
	if rCh == nil {
		t.Fatalf("Failed to get a result channel")
	}

	result := <-rCh
	if string(result) != string(reader()) {
		t.Errorf("Expected %v. Got %v.", string(reader()), string(result))
	}
}
