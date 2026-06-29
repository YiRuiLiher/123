# 视频网站部署指南

本项目支持使用 Docker 和 Docker Compose 进行一键部署。这使得将项目托管到任何支持 Docker 的云服务器（如阿里云、腾讯云等）或者本地机器变得非常简单。

## 部署环境准备

请确保目标机器已经安装了以下环境：
- **Docker**
- **Docker Compose**

## 一键部署步骤

1. **修改网站名称 (可选)**
   如果您想要更改网站名称，请在部署前修改 `src/data/config.ts` 中的 `appName` 字段：
   ```typescript
   export const AppConfig = {
     // 修改此处的 appName 即可更改网站名称
     appName: '您的自定义名称',
     ...
   };
   ```

2. **准备视频文件 (可选)**
   如果您的视频文件较大，建议不要直接打包在镜像中。您可以把它们放在项目根目录的 `public/assets/videos` 目录下，并在 `docker-compose.yml` 中取消相关的 volume 挂载注释，从而映射到容器内：
   ```yaml
   volumes:
     - ./public/assets/videos:/usr/share/nginx/html/assets/videos
   ```

3. **构建并启动容器**
   在包含 `docker-compose.yml` 的项目根目录下，运行以下命令即可实现一键部署并后台运行：
   ```bash
   docker-compose up -d --build
   ```

4. **访问应用**
   启动成功后，项目将运行在本机的 8080 端口。
   您可以通过浏览器访问 `http://localhost:8080` (或 `http://您的服务器IP:8080`) 预览和使用视频网站。

## 常用命令

- **查看运行日志**：
  ```bash
  docker-compose logs -f
  ```
- **停止服务**：
  ```bash
  docker-compose down
  ```
- **重启服务**：
  ```bash
  docker-compose restart
  ```
