package storage

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"os"
	"strings"
)

type Data struct {
	ActiveAccount string `json:"activeAccount"`
	Accounts      string `json:"accounts"`
	Settings      string `json:"settings"`
}

func StorageUnpackKeyValue[Value any](data *Data, key string) (*Value, error) {
	str := ""
	if key == "ActiveAccount" {
		str = data.ActiveAccount
	} else if key == "Accounts" {
		str = data.ActiveAccount
	} else if key == "Settings" {
		str = data.ActiveAccount
	}
	var result Value
	err := json.Unmarshal([]byte(str), &result)
	if err != nil {
		return nil, err
	}
	return &result, nil
}

func StoragePackKeyValue[Value any](data *Data, key string, value Value) error {
	jsonBytes, err := json.Marshal(value)
	if err != nil {
		return err
	}
	if key == "ActiveAccount" {
		data.ActiveAccount = string(jsonBytes)
	} else if key == "Accounts" {
		data.Accounts = string(jsonBytes)
	} else if key == "ActiveAccount" {
		data.Settings = string(jsonBytes)
	}
	return nil
}

func getFilePath() (string, string) {
	homeDirName, err := os.UserHomeDir()
	if err != nil {
		panic(err)
	}
	homeDirPath := fmt.Sprintf("%s/faded", homeDirName)
	filePath := fmt.Sprintf("%s/faded/storage.json", homeDirName)
	return filePath, homeDirPath
}

func GetFile() *os.File {
	filePath, homeDirPath := getFilePath()
	if _, err := os.Stat(homeDirPath); errors.Is(err, os.ErrNotExist) {
		err := os.Mkdir(homeDirPath, os.ModePerm)
		if err != nil {
			panic(err)
		}
	}
	if _, err := os.Stat(filePath); errors.Is(err, os.ErrNotExist) {
		f, err := os.Create(filePath)
		if err != nil {
			panic(err)
		}
		err = f.Close()
		if err != nil {
			panic(err)
		}
	}
	file, err := os.OpenFile(filePath, os.O_RDWR, os.ModePerm)
	if err != nil {
		panic(err)
	}
	return file
}

func ReadFile() Data {
	file := GetFile()
	stringBuilder := strings.Builder{}
	_, err := io.Copy(&stringBuilder, file)
	if err != nil {
		panic(err)
	}
	data := Data{}
	s := stringBuilder.String()
	if s == "" {
		s = "{}"
	}
	err = json.Unmarshal([]byte(s), &data)
	if err != nil {
		panic(err)
	}
	err = file.Close()
	if err != nil {
		panic(nil)
	}
	return data
}

func WriteFile(data Data) {
	filePath, _ := getFilePath()
	file, err := os.OpenFile(filePath, os.O_TRUNC|os.O_WRONLY, os.ModePerm)
	if err != nil {
		panic(err)
	}
	jsonString, err := json.Marshal(data)
	if err != nil {
		panic(err)
	}
	_, err = file.Write(jsonString)
	if err != nil {
		panic(err)
	}
	err = file.Close()
	if err != nil {
		panic(err)
	}
}
