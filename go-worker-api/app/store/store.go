package store

import "sync"

var (
	mu     sync.RWMutex
	latest string
)

func SetLatest(s string) {
	mu.Lock()
	latest = s
	mu.Unlock()
}

func GetLatest() string {
	mu.RLock()
	v := latest
	mu.RUnlock()
	return v
}
