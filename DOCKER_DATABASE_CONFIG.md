# Configuration Base de Données avec Docker 🐳

## Problème courant: "connect ECONNREFUSED"

Si vous obtenez l'erreur `connect ECONNREFUSED ::1:3306` ou similaire, c'est un problème de réseau Docker.

### 🔧 Solutions selon votre configuration

## 1️⃣ Base de données dans Docker (même réseau)

Si votre base de données tourne aussi dans Docker sur le **même réseau** (`social-network_social-network`):

### Pour PostgreSQL:
```
Host: postgres
Port: 5432
Database: social_hybrid
User: postgres
Password: [votre mot de passe]
```

### Pour MySQL:
```
Host: mysql
Port: 3306
Database: social_hybrid
User: root ou socialnet
Password: [votre mot de passe]
```

**Note:** Utilisez le **nom du service** défini dans `docker-compose.yml`, pas `localhost`!

## 2️⃣ Base de données sur l'hôte (serveur local)

Si votre BDD tourne directement sur le serveur (pas dans Docker):

### Linux/Mac:
```
Host: host.docker.internal
Port: 3306 (MySQL) ou 5432 (PostgreSQL)
```

### Linux (alternative si host.docker.internal ne fonctionne pas):
```
Host: 172.17.0.1
Port: 3306 ou 5432
```

Pour trouver l'IP du bridge Docker:
```bash
docker network inspect bridge | grep Gateway
```

## 3️⃣ Base de données distante (serveur externe)

Si votre BDD est sur un autre serveur:

```
Host: [adresse IP ou nom de domaine]
Port: 3306 ou 5432
User: [votre utilisateur]
Password: [votre mot de passe]
```

## 🐘 Exemple avec PostgreSQL dans Docker

Ajoutez à votre `docker-compose.yml`:

```yaml
services:
  postgres:
    image: postgres:15-alpine
    container_name: social-hybrid-db
    environment:
      POSTGRES_DB: social_hybrid
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: votremotdepasse
    ports:
      - "5433:5432"  # Port externe: 5433 pour éviter conflits
    networks:
      - social-network

networks:
  social-network:
    driver: bridge
```

Puis dans l'interface web:
- **Host:** `postgres` (nom du service)
- **Port:** `5432` (port interne Docker)

## 🐬 Exemple avec MySQL dans Docker

Ajoutez à votre `docker-compose.yml`:

```yaml
services:
  mysql:
    image: mysql:8.0
    container_name: social-hybrid-mysql
    environment:
      MYSQL_ROOT_PASSWORD: votremotdepasse
      MYSQL_DATABASE: social_hybrid
    ports:
      - "3306:3306"
    networks:
      - social-network
```

Puis dans l'interface web:
- **Host:** `mysql` (nom du service)
- **Port:** `3306`

## 🔍 Diagnostic

### Vérifier que la BDD est accessible:

```bash
# Depuis le conteneur backend
docker exec -it social-hybrid-backend ping postgres
docker exec -it social-hybrid-backend ping mysql

# Tester la connexion PostgreSQL
docker exec -it social-hybrid-backend nc -zv postgres 5432

# Tester la connexion MySQL
docker exec -it social-hybrid-backend nc -zv mysql 3306
```

### Vérifier les réseaux Docker:

```bash
# Lister les réseaux
docker network ls

# Inspecter le réseau
docker network inspect social-network_social-network

# Voir quelle IP a chaque conteneur
docker inspect -f '{{.Name}} - {{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' $(docker ps -q)
```

## ⚠️ Erreurs courantes

### 1. `ECONNREFUSED ::1:3306` ou `::1:5432`
**Cause:** Vous utilisez `localhost` dans Docker  
**Solution:** Remplacez `localhost` par le nom du service (`postgres`, `mysql`) ou `host.docker.internal`

### 2. `getaddrinfo ENOTFOUND postgres`
**Cause:** Le service n'existe pas ou n'est pas sur le même réseau  
**Solution:** 
- Vérifiez que le service est défini dans `docker-compose.yml`
- Vérifiez qu'ils partagent le même réseau
- Redémarrez les conteneurs: `docker compose restart`

### 3. `Connection refused` mais le ping fonctionne
**Cause:** Le port n'est pas le bon ou la BDD n'écoute pas  
**Solution:** 
- Vérifiez le port avec `docker ps`
- Vérifiez les logs: `docker logs [nom-conteneur]`

### 4. `Access denied for user`
**Cause:** Mauvais identifiants  
**Solution:** Vérifiez les variables d'environnement dans `docker-compose.yml`

## 💡 Configuration recommandée

Pour une installation complète avec Docker:

```yaml
version: '3.8'

services:
  # Base de données PostgreSQL
  postgres:
    image: postgres:15-alpine
    container_name: social-hybrid-db
    restart: always
    environment:
      POSTGRES_DB: social_hybrid
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5433:5432"
    networks:
      - social-network

  # Backend API
  backend:
    build: ./backend
    container_name: social-hybrid-backend
    restart: always
    ports:
      - "8091:3001"
    depends_on:
      - postgres
    networks:
      - social-network

  # Frontend
  frontend:
    build: ./frontend
    container_name: social-hybrid-frontend
    restart: always
    ports:
      - "8092:80"
    depends_on:
      - backend
    networks:
      - social-network

volumes:
  postgres_data:

networks:
  social-network:
    driver: bridge
```

Puis dans l'assistant web:
- **Type:** PostgreSQL
- **Host:** `postgres`
- **Port:** `5432`
- **Database:** `social_hybrid`
- **User:** `postgres`
- **Password:** [votre mot de passe défini dans .env.docker]

---

💡 **Astuce:** Si vous êtes en développement local sans Docker, utilisez `localhost`. Si vous utilisez Docker, utilisez toujours le **nom du service** Docker!
