# 部署 Rememoi

这套部署由四部分组成：

- **宿主机上的 Caddy**：负责 TLS 和反向代理。
- **Docker 中的 Rememoi**：监听 `127.0.0.1:3010`。
- **SQLite**：放在宿主机 bind mount 的 `./data` 里。
- **COS**：存放媒体文件，由应用代理访问。

```text
互联网
  │ 80/443
  ▼
Caddy（宿主机）
  │ http://127.0.0.1:3010
  ▼
Rememoi 容器
  ├── ./data/rememoi.db
  └── 私有 COS（GetObject 代理）
```

## 1. DNS

在 Namecheap 的 Advanced DNS 里配置：

| 类型 | 主机 | 值 |
| --- | --- | --- |
| A | `@` | 轻量应用服务器的公网 IPv4 |
| CNAME | `www` | `rememoi.com` |

在轻量应用服务器的防火墙里放行 TCP 80、TCP 443 和 UDP 443。

## 2. 生产环境变量

把 `.env.production` 复制到服务器并填写：

- `AUTH_SECRET`
- `AUTH_GITHUB_ID` / `AUTH_GITHUB_SECRET`
- `ADMIN_GITHUB_LOGINS`
- `COS_SECRET_ID` / `COS_SECRET_KEY`
- `COS_BUCKET` / `COS_REGION`
- `DATABASE_URL`（不使用本地数据库文件时才需要填）
- `REMEMOI_API_TOKEN`

这个文件务必保持私有：

```bash
chmod 600 .env.production
```

## 3. 持久化数据库

创建数据目录：

```bash
mkdir -p data
```

如果本地已有数据库，直接拷贝过去：

```bash
cp /path/to/rememoi.db ./data/rememoi.db
```

卷为空时，容器会把镜像内自带的数据库快照复制进去（该快照在构建阶段由 `content/memory` 播种生成），所以新机器一启动就有内容，运行时也不需要 `pnpm` 或 `tsx`。已存在的 `data/rememoi.db` 永远不会被覆盖；后续的表结构变更由 `ensureSchema()` 就地完成。

## 4. 构建与传输镜像

镜像在 Mac 上构建，再传到 Debian 服务器运行。服务器上不需要源码、Node 或 pnpm，只要 Docker、`docker-compose.yml`、`.env.production` 和 `data/` 目录。

下文假设服务器上的部署目录是 `/srv/rememoi`，compose 文件、`.env.production`、`data/` 和镜像包都放在这里。

### 4.1 在 Mac 上构建

Apple Silicon 的 Mac 是 arm64，服务器是 amd64，**必须指定 `--platform linux/amd64`**，否则镜像在服务器上会直接报 `exec format error`。项目里的 `make build` 已经带上了这个参数：

```bash
make build
```

等价于：

```bash
docker build \
  --platform linux/amd64 \
  --build-arg NEXT_PUBLIC_SITE_URL=https://rememoi.com \
  -t rememoi:latest .
```

构建走 Docker 的跨架构模拟，在 M 系列芯片上会慢一些，属于正常现象。第一次构建要下载 amd64 的基础镜像，并按 amd64 拉取 `sharp`、`@libsql` 的原生依赖包，通常几分钟；之后命中层缓存会快很多。

确认产物架构：

```bash
docker image inspect rememoi:latest --format '{{.Os}}/{{.Architecture}}'
# 期望输出 linux/amd64
```

镜像分三段构建：`deps` 装上包含 devDependencies 的完整依赖，`builder` 执行 `pnpm build`，`runner` 只保留 `output: 'standalone'` 的产物——所以最终镜像没有 `pnpm`、`tsx` 和 devDependencies，体积约 300MB（改造前的单阶段镜像在 1.1GB 左右）。

`.env.production` 不会进镜像（`.dockerignore` 已排除），密钥只在运行时由 compose 注入。

### 4.2 把镜像传到服务器

**方式一：save / load（不需要镜像仓库，单机部署最省事）**

```bash
# Mac
docker save rememoi:latest | gzip > rememoi-image.tar.gz
scp rememoi-image.tar.gz user@server:/srv/rememoi/

# 服务器
gunzip -c /srv/rememoi/rememoi-image.tar.gz | docker load
```

gzip 之后大约 100MB，普通带宽下几分钟能传完。

**方式二：走镜像仓库（部署频繁时更省事）**

推到腾讯云 TCR 或 Docker Hub，服务器直接 pull。国内服务器拉 Docker Hub 经常超时，用 TCR 个人版（免费）更稳：

```bash
# Mac
docker tag rememoi:latest ccr.ccs.tencentyun.com/<namespace>/rememoi:latest
docker login ccr.ccs.tencentyun.com
docker push ccr.ccs.tencentyun.com/<namespace>/rememoi:latest

# 服务器
docker login ccr.ccs.tencentyun.com
docker pull ccr.ccs.tencentyun.com/<namespace>/rememoi:latest
docker tag ccr.ccs.tencentyun.com/<namespace>/rememoi:latest rememoi:latest
```

