FROM heroiclabs/nakama-pluginbuilder:3.24.2 AS builder

WORKDIR /backend
COPY go.mod .
COPY modules/ modules/

RUN go mod tidy && go build -buildmode=plugin -trimpath -o ./backend.so ./modules

FROM heroiclabs/nakama:3.24.2
COPY --from=builder /backend/backend.so /nakama/data/modules/

COPY entrypoint.sh /entrypoint.sh
COPY nakama.yml /nakama/data/nakama.yml
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]

