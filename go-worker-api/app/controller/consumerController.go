package controller

import "github.com/JoaoVitorML-BR/joao-vitor-desafio-gdash-2025-02/app/service"

func FetchOneMessage(amqpURL, queue string) (string, error) {
	return service.GetOneMessage(amqpURL, queue)
}
