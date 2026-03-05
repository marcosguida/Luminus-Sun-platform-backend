# ⚡ Luminus Sun - Backend
![⁠ZodTypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![n8n](https://img.shields.io/badge/n8n-EA4B71?style=for-the-badge&logo=n8n&logoColor=white)
![Google Gemini](https://img.shields.io/badge/Google%20Gemini-8E75B2?style=for-the-badge&logo=google&logoColor=white)

[![Hackathon InovaUni 2025](https://img.shields.io/badge/Hackathon-InovaUni%202025-purple?style=for-the-badge)](https://github.com/arthurpestana/hackathon-2025-backend)

*Sistema de Gestão e Otimização Energética por meio de Análise Inteligente*

</div>

## 📋 Sobre

Backend da plataforma *Luminus Sun* que processa dados climáticos brasileiros (INMET/ONS) através de IA para gerar análises preditivas de energia solar. Utiliza *n8n* para orquestração de workflows automatizados e agente de IA do *Google Gemini* para análise inteligente para tomada de decisão do usuário.

## 🏗️ Stack Tecnológica

- *Framework*: Next.js + TypeScript

- ⁠*Banco de Dados*: MongoDB (Mongoose)
- ⁠*Automação*: n8n (workflow automation)
- *IA*: Google Gemini Flash 2.5
- ⁠*APIs*: OpenWeather, INMET, ONS
- *E-mail*: SendGrid

## 🚀 Instalação Rápida

### Pré-requisitos
- ⁠Bun 18+
- MongoDB (local ou Atlas)
- Conta n8n

### Configuração
⁠ bash
# 1. Clone o repositório
``git clone `https://github.com/arthurpestana/hackathon-2025-backend.git` ``

``cd hackathon-2025-backend``

# 2. Instale as dependências
``npm install``

# 3. Configure as variáveis de ambiente
cp .env.example .env
 ⁠

### Variáveis de Ambiente (.env)
⁠ bash

# MongoDB
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/luminus

# APIs
OPENWEATHER_API_KEY=sua_chave_openweather
GEMINI_API_KEY=sua_chave_gemini
SENDGRID_API_KEY=sua_chave_sendgrid

# n8n
N8N_WEBHOOK_URL=https://seu-n8n.com/webhook/luminus
 ⁠

### Executar
⁠ bash
# Desenvolvimento
``npm run dev``

# Produção
``npm run build``
``npm start``
 ⁠

Acesse: ⁠ `http://localhost:3000`

## 🧠 Como Funciona

- 1.⁠ ⁠*Cadastro*: Usuário informa nome, e-mail, cidade e estado.
- 2.⁠ ⁠*Coleta*: Sistema busca estação meteorológica INMET mais próxima.
- 3.⁠ ⁠*Previsão*: Obtém dados climáticos horários (24h) via OpenWeather.
- 4.⁠ ⁠*Análise*: IA processa dados e realiza cálculos dos dados da API.
- 5.⁠ ⁠*Relatório*: Gera 3 melhores horários para consumo + dicas de economia.
- 6.⁠ ⁠*Envio*: Relatório enviado no E-mail com análise para tomada de decisão.

## 📊 Dados Processados
- ⁠🌍 Latitude/Longitude (estação INMET)
- 🌡️ Temperatura min/max
- ☁️ Cobertura de nuvens
- 💧 Umidade relativa
- 🌧️ Volume de chuva
- ⁠👁️ Visibilidade
- 💨 Velocidade do vento
- ⁠📊 Pressão atmosférica


## 🔐 Requisitos de Segurança

- Senhas criptografadas (bcrypt)
- Validação de dados (Zod)
- Tempo de resposta < 10s
- ⁠Tratamento de falhas de API

## 👥 Equipe Luminus Sun

*Sistemas de Informação*
- Arthur Henrique Pestana 
- ⁠Bruno Sales Noleto
- ⁠Juliana Chaves
- ⁠Marcos Ribeiro

*Engenharia Agronômica*
- ⁠Graciliano Henrique

<div align="center">

*Hackathon InovaUni 2025* | Energia Limpa e Sustentável 

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

</div>
