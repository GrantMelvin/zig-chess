if exist .\zig-out\bin\ (
    rmdir /s /q .\zig-out\bin\
)
zig build && python3 -m http.server
