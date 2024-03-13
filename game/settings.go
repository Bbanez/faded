package game

import (
	"encoding/json"
	"fdd-wails/storage"
)

type SettingsResolution struct {
	Width uint32 `json:"width"`
}

type Settings struct {
	Model      Model              `json:"model"`
	Resolution SettingsResolution `json:"resolution"`
}

func NewSettings(resolution SettingsResolution) Settings {
	return Settings{
		Model:      NewModel(),
		Resolution: resolution,
	}
}

func (api *Api) SettingsGet(resolution SettingsResolution) Settings {
	if StateData.Settings == nil {
		storageData := storage.ReadFile()
		settings := NewSettings(resolution)
		StateData.Settings = &settings
		bytes, err := json.Marshal(StateData.Settings)
		if err != nil {
			panic(err)
		}
		s := string(bytes)
		storageData.Settings = s
		storage.WriteFile(storageData)
		if err != nil {
			panic(err)
		}
	}
	return *StateData.Settings
}

func (api *Api) SettingsSet(resolution SettingsResolution) Settings {
	storageData := storage.ReadFile()
	if StateData.Settings == nil {
		settings := NewSettings(resolution)
		StateData.Settings = &settings
	} else {
		StateData.Settings.Resolution = resolution
	}
	bytes, err := json.Marshal(StateData.Settings)
	if err != nil {
		panic(err)
	}
	s := string(bytes)
	storageData.Settings = s
	storage.WriteFile(storageData)
	if err != nil {
		panic(err)
	}
	return *StateData.Settings
}
