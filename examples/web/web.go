package main

import (
	"github.com/wirelessregistry/goprofui"
	"golang.org/x/net/websocket"
	"log"
	"net/http"
	"sort"
	"time"
)

func fib(pos int) int {
	if pos <= 1 {
		return 1
	}

	return fib(pos-1) + fib(pos-2)
}

func reverse(words []string) {
	for i, j := 0, len(words)-1; i < j; i, j = i+1, j-1 {
		words[i], words[j] = words[j], words[i]
	}
}

func sortInts(max int) {
	list := make([]int, max)
	for j := max - 1; j >= 0; j-- {
		list[j] = max - j
	}
	sort.Ints(list)
}

func main() {
	profileMux := http.NewServeMux()
	profileMux.HandleFunc("/cpuprofile/start", goprofui.StartCPUProfHandler)
	profileMux.HandleFunc("/cpuprofile/stop", goprofui.StopCPUProfHandler)
	profileMux.Handle("/memory", websocket.Handler(goprofui.MemoryHandler(1*time.Second)))
	profileMux.Handle("/gc", websocket.Handler(goprofui.GCHandler(1*time.Second)))
	profileMux.Handle("/goroutines", websocket.Handler(goprofui.GoRoutinesHandler(1*time.Second)))

	go func() {
		for {
			fib(25)

			sortInts(10000)

			for i := 0; i < 10000; i++ {
				reverse([]string{"qwertyiolkahsdlfnalhgslhldsbndsadasdsajdasasdjljk", "dsajkfhkadhfhlsahlghglafshgfakdgnadflhgbliadflnubfnbliadfuhbnlai"})
			}
		}
	}()

	go func() {
		for i := 0; i < 1000; i++ {
			go func(id int) {
				_ = make([]byte, 1000000)
				time.Sleep(10 * time.Second)
			}(i)

			time.Sleep(1 * time.Second)
		}
	}()

	if err := http.ListenAndServe(":6060", profileMux); err != nil {
		log.Fatalf("%s \n", err.Error())
	}

}
