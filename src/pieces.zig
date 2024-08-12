const std = @import("std");
const board = @import("checkerboard.zig");

extern fn consoleLog(arg: u32) void;

const board_size = board.getCheckerboardSize();

// Initialize the board state with the default setup
var board_state = std.mem.zeroes([board_size][board_size]u8);

pub fn get() [*]u8 {
    return @ptrCast(&board_state);
}

// White pieces are capitalized
// Black pieces are lower case
pub fn init() void {
    // Initialize pawns for both sides in ascii
    for (0..board_size) |i| {
        board_state[1][i] = 80;
        board_state[6][i] = 112;
    }

    // Initialize pieces for white in ascii
    board_state[0][0] = 82;
    board_state[0][1] = 78;
    board_state[0][2] = 66;
    board_state[0][3] = 81;
    board_state[0][4] = 75;
    board_state[0][5] = 66;
    board_state[0][6] = 78;
    board_state[0][7] = 82;

    // Initialize pieces for black in ascii
    board_state[7][0] = 114;
    board_state[7][1] = 110;
    board_state[7][2] = 98;
    board_state[7][3] = 113;
    board_state[7][4] = 107;
    board_state[7][5] = 98;
    board_state[7][6] = 110;
    board_state[7][7] = 114;

    //logBoardState();
}

// Get the current board state
// pub fn get() [board_size][board_size]u8 {
//     return board_state;
// }

// Need X Y coordinates from front end
// Starting position
// Ending position
pub fn change(startx: u8, starty: u8, stopx: u8, stopy: u8, piece: u8) void {
    consoleLog(startx);
    consoleLog(starty);
    consoleLog(stopx);
    consoleLog(stopy);
    consoleLog(piece);
    board_state[startx][starty] = 0;
    board_state[stopx][stopy] = piece;
    logBoardState();
}

// Logs each piece on the board
pub fn logBoardState() void {
    for (0..8) |row| {
        for (0..8) |col| {
            consoleLog((@intCast(board_state[row][col])));
        }
    }
}
