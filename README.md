*This project has been created as part of the 42 curriculum by nmatondo, emalungo, asebasti *

# ft_transcendence - BidLive

## 🔑 Geração e Gerenciamento de Certificados HTTPS (Root CA)

Para garantir a comunicação segura HTTPS descentralizada entre os containers, utilizaremos o **CFSSL** (Cloudflare's PKI Toolkit).

A autoridade certificadora (Root CA) é composta pelos seguintes arquivos dentro da pasta `secrets/`:
- `ca-config.json`: Define as políticas de assinatura, perfis e o tempo de expiração do certificado.
- `ca-csr.json`: Define as informações da Autoridade Certificadora (CN, localização, algoritmos de criptografia).
- `ca.pem`: O certificado raiz público (distribuído aos containers).
- `ca-key.pem`: A chave privada do CA raiz (deve ser mantida em segredo absoluto).

---

### 1. Criar os Arquivos de Configuração

Os arquivos de configuração devem estar localizados no diretório `secrets/` do projeto. Se não existirem, crie-os com o seguinte conteúdo:

#### `secrets/ca-config.json`
Define que os certificados assinados expirarão em 10 anos (`87600h`) e podem ser usados para autenticação de servidor e cliente.
```json
{
  "signing": {
    "default": {
      "expiry": "87600h",
      "usages": [
        "signing",
        "key encipherment",
        "server auth",
        "client auth"
      ]
    }
  }
}
```

#### `secrets/ca-csr.json`
Define os metadados da Autoridade Certificadora Raiz.
```json
{
  "CN": "BidLive Root CA",
  "key": {
    "algo": "rsa",
    "size": 4096
  },
  "names": [
    {
      "C": "AO",
      "ST": "Luanda",
      "L": "Luanda",
      "O": "BidLive",
      "OU": "Security"
    }
  ]
}
```

---

### 2. Gerar o CA Raiz (`ca.pem` e `ca-key.pem`)

Você pode gerar os arquivos de duas maneiras:

#### Método A: Usando o Makefile do Projeto (Recomendado)
O projeto possui uma regra no `Makefile` que automatiza a criação usando Docker (sem necessidade de instalar o `cfssl` localmente).

Execute o seguinte comando na raiz do projeto:
```bash
make ca
```
*Isso executará o script `srcs/ca/generate_ca.sh`, que usa o Docker para rodar o CFSSL temporariamente, lê os arquivos JSON em `secrets/` e gera os certificados.*

#### Método B: Usando Docker Diretamente
Se preferir gerar manualmente sem o `Makefile`, execute o comando a partir da raiz do projeto:
```bash
# 1. Gerar o CA
docker run --rm -i \
  -v "$(pwd)/secrets:/secrets" \
  -w /secrets \
  cfssl/cfssl gencert -initca /secrets/ca-csr.json | \
  docker run --rm -i \
    --entrypoint cfssljson \
    -v "$(pwd)/secrets:/secrets" \
    -w /secrets \
    cfssl/cfssl -bare /secrets/ca

# 2. Limpar arquivo de request temporário e ajustar permissões
rm -f secrets/ca.csr
chmod 644 secrets/ca.pem
chmod 600 secrets/ca-key.pem
```

#### Método C: Usando CFSSL Instalado Localmente
Se você tiver o `cfssl` e `cfssljson` instalados localmente na sua máquina:
```bash
cfssl gencert -initca secrets/ca-csr.json | cfssljson -bare secrets/ca
```

---

### ⚠️ Importante sobre Segurança

> [!WARNING]
> A chave privada `ca-key.pem` é a base de confiança de toda a comunicação HTTPS interna dos containers.
> **Nunca a compartilhe ou comite no repositório Git!**
> Ela já foi adicionada ao `.gitignore` para evitar vazamentos acidentais.

---

### ⚙️ Como Funciona nos Containers
Durante a inicialização de cada container (ex.: `nginx`, `backend`, `frontend`), os arquivos `ca.pem`, `ca-key.pem` e `ca-config.json` são montados via **Docker Secrets** em `/run/secrets/`.

O script `generate_cert.sh` é acionado pelo entrypoint de cada serviço para:
1. Gerar dinamicamente os certificados internos (`server.crt` e `server.key`) assinados pela Root CA.
2. Adicionar o `ca.pem` ao trust store local do container para que ele possa validar chamadas HTTPS feitas para os outros containers.
