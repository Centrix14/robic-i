FROM alpine:3

LABEL name="istok"
LABEL version=0
LABEL description="Docker image for running Istok app"

RUN apk add lighttpd

COPY ./lighttpd.conf /etc/lighttpd/
COPY ./app /var/www/localhost/html/

EXPOSE 80/tcp

#ENTRYPOINT ["sh"]
ENTRYPOINT ["lighttpd", "-D", "-f", "/etc/lighttpd/lighttpd.conf"]