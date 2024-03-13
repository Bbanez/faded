package main

import (
	"embed"
	"fdd-wails/game"
	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
)

//go:embed all:frontend/dist
var assets embed.FS

func main() {
	game.InitStateData()
	initApp()
}

func initApp() {
	// Create an instance of the app structure
	gameApi := game.NewApi()

	// Create application with options
	err := wails.Run(&options.App{
		Title:  "fdd-wails",
		Width:  1024,
		Height: 768,
		AssetServer: &assetserver.Options{
			Assets: assets,
		},
		BackgroundColour: &options.RGBA{R: 27, G: 38, B: 54, A: 1},
		OnStartup:        gameApi.Startup,
		Bind: []interface{}{
			gameApi,
		},
	})
	if err != nil {
		println("Error:", err.Error())
	}
}
