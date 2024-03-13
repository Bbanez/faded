package game

import (
	"encoding/json"
	"fdd-wails/bcms"
	"fdd-wails/storage"
)

type State struct {
	ActiveAccount *Account
	Accounts      []Account
	Settings      *Settings
	Maps          []bcms.FddMapEntryMetaItem
	Characters    []bcms.FddCharacterEntryMetaItem
	EnemiesData   []bcms.FddEnemyEntryMetaItem
	Player        *Player
	MapInfo       MapInfo
}

var StateData = State{}

func InitStateData() {
	err := json.Unmarshal([]byte(bcms.FDD_MAP_META_ITEMS), &StateData.Maps)
	if err != nil {
		panic(err)
	}
	err = json.Unmarshal([]byte(bcms.FDD_CHARACTER_META_ITEMS), &StateData.Characters)
	if err != nil {
		panic(err)
	}
	err = json.Unmarshal([]byte(bcms.FDD_ENEMY_META_ITEMS), &StateData.EnemiesData)
	if err != nil {
		panic(err)
	}
	storageData := storage.ReadFile()
	if storageData.Accounts != "" {
		err := json.Unmarshal([]byte(storageData.Accounts), &StateData.Accounts)
		if err != nil {
			panic(err)
		}
	} else {
		StateData.Accounts = []Account{}
	}
	if storageData.ActiveAccount != "" {
		err := json.Unmarshal([]byte(storageData.ActiveAccount), &StateData.ActiveAccount)
		if err != nil {
			panic(err)
		}
	}
	if storageData.Settings != "" {
		err := json.Unmarshal([]byte(storageData.Settings), &StateData.Settings)
		if err != nil {
			panic(err)
		}
	}

}

func (state *State) FindMap(slug string) *bcms.FddMapEntryMetaItem {
	for i := range state.Maps {
		if state.Maps[i].Slug == slug {
			return &state.Maps[i]
		}
	}
	return nil
}

func (state *State) FindCharacter(slug string) *bcms.FddCharacterEntryMetaItem {
	for i := range state.Characters {
		if state.Characters[i].Slug == slug {
			return &state.Characters[i]
		}
	}
	return nil
}
