const std = @import("std");
const pieces = @import("pieces.zig");

extern fn consoleLog(arg: u32) void;

const checkerboard_size: usize = 8;

var board_buffer = std.mem.zeroes([checkerboard_size][checkerboard_size][6]u8);
var coordBuffer = std.mem.zeroes([checkerboard_size][checkerboard_size][2]u8);

// The returned pointer will be used as an offset integer to the wasm memory
export fn getCheckerboardBufferPointer() [*]u8 {
    return @ptrCast(&board_buffer);
}

pub export fn getCheckerboardSize() usize {
    return checkerboard_size;
}

pub export fn getCoordBufferPointer() [*]u8 {
    return @ptrCast(&coordBuffer);
}

export fn colorCheckerboard() void {
    for (&board_buffer, 0..) |*row, y| {
        for (row, 0..) |*square, x| {
            const dark_value = 255;
            const light_value = 0;

            var is_dark_square = true;

            if ((y % 2) == 0) {
                is_dark_square = false;
            }

            if ((x % 2) == 0) {
                is_dark_square = !is_dark_square;
            } else {}

            // RBG values if it is a dark square
            var square_value_red: u8 = dark_value;
            var square_value_green: u8 = dark_value;
            var square_value_blue: u8 = dark_value;

            // RBG values if it is a light square
            if (!is_dark_square) {
                square_value_red = light_value;
                square_value_green = light_value;
                square_value_blue = light_value;
            }

            square.*[0] = square_value_red;
            square.*[1] = square_value_green;
            square.*[2] = square_value_blue;
            square.*[3] = 255; // Alpha value

            // We dont need these - dont feel like redoing math on frontend
            square.*[4] = @intCast(x);
            square.*[5] = @intCast(y);

            // coord_buffer[x][y][0] = @intCast(x);
            // coord_buffer[x][y][1] = @intCast(y);
        }
    }
}

pub export fn fillCoordLayer() void {
    for (&coordBuffer, 0..) |*row, y| {
        for (row, 0..) |*square, x| {
            square.*[0] = @intCast(x);
            square.*[1] = @intCast(y);

            coordBuffer[x][y][0] = @intCast(x);
            coordBuffer[x][y][1] = @intCast(y);
        }
    }
}

pub export fn init() void {
    pieces.init();
}

pub export fn get() [*]u8 {
    return pieces.get();
}

pub export fn change(startx: u8, starty: u8, stopx: u8, stopy: u8, piece: u8) void {
    pieces.change(startx, starty, stopx, stopy, piece);
}
