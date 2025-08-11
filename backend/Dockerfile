FROM golang:1.24-alpine AS builder
WORKDIR /app
COPY ./go.mod ./go.sum ./
RUN go mod download
RUN go mod verify
RUN go mod tidy
COPY . .
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o /go/bin/main ./cmd/main.go

FROM alpine:3.20
WORKDIR /app
COPY --from=builder /go/bin/main .
COPY --from=builder /app/templates ./templates
EXPOSE 3001
CMD ["./main"]
