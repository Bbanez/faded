package game

import (
	"fdd-wails/storage"
)

type Account struct {
	Model    Model  `json:"model"`
	Username string `json:"username"`
}

func NewAccount(username string) Account {
	return Account{
		Model:    NewModel(),
		Username: username,
	}
}

func FindAccount(accounts *[]Account, username string) *Account {
	for _, account := range *accounts {
		if account.Username == username {
			return &account
		}
	}
	return nil
}

func SetAccount(accounts *[]Account, account Account) {
	for _, acc := range *accounts {
		if acc.Username == account.Username {
			return
		}
	}
	*accounts = append(*accounts, account)
}

func getOrCreateAccount(accounts *[]Account, username string) *Account {
	account := FindAccount(accounts, username)
	if account != nil {
		return account
	}
	acc := NewAccount(username)
	*accounts = append(*accounts, acc)
	return &acc
}

func (api *Api) AccountCreate(username string) Account {
	account := getOrCreateAccount(&StateData.Accounts, username)
	StateData.ActiveAccount = account

	storageData := storage.ReadFile()
	err := storage.StoragePackKeyValue(&storageData, "ActiveAccount", StateData.ActiveAccount)
	if err != nil {
		panic(err)
	}
	err = storage.StoragePackKeyValue(&storageData, "Accounts", StateData.Accounts)
	if err != nil {
		panic(err)
	}
	storage.WriteFile(storageData)
	if err != nil {
		panic(err)
	}

	return *account
}

func (api *Api) ActiveAccountGet() *Account {
	return StateData.ActiveAccount
}

func (api *Api) AccountAll() []Account {
	return StateData.Accounts
}
