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

func GetFile() *os.File {
	homeDirName, err := os.UserHomeDir()
	if err != nil {
		panic(err)
	}
	homeDirPath := fmt.Sprintf("%s/faded", homeDirName)
	filePath := fmt.Sprintf("%s/faded/storage.json", homeDirName)
	if _, err := os.Stat(homeDirPath); errors.Is(err, os.ErrNotExist) {
		fmt.Println("HERE")
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

func ReadFile(file *os.File) Data {
	stringBuilder := strings.Builder{}
	_, err := io.Copy(&stringBuilder, file)
	if err != nil {
		panic(err)
	}
	data := Data{}
	err = json.Unmarshal([]byte(stringBuilder.String()), &data)
	if err != nil {
		panic(err)
	}
	return data
}

func WriteFile(file *os.File, data Data) {
	jsonString, err := json.Marshal(data)
	if err != nil {
		panic(err)
	}
	_, err = file.Write(jsonString)
	if err != nil {
		panic(err)
	}
}
