# 開発環境セットアップ・起動ガイド

Open Denkaru EMRシステムの開発環境セットアップと起動方法を説明します。

## 📋 前提条件

以下のソフトウェアがインストールされている必要があります：

- **Docker & Docker Compose**: コンテナ環境
- **Python 3.11+**: バックエンド開発
- **Node.js 18+**: フロントエンド開発
- **uv**: Python パッケージマネージャー（推奨）

## 🚀 クイックスタート

### 1. リポジトリのクローン

```bash
git clone <repository-url>
cd open-denkaru
```

### 2. 環境変数設定

```bash
# バックエンド環境変数
cp backend/.env.example backend/.env
# 必要に応じて設定を編集
```

### 3. データベース起動

```bash
# PostgreSQLとRedisを起動
docker compose up postgres redis -d

# データベース接続確認
docker compose ps
```

### 4. データベースマイグレーション実行

```bash
# マイグレーション実行
cd backend
uv sync  # 依存関係インストール
uv run alembic upgrade head
```

### 5. テストデータ作成（オプション）

```bash
# 認証テスト用のユーザー・ロール作成
PYTHONPATH=/path/to/open-denkaru/backend uv run python backend/app/scripts/create_test_data.py
```

## 🔧 開発サーバー起動

### バックエンド起動（FastAPI）

#### 方法1: uvコマンド（推奨）

```bash
cd backend
uv sync  # 初回のみ

# 開発サーバー起動
PYTHONPATH=/path/to/open-denkaru/backend uv run uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

#### 方法2: Dockerコンテナ

```bash
# バックエンドコンテナ起動
docker compose up backend -d

# ログ確認
docker compose logs backend -f
```

### フロントエンド起動（Next.js）

#### 方法1: npmコマンド（推奨）

```bash
cd frontend
npm install  # 初回のみ

# 開発サーバー起動
npm run dev
```

#### 方法2: Dockerコンテナ

```bash
# フロントエンドコンテナ起動
docker compose up frontend -d

# ログ確認
docker compose logs frontend -f
```

## 🌐 アクセスURL

起動完了後、以下のURLでアクセス可能：

| サービス | URL | 説明 |
|---------|-----|------|
| **フロントエンド** | http://localhost:3000 | メインアプリケーション |
| **バックエンドAPI** | http://localhost:8000 | REST API |
| **API文書** | http://localhost:8000/api/docs | Swagger UI |
| **ヘルスチェック** | http://localhost:8000/health | サーバー状態確認 |

## 🔐 認証テスト

システムが正常に起動したら、認証機能をテストできます：

### テストユーザー

```bash
# 以下のテストユーザーが利用可能（create_test_data.py実行後）
Username: admin      Password: AdminPassword123!
Username: doctor1    Password: DoctorPassword123!
Username: nurse1     Password: NursePassword123!
```

### APIテスト例

```bash
# ログインテスト
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"AdminPassword123!"}'

# ヘルスチェック
curl http://localhost:8000/health
```

## 🐛 トラブルシューティング

### よくある問題と解決方法

#### 1. ポート競合エラー

```bash
# ポート使用状況確認
lsof -i :8000  # バックエンド
lsof -i :3000  # フロントエンド
lsof -i :5432  # PostgreSQL

# プロセス終了
kill -9 <PID>
```

#### 2. データベース接続エラー

```bash
# PostgreSQL接続確認
docker compose exec postgres psql -U postgres -d open_denkaru -c "SELECT version();"

# コンテナ再起動
docker compose restart postgres
```

#### 3. マイグレーションエラー

```bash
# マイグレーション状態確認
cd backend
uv run alembic current
uv run alembic history

# マイグレーション再実行
uv run alembic upgrade head
```

#### 4. 依存関係エラー

```bash
# Python依存関係再インストール
cd backend
uv sync --reinstall

# Node.js依存関係再インストール
cd frontend
rm -rf node_modules package-lock.json
npm install
```

## 🔧 開発ツール

### データベース管理

```bash
# pgAdmin起動（GUI管理ツール）
docker compose up pgadmin -d
# http://localhost:5050 でアクセス
# Email: admin@open-denkaru.local, Password: admin

# Redis Commander起動
docker compose up redis-commander -d
# http://localhost:8081 でアクセス
```

### 監視・ログ

```bash
# Prometheus監視
docker compose up prometheus -d
# http://localhost:9090

# Grafana分析
docker compose up grafana -d
# http://localhost:3001 (admin/admin)

# リアルタイムログ
docker compose logs -f backend frontend
```

## 📝 開発ワークフロー

1. **機能開発**
   ```bash
   # フィーチャーブランチ作成
   git checkout -b feature/new-feature
   
   # 開発サーバー起動
   npm run dev  # フロントエンド
   uv run uvicorn main:app --reload  # バックエンド
   ```

2. **テスト実行**
   ```bash
   # バックエンドテスト
   cd backend
   uv run pytest
   
   # フロントエンドテスト
   cd frontend
   npm test
   ```

3. **コードフォーマット**
   ```bash
   # Python
   cd backend
   uv run ruff format .
   uv run ruff check .
   
   # TypeScript
   cd frontend
   npm run lint
   npm run format
   ```

## 🚨 注意事項

- **本番環境では使用禁止**: このドキュメントは開発環境専用です
- **セキュリティ**: 開発用の認証情報は本番では変更してください
- **データ**: 開発環境のデータは定期的にリセットされる場合があります
- **ポート**: 他のサービスとポート競合しないよう注意してください

## 📞 サポート

問題が解決しない場合：

1. **GitHub Issues**: 技術的な問題報告
2. **Wiki**: 詳細なドキュメント
3. **Discord**: リアルタイム質問（開発チーム）

---

**Happy Coding! 🎉**

このガイドでOpen Denkaru EMRの開発を始められます。質問があれば遠慮なくお聞きください。