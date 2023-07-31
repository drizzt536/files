package main

import (
	"net/http"
	"net"
	"flag"
	"os"
	"strconv"
)

func invalidPortString(portString string) bool {
	// return true if port is invalid, false otherwise

	port, err := strconv.Atoi(portString)

	if err != nil { return true }

	return port < 1 || 65535 < port // 0 < port < 2^16
}

var done = make(chan bool)

func main() {
	// setup arguments

	var (
		ip      string
		port    string
		persist bool
	)

	{
		var ip_arg      *string  = flag.String("ip"     , "127.0.0.1", "server IP address"          )
		var port_arg    *string  = flag.String("port"   , "80"       , "server http port"           )
		var persist_arg *bool    = flag.Bool  ("persist", false      , "persist after serving files")

		flag.Parse()

		ip      = *ip_arg
		port    = *port_arg
		persist = *persist_arg
	}

	var address string  = ip + ":" + port // full server address
	var filesServed int = 0

	// validate arguments
	if net.ParseIP(ip) == nil {
		println("server ip address is not valid")
		os.Exit(1)
	}
	if invalidPortString(port) {
		println("server port is not valid")
		os.Exit(2)
	}

	println("arguments are valid")
	// start doing server things

	http.HandleFunc("/", func (w http.ResponseWriter, r *http.Request) {
		var file string = r.URL.Path[1:]
		if file == "" {
			file = "index.html"
		}

		println("serving file '" + file + "'")
		http.ServeFile(w, r, file)

		if persist {
			return
		}

		filesServed++

		if filesServed > 3 {
			// index.html and cubefield.swf don't count for some reason
			// ruffle.js, core.ruffle.js, ruffle.wasm
			close(done)
		}
	})

	go func () {
		// exit after files are served
		<- done
		os.Exit(0)
	}()

	println("waiting for a connection to http://" + address)
	err := http.ListenAndServe(address, nil)

	if err != nil {
		println("Server error: " + err.Error())
	}
}