两种方式最后都要保证服务器上存在 `rememoi:latest` 这个 tag——compose 文件里写的就是它。

### 4.3 启动容器

```bash
docker compose up -d --no-build
docker compose logs -f rememoi
```

`--no-build` 不能省：compose 文件里保留了 `build:` 段，不加这个参数时 compose 可能尝试在服务器上就地重新构建——2C2G 的机器跑 `next build` 很容易 OOM，而且那不是我们要的流程。

应用是刻意只绑定回环地址的：

```text
127.0.0.1:3010
```

所以无法从公网直接访问。

## 5. 在宿主机上安装 Caddy

Debian/Ubuntu 使用官方软件源：

```bash
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https curl
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' \
  | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' \
  | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update
sudo apt install -y caddy
```

## 6. 配置 Caddy

先备份默认配置，再装上项目的 Caddyfile：

```bash
sudo cp /etc/caddy/Caddyfile /etc/caddy/Caddyfile.original
sudo cp Caddyfile /etc/caddy/Caddyfile
sudo caddy validate --config /etc/caddy/Caddyfile
sudo systemctl reload caddy
```

查看证书签发情况：

```bash
sudo journalctl -u caddy -f
```

Caddy 会自动为 `rememoi.com` 和 `www.rememoi.com` 申请并续期证书。

## 7. 验证

```bash
curl -I https://rememoi.com
curl -I https://www.rememoi.com
curl -I http://127.0.0.1:3010/
```

预期结果：

- `https://rememoi.com` → `200`
- `https://www.rememoi.com` → 重定向到主域名
- 直接访问 3010 端口只在本地可用

## 8. 更新

Mac 上重新构建并打包：

```bash
make build
docker save rememoi:latest | gzip > rememoi-image.tar.gz
scp rememoi-image.tar.gz user@server:/srv/rememoi/
```

服务器上先给旧镜像留个回滚点，再加载新镜像替换容器：

```bash
docker tag rememoi:latest rememoi:previous 2>/dev/null || true
gunzip -c rememoi-image.tar.gz | docker load
docker compose up -d --no-build
# 清掉历史遗留的悬空镜像。回滚点是有 tag 的，不会被删掉。
docker image prune -f
```

`docker compose up -d` 察觉到镜像变了会自动重建容器，不用先 `down`。万一新版本有问题，回滚只需要一步：

```bash
docker tag rememoi:previous rememoi:latest
docker compose up -d --no-build
```

`docker-compose.yml`、`Caddyfile` 这类配置改动仍然在服务器上 `git pull` 获取；应用代码不用同步，它已经在镜像里了。部署几次之后用 `docker system df` 看一眼磁盘占用，否则镜像加构建缓存会一直增长。

Caddy 不需要重启。

## 9. 备份

数据库就是宿主机上的 `data/rememoi.db`：

```bash
sqlite3 data/rememoi.db \
  ".backup 'backups/rememoi-$(date +%Y%m%d-%H%M%S).db'"
```

`.env.production` 请另外单独、安全地备份。

## 附注

- Caddy **不在** `docker-compose.yml` 里，它以宿主机服务的形式运行。
- 服务器侧只需要 Docker、`docker-compose.yml`、`.env.production` 和 `data/`；代码改动只作用在 Mac 产的镜像里，服务器上 `git pull` 只是为了拿配置文件（compose、Caddyfile）的更新。
- 同一台服务器跑多个应用时，每个应用各占一个目录，把 `docker-compose.yml`、`.env.production` 和 `data/` 放在一起即可：卷里的 `./data` 是相对 compose 文件所在目录解析的，不会和其它应用串。要避开的是把容器内路径当宿主机路径写（`/app/data:/app/data`），那会让多个应用共用一个 SQLite 文件。端口（`127.0.0.1:3010`）和 `name:` 也要各自不同。
- 镜像架构必须和服务器一致（这里是 `linux/amd64`）；换成 arm64 服务器时，`make build` 里的 `--platform` 也要改成 `linux/arm64`。
- `NEXT_PUBLIC_SITE_URL` 会被打进镜像，域名变了要重新构建。
- `runner` 阶段用 `node server.js`（standalone 产物）启动，所以镜像里没有 `pnpm`、`tsx` 和 devDependencies。只有在一个空卷上首次启动时，容器日志才会出现 `[entrypoint] seeding …`。
- 因为种子数据库是构建进镜像的，改动 `content/memory` 只对全新的卷生效（而且要重新构建），不会重新播种已有的 `data/rememoi.db`。
- 容器通过应用代理访问 COS，因此不需要公开的 COS 桶或图片 CDN。
- 应用起不来时，先看 `docker compose logs rememoi`。
- Caddy 签不出证书时，检查 DNS 以及 80/443 端口。
