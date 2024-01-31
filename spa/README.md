# Run without nodeJS
docker run -it --rm -p 8080:8080 \
  -v ~/code/fuddata.github.io/spa:/usr/share/nginx/html \
  -v ~/code/fuddata.github.io/spa/default.conf:/etc/nginx/conf.d/default.conf \
   nginxinc/nginx-unprivileged

