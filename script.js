var memory = new WebAssembly.Memory({
    initial: 2,
    maximum: 2,
});

var importObject = {
    env: {
        consoleLog: (arg) => console.log(arg), // Useful for debugging on zig's side
        memory: memory,
    },
};

WebAssembly.instantiateStreaming(fetch("zig-out/bin/board.wasm"), importObject).then((result) => {
    const wasmMemoryArray = new Uint8Array(memory.buffer);

    // Automatically set canvas size as defined in `checkerboard.zig`
    const checkerboardSize = result.instance.exports.getCheckerboardSize();

    // All 3 layers of canvas'
    const overlay = document.getElementById("overlay-layer");
    const coordDisplay = document.getElementById("coordDisplay");
    const selectedDisplay = document.getElementById("selectedDisplay");

    let asciiDataArray ;
    var selected = null ;
    var target = null ;

    // Loads the overlay that the user interacts with
    const initBoard = () => {
        // Gets size of board we are making
        overlay.width = checkerboardSize;
        overlay.height = checkerboardSize;

        const context = overlay.getContext("2d");
        const rgbaData = context.createImageData(overlay.width, overlay.height);

        // Loads the board with rgba values
        result.instance.exports.colorCheckerboard();

        const boardOffset = result.instance.exports.getCheckerboardBufferPointer();
        const rgbaDataArray = wasmMemoryArray.slice(
            boardOffset,
            boardOffset + checkerboardSize * checkerboardSize * 6
        );
        //console.log(imageDataArray)

        // Loads RGBA values from zig
        for (let j = 0, i = 0; i < checkerboardSize * checkerboardSize * 6; j += 4, i += 6) {
            rgbaData.data[j]     = rgbaDataArray[i];     // R
            rgbaData.data[j + 1] = rgbaDataArray[i + 1]; // G
            rgbaData.data[j + 2] = rgbaDataArray[i + 2]; // B
            rgbaData.data[j + 3] = rgbaDataArray[i + 3]; // A
        }
        context.putImageData(rgbaData, 0, 0);
        
        // Initializes board
        result.instance.exports.init();

        const pieceOffset = result.instance.exports.get();
        asciiDataArray = wasmMemoryArray.slice(
            pieceOffset,
            pieceOffset + checkerboardSize * checkerboardSize
        );

        // Initial board state in ascii
        //console.log(asciiDataArray)

        // Add an event listener for mouse clicks to display coordinates
        overlay.addEventListener('click', (event) => {
            // Confines area of click
            const rect = overlay.getBoundingClientRect();
            
            // Mouse position in rect
            const mouseX = event.clientX - rect.left;
            const mouseY = event.clientY - rect.top;

            // Translates mouse position to row column
            const { coordX, coordY, asciiValue } = getCoordAtPosition(mouseX, mouseY);

            // Displays current click
            coordDisplay.textContent = `Click at (${coordX}, ${coordY})`;

            if(selected){
                console.log('selected found')

                // Gets the target in the 2-part click sequence
                target = {coordX, coordY, asciiValue}

                // Changes board state
                result.instance.exports.change(selected.coordX,selected.coordY,target.coordX,target.coordY,selected.asciiValue);
                
                // Redefines memory chunk with updated values
                asciiDataArray = wasmMemoryArray.slice(
                    pieceOffset,
                    pieceOffset + checkerboardSize * checkerboardSize
                );

                // Image source (replace with your image URL or path)
                const imgSrc = './assets/red.png';
                drawImageOnSquare(imgSrc, coordY, coordX);

                console.log(asciiDataArray)
                // Resets the sequence of a move
                selected = null ;

                selectedDisplay.textContent = `Currently Selected: ${convertAscii(target.asciiValue)}`;
            }else{
                // Gets the start in the 2-part click sequence
                console.log('selected not found')
                selected = {coordX, coordY, asciiValue}
                // Image source (replace with your image URL or path)
                const imgSrc = './assets/blue.png';
                drawImageOnSquare(imgSrc, coordY, coordX);
                selectedDisplay.textContent = `Currently Selected: ${convertAscii(selected.asciiValue)}`;
            }
            
        });

        // Function to get coordinates based on mouse position
        const getCoordAtPosition = (x, y) => {
            // Calculates the size of each square on the board
            const screenWidth = overlay.offsetWidth;
            const squareSize = screenWidth / checkerboardSize;

            // Gets the entry in the array that we are looking for
            const col = Math.floor(x / squareSize);
            const row = Math.floor(y / squareSize);
            console.log(row, col)

            // Multiply by 6 to access the correct entry block in imageDataArray
            const index = (row * checkerboardSize + col) * 6; 

            // Coordinates that we want 
            const coordY = rgbaDataArray[index + 4]; 
            const coordX = rgbaDataArray[index + 5];

            // Retrieve the ASCII value from the shared asciiDataArray
            const asciiValue = getAsciiValueAtPosition(row, col);

            // Draw the image at the specific square
            return { coordX, coordY, asciiValue };
        };

        // Function to load and render an image on a coordinate in the canvas
        const drawImageOnSquare = (imgSrc, col, row) => {
            const img = new Image();
            img.src = imgSrc;

            img.onload = () => {
                const squareSize = overlay.width / checkerboardSize;

                // Calculate the top-left corner of the square
                const posX = col * squareSize;
                const posY = row * squareSize;

                console.log("Drawing image at:", posX, posY, "with square size:", squareSize);

                // Draw the image on the calculated position, scaled to the square size
                context.drawImage(img, posX, posY, 1,1);
            };

            img.onerror = () => {
                console.error("Failed to load image:", imgSrc);
            };
        };

    };

    // Function to get ASCII value based on column and row
    function getAsciiValueAtPosition(row, col){
        if (!asciiDataArray) return null;

        const index = (row * checkerboardSize + col);
        console.log(asciiDataArray[index])
        return asciiDataArray[index];
    }

    function convertAscii(x){
        switch(x){
            case 0:
                return 'Empty'
            case 80:
            case 112:
                return 'Pawn'
            case 82:
            case 114:
                return 'Rook'
            case 78:
            case 110:
                return 'Knight'
            case 66:
            case 98:
                return 'Bishop'
            case 81:
                return 'White Queen'
            case 113:
                return 'Black Queen'
            case 75:
                return 'White King'
            case 107:
                return 'Black King'
        }
    }

    initBoard();
});