# Phase 3: Authentication & Authorization System Design

## 概要

Open Denkaru Phase 3では、医療システムに特化したセキュアな認証・認可システムを実装します。オフライン運用対応、日本の医療法・個人情報保護法準拠、完全自前実装によるデータ主権確保を重視します。

## 技術選定（2025年ベストプラクティス対応）

### 認証ライブラリ選択理由

**選定**: `python-jose` + `argon2-cffi` + `SQLModel` + `pyotp`

**2025年セキュリティ要件対応**:
- **Argon2id採用**: OWASP推奨、メモリハード攻撃耐性（bcryptから変更）
- **JWT強化**: RS256/ECDSA、"none"アルゴリズム完全無効化
- **MFA統合**: TOTP/HOTP多要素認証対応（pyotp）
- **リアルタイム監査**: HIPAA 2025準拠の包括的ログ記録

**医療システム特化理由**:
- **オフライン完結**: 外部サービス依存なし、完全ローカル運用
- **医療データ保護**: データが外部に送信されない
- **災害対応**: インターネット遮断時も認証システム継続動作
- **GPU攻撃耐性**: Argon2idによる現代的ハードウェア攻撃対策
- **HIPAA準拠**: 2025年監査要件完全対応

### アーキテクチャ概要

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (Next.js)     │    │   (FastAPI)     │    │ (PostgreSQL)    │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ • Login Form    │◄──►│ • JWT Auth      │◄──►│ • users         │
│ • Session Mgmt  │    │ • Role Check    │    │ • roles         │
│ • Protected UI  │    │ • Audit Log     │    │ • permissions   │
│ • Logout        │    │ • Session Store │    │ • audit_logs    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## データベース設計

### ユーザー管理テーブル

```sql
-- ユーザー基本情報
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    
    -- 医療従事者情報
    medical_license_number VARCHAR(50),
    department VARCHAR(100),
    position VARCHAR(50),
    
    -- システム管理
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login_at TIMESTAMP WITH TIME ZONE,
    
    -- セキュリティ
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP WITH TIME ZONE,
    password_changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ロール（職種）管理
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) UNIQUE NOT NULL, -- doctor, nurse, admin, receptionist
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 権限管理
CREATE TABLE permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) UNIQUE NOT NULL, -- read_patient, write_prescription, etc.
    resource VARCHAR(50) NOT NULL,    -- patient, prescription, lab_order
    action VARCHAR(20) NOT NULL,      -- create, read, update, delete
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ユーザー・ロール関連付け
CREATE TABLE user_roles (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    assigned_by UUID REFERENCES users(id),
    PRIMARY KEY (user_id, role_id)
);

-- ロール・権限関連付け
CREATE TABLE role_permissions (
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

-- セッション管理（Redis代替）
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    refresh_token VARCHAR(255) UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT
);
```

### 監査ログテーブル

```sql
-- 包括的監査ログ（HIPAA 2025準拠）
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- アクション情報
    user_id UUID REFERENCES users(id),
    action VARCHAR(50) NOT NULL,      -- login, logout, create_patient, etc.
    resource_type VARCHAR(50),        -- patient, prescription, user
    resource_id UUID,
    
    -- メタデータ
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT,
    session_id UUID REFERENCES user_sessions(id),
    
    -- 詳細情報
    details JSONB,                    -- 変更前後の値など
    success BOOLEAN DEFAULT TRUE,
    error_message TEXT,
    
    -- HIPAA 2025要件対応
    medical_significance VARCHAR(20), -- critical, important, routine
    retention_period INTEGER DEFAULT 7,  -- 保存年数
    phi_accessed BOOLEAN DEFAULT FALSE,  -- ePHI関連フラグ
    mfa_verified BOOLEAN DEFAULT FALSE,  -- MFA認証フラグ
    risk_score INTEGER DEFAULT 0,       -- リスクスコア（0-100）
    compliance_tags TEXT[],             -- コンプライアンスタグ
    
    -- 2025年追加要件
    geolocation POINT,                  -- 地理的位置情報
    device_fingerprint TEXT,            -- デバイス識別情報
    threat_indicators JSONB             -- 脅威インジケータ
);

-- インデックス最適化
CREATE INDEX idx_audit_logs_user_timestamp ON audit_logs(user_id, timestamp DESC);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action, timestamp DESC);
```

## 認証フロー

### 1. ログイン認証

```python
# 認証プロセス
1. ユーザー名/パスワード入力
2. パスワードハッシュ検証 (bcrypt)
3. アカウントロック状態確認
4. JWT アクセストークン生成 (15分有効)
5. リフレッシュトークン生成 (7日有効)
6. セッション情報 DB 保存
7. 監査ログ記録
```

### 2. 認可（Role-Based Access Control）

```python
# 権限チェックフロー
1. JWT トークン検証
2. ユーザー情報取得
3. ロール・権限情報取得
4. リソースアクセス可否判定
5. アクセス結果監査ログ記録
```

