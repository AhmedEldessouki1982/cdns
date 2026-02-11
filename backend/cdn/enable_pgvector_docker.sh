#!/bin/bash
# Script to enable pgvector extension in Docker PostgreSQL container
# Usage: ./enable_pgvector_docker.sh [postgres_password]

CONTAINER_NAME="postgres"
DB_NAME="eldessouki"
DB_USER="eldessouki"
DB_PASSWORD="eldessouki"

# Try to get postgres superuser password from argument or environment
POSTGRES_PASSWORD="${1:-${POSTGRES_PASSWORD:-postgres}}"

echo "🔍 Checking if pgvector extension is available..."
docker exec -e PGPASSWORD=$DB_PASSWORD $CONTAINER_NAME psql -U $DB_USER -d $DB_NAME -c "SELECT name, default_version FROM pg_available_extensions WHERE name = 'vector';"

echo ""
echo "🔧 Attempting to enable pgvector extension as superuser..."

# Try with postgres superuser
docker exec -e PGPASSWORD=$POSTGRES_PASSWORD $CONTAINER_NAME psql -U postgres -d $DB_NAME -c "CREATE EXTENSION IF NOT EXISTS vector;" 2>&1

if [ $? -eq 0 ]; then
    echo "✅ pgvector extension enabled successfully!"
    echo ""
    echo "Now you can run the migration:"
    echo "  cd /mnt/data/coding/tanStack/CDN/backend/cdn"
    echo "  npx prisma migrate dev"
    exit 0
fi

echo ""
echo "⚠️  Could not enable extension with default postgres password."
echo ""
echo "Please run one of these commands manually:"
echo ""
echo "Option 1: If you know the postgres superuser password:"
echo "  docker exec -e PGPASSWORD=<your_postgres_password> $CONTAINER_NAME psql -U postgres -d $DB_NAME -c 'CREATE EXTENSION IF NOT EXISTS vector;'"
echo ""
echo "Option 2: Grant superuser privileges to eldessouki user (requires postgres superuser):"
echo "  docker exec -e PGPASSWORD=<postgres_password> $CONTAINER_NAME psql -U postgres -d $DB_NAME -c \"ALTER USER eldessouki WITH SUPERUSER;\""
echo "  docker exec -e PGPASSWORD=$DB_PASSWORD $CONTAINER_NAME psql -U $DB_USER -d $DB_NAME -c 'CREATE EXTENSION IF NOT EXISTS vector;'"
echo ""
echo "Option 3: Connect to the container interactively:"
echo "  docker exec -it $CONTAINER_NAME bash"
echo "  psql -U postgres -d eldessouki"
echo "  # Then run: CREATE EXTENSION IF NOT EXISTS vector;"
