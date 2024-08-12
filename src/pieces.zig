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
    board_state[0][0] = 82; // Rook
    board_state[0][1] = 78; // Knight
    board_state[0][2] = 66; // Bishop
    board_state[0][3] = 81; // Queen
    board_state[0][4] = 75; // King
    board_state[0][5] = 66; // Bishop
    board_state[0][6] = 78; // Knight
    board_state[0][7] = 82; // Rook

    // Initialize pieces for black in ascii
    board_state[7][0] = 114; // Rook
    board_state[7][1] = 110; // Knight
    board_state[7][2] = 98; // Bishop
    board_state[7][3] = 113; // Queen
    board_state[7][4] = 107; // King
    board_state[7][5] = 98; // Bishop
    board_state[7][6] = 110; // Knight
    board_state[7][7] = 114; // Rook
}

// Starting position
// Ending position
// Piece to move
// Validation of move
pub fn change(startx: u8, starty: u8, stopx: u8, stopy: u8, piece: u8) void {
    // Some validation of move
    //  piece can move in that space
    //  piece has the ability to move
    //  is the piece going to take anything
    // get board
    // consoleLog(startx);
    // consoleLog(starty);
    // consoleLog(stopx);
    // consoleLog(stopy);
    // consoleLog(piece);
    if (validateMove(startx, starty, stopx, stopy, piece)) {
        board_state[startx][starty] = 0;
        board_state[stopx][stopy] = piece;
    } else {
        //logBoardState();
    }
}

// Logs each piece on the board
pub fn logBoardState() void {
    for (0..8) |row| {
        for (0..8) |col| {
            consoleLog((@intCast(board_state[row][col])));
        }
    }
}

pub fn validateMove(startx: u8, starty: u8, stopx: u8, stopy: u8, piece: u8) bool {
    // consoleLog(startx);
    // consoleLog(starty);
    // consoleLog(11111);
    // consoleLog(stopx);
    // consoleLog(stopy);
    // consoleLog(piece);

    switch (piece) {
        // pawn validation
        80, 112 => {
            if (@abs(@as(i32, startx) - @as(i32, stopx)) == 1) {
                if (starty == stopy) {
                    return true;
                }
            } else {
                return false;
            }
            return false; // Handle case where condition is not met
        },
        else => return false,
    }
}
