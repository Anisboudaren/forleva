# Nginx: video upload (413 Request Entity Too Large)

Your app accepts uploads up to **500 MB** (`app/api/vimeo/upload/route.ts`). Nginx’s default `client_max_body_size` is **1 MB**, so uploads fail with **413** before Next.js runs.

## Fix on the VPS

### 1. Find the site config

```bash
sudo nginx -T 2>/dev/null | grep -E "server_name|client_max_body"
# or
ls /etc/nginx/sites-enabled/
```

Common paths:

- `/etc/nginx/sites-available/forleva` (or your domain name)
- `/etc/nginx/sites-enabled/default`

### 2. Edit the `server { ... }` block that proxies to Next.js

Inside the same `server` block as `proxy_pass` (port 3000 or your PM2 port), add:

```nginx
# Match app limit (500MB) — required for /api/vimeo/upload
client_max_body_size 500M;

# Large uploads can take several minutes
client_body_timeout 600s;
proxy_connect_timeout 600s;
proxy_send_timeout 600s;
proxy_read_timeout 600s;
```

Example `location` (adjust port/socket):

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name your-domain.com;

    client_max_body_size 500M;
    client_body_timeout 600s;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_connect_timeout 600s;
        proxy_send_timeout 600s;
        proxy_read_timeout 600s;
    }
}
```

If you use **HTTPS** (Certbot), edit the `server` block on port **443** as well (or the included file Certbot manages).

### 3. Global limit (only if 413 persists)

Check `/etc/nginx/nginx.conf` inside `http { }`:

```nginx
client_max_body_size 500M;
```

Site-level settings override the default; both should be ≥ your largest video.

### 4. Test and reload

```bash
sudo nginx -t
sudo systemctl reload nginx
```

### 5. Verify

Upload the same `intro.mp4` (~8 MB). Network tab should show **200** JSON from `/api/vimeo/upload`, not **413** HTML from nginx.

## Reference

See `docs/nginx-forleva.conf.example` in this repo for a full sample server block.
