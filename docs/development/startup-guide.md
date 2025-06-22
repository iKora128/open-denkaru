# Open Denkaru 起動ガイド

このドキュメントでは、Open Denkaru EMRシステムの起動方法を詳しく説明します。

## 🚀 クイックスタート（推奨）

### 1. 前提条件の確認

```bash
# 必要なツールがインストールされているか確認
node --version       # Node.js 18以上
python --version     # Python 3.11以上
brew --version       # Homebrew（macOS）
```

### 2. 必要なサービスのインストール（初回のみ）

```bash
# PostgreSQL 15のインストール
brew install postgresql@15
brew services start postgresql@15

# Redisのインストール
brew install redis
brew services start redis

# Python依存関係のインストール（uvを使用）
cd backend
uv sync

# Node.js依存関係のインストール
cd ../frontend
npm install
```

### 3. データベースのセットアップ（初回のみ）

```bash
# PostgreSQLのPATHを通す
export PATH="/opt/homebrew/opt/postgresql@15/bin:$PATH"

# データベースとユーザーの作成
createdb open_denkaru
psql open_denkaru -c "CREATE USER postgres WITH PASSWORD 'password';"
psql open_denkaru -c "GRANT ALL PRIVILEGES ON DATABASE open_denkaru TO postgres;"
psql open_denkaru -c "GRANT ALL ON SCHEMA public TO postgres;"

# マイグレーションの実行
cd backend
PYTHONPATH=. SECRET_KEY=dev-secret-key-replace-in-production \
DATABASE_URL=postgresql+asyncpg://postgres:password@localhost:5432/open_denkaru \
REDIS_URL=redis://localhost:6379/0 \
uv run alembic upgrade head

# テストデータの作成（オプション）
PYTHONPATH=. SECRET_KEY=dev-secret-key-replace-in-production \
DATABASE_URL=postgresql+asyncpg://postgres:password@localhost:5432/open_denkaru \
REDIS_URL=redis://localhost:6379/0 \
uv run python create_simple_patients.py
```

## 🖥️ システムの起動

### 方法1: 個別起動（開発時推奨）

#### バックエンドの起動
```bash
cd backend

# 環境変数を設定して起動
PYTHONPATH=. \
SECRET_KEY=dev-secret-key-replace-in-production \
DATABASE_URL=postgresql+asyncpg://postgres:password@localhost:5432/open_denkaru \
REDIS_URL=redis://localhost:6379/0 \
uv run uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

#### フロントエンドの起動（別ターミナル）
```bash
cd frontend
npm run dev
```

### 方法2: バックグラウンド起動

```bash
# バックエンドをバックグラウンドで起動
cd backend
nohup env PYTHONPATH=. \
SECRET_KEY=dev-secret-key-replace-in-production \
DATABASE_URL=postgresql+asyncpg://postgres:password@localhost:5432/open_denkaru \
REDIS_URL=redis://localhost:6379/0 \
uv run uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload > backend.log 2>&1 &

# フロントエンドをバックグラウンドで起動
cd ../frontend
nohup npm run dev > frontend.log 2>&1 &
```

### 方法3: 簡易APIサーバー（テスト用）

現在、メインAPIに関係性の問題があるため、簡易APIサーバーを使用できます：

```bash
cd backend
PYTHONPATH=. \
SECRET_KEY=dev-secret-key-replace-in-production \
DATABASE_URL=postgresql+asyncpg://postgres:password@localhost:5432/open_denkaru \
REDIS_URL=redis://localhost:6379/0 \
uv run python test_simple_api.py
```

## 🌐 アクセスURL

起動後、以下のURLでアクセスできます：

- **フロントエンド**: http://localhost:3000 (または3001, 3002)
- **バックエンドAPI**: http://localhost:8000
- **簡易API**: http://localhost:8001
- **APIドキュメント**: http://localhost:8000/docs

## 🛑 システムの停止

### すべてのプロセスを停止

```bash
# 使用中のポートを確認
lsof -i :3000 -i :3001 -i :3002 -i :8000 -i :8001

# プロセスを停止
lsof -ti:3000 -ti:3001 -ti:3002 -ti:8000 -ti:8001 | xargs kill -9

# PostgreSQLとRedisを停止（必要な場合）
brew services stop postgresql@15
brew services stop redis
```

## 🔧 トラブルシューティング

### ポートが使用中の場合
```bash
# 特定のポートを使用しているプロセスを確認
lsof -i :ポート番号

# プロセスを強制終了
kill -9 プロセスID
```

### データベース接続エラーの場合
```bash
# PostgreSQLが起動しているか確認
brew services list | grep postgresql

# 再起動
brew services restart postgresql@15
```

### 権限エラーの場合
```bash
# データベースの権限を再設定
psql open_denkaru -c "GRANT ALL ON SCHEMA public TO postgres;"
psql open_denkaru -c "GRANT CREATE ON DATABASE open_denkaru TO postgres;"
```

## 📝 環境変数

### 必須環境変数
- `SECRET_KEY`: セキュリティキー（本番環境では安全な値に変更）
- `DATABASE_URL`: PostgreSQL接続URL
- `REDIS_URL`: Redis接続URL

### オプション環境変数
- `DEBUG`: デバッグモード（true/false）
- `LOG_LEVEL`: ログレベル（INFO/DEBUG/WARNING/ERROR）
- `CORS_ORIGINS`: 許可するオリジン（カンマ区切り）

## 🔄 開発フロー

1. **コード変更**
   - バックエンド: 自動リロード（--reload オプション）
   - フロントエンド: Hot Module Replacement（自動）

2. **データベース変更**
   ```bash
   # 新しいマイグレーションを作成
   cd backend
   uv run alembic revision --autogenerate -m "変更内容の説明"
   
   # マイグレーションを適用
   uv run alembic upgrade head
   ```

3. **ログの確認**
   ```bash
   # バックエンドログ
   tail -f backend/backend.log
   
   # フロントエンドログ
   tail -f frontend/frontend.log
   ```

## 🎯 推奨される開発環境

- **IDE**: VS Code with Python/TypeScript extensions
- **ターミナル**: iTerm2 または Terminal.app
- **API テスト**: Postman または curl
- **データベース管理**: TablePlus または pgAdmin

## 📞 サポート

問題が発生した場合は、以下を確認してください：

1. [トラブルシューティングガイド](./troubleshooting.md)
2. [GitHub Issues](https://github.com/your-org/open-denkaru/issues)
3. [Discord コミュニティ](https://discord.gg/open-denkaru)