package game

import (
	"context"
)

// App struct
type Api struct {
	ctx context.Context
}

// NewApp creates a new App application struct
func NewApi() *Api {
	return &Api{}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (api *Api) Startup(ctx context.Context) {
	api.ctx = ctx
}
