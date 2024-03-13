package game

import (
	"github.com/google/uuid"
	"time"
)

type Model struct {
	Id        string `json:"id"`
	CreatedAt int64  `json:"createdAt"`
	UpdatedAt int64  `json:"updatedAt"`
}

func NewModel() Model {
	return Model{
		Id:        uuid.New().String(),
		CreatedAt: time.Now().UnixMilli(),
		UpdatedAt: time.Now().UnixMilli(),
	}
}
