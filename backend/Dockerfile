FROM golang:1.22-alpine AS builder
WORKDIR /app
COPY backend/go.mod backend/go.sum ./
RUN go mod download
RUN go mod verify
RUN go mod tidy
COPY backend/ .
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o /go/bin/main ./main.go

FROM alpine:3.20
WORKDIR /app
COPY --from=builder /go/bin/main .
EXPOSE 3000
CMD ["./main"]
