FROM golang:1.24-alpine AS builder

WORKDIR /app

# copy go modules files and download dependencies
COPY go.mod go.sum ./
RUN go mod download

# copy source code
COPY . .

# Build binary
RUN CGO_ENABLED=0 GOOS=linux go build -o worker ./cmd/worker/main.go

# Smaller final image
FROM alpine:latest

WORKDIR /app

# Copy binary from previous stage
COPY --from=builder /app/worker .

# Expose health check port
EXPOSE 8001

# Run worker
CMD ["./worker"]
