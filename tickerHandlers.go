package goprofui

import (
	"fmt"
	"runtime"
	"time"

	"golang.org/x/net/websocket"
)

type collectFn func(time.Duration, chan struct{}) chan []byte

func MemoryHandler(freq time.Duration) func(*websocket.Conn) {
	return TickerHandler(freq, CollectMemStats())
}

func GCHandler(freq time.Duration) func(*websocket.Conn) {
	return TickerHandler(freq, CollectGCStats())
}

func CollectGCStats() collectFn {
	return CollectStats(
		func() []byte {
			var m runtime.MemStats

			runtime.ReadMemStats(&m)
			stats := fmt.Sprintf("%d", m.PauseNs[(m.NumGC+255)%256])
			return []byte(stats)
		})
}

func CollectMemStats() collectFn {
	return CollectStats(
		func() []byte {
			var m runtime.MemStats

			runtime.ReadMemStats(&m)
			stats := fmt.Sprintf("%d,%d,%d,%d", m.HeapSys, m.HeapAlloc, m.HeapIdle, m.HeapReleased)
			return []byte(stats)
		})
}

func GoRoutinesHandler(freq time.Duration) func(*websocket.Conn) {
	return TickerHandler(freq, CollectRoutinesStats())
}

func CollectRoutinesStats() collectFn {
	return CollectStats(
		func() []byte {
			n := runtime.NumGoroutine()
			stats := fmt.Sprintf("%d", n)
			return []byte(stats)
		})
}

func TickerHandler(freq time.Duration, fn collectFn) func(*websocket.Conn) {
	return func(ws *websocket.Conn) {
		doneCh := make(chan struct{}, 1)
		data := fn(freq, doneCh)

		for {
			d := <-data
			_, err := ws.Write(d)

			if err != nil {
				// client has moved on
				doneCh <- struct{}{}
				return
			}
		}
	}
}

func CollectStats(reader func() []byte) collectFn {
	return func(freq time.Duration, doneCh chan struct{}) chan []byte {
		ch := make(chan []byte, 1)
		ticker := time.NewTicker(freq)

		ch <- reader() // Send some data right away
		go func() {
			for {
				select {

				case <-ticker.C:
					ch <- reader()

				case <-doneCh:
					return
				}
			}
		}()

		return ch
	}
}
