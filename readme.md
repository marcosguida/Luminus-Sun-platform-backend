<div align="center">

# ☀️ Luminus Sun

### *Sistema Inteligente de Gestão e Otimização Energética*

**Frontend & Backend**

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![SCSS](https://img.shields.io/badge/SCSS-CC6699?style=for-the-badge&logo=sass&logoColor=white)
![Zod](https://img.shields.io/badge/Zod-4F46E5?style=for-the-badge&logo=typescript&logoColor=white)

**Banco de Dados & IA & Automação**

![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Google Gemini](https://img.shields.io/badge/Google%20Gemini-8E75B2?style=for-the-badge&logo=google&logoColor=white)
![n8n](https://img.shields.io/badge/n8n-EA4B71?style=for-the-badge&logo=n8n&logoColor=white)

**APIs & Serviços Externos**

![OpenWeather](https://img.shields.io/badge/OpenWeather-EB6E4B?style=for-the-badge&logo=openweathermap&logoColor=white)
![SendGrid](https://img.shields.io/badge/SendGrid-3994FF?style=for-the-badge&logo=sendgrid&logoColor=white)

**Projeto**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![Hackathon InovaUni 2025](https://img.shields.io/badge/Hackathon-InovaUni%202025-purple?style=for-the-badge)](https://github.com/arthurpestana)
[![ODS 7](https://img.shields.io/badge/ODS-7%20Energia%20Limpa-yellow?style=for-the-badge)](https://sdgs.un.org/goals/goal7)

</div>


## Sobre

O **Luminus Sun** é uma solução desenvolvida para o **4º Hackathon InovaUni 2025**, com foco no tema **Energia Limpa e Sustentável (ODS 7)**. A plataforma correlaciona previsão climática e padrões de consumo elétrico para maximizar a eficiência energética residencial, gerando economia financeira e redução de impacto ambiental.

O núcleo do sistema é baseado em dados brutos heterogêneos (meteorológicos, geoespaciais e energéticos) que são coletados, normalizados e transformados em *features* estruturadas que alimentam um modelo de predição. As predições resultantes são consumidas pela IA generativa (Gemini) para gerar recomendações contextualizadas e personalizadas por usuário.

| | |
|---|---|
| 🔴 **Problema** | A geração excessiva e desorganizada desestimula o uso da energia solar como solução sustentável |
| 🟢 **Solução** | Monitoramento energético com análise preditiva que promove o consumo consciente e a microgeração sustentável |
<br>

## 📊 Modelagem Preditiva

### Variáveis de Entrada (Features)

O modelo preditivo de irradiância solar utiliza as seguintes *features* extraídas do pipeline de dados climáticos:

| Feature | Fonte | Descrição |
|---|---|---|
| `clouds_pct` | OpenWeather | Cobertura de nuvens (%) — principal atenuador da radiação solar |
| `temp_celsius` | OpenWeather / INMET | Temperatura do ar — influencia a eficiência dos painéis fotovoltaicos |
| `humidity_pct` | OpenWeather | Umidade relativa — proxy para vapor d'água e absorção atmosférica |
| `wind_speed_ms` | OpenWeather | Velocidade do vento — auxilia no resfriamento de painéis |
| `latitude` | IBGE / OpenWeather Geo | Determina o ângulo de incidência solar e a duração do dia |
| `altitude_m` | INMET | Altitude da estação — afeta a espessura da camada atmosférica |
| `datetime_utc` | OpenWeather Forecast | Posição temporal para cálculo do ângulo zenital solar |

### Cálculo do GHI (Global Horizontal Irradiance)

O **GHI** é a métrica central do modelo — representa a irradiância solar total que incide em uma superfície horizontal por unidade de área (W/m²). O algoritmo interno do Luminus Sun estima o GHI combinando:

1. **Irradiância extraterrestre (I₀):** calculada com base na latitude, longitude e posição orbital da Terra no instante previsto.
2. **Fator de transmitância atmosférica (τ):** modelado a partir da cobertura de nuvens, umidade e altitude da estação INMET associada ao usuário.
3. **Correção por ângulo zenital solar (θz):** aplicada hora a hora para os 5 dias de previsão.

```
GHI_estimado = I₀ × τ(nuvens, umidade, altitude) × cos(θz)
```

> Os dados de geração real da **ONS** funcionam como *ground truth* para validação das estimativas regionais, permitindo calibrar o modelo por subsistema (SE/CO, S, NE, N).

### Saída do Modelo e Consumo pela IA

Os valores de GHI estimados hora a hora são estruturados como séries temporais e entregues ao **Gemini Flash 2.5** como contexto quantitativo. A IA interpreta os padrões preditivos e produz:

- 🕐 **Top 3 janelas horárias** de maior disponibilidade solar para consumo ou geração
- 📉 **Alertas de baixa irradiância** antecipando períodos nublados
- 💡 **Recomendações personalizadas** de eficiência baseadas no histórico do usuário (memória conversacional via MongoDB)

```
Série temporal GHI (5 dias × 24h) → Gemini (prompt estruturado) → Recomendações + Relatório HTML
```

### Aprendizado Contínuo

A **memória conversacional** armazenada no MongoDB permite que o modelo de recomendação evolua por usuário ao longo do tempo. Interações anteriores, padrões de consumo informados e feedbacks implícitos são incorporados ao contexto das análises subsequentes, tornando as predições progressivamente mais precisas e personalizadas.


## 🧠 Como Funciona

| # | Etapa | Descrição | Tecnologia |
|---|---|---|---|
| 1️⃣ | **Cadastro** | Usuário informa nome, e-mail, cidade e estado | Next.js + MongoDB |
| 2️⃣ | **Geocodificação** | Identifica a estação INMET mais próxima via coordenadas | OpenWeather Geo + INMET |
| 3️⃣ | **Coleta Climática** | Previsão horária (5 dias) com variáveis meteorológicas | OpenWeather API |
| 4️⃣ | **Cálculo Solar** | Estimativa de irradiância (GHI) por lat/lon, nuvens e altitude | Algoritmo GHI interno |
| 5️⃣ | **Análise IA** | Gemini processa dados e gera recomendações personalizadas | Google Gemini Flash 2.5 |
| 6️⃣ | **Relatório** | 3 melhores horários para consumo + dicas de economia | n8n + Gemini |
| 7️⃣ | **Envio** | Relatório HTML responsivo enviado por e-mail | SendGrid |
| 8️⃣ | **Persistência** | Histórico e memória conversacional para aprendizado contínuo | MongoDB |

## 🚀 Instalação

### Pré-requisitos

- Bun 1.3.1+ / Node.js 18+
- MongoDB 7.0+ (local ou Atlas)
- Conta n8n
- Chaves de API: OpenWeather, Google Gemini, SendGrid

### Backend

``` 
git clone https://github.com/arthurpestana/hackathon-2025-backend.git 
```
```
cd hackathon-2025-backend 
```

```
npm install
```

``` 
cp .env.example .env
```

``` 
npm run dev                       
```

```
npm run build && npm start           
```

### Frontend

```
git clone https://github.com/arthurpestana/hackathon-2025-frontend.git
```

```
cd hackathon-2025-frontend
```

```
npm install
```

```
cp .env.example .env.local
```

```
npm run dev
```

Acesse: `http://localhost:3000`


## 🔐 Variáveis de Ambiente

```env
# MongoDB
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/luminus

# APIs Externas
OPENWEATHER_API_KEY=sua_chave_openweather
GEMINI_API_KEY=sua_chave_gemini
SENDGRID_API_KEY=sua_chave_sendgrid

# n8n
N8N_WEBHOOK_URL=https://seu-n8n.com/webhook/luminus

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

| Serviço | Link |
|---|---|
| OpenWeather | [openweathermap.org/api](https://openweathermap.org/api) |
| Google Gemini | [ai.google.dev](https://ai.google.dev) |
| SendGrid | [sendgrid.com](https://sendgrid.com) |
| MongoDB | [mongodb.com](https://www.mongodb.com) |


## API — Módulos e Rotas

### Auth — `/auth`
| Método | Rota | Descrição |
|---|---|---|
| POST | `/auth/login` | Autenticação com cookie JWT |
| POST | `/auth/register` | Cadastro de novo usuário |
| POST | `/auth/logout` | Encerramento de sessão |

### Users — `/users`
| Método | Rota | Descrição |
|---|---|---|
| GET | `/users` | Listar usuários com região associada |
| GET | `/users/:id` | Buscar usuário por ID |
| POST | `/users` | Criar usuário |
| PUT | `/users/:id` | Atualizar usuário |
| DELETE | `/users/:id` | Remover usuário |

### Region Stations — `/regionStations`
| Método | Rota | Descrição |
|---|---|---|
| GET | `/regionStations` | Listar todas as estações |
| GET | `/regionStations/uf/:uf` | Filtrar por UF |
| POST | `/regionStations` | Criar estação (admin) |
| PUT | `/regionStations/:id` | Atualizar estação |
| DELETE | `/regionStations/:id` | Remover estação |

### Weather — `/weather`
| Método | Rota | Descrição |
|---|---|---|
| GET | `/weather` | Listar registros climáticos (camada Silver) |
| GET | `/weather/region/:id` | Clima por região |
| POST | `/weather` | Criar registro |
| POST | `/weather/bulk` | Inserção em massa (ETL batch) |

### Energy — `/energy`
| Método | Rota | Descrição |
|---|---|---|
| GET | `/energy` | Listar geração energética |
| GET | `/energy/region/:region` | Filtrar por região |
| GET | `/energy/type/:type` | Filtrar por tipo |
| GET | `/energy/report/:region` | Relatório de performance (validação do modelo GHI) |
| POST | `/energy/sync/ons` | Sincronizar dados da ONS (ground truth) |

### Forecast — `/forecast-energy`
| Método | Rota | Descrição |
|---|---|---|
| GET | `/forecast-energy` | Listar previsões (camada Gold) |
| GET | `/forecast-energy/region/:id/next5days` | Série temporal GHI — próximos 5 dias |
| POST | `/forecast-energy/generate/:regionId` | Executar modelo preditivo por região |
| POST | `/forecast-energy/generate-all` | Executar modelo preditivo para todas as regiões |

### Serviços Externos
| Método | Rota | Descrição |
|---|---|---|
| POST | `/inmet/sync` | Sincronizar estações INMET (feature: altitude) |
| GET | `/openweather/current` | Clima atual por coordenadas |
| GET | `/openweather/forecast5d` | Previsão 5 dias 3h/3h (features meteorológicas brutas) |
| GET | `/ibge-geocoding/states` | Listar estados via IBGE |
| GET | `/ibge-geocoding/states/:uf/cities` | Municípios por UF |


## 🔄 Workflows n8n

### 📧 AI Notification Agent
Disparado diariamente às **10h** via cron. Executa o pipeline completo de dados: coleta features climáticas atualizadas, aciona o modelo GHI, processa a série temporal preditiva com o Gemini (com memória conversacional em MongoDB) e envia relatório HTML personalizado por e-mail via SendGrid.


### 💬 Climate Virtual AI Assistant
Chatbot climático ativado por webhook POST. Recebe mensagem do usuário, recupera o histórico preditivo e a memória conversacional no MongoDB e responde com análise solar personalizada baseada nas predições de GHI do usuário.


> Os arquivos estão em `workflows/` e podem ser importados diretamente no n8n.

## 📋 Requisitos

### ✅ Funcionais

| ID | Descrição | Status |
|---|---|---|
| RF01 | Iniciar fluxo de automação após cadastro | ✅ |
| RF02 | Persistir análise da IA e histórico de predições por usuário | ✅ |
| RF03 | Obter previsão climática horária via OpenWeather | ✅ |
| RF04 | Executar pipeline de feature engineering antes da inferência do modelo GHI | ✅ |
| RF05 | Alimentar AI Agent com série temporal GHI e dados meteorológicos | ✅ |
| RF06 | Gerar relatório com 3 melhores janelas horárias + dicas baseadas no perfil preditivo | ✅ |
| RF07 | Geocodificação para estação INMET mais próxima (feature de altitude e coordenadas) | ✅ |
| RF08 | Validar estimativas GHI com dados reais de geração solar (ONS) | ✅ |
| RF09 | Enviar relatório HTML ao e-mail do usuário | ✅ |

### ⚙️ Não Funcionais

| ID | Categoria | Descrição | Status |
|---|---|---|---|
| RNF01 | Desempenho | Tempo de resposta do pipeline preditivo completo < 10 segundos | ✅ |
| RNF02 | Segurança | Senhas com hash bcrypt, JWT HttpOnly | ✅ |
| RNF03 | Confiabilidade | Tratamento de falhas em APIs externas | ✅ |
| RNF04 | Usabilidade | Relatórios HTML responsivos (Gmail, Outlook) | ✅ |
| RNF05 | Qualidade de Dados | Validação de schemas via Zod em todas as camadas do pipeline | ✅ |

## 👥 Equipe

### Sistemas de Informação

| Nome | GitHub | 
|---|---|
| Arthur Henrique Pestana | [@arthurpestana](https://github.com/arthurpestana) | 
| Bruno Sales Noleto | [@Brunosno](https://github.com/Brunosno) |
| Juliana Chaves | — 
| Marcos Ribeiro | [@marcosguida](https://github.com/marcosguida) |

### Engenharia Agronômica

| Nome | Papel |
|---|---|
| Graciliano Henrique | Consultoria Técnica Agronômica |


