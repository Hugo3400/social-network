# MySQL/MariaDB Support 🐬

Le Social Hybrid Network supporte maintenant **deux types de bases de données** :

## Bases de données supportées

### 🐘 PostgreSQL (Recommandé)
- Port par défaut : **5432**
- Haute performance pour les opérations complexes
- Excellent support JSON
- Idéal pour les applications sociales avec relations complexes

### 🐬 MySQL / MariaDB
- Port par défaut : **3306**
- **Compatible phpMyAdmin** pour administration graphique
- Large adoption et support communautaire
- Parfait si vous avez déjà un environnement MySQL/LAMP

## Installation avec MySQL

### 1. Via l'assistant web (Recommandé)

Lors de l'installation, sélectionnez simplement **"MySQL / MariaDB"** dans le menu déroulant "Database Type". Le port sera automatiquement ajusté à 3306.

### 2. Configuration Docker avec MySQL

Ajoutez un service MySQL à votre `docker-compose.yml` :

```yaml
services:
  mysql:
    image: mysql:8.0
    container_name: social-hybrid-mysql
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: ${DB_PASSWORD:-changeme}
      MYSQL_DATABASE: social_hybrid
      MYSQL_USER: socialnet
      MYSQL_PASSWORD: ${DB_PASSWORD:-changeme}
    volumes:
      - mysql_data:/var/lib/mysql
      - ./backend/app/db/schema-mysql.sql:/docker-entrypoint-initdb.d/schema.sql
    ports:
      - "3306:3306"
    command: --default-authentication-plugin=mysql_native_password

volumes:
  mysql_data:
    driver: local
```

### 3. Avec phpMyAdmin

Ajoutez phpMyAdmin pour gérer votre base de données :

```yaml
services:
  phpmyadmin:
    image: phpmyadmin/phpmyadmin
    container_name: social-hybrid-phpmyadmin
    restart: always
    ports:
      - "8080:80"
    environment:
      PMA_HOST: mysql
      PMA_PORT: 3306
    depends_on:
      - mysql
```

Accédez ensuite à phpMyAdmin via http://localhost:8080

## Différences techniques

### Schémas SQL
- **PostgreSQL** : `backend/app/db/schema.sql`
- **MySQL** : `backend/app/db/schema-mysql.sql`

### Connecteurs
- **PostgreSQL** : Package `pg`
- **MySQL** : Package `mysql2`
- **Universel** : `backend/app/db/database-universal.js` (supporte les deux)

### Types de données
| PostgreSQL | MySQL |
|------------|-------|
| SERIAL | INT AUTO_INCREMENT |
| BOOLEAN | BOOLEAN |
| TIMESTAMP | TIMESTAMP |
| JSONB | JSON |
| TEXT | TEXT |

## Migration PostgreSQL → MySQL

Si vous avez une base PostgreSQL existante et souhaitez migrer vers MySQL :

```bash
# 1. Exporter les données PostgreSQL
pg_dump -U postgres social_hybrid > backup.sql

# 2. Convertir le dump (ajustements manuels nécessaires)
# - Remplacer SERIAL par INT AUTO_INCREMENT
# - Ajuster les types BOOLEAN
# - Convertir JSONB en JSON

# 3. Importer dans MySQL
mysql -u socialnet -p social_hybrid < backup_converted.sql
```

## Performances

### PostgreSQL est meilleur pour :
- Requêtes complexes avec JOINs multiples
- Full-text search avancé
- Données JSON complexes
- Transactions ACID strictes

### MySQL est meilleur pour :
- Lectures simples à haute vitesse
- Environnements LAMP traditionnels
- Compatibilité avec outils existants (phpMyAdmin)
- Réplication simple

## Support et compatibilité

✅ **Toutes les fonctionnalités sont supportées** sur les deux bases de données :
- Posts et feed social
- Groupes et membres
- Profils utilisateurs
- Messages et conversations en temps réel
- Notifications
- Hashtags et recherche

## Configuration recommandée

### Pour MySQL 8.0+
```ini
[mysqld]
max_connections = 200
innodb_buffer_pool_size = 1G
character-set-server = utf8mb4
collation-server = utf8mb4_unicode_ci
```

### Pour MariaDB 10.5+
```ini
[mariadb]
max_connections = 200
innodb_buffer_pool_size = 1G
character_set_server = utf8mb4
collation_server = utf8mb4_unicode_ci
```

## Dépannage

### Erreur de connexion MySQL
```bash
# Vérifier que MySQL est démarré
docker ps | grep mysql

# Voir les logs MySQL
docker logs social-hybrid-mysql

# Tester la connexion
mysql -h localhost -P 3306 -u socialnet -p
```

### Erreur "Authentication plugin 'caching_sha2_password'"
Ajoutez `--default-authentication-plugin=mysql_native_password` à la commande MySQL.

### Performance lente
- Augmentez `innodb_buffer_pool_size`
- Ajoutez des index sur les colonnes fréquemment requêtées
- Activez le query cache

## Outils recommandés

- **phpMyAdmin** : Administration web graphique
- **MySQL Workbench** : Client desktop officiel
- **Adminer** : Alternative légère à phpMyAdmin
- **DBeaver** : Client universel multi-plateformes

---

💡 **Conseil** : PostgreSQL est recommandé pour les nouvelles installations, mais MySQL/MariaDB est un excellent choix si vous avez déjà un environnement LAMP ou préférez phpMyAdmin.
