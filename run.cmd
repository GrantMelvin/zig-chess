if exist .\zig-out\bin\ (
    rmdir /s /q .\zig-out\bin\
)
if exist .\.zig-cache\ (
    rmdir /s /q .\.zig-cache\
)
zig build && python3 -m http.server
