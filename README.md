# 🎮 Painel Minecraft - Server Management Dashboard

Uma aplicação web moderna para gerenciamento de servidores Minecraft através de uma interface intuitiva e segura.

## 📋 Visão Geral

Este projeto é um painel de administração completo que permite gerenciar servidores Minecraft remotamente via SSH, com autenticação segura, monitoramento em tempo real e interface moderna construída com as melhores práticas de desenvolvimento.

## ✨ Funcionalidades

### 🔐 **Segurança**
- Autenticação JWT com cookies httpOnly
- Rate limiting para proteção contra ataques
- Configuração segura de variáveis de ambiente
- Validação de inputs com Zod

### 🖥️ **Gerenciamento de Servidor**
- Conexão SSH segura com VPS
- Comandos remotos para controle do servidor Minecraft
- Monitoramento de status em tempo real
- Sistema de logs estruturados

### 🚀 **Performance**
- Backend com Fastify (2x mais rápido que Express)
- TypeScript para tipagem segura
- Arquitetura modular e escalável
- Hot reload em desenvolvimento

## 🛠️ Stack Tecnológico

### **Backend**
- **[Fastify](https://www.fastify.io/)** - Framework web ultra-rápido
- **[TypeScript](https://www.typescriptlang.org/)** - Tipagem estática
- **[JWT](https://jwt.io/)** - Autenticação stateless
- **[bcryptjs](https://www.npmjs.com/package/bcryptjs)** - Hash de senhas
- **[node-ssh](https://www.npmjs.com/package/node-ssh)** - Cliente SSH
- **[Winston](https://www.npmjs.com/package/winston)** - Logging estruturado
- **[Zod](https://zod.dev/)** - Validação de schemas

### **Ferramentas**
- **[tsx](https://tsx.is/)** - TypeScript executor com hot reload
- **[Prisma](https://www.prisma.io/)** - ORM (configurado para uso futuro)
- **ESLint** - Linting e qualidade de código

## 📁 Estrutura do Projeto

```
painel-minecraft/
├── backend/
│   ├── src/
│   │   ├── routes/          # Rotas da API
│   │   ├── services/        # Lógica de negócio
│   │   ├── middleware/      # Middlewares
│   │   ├── utils/           # Utilitários
│   │   └── types/           # Definições de tipos
│   ├── package.json
│   └── tsconfig.json
├── .env.example            # Template de variáveis de ambiente
├── .gitignore              # Arquivos ignorados pelo Git
└── README.md               # Este arquivo
```

## 🚀 Getting Started

### **Pré-requisitos**
- Node.js 18+
- npm ou yarn
- Chave SSH configurada para acesso ao servidor Minecraft

### **1. Clone o Repositório**
```bash
git clone https://github.com/seu-usuario/painel-minecraft.git
cd painel-minecraft
```

### **2. Configure as Variáveis de Ambiente**
```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:
```env
# Server Configuration
NODE_ENV=development
PORT=3000

# JWT Configuration
JWT_SECRET=sua-chave-secreta-aqui
JWT_EXPIRES=86400

# Admin User Configuration
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=hash-da-senha-aqui

# SSH Configuration
VPS_IP=ip-do-seu-servidor
SSH_USER=usuario-ssh
SSH_KEY_PATH=/caminho/para/sua/chave-ssh
```

### **3. Instale as Dependências**
```bash
cd backend
npm install
```

### **4. Inicie o Servidor**
```bash
npm run dev
```

O servidor estará disponível em `http://localhost:3000`

## 📚 API Reference

### **Autenticação**
```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "senha"}' \
  -c cookies.txt

# Verificar token
curl http://localhost:3000/api/auth/verify \
  -b cookies.txt

# Logout
curl -X POST http://localhost:3000/api/auth/logout \
  -b cookies.txt
```

### **Gerenciamento de Servidor**
```bash
# Status do servidor
curl http://localhost:3000/api/server/status \
  -b cookies.txt

# Iniciar servidor Minecraft
curl -X POST http://localhost:3000/api/server/start \
  -b cookies.txt

# Parar servidor Minecraft
curl -X POST http://localhost:3000/api/server/stop \
  -b cookies.txt

# Reiniciar servidor Minecraft
curl -X POST http://localhost:3000/api/server/restart \
  -b cookies.txt
```

## 🔧 Configuração Avançada

### **Segurança**
- Todas as credenciais são armazenadas em variáveis de ambiente
- Cookies configurados como httpOnly e secure em produção
- Rate limiting configurado para prevenir ataques de força bruta
- Validação rigorosa de todos os inputs

### **Logging**
O sistema utiliza Winston para logging estruturado:
```javascript
// Logs são salvos em backend/logs/
// Níveis: error, warn, info, debug
// Formato JSON para fácil análise
```

### **SSH Configuration**
A conexão SSH é estabelecida usando chaves privadas:
```javascript
// Configuração recomendada:
// - Chaves Ed25519 ou RSA 4096+
// - Sem senhas na chave (use ssh-agent)
// - Usuário dedicado para operações Minecraft
```

## 🎯 Roadmap

### **Versão 1.0 (Atual)**
- ✅ Autenticação segura
- ✅ Comandos SSH básicos
- ✅ API RESTful
- ✅ Logging estruturado

### **Versão 1.1 (Planejado)**
- 🔄 Frontend React/Next.js
- 🔄 WebSocket para atualizações em tempo real
- 🔄 Sistema de backup automático
- 🔄 Monitoramento de recursos (CPU, RAM, Disco)

### **Versão 2.0 (Futuro)**
- 📋 Multi-servidores
- 📋 Sistema de permissões
- 📋 Plugins marketplace
- 📋 Analytics e métricas

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/amazing-feature`)
3. Commit suas mudanças (`git commit -m 'Add amazing feature'`)
4. Push para a branch (`git push origin feature/amazing-feature`)
5. Abra um Pull Request

### **Guidelines**
- Siga os padrões de código estabelecidos
- Adicione testes para novas funcionalidades
- Documente suas mudanças
- Mantenha a compatibilidade com a API atual

## 📝 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 👨‍💻 Sobre o Desenvolvedor

Olá! Sou um desenvolvedor apaixonado por criar soluções robustas e eficientes. Este projeto nasceu da necessidade de gerenciar servidores Minecraft de forma mais prática e segura, combinando modernas práticas de desenvolvimento com uma interface intuitiva.

### **Princípios de Desenvolvimento**
- **Segurança em Primeiro Lugar**: Cada linha de código é escrita com segurança em mente
- **Performance**: Otimização contínua para garantir a melhor experiência
- **Código Limpo**: Estrutura modular e documentação clara
- **Aprendizado Contínuo**: Sempre atualizado com as melhores práticas do mercado

### **Contato**
- 📧 Email: [Padilhakawashakil@gmail.com]
- 💼 LinkedIn: [https://www.linkedin.com/in/leonardo-padilha-kawashaki/]
- 🐙 GitHub: [https://github.com/Padokazzz]

---

## ⭐ Agradecimentos

Agradeço a toda a comunidade open source que torna projetos como este possíveis, especialmente:
- Equipe Fastify pelo framework incrível
- Comunidade TypeScript pela tipagem segura
- Todos os contribuidores das bibliotecas utilizadas

**Built with ❤️ and lots of ☕**
