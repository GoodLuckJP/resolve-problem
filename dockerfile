# Node.js ベースイメージ
FROM node:18-alpine

# 作業ディレクトリを設定
WORKDIR /app

# パッケージファイルをコピー
COPY package*.json ./

# 依存関係をインストール
RUN npm install

# アプリケーションファイルをコピー
COPY . .

# Next.jsの開発サーバーを起動
CMD ["npm", "run", "dev"]

# ポートを開放
EXPOSE 3000