## セキュリティ要件

### パスワード要件（2025年OWASP準拠）
- **最小長さ**: 14文字（2025年推奨、8文字から強化）
- **複雑さ**: 大文字・小文字・数字・記号各1文字以上
- **履歴管理**: 過去8回のパスワードは再利用不可（5回から強化）
- **有効期限**: 医療従事者45日、一般職員60日（90日から短縮）
- **強制変更**: 初回ログイン、パスワードリセット後
- **ハッシュ化**: Argon2id（memory=19MiB, iterations=2, parallelism=1）

### アカウントロック
- **失敗回数**: 5回でロック
- **ロック時間**: 30分（管理者解除可能）
- **段階的遅延**: 失敗回数に応じてレスポンス遅延

### セッション管理（2025年強化版）
- **アクセストークン**: 15分有効、自動延長なし、RS256署名
- **リフレッシュトークン**: 7日有効、ローテーション必須
- **署名アルゴリズム**: RSA+SHA256（HS256から変更）、ECDSA対応
- **同時セッション**: ユーザー当たり最大2セッション（3から削減）
- **自動ログアウト**: 15分非アクティブで強制ログアウト（30分から短縮）
- **MFAトークン**: 30秒TOTP、バックアップコード8個

## 多職種対応ロール設計

### 基本ロール定義

```python
ROLES = {
    "doctor": {
        "display_name": "医師",
        "permissions": [
            "read_patient", "write_patient", "update_patient",
            "read_prescription", "write_prescription", "update_prescription",
            "read_lab_order", "write_lab_order", "update_lab_order",
            "read_medical_record", "write_medical_record"
        ]
    },
    "nurse": {
        "display_name": "看護師",
        "permissions": [
            "read_patient", "update_patient",
            "read_prescription", "execute_prescription",
            "read_lab_order", "collect_sample",
            "write_nursing_note"
        ]
    },
    "pharmacist": {
        "display_name": "薬剤師",
        "permissions": [
            "read_patient", "read_prescription", 
            "verify_prescription", "dispense_medication",
            "drug_interaction_check"
        ]
    },
    "receptionist": {
        "display_name": "受付",
        "permissions": [
            "read_patient", "create_patient", "update_patient_contact",
            "schedule_appointment", "check_insurance"
        ]
    },
    "admin": {
        "display_name": "システム管理者",
        "permissions": ["*"]  # 全権限
    }
}
```

## 実装計画

### Phase 3.1: 基盤実装 (Week 1-2)
- [ ] SQLModelベース認証モデル作成
- [ ] JWT認証エンドポイント実装
- [ ] パスワードハッシュ・検証機能
- [ ] 基本的な権限チェック機能

### Phase 3.2: セキュリティ強化 (Week 3-4)
- [ ] アカウントロック機能
- [ ] セッション管理システム
- [ ] パスワード要件強化
- [ ] 監査ログ基盤

### Phase 3.3: 多職種対応 (Week 5-6)
- [ ] RBAC (Role-Based Access Control) 完全実装
- [ ] 職種別UI表示制御
- [ ] 権限ベースAPI制御
- [ ] 多職種ワークフロー対応

### Phase 3.4: 監査・コンプライアンス (Week 7-8)
- [ ] 包括的監査ログシステム
- [ ] 医療法準拠データ保存
- [ ] セキュリティイベント監視
- [ ] コンプライアンスレポート機能

## セキュリティ監視

### 自動検知項目
- 異常ログイン試行（時間・場所・頻度）
- 権限昇格試行
- 大量データアクセス
- 通常時間外アクセス
- 複数端末同時ログイン

### アラート対応
- リアルタイム管理者通知
- 自動アカウントロック
- 詳細ログ記録
- インシデント追跡

## 災害対応・事業継続

### オフライン運用
- ローカル認証完全対応
- 災害時緊急アクセス機能
- データ同期再開自動処理
- 監査ログ継続記録

### バックアップ・復旧
- 認証データ暗号化バックアップ
- セッション状態復旧機能
- 監査ログ完全性保証
- 災害時手動認証モード

## 法的準拠事項

### 個人情報保護法対応
- 医療従事者個人情報最小化
- アクセスログ詳細記録
- データ保存期間管理（7年）
- 本人同意・開示対応

### 医療法対応
- 医師法に基づく電子署名準備
- 医療記録改ざん防止機能
- 法定保存期間自動管理
- 監査証跡完全性保証

## まとめ

Phase 3認証システムは、医療現場の実運用に耐える堅牢性と、日本の法的要件への完全準拠を両立します。オフライン対応により災害時の医療継続を支援し、多職種協働による質の高い医療提供を技術面から支えます。

セキュリティとユーザビリティのバランスを取りながら、医療従事者が安心して利用できるシステムを構築します。